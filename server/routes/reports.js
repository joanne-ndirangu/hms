const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');

// Routes
router.get('/guests', reportsController.getGuestReport);
router.get('/admin', reportsController.getAdminReport);
router.get('/', reportsController.getAllReports);

// Booking Summary Route
router.get('/booking-summary', reportsController.getBookingSummary);

// Revenue Report
router.get('/revenue-summary', reportsController.getRevenueSummary);

// Room Occupancy Report
router.get('/room-occupancy', reportsController.getRoomOccupancy);

// Top Guest Report
router.get('/top-guests', reportsController.getTopGuests);

// Top Rooms Report
router.get('/top-rooms', reportsController.getTopEarningRooms);

// Daily Activity Report
router.get('/daily-activity', reportsController.getDailyBookingActivity);

// Monthly report - Calculate average rating and total reviews per month
router.get('/monthly-reviews', reportsController.getMonthlyReport);

// Bookings by Date Range
router.get('/bookings-by-date', reportsController.getBookingsByDateRange);

// Guest Stay Duration
router.get('/stay-duration', reportsController.getGuestStayDuration);

// Repeat Guests
router.get('/repeat-guests', reportsController.getRepeatGuests);

// Guests without bookings
router.get('/no-booking-guests', reportsController.getGuestsWithoutBookings);

module.exports = router;
