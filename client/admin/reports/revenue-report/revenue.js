const form = document.getElementById('revenueForm');
const tableBody = document.getElementById('revenueTableBody');
const totalDiv = document.getElementById('totalRevenue');

async function fetchRevenue(start = '', end = '') {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);

  try {
    const response = await fetch(`http://localhost:5000/api/reports/revenue-summary?${params.toString()}`);
    const data = await response.json();

    renderRevenueTable(data.roomTypeRevenue || []);
    renderTotalRevenue(data.totalRevenue || 0);
  } catch (error) {
    console.error('Error fetching revenue report:', error);
  }
}

function renderRevenueTable(rows) {
  tableBody.innerHTML = '';

  if (rows.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No data</td></tr>`;
    return;
  }

  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.room_type}</td>
      <td>${parseFloat(row.revenue).toFixed(2)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function renderTotalRevenue(amount) {
  totalDiv.textContent = `Total Revenue: Ksh ${parseFloat(amount).toFixed(2)}`;
}

// Initial load
fetchRevenue();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const start = form.start.value;
  const end = form.end.value;
  fetchRevenue(start, end);
});
