const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cupid', {
  version: process.versions.electron,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  resize: (data) => ipcRenderer.send('window-resize', data),
});
