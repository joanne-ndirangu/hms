const occupancyForm = document.getElementById('occupancyFilterForm');
const occupancyBody = document.getElementById('occupancyTableBody');

async function fetchRoomOccupancy(start = '', end = '') {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);

  try {
    const response = await fetch(`http://localhost:5000/api/reports/room-occupancy?${params.toString()}`);
    const data = await response.json();
    renderOccupancyTable(data.rooms || []);
  } catch (error) {
    console.error('Error fetching room occupancy:', error);
  }
}

function renderOccupancyTable(rooms) {
  occupancyBody.innerHTML = '';

  if (rooms.length === 0) {
    occupancyBody.innerHTML = `<tr><td colspan="4" class="text-center">No data available</td></tr>`;
    return;
  }

  rooms.forEach((room, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${room.room_number}</td>
      <td>${room.room_type}</td>
      <td>${room.occupancy_status}</td>
    `;
    occupancyBody.appendChild(row);
  });
}

// Submit handler
occupancyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const start = occupancyForm.start.value;
  const end = occupancyForm.end.value;
  fetchRoomOccupancy(start, end);
});

// Initial load without filter
fetchRoomOccupancy();
