const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNetworkUpdate: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('network-update', subscription);
    return () => ipcRenderer.removeListener('network-update', subscription);
  },
  setAlwaysOnTop: (isAlwaysOnTop) => ipcRenderer.invoke('set-always-on-top', isAlwaysOnTop),
  sendToDesktop: () => ipcRenderer.invoke('send-to-desktop'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  setWindowHeight: (height) => ipcRenderer.invoke('set-window-height', height)
});
