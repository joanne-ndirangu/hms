const loadBtn = document.getElementById('loadBtn');
const roomsTable = document.getElementById('roomsTable');
const tbody = roomsTable.querySelector('tbody');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const limitInput = document.getElementById('limit');

async function fetchTopRooms(limit) {
  loading.style.display = 'block';
  error.textContent = '';
  roomsTable.style.display = 'none';
  tbody.innerHTML = '';

  try {
    const response = await fetch(`http://localhost:5000/api/reports/top-rooms?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.topRooms.length === 0) {
      error.textContent = 'No room data found.';
      return;
    }

    data.topRooms.forEach(room => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${room.room_number}</td>
        <td>${room.room_type}</td>
        <td>${room.total_bookings}</td>
        <td>${parseFloat(room.total_earned || 0).toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });

    roomsTable.style.display = 'table';
  } catch (err) {
    error.textContent = `Error loading data: ${err.message}`;
  } finally {
    loading.style.display = 'none';
  }
}

loadBtn.addEventListener('click', () => {
  const limit = limitInput.value || 10;
  fetchTopRooms(limit);
});

// Load initial data
fetchTopRooms(limitInput.value);
