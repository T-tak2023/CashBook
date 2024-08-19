const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path')
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./cashbook.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to the SQLite database');
  }
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: false,
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-records', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM transactions', [], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
