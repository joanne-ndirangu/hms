const toggleButton = document.getElementById('toggle-form-btn');
const addRoomForm = document.getElementById('add-room-form');
const createRoomButton = document.getElementById('create-room');
const roomIdInput = document.getElementById('room-id'); // Add this to track the room id when updating

// Ensure the form is visible and call fetchRooms on page load
document.addEventListener("DOMContentLoaded", function() {
    fetchRooms(); // Fetch rooms on page load
});

  // Search bar
setupSearch('search-room', 'rooms-list');

function setupSearch(inputId, containerId) {
    const searchInput = document.getElementById(inputId);
    const container = document.getElementById(containerId);

    if (!searchInput || !container) return;

    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const items = container.getElementsByClassName('room'); // Use your .room cards

        Array.from(items).forEach(item => {
            const itemText = item.textContent.toLowerCase();
            item.style.display = itemText.includes(filter) ? '' : 'none';
        });
    });
}


// Toggle form visibility
toggleButton.addEventListener('click', () => {
    addRoomForm.style.display = addRoomForm.style.display === 'none' ? 'block' : 'none';
  });


// Fetch all rooms and display them
function fetchRooms() {
    fetch("http://localhost:5000/api/rooms")
        .then(response => response.json())
        .then(data => {
            const roomsList = document.getElementById("rooms-list");
            roomsList.innerHTML = ""; // Clear current list

            data.forEach(room => {
                const roomItem = document.createElement("div");
                roomItem.classList.add("room");

                roomItem.innerHTML = `
                    <h3>Room ${room.room_number}</h3>
                    <p>Type: ${room.room_type}</p>
                    <p>Price: Ksh ${room.price}</p>
                    <p>Status: ${room.status}</p>
                    <p>Description: ${room.description}</p>
                    <img src="${room.image}" alt="Room Image">
                    <button data-id="${room.room_id}" onclick="updateRoom(event)">Update</button>
                    <button data-id="${room.room_id}" onclick="deleteRoom(event)">Delete</button>
                `;

                roomsList.appendChild(roomItem);
            });
        })
        .catch(error => {
            console.error("Error fetching rooms:", error);
        });
}

// Create or update room
createRoomButton.addEventListener('click', () => {
    const roomId = roomIdInput.value;  // Check if there's an existing room id (for update)
    const roomNumber = document.getElementById('room-number').value;
    const roomType = document.getElementById('room-type').value;
    const price = parseFloat(document.getElementById('price').value);
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value;
    const image = document.getElementById('image').value;

    if (roomNumber && roomType && price && status && description && image) {
        const requestBody = {
            room_number: roomNumber,
            room_type: roomType,
            price: price,
            status: status,
            description: description,
            image: image
        };

        // Check if we're updating an existing room or creating a new one
        const method = roomId ? 'PUT' : 'POST';
        const url = roomId ? `http://localhost:5000/api/rooms/${roomId}` : "http://localhost:5000/api/rooms";

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error.error) });
            }
            return response.json();
        })
        .then(data => {
            alert(roomId ? "Room updated successfully!" : "Room created successfully!");
            fetchRooms(); // Refresh the list of rooms after successful creation or update
            form.style.display = 'none'; // Hide the form after submitting
            resetForm(); // Reset form inputs
        })
        .catch(error => {
            console.error('Error creating/updating room:', error);
            alert('Failed to create/update room: ' + error.message);
        });
    } else {
        alert("Please fill out all fields.");
    }
});

// Update room details
function updateRoom(event) {
    const roomId = event.target.getAttribute('data-id');  // Get the room ID
    fetch(`http://localhost:5000/api/rooms/${roomId}`)
        .then(response => response.json())
        .then(room => {
            // Populate the form with the existing room data
            roomIdInput.value = room.room_id;  // Store the room ID for the update
            document.getElementById('room-number').value = room.room_number;
            document.getElementById('room-type').value = room.room_type;
            document.getElementById('price').value = room.price;
            document.getElementById('status').value = room.status;
            document.getElementById('description').value = room.description;
            document.getElementById('image').value = room.image;

            // Change the button text to "Update Room"
            createRoomButton.innerText = 'Update Room';

            // Scroll to the form when updating
            form.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error fetching room data:', error);
        });
}

// Reset form after submitting
function resetForm() {
    document.getElementById('room-id').value = ''; // Clear room ID
    document.getElementById('room-number').value = '';
    document.getElementById('room-type').value = '';
    document.getElementById('price').value = '';
    document.getElementById('status').value = '';
    document.getElementById('description').value = '';
    document.getElementById('image').value = '';
    createRoomButton.innerText = 'Create Room'; // Reset button text
}

// Delete room
function deleteRoom(event) {
    const roomId = event.target.getAttribute('data-id');  // Assuming you have the room's ID on the button

    if (confirm("Are you sure you want to delete this room?")) {
        fetch(`http://localhost:5000/api/rooms/${roomId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw new Error(error.error) });
                }
                return response.json();
            })
            .then(data => {
                alert("Room deleted successfully!");
                fetchRooms(); // Refresh the list of rooms after successful deletion
            })
            .catch(error => {
                console.error('Error deleting room:', error);
                alert('Failed to delete room: ' + error.message);
            });
    }
}
