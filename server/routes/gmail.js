const express = require('express');
const { getAuthUrl, authenticate, oauth2Callback, sendEmail } = require('../controllers/gmail'); // Import controller functions

const router = express.Router();

// Define Gmail routes
router.get('/init', getAuthUrl);
router.get('/authenticate', authenticate);  // Route to start OAuth flow
router.get('/oauth2callback', oauth2Callback);  // Route to handle OAuth callback
router.post('/send', sendEmail);  // Route to send email

module.exports = router;
