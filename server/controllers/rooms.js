// controllers/rooms.js
const db = require('../db');

// List of valid room statuses
const validStatuses = ['available', 'booked', 'maintenance'];

// Validate status
function isValidStatus(status) {
  return validStatuses.includes(status);
}

// Get all rooms
exports.getRooms = (req, res) => {
  const query = 'SELECT * FROM Rooms';
  
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching rooms' });
    res.status(200).json(result);
  });
};

// Get a specific room by ID
exports.getRoomById = (req, res) => {
  const roomId = req.params.id;
  const query = 'SELECT * FROM Rooms WHERE room_id = ?';
  
  db.query(query, [roomId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching room' });
    if (result.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json(result[0]);
  });
};

// Create a new room
exports.createRoom = (req, res) => {
  const { room_number, room_type, price, status, description, image } = req.body;
  const query = `
    INSERT INTO Rooms (room_number, room_type, price, status, description, image)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(query, [room_number, room_type, price, status, description, image], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error creating room' });
    res.status(201).json({ message: 'Room created successfully' });
  });
};

// Update room details
exports.updateRoom = (req, res) => {
  const roomId = req.params.id;
  const { room_number, room_type, price, status, description, image } = req.body;
  const query = `
    UPDATE Rooms 
    SET room_number = ?, room_type = ?, price = ?, status = ?, description = ?, image = ?
    WHERE room_id = ?`;

  db.query(query, [room_number, room_type, price, status, description, image, roomId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating room' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json( {message: 'Room updated successfully' });
  });
};

// Delete a room
exports.deleteRoom = (req, res) => {
  const roomId = req.params.id;
  const query = 'DELETE FROM Rooms WHERE room_id = ?';

  db.query(query, [roomId], (err, result) => {
    if (err) return res.status(500).send('Error deleting room');
    if (result.affectedRows === 0) return res.status(404).send('Room not found');
    res.status(200).json({ message: 'Room deleted successfully' });
  });
};

