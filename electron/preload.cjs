const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('cupid', {
  version: process.versions.electron,
});
