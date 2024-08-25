const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path')
const sqlite3 = require('sqlite3').verbose();

const userDataPath = app.getPath('userData'); // ユーザーデータディレクトリのパス
const dbPath = path.join(userDataPath, 'cashbook.db'); // 絶対パスを指定

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    // テーブルが存在しない場合にテーブルを作成する
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT,
        income INTEGER DEFAULT 0,
        expense INTEGER DEFAULT 0
    )
    `, (err) => {
      if (err) {
        console.error('Failed to create table:', err);
      } else {
        console.log('Table `transactions` is ready.');
        initializeData(); // テーブル作成後にデータを挿入
      }
    });
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
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-records-by-date-range', async (event, { startDate, endDate }) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM transactions
        WHERE date BETWEEN ? AND ?
        ORDER BY date
      `;
      db.all(query, [startDate, endDate], (err, rows) => {
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

  ipcMain.handle('get-record-by-id', async (event, id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Failed to fetch record:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  });

  ipcMain.handle('update-record', async (event, record) => {
    console.log('Update record handler triggered:', record);

    return new Promise((resolve, reject) => {
      const { id, date, description, income, expense } = record;
      db.run(
        'UPDATE transactions SET date = ?, description = ?, income = ?, expense = ? WHERE id = ?',
        [date, description, income, expense, id],
        function (err) {
          if (err) {
            console.error('Failed to update record:', err);
            reject(err);
          } else {
            resolve(record);
          }
        }
      );
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 固定の初期データ
const initializeData = () => {
  const sampleData = [
    // 2024年8月
    { date: '2024-08-05', description: 'オフィスのレンタル料', income: 0, expense: 1500 },
    { date: '2024-08-20', description: '給与支払い', income: 0, expense: 3000 },
    { date: '2024-08-01', description: '取引先Aへの支払い', income: 0, expense: 1000 },
    { date: '2024-08-15', description: '備品購入', income: 0, expense: 500 },
    { date: '2024-08-10', description: '売上報告', income: 2000, expense: 0 },

    // 2024年9月
    { date: '2024-09-18', description: '売上報告', income: 2500, expense: 0 },
    { date: '2024-09-25', description: '交通費', income: 0, expense: 300 },
    { date: '2024-09-02', description: 'プロジェクト費用', income: 0, expense: 1200 },
    { date: '2024-09-07', description: '会議費用', income: 0, expense: 800 },
    { date: '2024-09-12', description: '広告宣伝費', income: 0, expense: 1500 },

    // 2024年10月
    { date: '2024-10-20', description: 'プロジェクト費用', income: 0, expense: 2000 },
    { date: '2024-10-05', description: '取引先Bへの支払い', income: 0, expense: 1100 },
    { date: '2024-10-01', description: '福利厚生費', income: 0, expense: 600 },
    { date: '2024-10-15', description: 'オフィスのレンタル料', income: 0, expense: 1500 },
    { date: '2024-10-10', description: '売上報告', income: 2200, expense: 0 }
  ];

  sampleData.forEach((record) => {
    db.run(
      'INSERT INTO transactions (date, description, income, expense) VALUES (?, ?, ?, ?)',
      [record.date, record.description, record.income, record.expense],
      (err) => {
        if (err) {
          console.error('Failed to insert initial data:', err);
        }
      }
    );
  });
};
