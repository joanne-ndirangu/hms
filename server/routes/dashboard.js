const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');

router.get('/total-guests', dashboardController.getTotalGuests);
router.get('/rooms-occupied', dashboardController.getRoomsOccupied);
router.get('/bookings-today', dashboardController.getBookingsToday);
router.get('/revenue-month', dashboardController.getMonthlyRevenue);

module.exports = router;
