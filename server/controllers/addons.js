const db = require('../db');

// Get all available add-on types (for the frontend form)
exports.getAllAddons = (req, res) => {
  const query = 'SELECT * FROM AddonTypes';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching addon types:', err);
      return res.status(500).send('Error fetching addon types');
    }
    res.status(200).json(results);
  });
};

// Get all addons associated with a specific booking
exports.getAddonsByBookingId = (req, res) => {
  const bookingId = req.params.bookingId;
  const query = `
    SELECT at.addon_id, at.addon_name, at.addon_price
    FROM BookingAddons ba
    JOIN AddonTypes at ON ba.addon_id = at.addon_id
    WHERE ba.booking_id = ?
  `;
  db.query(query, [bookingId], (err, results) => {
    if (err) {
      console.error('Error fetching addons for booking:', err);
      return res.status(500).send('Error fetching addons for booking');
    }
    res.status(200).json(results);
  });
};

// Attach an existing addon type to a booking
exports.addAddon = (req, res) => {
  const { booking_id, addon_id } = req.body;
  
  // Basic validation
  if (!booking_id || !addon_id) {
    return res.status(400).send('Booking ID and Addon ID are required');
  }

  const query = 'INSERT INTO BookingAddons (booking_id, addon_id) VALUES (?, ?)';
  db.query(query, [booking_id, addon_id], (err, result) => {
    if (err) {
      console.error('Error adding addon to booking:', err);
      return res.status(500).send('Error adding addon to booking');
    }
    res.status(201).send('Addon added to booking successfully');
  });
};

// Update an addon type (not booking-specific, optional)
exports.updateAddon = (req, res) => {
  const addonId = req.params.addonId;
  const { addon_name, addon_price } = req.body;

  // Basic validation
  if (!addon_name || !addon_price) {
    return res.status(400).send('Addon name and price are required');
  }

  const query = 'UPDATE AddonTypes SET addon_name = ?, addon_price = ? WHERE addon_id = ?';
  db.query(query, [addon_name, addon_price, addonId], (err, result) => {
    if (err) {
      console.error('Error updating addon type:', err);
      return res.status(500).send('Error updating addon type');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Addon type not found');
    }
    res.status(200).send('Addon type updated successfully');
  });
};

// Remove an addon from a specific booking
exports.deleteAddon = (req, res) => {
  const bookingId = req.params.bookingId;
  const addonId = req.params.addonId;

  // Basic validation
  if (!bookingId || !addonId) {
    return res.status(400).send('Booking ID and Addon ID are required');
  }

  const query = 'DELETE FROM BookingAddons WHERE booking_id = ? AND addon_id = ?';
  db.query(query, [bookingId, addonId], (err, result) => {
    if (err) {
      console.error('Error deleting addon from booking:', err);
      return res.status(500).send('Error deleting addon from booking');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Addon not found for this booking');
    }
    res.status(200).send('Addon removed from booking successfully');
  });
};
