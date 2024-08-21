window.api.getRecords().then(records => {
  const tableBody = document.querySelector('#records-table tbody');
  records.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.date}</td>
      <td>${record.description}</td>
      <td>${record.income}</td>
      <td>${record.expense}</td>
      <td>${record.id}</td>
      <td>
        <button class="edit-button" data-id="${record.id}">修正</button>
        <button class="delete-button" data-id="${record.id}">削除</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', event => {
      const id = event.target.getAttribute('data-id');
      deleteRecord(id);
    });
  });

}).catch(error => {
  console.error('Failed to fetch records:', error);
});

// 新規登録モーダルウィンドウを表示する関数
function showAddModal() {
  document.getElementById('add-modal').style.display = 'block';
}

// 新規登録モーダルウィンドウを非表示にする関数
function hideAddModal() {
  document.getElementById('add-modal').style.display = 'none';
}

// 「新規登録」ボタンにイベントリスナーを追加
document.getElementById('show-add-modal').addEventListener('click', showAddModal);

// 「キャンセル」ボタンにイベントリスナーを追加
document.getElementById('cancel-add').addEventListener('click', hideAddModal);

document.getElementById('add-record-form').addEventListener('submit', event => {
  event.preventDefault();

  console.log('Form submitted');

  const form = event.target;
  const income = parseInt(form.income.value, 10);
  const expense = parseInt(form.expense.value, 10);

  if (income > 0 && expense > 0) {
    alert('収入と支出の両方に値を入力することはできません。どちらか一方だけにしてください。');
    return;
  }

  if (income <= 0 && expense <= 0) {
    alert('収入または支出のいずれかに値を入力してください。');
    return;
  }

  const record = {
    date: form.date.value,
    description: form.description.value,
    income: parseInt(form.income.value, 10),
    expense: parseInt(form.expense.value, 10)
  };

  console.log('Record to add:', record);

  window.api.addRecord(record).then(newRecord => {
    const tableBody = document.querySelector('#records-table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${newRecord.date}</td>
      <td>${newRecord.description}</td>
      <td>${newRecord.income}</td>
      <td>${newRecord.expense}</td>
      <td>${newRecord.id}</td>
      <td>
        <button class="edit-button" data-id="${newRecord.id}">修正</button>
        <button class="delete-button" data-id="${newRecord.id}">削除</button>
      </td>
    `;
    tableBody.appendChild(row);

    alert('登録しました');

    hideAddModal();

    row.querySelector('.edit-button').addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      editRecord(id);
    });
    row.querySelector('.delete-button').addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      deleteRecord(id);
    });

    const rows = Array.from(tableBody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const dateA = new Date(a.cells[0].textContent);
      const dateB = new Date(b.cells[0].textContent);
      return dateA - dateB;
    });

    rows.forEach(row => tableBody.appendChild(row));

    form.reset();
  }).catch(error => {
    console.error('Failed to add record:', error);
  });
});

function deleteRecord(id) {
  if (confirm('このレコードを削除してもよろしいですか？')) {
    window.api.deleteRecord(id).then(() => {
      // レコード削除後、表示を更新
      const row = document.querySelector(`button[data-id="${id}"]`).closest('tr');
      row.remove();
    }).catch(error => {
      console.error('Failed to delete record:', error);
    });
  }
}

document.querySelector('#records-table').addEventListener('click', event => {
  if (event.target.classList.contains('edit-button')) {
    const id = event.target.getAttribute('data-id');
    // APIからレコードを取得
    window.api.getRecordById(id).then(record => {
      console.log('Fetched record:', record);

      // モーダルのフォームにデータをセット
      document.getElementById('edit-id').value = record.id;
      document.getElementById('edit-date').value = record.date;
      document.getElementById('edit-description').value = record.description;
      document.getElementById('edit-income').value = record.income;
      document.getElementById('edit-expense').value = record.expense;

      // モーダルを表示
      document.getElementById('edit-modal').style.display = 'block';
    }).catch(error => {
      console.error('Failed to fetch record:', error);
    });
  }
});

document.getElementById('cancel-edit').addEventListener('click', () => {
  document.getElementById('edit-modal').style.display = 'none';
});

document.getElementById('edit-record-form').addEventListener('submit', event => {
  event.preventDefault();

  console.log('Edit form submitted');

  const form = event.target;
  const record = {
    id: form['id'].value,
    date: form['date'].value,
    description: form['description'].value,
    income: parseInt(form['income'].value, 10),
    expense: parseInt(form['expense'].value, 10)
  };

  console.log('Record to update:', record);

  window.api.updateRecord(record).then(updatedRecord => {
    // 更新されたレコードを表示に反映
    const row = document.querySelector(`button[data-id="${updatedRecord.id}"]`).closest('tr');
    row.innerHTML = `
      <td>${updatedRecord.date}</td>
      <td>${updatedRecord.description}</td>
      <td>${updatedRecord.income}</td>
      <td>${updatedRecord.expense}</td>
      <td>${updatedRecord.id}</td>
      <td>
        <button class="edit-button" data-id="${updatedRecord.id}">修正</button>
        <button class="delete-button" data-id="${updatedRecord.id}">削除</button>
      </td>
    `;

    // モーダルを閉じる
    document.getElementById('edit-modal').style.display = 'none';
  }).catch(error => {
    console.error('Failed to update record:', error);
  });
});
