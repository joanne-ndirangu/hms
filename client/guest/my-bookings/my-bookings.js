document.addEventListener('DOMContentLoaded', function () {
  const userId = localStorage.getItem('user_id');

  if (!userId) {
    document.getElementById('bookings-list').innerHTML = '<p>Please log in to see your bookings.</p>';
    return;
  }

  function formatDate(iso) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(iso).toLocaleDateString(undefined, options);
  }

  async function fetchBookings() {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/user/${userId}`);
      const data = await res.json();
      const bookingsList = document.getElementById('bookings-list');
      bookingsList.innerHTML = '';

      if (data.length === 0) {
        bookingsList.innerHTML = '<p>No bookings found.</p>';
        return;
      }

      data.forEach(booking => {
        const card = document.createElement('div');
        card.classList.add('booking-card');

        let html = `
          <h3>Room ${booking.room_number}</h3>
          <p><strong>${booking.room_type}</strong></p>
          <p>${booking.description}</p>
          <p><strong>Check-in:</strong> ${formatDate(booking.check_in)}</p>
          <p><strong>Check-out:</strong> ${formatDate(booking.check_out)}</p>
          <p><strong>Total Amount:</strong> Ksh ${booking.total_amount}</p>
        `;

        if (booking.addons && booking.addons.length > 0) {
          html += '<h4>Added Extras:</h4><ul>';
          booking.addons.forEach(addon => {
            html += `<li>${addon.name || 'Addon'} - Ksh ${addon.price || 0}</li>`;
          });
          html += '</ul>';
        } else {
          html += '<p>No extras selected.</p>';
        }

        html += `
          <button onclick='showEditForm(${JSON.stringify(booking)})'>Edit</button>
          <button onclick='cancelBooking(${booking.booking_id})'>Cancel</button>
        `;

        card.innerHTML = html;
        bookingsList.appendChild(card);
      });
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }

  window.cancelBooking = async function (bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await fetch('http://localhost:5000/api/bookings/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      });
      alert('Booking cancelled.');
      fetchBookings();
    } catch (err) {
      alert('Error cancelling booking.');
      console.error(err);
    }
  };

  window.showEditForm = async function (booking) {
    const form = document.getElementById('edit-form-container');
    form.style.display = 'block';

    document.getElementById('edit-booking-id').value = booking.booking_id;
    document.getElementById('edit-check-in').value = booking.check_in.split('T')[0];
    document.getElementById('edit-check-out').value = booking.check_out.split('T')[0];

    const roomSelect = document.getElementById('edit-room');
    roomSelect.innerHTML = ''; // clear old options

    const rooms = await (await fetch('http://localhost:5000/api/rooms')).json();
    rooms.forEach(room => {
      const opt = document.createElement('option');
      opt.value = room.room_id;
      opt.dataset.price = room.price;
      opt.textContent = `${room.room_type} - Ksh ${room.price}`;
      if (room.room_id === booking.room_id) opt.selected = true;
      roomSelect.appendChild(opt);
    });

    const addonsDiv = document.getElementById('edit-addons-container');
    addonsDiv.innerHTML = ''; // clear old checkboxes

    const allAddons = await (await fetch('http://localhost:5000/api/addons')).json();
    const selectedAddons = booking.addons.map(a => a.addon_id);

    allAddons.forEach(addon => {
      const div = document.createElement('div');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = addon.addon_id;
      cb.id = `addon-${addon.addon_id}`;
      cb.dataset.price = addon.addon_price;
      cb.dataset.name = addon.addon_name.toLowerCase();
      if (selectedAddons.includes(addon.addon_id)) cb.checked = true;

      const label = document.createElement('label');
      label.htmlFor = cb.id;
      label.textContent = `${addon.addon_name} - Ksh ${addon.addon_price}`;

      div.appendChild(cb);
      div.appendChild(label);
      addonsDiv.appendChild(div);
    });

    calculateEditTotal();

    document.getElementById('cancel-edit-btn').onclick = () => {
      form.style.display = 'none';
    };
  };

  function calculateEditTotal() {
    const checkIn = new Date(document.getElementById('edit-check-in').value);
    const checkOut = new Date(document.getElementById('edit-check-out').value);
    if (checkOut <= checkIn) return;

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const room = document.getElementById('edit-room');
    const price = parseFloat(room.options[room.selectedIndex].dataset.price);

    let addonTotal = 0;
    document.querySelectorAll('#edit-addons-container input[type=checkbox]:checked').forEach(cb => {
      const addonPrice = parseFloat(cb.dataset.price);
      const isPerNight = cb.dataset.name.includes('breakfast');
      addonTotal += isPerNight ? (addonPrice * nights) : addonPrice;
    });

    const total = (price * nights) + addonTotal;
    document.getElementById('edit-total-amount').textContent = total.toFixed(2);
  }

  ['edit-check-in', 'edit-check-out', 'edit-room'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', calculateEditTotal);
  });

  const addonsDiv = document.getElementById('edit-addons-container');
  addonsDiv.addEventListener('change', calculateEditTotal);

  document.getElementById('save-edit-booking').addEventListener('click', async () => {
    const bookingId = document.getElementById('edit-booking-id').value;
    const checkIn = document.getElementById('edit-check-in').value;
    const checkOut = document.getElementById('edit-check-out').value;
    const roomId = document.getElementById('edit-room').value;
    const selectedAddons = Array.from(document.querySelectorAll('#edit-addons-container input[type=checkbox]:checked')).map(cb => parseInt(cb.value));
    const total = parseFloat(document.getElementById('edit-total-amount').textContent);

    try {
      await fetch('http://localhost:5000/api/bookings/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          user_id: userId,
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
          total_amount: total,
          bookingaddons: selectedAddons
        })
      });
      alert('Booking updated.');
      document.getElementById('edit-form-container').style.display = 'none';
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking.');
      console.error(err);
    }
  });

  fetchBookings();
});
