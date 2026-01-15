fetch('http://localhost:5000/api/reports/no-booking-guests')
  .then(res => res.json())
  .then(data => {
    const table = document.querySelector('#no-booking-guests-table tbody');
    data.noBookingGuests.forEach(guest => {
      const row = `<tr>
        <td>${guest.guest_name}</td>
        <td>${guest.email}</td>
      </tr>`;
      table.innerHTML += row;
    });
  })
  .catch(err => console.error('Error loading guests without bookings:', err));
