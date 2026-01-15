document.addEventListener('DOMContentLoaded', function () {
    const roomId = new URLSearchParams(window.location.search).get('roomId');
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    const availabilityMessage = document.getElementById('availability-message');
    const bookNowBtn = document.getElementById('book-now-btn');
    const bookingForm = document.getElementById('booking-form');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    const addonGroup = document.querySelector('.addon-group');
    const priceAmount = document.getElementById('price-amount');

    const today = new Date().toISOString().split('T')[0];
    checkInInput.min = today;
    checkOutInput.min = today;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        console.error('User ID not found. Please login first.');
        return;
    }

    let roomPrice = 0;
    let totalAmount = 0;

    function updateTotalPrice() {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (isNaN(numberOfNights) || numberOfNights <= 0) {
            priceAmount.textContent = '0.00';
            return;
        }

        totalAmount = roomPrice * numberOfNights;

        // Loop through add-ons
        document.querySelectorAll('.addon-checkbox:checked').forEach(addon => {
            const addonPrice = parseFloat(addon.dataset.price);
            const addonName = addon.dataset.name;

            // If it's "Breakfast", calculate per day
            if (addonName === 'Breakfast') {
                totalAmount += addonPrice * numberOfNights;  // Multiply by number of nights for per day charge
            } else {
                totalAmount += addonPrice;  // One-time charge for other add-ons
            }
        });

        priceAmount.textContent = totalAmount.toFixed(2);
    }

    // Fetch available add-ons
    fetch('http://localhost:5000/api/addons')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                data.forEach(addon => {
                    const addonLabel = document.createElement('label');
                    const addonCheckbox = document.createElement('input');
                    addonCheckbox.type = 'checkbox';
                    addonCheckbox.classList.add('addon-checkbox');
                    addonCheckbox.dataset.price = addon.addon_price;  // Using addon_price directly
                    addonCheckbox.dataset.name = addon.addon_name;    // Using addon_name directly
                    addonCheckbox.dataset.id = addon.addon_id;        // Storing addon_id for later use

                    addonLabel.appendChild(addonCheckbox);
                    addonLabel.appendChild(document.createTextNode(` ${addon.addon_name} (+Ksh ${addon.addon_price})`));  // Displaying the name and price
                    addonGroup.appendChild(addonLabel);
                });

                document.querySelectorAll('.addon-checkbox').forEach(addon => {
                    addon.addEventListener('change', updateTotalPrice);
                });

                updateTotalPrice();
            } else {
                console.error('Failed to fetch add-ons');
            }
        })
        .catch(error => {
            console.error('Error fetching add-ons:', error);
        });

    // Fetch room price
    fetch(`http://localhost:5000/api/rooms/${roomId}`)
        .then(response => response.json())
        .then(data => {
            if (data.price) {
                roomPrice = parseFloat(data.price);
                updateTotalPrice();
            } else {
                console.error('Room price not found');
            }
        })
        .catch(error => {
            console.error('Error fetching room price:', error);
        });

    function validateDates(checkIn, checkOut) {
        return new Date(checkIn) < new Date(checkOut);
    }

    function checkAvailability() {
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;

        if (checkIn && checkOut) {
            if (!validateDates(checkIn, checkOut)) {
                availabilityMessage.textContent = 'Check-in date must be before check-out date.';
                availabilityMessage.style.color = 'red';
                bookNowBtn.disabled = true;
                return;
            }

            fetch('http://localhost:5000/api/bookings/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: roomId,
                    check_in: checkIn,
                    check_out: checkOut
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.available) {
                        availabilityMessage.textContent = 'Room is available!';
                        availabilityMessage.style.color = 'green';
                        bookNowBtn.disabled = false;
                    } else {
                        availabilityMessage.textContent = 'Room is not available for the selected dates.';
                        availabilityMessage.style.color = 'red';
                        bookNowBtn.disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Error checking availability:', error);
                });

            updateTotalPrice();
        }
    }

    checkInInput.addEventListener('change', checkAvailability);
    checkOutInput.addEventListener('change', checkAvailability);

    bookNowBtn.addEventListener('click', function () {
        bookingForm.style.display = 'block';
    });

    confirmBookingBtn.addEventListener('click', function () {
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        const finalAmount = parseFloat(priceAmount.textContent);

        fetch('http://localhost:5000/api/bookings/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                room_id: roomId,
                check_in: checkIn,
                check_out: checkOut,
                total_amount: finalAmount
            })
        })
            .then(response => response.json())
            .then(data => {
                const bookingId = data.bookingId;
                if (!bookingId) {
                    alert('Booking failed.');
                    return;
                }

                const addons = document.querySelectorAll('.addon-checkbox:checked');
                if (addons.length === 0) {
                    alert('Booking confirmed!');
                    return;
                }

                const addonPromises = Array.from(addons).map(addon => {
                    const addonId = addon.dataset.id;  // Using addon_id from the checkbox dataset
                    return addAddon(bookingId, addonId);  // Send addon_id to add the addon
                });

                Promise.all(addonPromises)
                    .then(() => {
                        alert('Booking and add-ons confirmed!');
                    })
                    .catch(err => {
                        console.error('Error adding add-ons:', err);
                        alert('Booking created, but some add-ons failed.');
                    });
            })
            .catch(error => {
                console.error('Error creating booking:', error);
                alert('Booking failed.');
            });
    });

    function addAddon(bookingId, addonId) {
        return fetch('http://localhost:5000/api/addons/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_id: bookingId,
                addon_id: addonId  // Send addon_id as intended
            })
        }).then(response => {
            if (!response.ok) throw new Error('Failed to add addon');
            return response.text();
        });
    }
});
