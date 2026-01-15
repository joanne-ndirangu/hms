document.addEventListener('DOMContentLoaded', function () {
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const addGuestForm = document.getElementById('add-guest-form');

    toggleFormBtn.addEventListener('click', () => {
        addGuestForm.style.display = addGuestForm.style.display === 'none' ? 'block' : 'none';
      });

    fetchGuests(); // Fetch all guests on page load
    setupTableSearch('search-guest', 'guests-table-body');


    function setupTableSearch(inputId, tableBodyId) {
    const searchInput = document.getElementById(inputId);
    const tableBody = document.getElementById(tableBodyId);

    if (!searchInput || !tableBody) return;

    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const rows = tableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(filter) ? '' : 'none';
        });
    });
    }

    // Function to fetch all guests
    function fetchGuests() {
        fetch("http://localhost:5000/api/guests")
            .then(response => response.json())
            .then(data => displayGuests(data))
            .catch(error => console.error('Error fetching guests:', error));
    }

    // Function to display guests in the DOM
    function displayGuests(guests) {
        const guestsTableBody = document.getElementById('guests-table-body');
        guestsTableBody.innerHTML = ''; // Clear the list before adding new data

        guests.forEach(guest => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${guest.user_id}</td>
                <td>${guest.first_name}</td>
                <td>${guest.last_name}</td>
                <td>${guest.email}</td>
                <td>
                    <button class="update-guest" data-id="${guest.user_id}">Update</button>
                    <button class="delete-guest" data-id="${guest.user_id}">Delete</button>
                </td>
            `;
            guestsTableBody.appendChild(row);
        });


        // Add event listeners for delete and update buttons
        document.querySelectorAll('.delete-guest').forEach(button => {
            button.addEventListener('click', deleteGuest);
        });
        document.querySelectorAll('.update-guest').forEach(button => {
            button.addEventListener('click', updateGuest);
        });
    }


// Update guest profile
function updateGuest(event) {
    const guestId = event.target.getAttribute('data-id');
    const row = event.target.closest('tr');
    const firstName = row.children[1].textContent;
    const lastName = row.children[2].textContent;
    const email = row.children[3].textContent;

    document.getElementById('update-guest-id').value = guestId;
    document.getElementById('update-first-name').value = firstName;
    document.getElementById('update-last-name').value = lastName;
    document.getElementById('update-email').value = email;
    document.getElementById('update-password').value = "";

    document.getElementById('update-guest-form').style.display = 'block';
}

// Handle update save
document.getElementById('save-update').addEventListener('click', function () {
    const guestId = document.getElementById('update-guest-id').value;
    const firstName = document.getElementById('update-first-name').value;
    const lastName = document.getElementById('update-last-name').value;
    const email = document.getElementById('update-email').value;
    const password = document.getElementById('update-password').value;

    const requestBody = {
        guestId, 
        firstName, 
        lastName, 
        email, 
        newPassword: password || undefined // If no password, don't include in the request
    };

    fetch("http://localhost:5000/api/guests/update", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        alert("Guest profile updated!");
        document.getElementById('update-guest-form').style.display = 'none';
        fetchGuests();  // Refresh the guest list after updating
    })
    .catch(error => {
        console.error('Error updating guest:', error);
        alert('Failed to update guest: ' + error.message);
    });
});

// Cancel update
document.getElementById('cancel-update').addEventListener('click', function () {
    document.getElementById('update-guest-form').style.display = 'none';
});


// Show delete modal
function deleteGuest(event) {
    const guestId = event.target.getAttribute('data-id');
    document.getElementById('delete-guest-id').value = guestId;
    document.getElementById('delete-email').value = '';
    document.getElementById('confirmModal').style.display = 'block';
}

// Confirm delete
document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    const guestId = document.getElementById('delete-guest-id').value;
    const email = document.getElementById('delete-email').value;

    if (!email) {
        alert("Please enter the guest's email.");
        return;
    }

    const requestBody = { email };

    fetch(`http://localhost:5000/api/guests/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => {
            alert("Guest deleted successfully!");
            document.getElementById('confirmModal').style.display = 'none';
            fetchGuests();
        })
        .catch(error => {
            console.error('Error deleting guest:', error);
            alert('Failed to delete guest: ' + error.message);
        });
});

// Cancel delete
document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
    document.getElementById('confirmModal').style.display = 'none';
});


    // Event listener for signing up a guest
    document.getElementById('signup-guest').addEventListener('click', function () {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (firstName && lastName && email && password) {
            fetch("http://localhost:5000/api/guests/signup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, email: email, password: password })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    fetchGuests(); // Refresh the list after signup
                })
                .catch(error => console.error('Error signing up guest:', error));
        } else {
            alert("Please fill all the fields.");
        }
    });

    // Event listener for login (optional, if you want to handle login)
    document.getElementById('login-guest').addEventListener('click', function () {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (email && password) {
            fetch("http://localhost:5000/api/guests/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    // Handle successful login (e.g., redirect or show logged-in state)
                })
                .catch(error => console.error('Error logging in guest:', error));
        } else {
            alert("Please provide email and password.");
        }
    });
});
