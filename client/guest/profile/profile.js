document.addEventListener('DOMContentLoaded', function () {
  const updateForm = document.getElementById('update-guest-form');
  const confirmModal = document.getElementById('confirmModal');

  const editBtn = document.getElementById('edit-profile-btn');
  const deleteBtn = document.getElementById('delete-account-btn');
  const saveUpdateBtn = document.getElementById('save-update');
  const cancelUpdateBtn = document.getElementById('cancel-update');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  // Retrieve user data from localStorage
  const userId = localStorage.getItem('user_id');
  const userName = localStorage.getItem('user_name');

  // Check if user is logged in
  if (!userId || !userName) {
    alert("Please log in to view your profile.");
    window.location.href = 'login.html';  // Redirect to login page if not logged in
    return;
  }

  const togglePassword = document.getElementById('toggle-password');
  const passwordField = document.getElementById('password');
  
 // Toggle password visibility when the eye icon is clicked
 togglePassword.addEventListener('click', function () {
  const type = passwordField.type === 'password' ? 'text' : 'password';
  passwordField.type = type;

  // Toggle the eye icon
  const icon = togglePassword.querySelector('i');
  icon.classList.toggle('fa-eye');        // Show eye icon
  icon.classList.toggle('fa-eye-slash');  // Show eye icon with slash
});

  // Fetch the profile data from the API based on logged-in user ID
  fetch(`http://localhost:5000/api/guests/profile/${userId}`)
    .then(response => response.json())
    .then(data => {
      if (data) {
        // Populate the profile UI with data fetched from the server
        updateProfileUI(data);
      } else {
        alert("Failed to load profile data.");
      }
    })
    .catch(error => {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile data.');
    });

  // Function to update the profile UI with user data
  function updateProfileUI(user) {
    document.getElementById('user-first-name').textContent = user.first_name;
    document.getElementById('user-last-name').textContent = user.last_name;
    document.getElementById('user-email').textContent = user.email;

    // Pre-fill update form with user data
    document.getElementById('update-guest-id').value = user.user_id;
    document.getElementById('update-first-name').value = user.first_name;
    document.getElementById('update-last-name').value = user.last_name;
    document.getElementById('update-email').value = user.email;
  }

  // Initially, hide edit form and delete confirmation modal
  updateForm.style.display = 'none';
  confirmModal.style.display = 'none';

  // Show the update form when Edit button is clicked
  editBtn.addEventListener('click', function () {
    updateForm.style.display = 'block';
    confirmModal.style.display = 'none'; // Hide the delete modal if editing
  });

  // Show delete confirmation modal when Delete button is clicked
  deleteBtn.addEventListener('click', function () {
    confirmModal.style.display = 'block';
    updateForm.style.display = 'none'; // Hide update form if deleting account
  });

  // Save profile updates
 saveUpdateBtn.addEventListener('click', function () {
  const guestId = document.getElementById('update-guest-id').value;
  const firstName = document.getElementById('update-first-name').value.trim();
  const lastName = document.getElementById('update-last-name').value.trim();
  const email = document.getElementById('update-email').value.trim();
  const password = document.getElementById('update-password').value;

  const updateMsg = document.getElementById('update-message');
  updateMsg.textContent = '';
  updateMsg.className = 'form-message';

  if (!firstName || !lastName || !email) {
    updateMsg.textContent = "Please fill all the required fields.";
    updateMsg.classList.remove('error', 'success');
    updateMsg.classList.add('error'); 
    return;
  }

  const requestBody = {
    guestId,
    firstName,
    lastName,
    email,
    newPassword: password || undefined
  };

  fetch("http://localhost:5000/api/guests/update", {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })
    .then(async response => {
      const data = await response.json();

      if (!response.ok) {
        updateMsg.textContent = data.error || 'An error occurred.';
        updateMsg.classList.add('error');
        return;
      }

      updateMsg.textContent = "Your profile has been updated.";
      updateMsg.classList.add('success');

      localStorage.setItem('user_id', guestId);
      localStorage.setItem('user_name', firstName + ' ' + lastName);

      updateProfileUI({
        user_id: guestId,
        first_name: firstName,
        last_name: lastName,
        email
      });

      document.getElementById('update-password').value = "";
      setTimeout(() => {
        updateForm.style.display = 'none';
        updateMsg.textContent = '';
      }, 2000);
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      updateMsg.textContent = 'Failed to update profile.';
      updateMsg.classList.add('error');
    });
});


  // Cancel update and hide the update form
  cancelUpdateBtn.addEventListener('click', function () {
    updateForm.style.display = 'none';
  });

  // Confirm account deletion
  confirmDeleteBtn.addEventListener('click', function () {
    const email = document.getElementById('delete-email').value;
    if (email !== email) {
      alert("Please enter your email to confirm.");
      return;
    }

    fetch("http://localhost:5000/api/guests/delete", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
      alert("Your account has been deleted.");
      localStorage.removeItem('user_id'); // Remove user data from localStorage
      localStorage.removeItem('user_name');
      confirmModal.style.display = 'none'; // Hide the delete confirmation modal
      window.location.href = '../../index.html'; // Redirect to landing page
    })
    .catch(error => {
      console.error('Error deleting account:', error);
      alert('Failed to delete account.');
    });
  });

  // Cancel account deletion
  cancelDeleteBtn.addEventListener('click', function () {
    confirmModal.style.display = 'none';
  });
});
