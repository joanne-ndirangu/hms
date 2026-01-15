document.getElementById("guest-button").addEventListener("click", function() {
    selectRole("guest");
});

document.getElementById("admin-button").addEventListener("click", function() {
    selectRole("admin");
});

function showMessage(message, isError = false) {
    const messageContainer = isError ? document.getElementById("error-message") : document.getElementById("success-message");
    messageContainer.innerHTML = message;
    messageContainer.style.display = "block";
    if (isError) {
        messageContainer.style.color = "red";  // Red for error messages
    } else {
        messageContainer.style.color = "green";  // Green for success messages
    }
}

function hideMessage(isError = false) {
    const messageContainer = isError ? document.getElementById("error-message") : document.getElementById("success-message");
    messageContainer.style.display = "none";
}

function selectRole(role) {
    // Hide role selection and show login form
    document.getElementById("role-selection").style.display = "none";
    document.getElementById("login-form").style.display = "block";

    // Store the selected role globally
    window.selectedRole = role;
    // Conditionally show/hide the sign-up link
    const signupLink = document.getElementById("signup-link");
    if (role === "guest") {
        signupLink.style.display = "block";  // Show the sign-up link for guest
    } else {
        signupLink.style.display = "none";  // Hide the sign-up link for admin
    }
}

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    handleLogin();
});

function handleLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    hideMessage(true);  // Clear any previous error message
    hideMessage(false);  // Clear any previous success message

    if (!email || !password || !window.selectedRole) {
        showMessage("Please enter your email, password, and select a role.", true);
        return;
    }

    let url = "";
    if (window.selectedRole === "guest") {
        url = "http://localhost:5000/api/guests/login";
    } else if (window.selectedRole === "admin") {
        url = "http://localhost:5000/api/admin/login";
    } else {
        showMessage("Invalid role selected", true);
        return;
    }

    console.log("Selected Role: ", window.selectedRole);  // Debugging: Check selected role

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
            // role: window.selectedRole, // Send the selected role
        }),
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 'Login failed. Please try again.';
            throw new Error(errorMessage);
        }
        return response.json();
    })
    
    .then(data => {
        showMessage("Login successful!");

        // Check if user_id is valid
        if (data.userId) {
            localStorage.setItem('user_id', data.userId);  // Store user_id
            localStorage.setItem('user_name', data.first_name + ' ' + data.last_name);  // Store user's name
            console.log('User ID stored in localStorage:', data.userId);
        } else {
            console.log('Error: userId is undefined');
        }

        if (window.selectedRole === "guest") {
            window.location.href = "../guest/home/home.html";
        } else if (window.selectedRole === "admin") {
            window.location.href = "../admin/admin.html";
        } else {
            showMessage("Unknown role, cannot redirect.", true);
        }
    })

    .catch(async (error) => {
        console.error('Error:', error);
    
        if (error.message) {
            showMessage(error.message, true); // Show the backend's exact error message
        } else {
            showMessage("Login failed. Please try again.", true);
        }
    });    
}