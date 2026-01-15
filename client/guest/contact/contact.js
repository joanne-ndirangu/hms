document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const message = document.getElementById("message").value;

    // Send the form data using EmailJS
    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
        .then(function(response) {
            console.log('SUCCESS', response);
            alert('Message sent successfully!');
        }, function(error) {
            console.log('FAILED', error);
            alert('Message failed to send. Please try again later.');
        });
});
