document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("signup-form").addEventListener("submit", function(event) {
        event.preventDefault();
        handleSignUp();
    });
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

function handleSignUp() {
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    hideMessage(true);  // Clear any previous error message
    hideMessage(false);  // Clear any previous success message

    if (!firstName || !lastName || !email || !password) {
        showMessage("Please fill in all fields.", true);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', true);
    return;
    }

    fetch("http://localhost:5000/api/guests/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, true);
        } else {
            showMessage("Sign up successful!");

            // Store user_id in localStorage
            localStorage.setItem('user_id', data.userId);

            // Redirect to guest home page
            window.location.href = "../login/login.html";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showMessage("An error occurred, please try again.", true);
    });
}
