const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getRecords: () => ipcRenderer.invoke('get-records')
});
