const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const os = require('os');
const { setupDesktopPinning } = require('./desktopManager.cjs');
const { getNetworkBytes } = require('./nativeNetwork.cjs');

app.setPath('userData', path.join(os.tmpdir(), 'only-widget-cache'));

// Hardware performance flags to drop CPU & RAM
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-gpu-process-crash-limit');
app.commandLine.appendSwitch('disable-software-rasterizer');

let mainWindow = null;
let networkInterval = null;
let desktopHelper = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 385,
    height: 535,
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
      nodeIntegration: false,
      backgroundThrottling: false,
      spellcheck: false
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

  // Ultra-fast 0% CPU native network speed monitor
  let initial = getNetworkBytes();
  let prevRx = initial.rx;
  let prevTx = initial.tx;
  let prevTimestamp = Date.now();

  networkInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    try {
      const stats = getNetworkBytes();
      const now = Date.now();
      const deltaSec = (now - prevTimestamp) / 1000;

      if (deltaSec > 0.4) {
        const rx_sec = Math.max(0, (stats.rx - prevRx) / deltaSec);
        const tx_sec = Math.max(0, (stats.tx - prevTx) / deltaSec);

        mainWindow.webContents.send('network-update', {
          iface: stats.iface || 'Wi-Fi',
          rx_sec: Math.round(rx_sec),
          tx_sec: Math.round(tx_sec),
          rx_bytes: stats.rx,
          tx_bytes: stats.tx
        });

        prevRx = stats.rx;
        prevTx = stats.tx;
        prevTimestamp = now;
      }
    } catch (err) {
      // Quiet error handle
    }
  }, 1000);

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
