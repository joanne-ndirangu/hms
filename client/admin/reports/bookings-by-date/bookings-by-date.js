async function fetchBookings(startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`http://localhost:5000/api/reports/bookings-by-date?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch bookings');
    }

    populateTable(data.bookings);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function populateTable(bookings) {
  const tbody = document.getElementById('bookings-body');
  tbody.innerHTML = '';

  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No bookings found for selected dates.</td></tr>';
    return;
  }

  bookings.forEach(({ booking_id, guest_name, room_number, check_in, check_out, status, total_amount }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${booking_id}</td>
      <td>${guest_name}</td>
      <td>${room_number || 'N/A'}</td>
      <td>${new Date(check_in).toLocaleDateString()}</td>
      <td>${new Date(check_out).toLocaleDateString()}</td>
      <td>${status}</td>
      <td>${parseFloat(total_amount).toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const defaultEndDate = now.toISOString().split('T')[0];
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - 29);
  const defaultStartDate = startDateObj.toISOString().split('T')[0];

  document.getElementById('startDate').value = defaultStartDate;
  document.getElementById('endDate').value = defaultEndDate;

  fetchBookings(defaultStartDate, defaultEndDate);

  document.getElementById('filterBtn').addEventListener('click', () => {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;

    if (!start || !end) {
      alert('Please select both start and end dates.');
      return;
    }
    if (new Date(start) > new Date(end)) {
      alert('Start date cannot be after end date.');
      return;
    }

    fetchBookings(start, end);
  });
});
