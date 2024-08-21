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
    width: 1200,
    height: 900,
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
      db.all('SELECT * FROM transactions ORDER BY date', [], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('add-record', async (event, record) => {
    console.log('Add record handler triggered:', record);

    return new Promise((resolve, reject) => {
      const { date, description, income, expense } = record;
      db.run('INSERT INTO transactions (date, description, income, expense) VALUES (?, ?, ?, ?)', [date, description, income, expense], function(err) {
        if (err) {
          console.error('Failed to insert record:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, ...record });
        }
      });
    });
  });

  ipcMain.handle('delete-record', async (event, id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Failed to delete record:', err);
          reject(err);
        } else {
          resolve();
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
