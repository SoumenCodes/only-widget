const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const os = require('os');
const si = require('systeminformation');
const { setupDesktopPinning } = require('./desktopManager.cjs');

app.setPath('userData', path.join(os.tmpdir(), 'aura-widget-cache'));

let mainWindow = null;
let networkInterval = null;
let desktopHelper = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 385,
    height: 695,
    x: Math.max(20, screenWidth - 415),
    y: 40,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide();
  }

  desktopHelper = setupDesktopPinning(mainWindow);

  const isDev = process.env.NODE_ENV === 'development' || (!app.isPackaged && process.argv.includes('--dev'));

  if (isDev) {
    const devUrl = 'http://localhost:5173';
    const tryLoad = () => {
      mainWindow.loadURL(devUrl).catch(() => {
        setTimeout(tryLoad, 400);
      });
    };
    tryLoad();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Real-time network speed monitor using precise millisecond deltas
  let prevRx = null;
  let prevTx = null;
  let prevTimestamp = null;

  si.networkStats('*').then(initialStats => {
    let initialRx = 0;
    let initialTx = 0;
    for (const s of initialStats) {
      if (s.operstate === 'up' || s.rx_bytes > 0 || s.tx_bytes > 0) {
        initialRx += (s.rx_bytes || 0);
        initialTx += (s.tx_bytes || 0);
      }
    }
    prevRx = initialRx;
    prevTx = initialTx;
    prevTimestamp = Date.now();

    networkInterval = setInterval(async () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;

      try {
        const allStats = await si.networkStats('*');
        const now = Date.now();
        let totalRx = 0;
        let totalTx = 0;
        let primaryInterface = 'Wi-Fi';

        for (const s of allStats) {
          if (s.operstate === 'up' || s.rx_bytes > 0 || s.tx_bytes > 0) {
            totalRx += (s.rx_bytes || 0);
            totalTx += (s.tx_bytes || 0);
            if (s.operstate === 'up') {
              primaryInterface = s.iface || primaryInterface;
            }
          }
        }

        if (prevTimestamp !== null) {
          const deltaSec = (now - prevTimestamp) / 1000;
          if (deltaSec > 0.4) {
            const rx_sec = Math.max(0, (totalRx - prevRx) / deltaSec);
            const tx_sec = Math.max(0, (totalTx - prevTx) / deltaSec);

            mainWindow.webContents.send('network-update', {
              iface: primaryInterface,
              rx_sec: Math.round(rx_sec),
              tx_sec: Math.round(tx_sec),
              rx_bytes: totalRx,
              tx_bytes: totalTx
            });
          }
        }

        prevRx = totalRx;
        prevTx = totalTx;
        prevTimestamp = now;
      } catch (err) {
        console.error('Error querying real network stats:', err);
      }
    }, 1000);
  });

  mainWindow.on('closed', () => {
    if (networkInterval) clearInterval(networkInterval);
    mainWindow = null;
    desktopHelper = null;
  });
}

// IPC Handlers
ipcMain.handle('set-always-on-top', (_event, flag) => {
  if (mainWindow) {
    if (flag) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      mainWindow.setAlwaysOnTop(false);
      if (desktopHelper?.pinToBottom) {
        desktopHelper.pinToBottom();
      }
    }
    return mainWindow.isAlwaysOnTop();
  }
  return false;
});

ipcMain.handle('send-to-desktop', () => {
  if (mainWindow && desktopHelper?.pinToBottom) {
    desktopHelper.pinToBottom();
  }
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('set-window-height', (_event, height) => {
  if (mainWindow) {
    const [width] = mainWindow.getSize();
    mainWindow.setSize(width, Math.max(240, Math.min(950, height)));
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
