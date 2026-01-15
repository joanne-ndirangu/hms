document.addEventListener('DOMContentLoaded', async function () {
  const roomSelect = document.getElementById('room-id');
  const addonsContainer = document.getElementById('addons-container');
  const totalDisplay = document.getElementById('total-amount');
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');
  const messageBox = document.getElementById('message');

  const toggleFormBtn = document.getElementById('toggle-form-btn');
  const addBookingForm = document.getElementById('add-booking-form');
  const createBookingBtn = document.getElementById('create-booking');
  const bookingsTableBody = document.getElementById('bookings-table-body');

  const editPopup = document.getElementById('edit-booking-popup');
  const deletePopup = document.getElementById('delete-booking-popup');


  let rooms = [];
  let addons = [];

  // Search bar
  const searchInput = document.getElementById('booking-search');

  searchInput.addEventListener('input', function () {
    const filter = searchInput.value.toLowerCase();
    const rows = bookingsTableBody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
      const rowText = row.textContent.toLowerCase();
      row.style.display = rowText.includes(filter) ? '' : 'none';
    });
  });

  function showMessage(text, type = 'success') {
    messageBox.textContent = text;
    messageBox.style.color = type === 'error' ? 'red' : 'green';
    setTimeout(() => (messageBox.textContent = ''), 3000);
  }

  function calculateTotal() {
    const selectedRoom = roomSelect.options[roomSelect.selectedIndex];
    const roomPrice = parseFloat(selectedRoom?.dataset.price || 0);

    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);

    let days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (isNaN(days) || days <= 0) days = 1;

    let total = roomPrice * days;

    const selectedAddons = addonsContainer.querySelectorAll('input[type="checkbox"]:checked');
    selectedAddons.forEach(cb => {
      const addonPrice = parseFloat(cb.dataset.price || 0);
      const addonName = cb.nextSibling.textContent.trim().toLowerCase(); // label text

      // If addon is breakfast, charge per night
      if (addonName.includes('breakfast')) {
        total += addonPrice * days;
      } else {
        total += addonPrice;
      }
    });

    totalDisplay.textContent = total.toFixed(2);
    return total;
  }

  checkInInput.addEventListener('change', calculateTotal);
  checkOutInput.addEventListener('change', calculateTotal);
  roomSelect.addEventListener('change', calculateTotal);
  addonsContainer.addEventListener('change', calculateTotal);

  toggleFormBtn.addEventListener('click', () => {
    addBookingForm.style.display = addBookingForm.style.display === 'none' ? 'block' : 'none';
  });

  async function fetchRooms() {
    try {
      const res = await fetch('http://localhost:5000/api/rooms');
      rooms = await res.json();
      roomSelect.innerHTML = '';
      rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.room_id;
        option.dataset.price = room.price;
        option.textContent = `${room.room_type} - Ksh ${room.price}`;
        roomSelect.appendChild(option);
      });
      calculateTotal();
    } catch (err) {
      console.error('Failed to fetch rooms', err);
      showMessage('Failed to load rooms', 'error');
    }
  }

  async function fetchAddons() {
    try {
      const res = await fetch('http://localhost:5000/api/addons');
      addons = await res.json();
      addonsContainer.innerHTML = '';
      addons.forEach(addon => {
        const div = document.createElement('div');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = addon.addon_id;
        cb.dataset.price = addon.addon_price;
        cb.id = `addon-${addon.addon_id}`;

        const label = document.createElement('label');
        label.setAttribute('for', cb.id);
        label.textContent = `${addon.addon_name} (Ksh ${addon.addon_price})`;

        div.appendChild(cb);
        div.appendChild(label);
        addonsContainer.appendChild(div);
      });
      calculateTotal();
    } catch (err) {
      console.error('Failed to fetch addons', err);
      showMessage('Failed to load add-ons', 'error');
    }
  }

  async function fetchBookings() {
    try {
      bookingsTableBody.innerHTML = '';
      const res = await fetch('http://localhost:5000/api/bookings');
      const bookings = await res.json();

      bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${booking.booking_id}</td>
          <td>${booking.user_name}</td>
          <td>${booking.room_number}</td>
          <td>${booking.room_type}</td>
          <td>${new Date(booking.check_in).toLocaleDateString()}</td>
          <td>${new Date(booking.check_out).toLocaleDateString()}</td>
          <td>${booking.total_amount}</td>
          <td>${booking.status}</td>
          <td>${booking.addons?.map(a => `${a.name} (Ksh ${a.price})`).join(', ') || 'None'}</td>
          <td>
            <button onclick="startEditBooking(${booking.booking_id})">Edit</button>
            <button onclick="startDeleteBooking(${booking.booking_id})">Delete</button>
          </td>
        `;
        bookingsTableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      showMessage('Failed to load bookings', 'error');
    }
  }

  async function addAddon(bookingId, addonId) {
    const res = await fetch('http://localhost:5000/api/addons/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        addon_id: addonId,
      }),
    });
    if (!res.ok) throw new Error('Failed to add addon');
    return res.text();
  }

  createBookingBtn.addEventListener('click', async () => {
    const userId = document.getElementById('user-id').value.trim();
    const roomId = roomSelect.value;
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;

    if (!userId || isNaN(userId)) {
      showMessage('Please enter a valid User ID', 'error');
      return;
    }
    if (!checkIn) {
      showMessage('Please select a check-in date', 'error');
      return;
    }
    if (!checkOut) {
      showMessage('Please select a check-out date', 'error');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      showMessage('Check-out date must be after check-in date', 'error');
      return;
    }
    if (!roomId) {
      showMessage('Please select a room', 'error');
      return;
    }

    const totalAmount = calculateTotal();
    const selectedAddons = Array.from(addonsContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));

    try {
      const res = await fetch('http://localhost:5000/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          room_id: parseInt(roomId),
          check_in: checkIn,
          check_out: checkOut,
          total_amount: totalAmount,
        }),
      });

      if (!res.ok) throw new Error('Failed to create booking');

      const data = await res.json();
      const bookingId = data.bookingId;

      if (!bookingId) {
        showMessage('Booking creation failed.', 'error');
        return;
      }

      if (selectedAddons.length === 0) {
        showMessage('Booking confirmed without add-ons!');
        await fetchBookings();
        addBookingForm.style.display = 'none';
        return;
      }

      // Add selected add-ons one by one
      const addonPromises = selectedAddons.map(addonId => addAddon(bookingId, addonId));
      await Promise.all(addonPromises);

      showMessage('Booking and add-ons confirmed!');
      await fetchBookings();
      addBookingForm.style.display = 'none';
    } catch (error) {
      console.error(error);
      showMessage('Booking failed. ' + error.message, 'error');
    }
  });


// Delete Booking
window.startDeleteBooking = function (id) {
    document.getElementById('delete-booking-id').value = id;
    deletePopup.style.display = 'block';
  };

  document.getElementById('confirm-delete').addEventListener('click', async () => {
  const id = document.getElementById('delete-booking-id').value;
  try {
    const res = await fetch('http://localhost:5000/api/bookings/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: id })
    });

    if (!res.ok) throw new Error('Failed to delete booking');
    showMessage('Booking deleted successfully!');
    deletePopup.style.display = 'none';
    await fetchBookings();
  } catch (err) {
    console.error(err);
    showMessage('Error deleting booking', 'error');
  }
});


  document.getElementById('cancel-delete').addEventListener('click', () => {
    deletePopup.style.display = 'none';
  });


  // Initial data fetch
  await fetchRooms();
  await fetchAddons();
  await fetchBookings();
});
