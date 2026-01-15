const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings');

// Create a new booking
router.post('/create', bookingsController.createBooking);

// Update booking
router.put('/update', bookingsController.updateBooking);

// Delete booking
router.delete('/delete', bookingsController.deleteBooking);

// Fetch all bookings with addons
router.get('/', bookingsController.getAllBookingsWithAddons);

// Fetch bookings by user ID
router.get('/user/:user_id', bookingsController.getBookingsByUser);

// Check room availability
router.post('/check-availability', bookingsController.checkAvailability);

// Admin creates booking (if needed)
router.post('/admin-create', bookingsController.createAdminBooking);

module.exports = router;
