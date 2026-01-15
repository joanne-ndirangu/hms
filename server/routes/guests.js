const express = require('express');
const router = express.Router();
const guestsController = require('../controllers/guests');

// Sign Up Guest
router.post('/signup', guestsController.signup);

// Login Guest
router.post('/login', guestsController.login);

// Fetch a single guest's details by user_id
router.get('/profile/:user_id', guestsController.getUserProfile);

// Update User Profile (email/password)
router.put('/update', guestsController.updateProfile);

// Delete User Account
router.delete('/delete', guestsController.deleteAccount);

// Fetch all guests
router.get('/', guestsController.getGuests);

// Fetch the 3 most recent guests (for the admin dashboard)
router.get('/recent', guestsController.getRecentGuests);

module.exports = router;
