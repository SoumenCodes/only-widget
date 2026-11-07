const koffi = require('koffi');

let user32 = null;
let SetWindowPos = null;
let GetWindowLongPtrW = null;
let SetWindowLongPtrW = null;

if (process.platform === 'win32') {
  try {
    user32 = koffi.load('user32.dll');
    SetWindowPos = user32.func('bool __stdcall SetWindowPos(uintptr_t hWnd, uintptr_t hWndInsertAfter, int X, int Y, int cx, int cy, uint32_t uFlags)');
    GetWindowLongPtrW = user32.func('intptr_t __stdcall GetWindowLongPtrW(uintptr_t hWnd, int nIndex)');
    SetWindowLongPtrW = user32.func('intptr_t __stdcall SetWindowLongPtrW(uintptr_t hWnd, int nIndex, intptr_t dwNewLong)');
  } catch (err) {
    console.warn('Could not load Win32 user32 bindings:', err);
  }
}

const HWND_BOTTOM = 1n;
const SWP_NOSIZE = 0x0001;
const SWP_NOMOVE = 0x0002;
const SWP_NOACTIVATE = 0x0010;
const SWP_FLAGS = SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE;

const GWL_EXSTYLE = -20;
const WS_EX_TOOLWINDOW = 0x00000080;

function setupDesktopPinning(win) {
  // macOS Desktop Behavior
  if (process.platform === 'darwin') {
    try {
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
      win.setFullScreenable(false);
      // 'desktop' level places the window on the desktop behind normal windows
      if (typeof win.setLevel === 'function') {
        win.setLevel('desktop');
      }
    } catch (e) {
      console.warn('macOS desktop level error:', e);
    }
    return {
      pinToBottom: () => {
        try {
          if (win && !win.isDestroyed() && typeof win.setLevel === 'function') {
            win.setLevel('desktop');
          }
        } catch (_) {}
      }
    };
  }

  // Windows Desktop Behavior
  if (process.platform === 'win32' && user32) {
    const getHwnd = () => {
      try {
        if (!win || win.isDestroyed()) return null;
        return win.getNativeWindowHandle().readBigUInt64LE(0);
      } catch {
        return null;
      }
    };

    // Configure tool window style so it behaves like a gadget and doesn't clutter Alt+Tab
    try {
      const hwnd = getHwnd();
      if (hwnd && GetWindowLongPtrW && SetWindowLongPtrW) {
        const curStyle = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        const newStyle = BigInt(curStyle) | BigInt(WS_EX_TOOLWINDOW);
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, newStyle);
      }
    } catch (e) {
      console.warn('Error setting toolwindow style:', e);
    }

    const pinToBottom = () => {
      try {
        const hwnd = getHwnd();
        if (hwnd && SetWindowPos) {
          SetWindowPos(hwnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_FLAGS);
        }
      } catch (e) {
        // Ignore handle errors on exit
      }
    };

    pinToBottom();

    win.on('blur', () => {
      pinToBottom();
    });

    win.on('show', () => {
      pinToBottom();
    });

    const bottomInterval = setInterval(() => {
      if (!win || win.isDestroyed()) {
        clearInterval(bottomInterval);
        return;
      }
      if (!win.isFocused()) {
        pinToBottom();
      }
    }, 1000);

    win.on('closed', () => {
      clearInterval(bottomInterval);
    });

    return { pinToBottom };
  }

  return { pinToBottom: () => {} };
}

module.exports = { setupDesktopPinning };
