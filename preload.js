const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getRecords: () => ipcRenderer.invoke('get-records'),
  addRecord: (record) => ipcRenderer.invoke('add-record', record),
  deleteRecord: (id) => ipcRenderer.invoke('delete-record', id)
});
