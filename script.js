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

document.getElementById('add-record-form').addEventListener('submit', event => {
  event.preventDefault();

  console.log('Form submitted');

  const form = event.target;
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
      <td>${newRecord.id}</td>
      <td>${newRecord.date}</td>
      <td>${newRecord.description}</td>
      <td>${newRecord.income}</td>
      <td>${newRecord.expense}</td>
    `;
    tableBody.appendChild(row);

    // Reset form
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
