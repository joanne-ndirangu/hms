// controllers/reservations.js
const db =  require('../db');  // MySQL connection setup

// Create a new reservation
const createReservation = (req, res) => {
  const { user_id, room_id, reservation_date, status } = req.body;

    // Ensure all required fields are present
    if (!user_id || !room_id || !reservation_date || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
  const query = `
    INSERT INTO reservations (user_id, room_id, reservation_date, status)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [user_id, room_id, reservation_date, status], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create reservation' });
    }
    return res.status(201).json({ reservationId: result.insertId });
  });
};

// Get all reservations
const getAllReservations = (req, res) => {
  const query = 'SELECT * FROM reservations';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve reservations' });
    }
    return res.status(200).json(result);
  });
};

module.exports = { createReservation, getAllReservations };
