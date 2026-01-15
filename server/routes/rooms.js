// routes/rooms.js
const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/rooms');

// Get all rooms
router.get('/', roomsController.getRooms);
  
// Get a specific room by ID
router.get('/:id', roomsController.getRoomById);

// Create a new room
router.post('/', roomsController.createRoom);

// Update room details
router.put('/:id', roomsController.updateRoom);

// Delete a room
router.delete('/:id', roomsController.deleteRoom);

module.exports = router;
