const express = require('express');
const router = express.Router();
const db = require('../db');

// Controller logic for payments
const { processPayment, getAllPayments } = require('../controllers/payments');

// Route to process a payment
router.post('/', processPayment);

// Route to get all payments
router.get('/', getAllPayments);

module.exports = router;
