fetch('http://localhost:5000/api/reports/repeat-guests')
  .then(res => res.json())
  .then(data => {
    const table = document.querySelector('#repeat-guests-table tbody');
    data.repeatGuests.forEach(guest => {
      const row = `<tr>
        <td>${guest.guest_name}</td>
        <td>${guest.total_bookings}</td>
      </tr>`;
      table.innerHTML += row;
    });
  })
  .catch(err => console.error('Error loading repeat guests:', err));
