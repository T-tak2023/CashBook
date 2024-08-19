window.api.getRecords().then(records => {
  const tableBody = document.querySelector('#records-table tbody');
  records.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.id}</td>
      <td>${record.date}</td>
      <td>${record.description}</td>
      <td>${record.income}</td>
      <td>${record.expense}</td>
    `;
    tableBody.appendChild(row);
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
