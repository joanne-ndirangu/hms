const express = require('express');
const router = express.Router();

// Import your controller
const mpesaController = require('../controllers/mpesa');

// Define the route for fetching the OAuth token
router.get('/get-oauth-token', mpesaController.getOAuthToken);

module.exports = router;
