const express = require('express');
const router = express.Router();
const db = require('../db');  // Import the db connection

// Controller logic for reservations
const { createReservation, getAllReservations } = require('../controllers/reservations');

// Route to create a new reservation
router.post('/', createReservation);

// Route to get all reservations
router.get('/', getAllReservations);

module.exports = router;
