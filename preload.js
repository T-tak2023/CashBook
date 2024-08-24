const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  addRecord: (record) => ipcRenderer.invoke('add-record', record),
  deleteRecord: (id) => ipcRenderer.invoke('delete-record', id),
  getRecordById: (id) => ipcRenderer.invoke('get-record-by-id', id),
  updateRecord: (record) => ipcRenderer.invoke('update-record', record),
  getRecordsByDateRange: (dateRange) => ipcRenderer.invoke('get-records-by-date-range', dateRange)
});
