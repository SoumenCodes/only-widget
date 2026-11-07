use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use sysinfo::Networks;
use tauri::{Emitter, Manager, Window};

#[derive(Serialize, Clone)]
struct NetworkPayload {
    iface: String,
    rx_sec: u64,
    tx_sec: u64,
    rx_bytes: u64,
    tx_bytes: u64,
}

#[tauri::command]
fn set_always_on_top(window: Window, flag: bool) {
    let _ = window.set_always_on_top(flag);
    if !flag {
        pin_to_desktop(&window);
    }
}

#[tauri::command]
fn minimize_window(window: Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn close_window(window: Window) {
    let _ = window.close();
}

#[tauri::command]
fn set_window_height(window: Window, height: f64) {
    let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        width: 385.0,
        height: height.max(240.0).min(950.0),
    }));
}

#[tauri::command]
fn send_to_desktop(window: Window) {
    pin_to_desktop(&window);
}

fn pin_to_desktop(window: &Window) {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::Foundation::HWND;
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SetWindowPos, HWND_BOTTOM, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE,
        };

        if let Ok(hwnd) = window.hwnd() {
            let hwnd_val = hwnd.0 as HWND;
            unsafe {
                SetWindowPos(
                    hwnd_val,
                    HWND_BOTTOM,
                    0,
                    0,
                    0,
                    0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
                );
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let networks = Arc::new(Mutex::new(Networks::new_with_refreshed_list()));

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            set_always_on_top,
            minimize_window,
            close_window,
            set_window_height,
            send_to_desktop
        ])
        .setup(move |app| {
            if let Some(main_window) = app.get_webview_window("main") {
                pin_to_desktop(&main_window.as_ref().window());
            }

            let app_handle = app.handle().clone();
            let net_ref = Arc::clone(&networks);

            // Low-overhead network monitor thread
            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_millis(1000));

                let mut rx_total = 0u64;
                let mut tx_total = 0u64;
                let mut primary_iface = "Wi-Fi".to_string();

                if let Ok(mut nets) = net_ref.lock() {
                    nets.refresh(true);
                    for (name, data) in nets.iter() {
                        rx_total += data.received();
                        tx_total += data.transmitted();
                        if data.received() > 0 || data.transmitted() > 0 {
                            primary_iface = name.clone();
                        }
                    }
                }

                let payload = NetworkPayload {
                    iface: primary_iface,
                    rx_sec: rx_total,
                    tx_sec: tx_total,
                    rx_bytes: rx_total,
                    tx_bytes: tx_total,
                };

                let _ = app_handle.emit("network-update", payload);
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
