const express = require('express');
const dotenv = require('dotenv');
const db = require('./db');  // Import the db connection
dotenv.config();

const app = express();

const cors = require('cors');
app.use(cors()); // This will allow all domains to access the server

// Middleware
app.use(express.json());  // To parse JSON bodies
app.use(express.static('client/components')); // Serve static files like images
// Serve images from client/images
app.use('/images', express.static(__dirname + '/../client/images'));


// Set up routes
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const reservationsRoutes = require('./routes/reservations');
const guestsRoutes = require('./routes/guests');
const roomsRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/admin');
const reviewsRoutes = require('./routes/reviews');
const addonsRoutes = require('./routes/addons');
const mpesaRoutes = require('./routes/mpesa');
const reportsRoutes = require('./routes/reports')
const dashboardRoutes = require('./routes/dashboard')
const gmailRoutes = require('./routes/gmail');

// Use the routes with their paths
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/addons', addonsRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/gmail', gmailRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
