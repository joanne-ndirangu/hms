document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:5000/api/rooms')  // This URL should be your API endpoint for fetching rooms
        .then(response => response.json())
        .then(rooms => {
            const roomsList = document.getElementById('rooms-list');
            rooms.forEach(room => {
                const roomCard = document.createElement('div');
                roomCard.classList.add('room-card');
                roomCard.innerHTML = `
                    <div class="room-card-body">
                      <!--  <img src="${room.image}" class="room-img" alt="${room.room_type}"> -->
                        <div class="room-details">
                            <h5 class="room-title">${room.room_type}</h5> <!-- room.room_type -->
                            <p class="room-description">${room.description}</p>
                            <p class="room-price"><strong>Price:</strong> Ksh ${room.price} per night</p>
                            <a href="../booking/booking.html?roomId=${room.room_id}" class="book-now-btn">Book Now</a>
                        </div>
                    </div>
                `;
                roomsList.appendChild(roomCard);
            });
        })
        .catch(error => console.log('Error fetching rooms:', error));
});
