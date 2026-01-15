const form = document.getElementById('filterForm');
const tableBody = document.getElementById('reportTableBody');
const totalBookings = document.getElementById('total-bookings');
const confirmedBookings = document.getElementById('confirmed-bookings');
const cancelledBookings = document.getElementById('cancelled-bookings');
const pendingBookings = document.getElementById('pending-bookings');
const roomTypeTableBody = document.getElementById('bookings-by-roomtype');

async function fetchReport(start = '', end = '') {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);

  try {
    const response = await fetch(`http://localhost:5000/api/reports/booking-summary?${params.toString()}`);
    const data = await response.json();
    renderTable(data.bookings || []);
    renderSummary(data.summary || {}); 
    renderRoomTypeBreakdown(data.roomTypeCounts || {});
  } catch (error) {
    console.error('Error fetching report:', error);
  }
}

function renderTable(bookings) {
  tableBody.innerHTML = '';

  if (bookings.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="10" class="text-center">No data available</td></tr>`;
    return;
  }

  bookings.forEach((booking, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${booking.guest_name}</td>
      <td>${booking.room_number}</td>
      <td>${booking.room_type}</td>
      <td>${booking.check_in}</td>
      <td>${booking.check_out}</td>
      <td>${parseFloat(booking.total_amount).toFixed(2)}</td>
      <td>${booking.booking_status}</td>
      <td>${booking.payment_status || 'N/A'}</td>
      <td>${booking.addons || '-'}</td>
    `;
    tableBody.appendChild(row);
  });
}

function renderSummary(summary) {
  totalBookings.textContent = summary.total || 0;
  confirmedBookings.textContent = summary.confirmed || 0;
  cancelledBookings.textContent = summary.cancelled || 0;
  pendingBookings.textContent = summary.pending || 0;
}

function renderRoomTypeBreakdown(roomTypeCounts) {
  roomTypeTableBody.innerHTML = '';

  const types = Object.entries(roomTypeCounts);
  if (types.length === 0) {
    roomTypeTableBody.innerHTML = `<tr><td colspan="2" class="text-center">No data available</td></tr>`;
    return;
  }

  types.forEach(([roomType, count]) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${roomType}</td>
      <td>${count}</td>
    `;
    roomTypeTableBody.appendChild(row);
  });
}

// Initial load
fetchReport();

// On form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const start = form.start.value;
  const end = form.end.value;
  fetchReport(start, end);
});
