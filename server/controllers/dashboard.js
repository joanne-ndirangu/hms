const db = require('../db');

// Total Guests
exports.getTotalGuests = (req, res) => {
  const query = `SELECT COUNT(*) AS total FROM Users WHERE role = 'guest'`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching total guests' });
    res.json(results[0]);
  });
};


// 2. Rooms Occupied
//Calculate rooms currently occupied from Bookings
exports.getRoomsOccupied = (req, res) => {
  const sqlOccupied = `
    SELECT COUNT(DISTINCT room_id) AS occupied_rooms 
    FROM Bookings 
    WHERE CURDATE() BETWEEN check_in AND check_out
      AND status IN ('confirmed', 'pending')
  `;

  const sqlTotal = `SELECT COUNT(*) AS total_rooms FROM Rooms`;

  db.query(sqlOccupied, (err, occupiedResults) => {
    if (err) return res.status(500).json({ error: 'Error fetching occupied rooms' });

    db.query(sqlTotal, (err, totalResults) => {
      if (err) return res.status(500).json({ error: 'Error fetching total rooms' });

      res.json({
        occupied_rooms: occupiedResults[0].occupied_rooms,
        total_rooms: totalResults[0].total_rooms
      });
    });
  });
};


  
//3. Get bookings for today
exports.getBookingsToday = (req, res) => {
  const sql = `
    SELECT COUNT(*) AS today_bookings 
    FROM Bookings 
    WHERE CURDATE() >= check_in 
      AND CURDATE() < check_out
      AND status IN (?, ?)
  `;

  const values = ['confirmed', 'pending'];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error fetching today\'s bookings:', err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json(results[0]);
  });
};



// 4. Revenue This Month (from Bookings table)
exports.getMonthlyRevenue = (req, res) => {
  const sql = `
    SELECT SUM(total_amount) AS monthly_revenue
    FROM Bookings
    WHERE status IN ('pending', 'confirmed', 'checked in', 'checked out')
      AND MONTH(check_in) = MONTH(CURDATE())
      AND YEAR(check_in) = YEAR(CURDATE())`;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
};

