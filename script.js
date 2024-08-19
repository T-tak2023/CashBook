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
