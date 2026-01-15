// routes/addons.js
const express = require('express');
const router = express.Router();
const addonsController = require('../controllers/addons');

// Get all available add-ons
router.get('/', addonsController.getAllAddons);

// Get addons for a specific booking
router.get('/:bookingId', addonsController.getAddonsByBookingId);

// Add a new addon to a booking
router.post('/add', addonsController.addAddon);

// Update an addon
router.put('/:addonId', addonsController.updateAddon);

// Delete an addon
router.delete('/:addonId', addonsController.deleteAddon);

module.exports = router;
