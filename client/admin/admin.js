document.addEventListener('DOMContentLoaded', function() {
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const guestForm = document.querySelector('.guest-card');
    
    toggleFormBtn.addEventListener('click', function() {
      if (guestForm.style.display === 'none') {
        guestForm.style.display = 'block';
        toggleFormBtn.textContent = '- Hide Form';
      } else {
        guestForm.style.display = 'none';
        toggleFormBtn.textContent = '+ Add New Guest';
      }
    });

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();  // Customize the format as needed
    }    
  
    // Function to fetch recent guests
    function fetchGuests() {
        fetch("http://localhost:5000/api/guests/recent")
            .then(response => response.json())
            .then(data => displayGuests(data))
            .catch(error => console.error('Error fetching guests:', error));
    }

    // Function to display guests in the DOM
    function displayGuests(guests) {
        const guestsTableBody = document.getElementById('recent-guests-body');
        guestsTableBody.innerHTML = ''; // Clear the list before adding new data

        guests.forEach(guest => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${guest.first_name} ${guest.last_name}</td>
                <td>${guest.email}</td>
                <td>${guest.room_type}</td>
                <td>${guest.booking_status}</td>
                <td>${formatDate(guest.check_in)}</td>
                <td>${formatDate(guest.check_out)}</td>
            `;
            guestsTableBody.appendChild(row);
        });
    }

    // Call the fetch function on page load to display recent guests
    fetchGuests();

    

    // Function to fetch rooms and display them in the room status section
    function fetchRooms() {
        fetch("http://localhost:5000/api/rooms")
            .then(response => response.json())
            .then(data => displayRooms(data))
            .catch(error => console.error('Error fetching rooms:', error));
    }

    // Function to display rooms in the DOM
    function displayRooms(rooms) {
        const roomsGrid = document.querySelector('.rooms-grid');
        roomsGrid.innerHTML = ''; // Clear the grid before adding new data

        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.classList.add('room-card');

            roomCard.innerHTML = `
                <img src="${room.image || '/api/placeholder/300/180'}" alt="${room.room_type}">
                <div class="room-card-content">
                    <span class="status ${room.status.toLowerCase()}">${room.status}</span>
                    <h3>${room.room_type} ${room.room_number}</h3>
                    <p>${room.description}</p>
                    <p class="price">Ksh ${room.price} per night</p>
                </div>
            `;

            roomsGrid.appendChild(roomCard);
        });
    }

    // Call fetchRooms to load rooms on page load
    fetchRooms();
});

// Fetch and display dashboard metrics
function fetchDashboardMetrics() {
    fetch('http://localhost:5000/api/dashboard/total-guests')
      .then(res => res.json())
      .then(data => {
        console.log("Guests:", data);
        document.getElementById('total-guests').textContent = data.total ?? 0;
      });
  
    fetch('http://localhost:5000/api/dashboard/rooms-occupied')
      .then(res => res.json())
      .then(data => {
        console.log("Rooms:", data);
        // We only have occupied_rooms, so display as 0/-
        document.getElementById('rooms-occupied').textContent = `${data.occupied_rooms ?? 0} / ${data.total_rooms ?? '-'}`;
      });
  
    fetch('http://localhost:5000/api/dashboard/bookings-today')
      .then(res => res.json())
      .then(data => {
        console.log("Bookings:", data);
        document.getElementById('bookings-today').textContent = data.today_bookings ?? 0;
      });
  
    fetch('http://localhost:5000/api/dashboard/revenue-month')
      .then(res => res.json())
      .then(data => {
        console.log("Revenue:", data);
        const revenue = data.monthly_revenue ?? 0;
        document.getElementById('revenue-month').textContent = `KSH ${Number(revenue).toLocaleString()}`;
      });
  }  
  
  // Call this when the DOM is ready
  fetchDashboardMetrics();
  