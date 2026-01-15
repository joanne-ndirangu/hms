const db = require('../db');

// GET Guest Report
exports.getGuestReport = (req, res) => {
  const query = `SELECT user_id, first_name, last_name, email, created_at FROM Users WHERE role = 'guest' ORDER BY created_at DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch guest report' });
    res.status(200).json({ guests: results });
  });
};

// GET Admin Report Summary (Monthly Revenue)
exports.getAdminReport = (req, res) => {
  const summaryQuery = `
    SELECT 
      (SELECT COUNT(*) FROM Users WHERE role = 'guest') AS total_guests,
      (SELECT COUNT(*) FROM Bookings) AS total_bookings,
      (
        SELECT IFNULL(SUM(total_amount), 0)
        FROM Bookings
        WHERE status IN ('pending', 'confirmed', 'checked in', 'checked out')
          AND MONTH(check_in) = MONTH(CURDATE())
          AND YEAR(check_in) = YEAR(CURDATE())
      ) AS total_revenue
  `;

  db.query(summaryQuery, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch admin report' });
    res.status(200).json(result[0]);
  });
};


exports.getAllReports = (req, res) => {
    const guestQuery = `SELECT user_id, first_name, last_name, email, created_at FROM Users WHERE role = 'guest' ORDER BY created_at DESC`;
    const adminSummaryQuery = `
      SELECT 
        (SELECT COUNT(*) FROM Users WHERE role = 'guest') AS total_guests,
        (SELECT COUNT(*) FROM Bookings) AS total_bookings,
        (SELECT IFNULL(SUM(total_amount), 0) FROM Bookings WHERE status = 'confirmed') AS total_revenue
    `;
  
    db.query(guestQuery, (err, guests) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch guest report' });
  
      db.query(adminSummaryQuery, (err2, summary) => {
        if (err2) return res.status(500).json({ error: 'Failed to fetch admin report' });
  
        res.status(200).json({
          guests: guests,
          admin: summary[0]
        });
      });
    });
  };
  
exports.getBookingSummary = (req, res) => {
  const start = req.query.start;
  const end = req.query.end;

  const params = [];
  let dateFilter = 'WHERE 1 = 1';

  if (start) {
    dateFilter += ' AND b.check_in >= ?';
    params.push(start);
  }

  if (end) {
    dateFilter += ' AND b.check_out <= ?';
    params.push(end);
  }

  const bookingsQuery = `
    SELECT 
      b.booking_id,
      CONCAT(u.first_name, ' ', u.last_name) AS guest_name,
      r.room_number,
      r.room_type,
      DATE_FORMAT(b.check_in, '%d/%m/%Y') AS check_in,
      DATE_FORMAT(b.check_out, '%d/%m/%Y') AS check_out,
      b.total_amount,
      b.status AS booking_status,
      MAX(p.payment_status) AS payment_status,
      GROUP_CONCAT(a.addon_name SEPARATOR ', ') AS addons
    FROM Bookings b
    JOIN Users u ON b.user_id = u.user_id
    JOIN Rooms r ON b.room_id = r.room_id
    LEFT JOIN Payments p ON b.booking_id = p.booking_id
    LEFT JOIN BookingAddons ba ON b.booking_id = ba.booking_id
    LEFT JOIN AddonTypes a ON ba.addon_id = a.addon_id
    ${dateFilter}
    GROUP BY b.booking_id
    ORDER BY b.check_in DESC
  `;

  const summaryQuery = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
      SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
      SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS pending
    FROM Bookings b
    ${dateFilter}
  `;

  const roomTypeQuery = `
    SELECT 
      r.room_type, COUNT(*) AS count
    FROM Bookings b
    JOIN Rooms r ON b.room_id = r.room_id
    ${dateFilter}
    GROUP BY r.room_type
  `;

  // Run all 3 queries in parallel
  db.query(bookingsQuery, params, (err, bookings) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Failed to fetch booking summary' });
    }

    db.query(summaryQuery, params, (err, summaryResults) => {
      if (err) {
        console.error('Error fetching summary:', err);
        return res.status(500).json({ error: 'Failed to fetch summary' });
      }

      db.query(roomTypeQuery, params, (err, roomTypeResults) => {
        if (err) {
          console.error('Error fetching room type breakdown:', err);
          return res.status(500).json({ error: 'Failed to fetch room type breakdown' });
        }

        // Format roomType breakdown into object
        const roomTypeCounts = {};
        roomTypeResults.forEach(row => {
          roomTypeCounts[row.room_type] = row.count;
        });

        res.status(200).json({
          bookings,
          summary: summaryResults[0],
          roomTypeCounts
        });
      });
    });
  });
};


exports.getRevenueSummary = (req, res) => {
  const start = req.query.start;
  const end = req.query.end;

  const params = [];
  let filter = 'WHERE 1 = 1';

  if (start) {
    filter += ' AND b.check_in >= ?';
    params.push(start);
  }

  if (end) {
    filter += ' AND b.check_out <= ?';
    params.push(end);
  }

  const roomTypeRevenueQuery = `
    SELECT 
      r.room_type, 
      SUM(b.total_amount) AS revenue
    FROM Bookings b
    JOIN Rooms r ON b.room_id = r.room_id
    ${filter}
    GROUP BY r.room_type
  `;

  const totalRevenueQuery = `
    SELECT SUM(b.total_amount) AS totalRevenue
    FROM Bookings b
    ${filter}
  `;

  db.query(roomTypeRevenueQuery, params, (err, revenueResults) => {
    if (err) {
      console.error('Error fetching room type revenue:', err);
      return res.status(500).json({ error: 'Failed to fetch revenue report' });
    }

    db.query(totalRevenueQuery, params, (err, totalResults) => {
      if (err) {
        console.error('Error fetching total revenue:', err);
        return res.status(500).json({ error: 'Failed to fetch total revenue' });
      }

      const totalRevenue = totalResults[0].totalRevenue || 0;

      res.status(200).json({
        roomTypeRevenue: revenueResults,
        totalRevenue
      });
    });
  });
};

exports.getRoomOccupancy = async (req, res) => {
  try {
    const { start, end } = req.query;

    const today = new Date().toISOString().split('T')[0];
    const validStart = start || today;
    const validEnd = end || '2099-12-31';

    const query = `
      SELECT 
        r.room_id,
        r.room_number,
        r.room_type,
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM Bookings b 
            WHERE b.room_id = r.room_id 
              AND b.status IN ('pending', 'confirmed')
              AND NOT (
                b.check_out <= ? OR b.check_in >= ?
              )
          ) THEN 'Occupied'
          ELSE 'Available'
        END AS occupancy_status
      FROM Rooms r
    `;

    const params = [validStart, validEnd]; 

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching occupancy:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ rooms: results });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected server error' });
  }
};


exports.getTopGuests = (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const query = `
    SELECT 
      u.user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS guest_name,
      COUNT(b.booking_id) AS total_bookings,
      SUM(IFNULL(b.total_amount, 0)) AS total_spent
    FROM Users u
    JOIN Bookings b ON u.user_id = b.user_id
    WHERE b.status IN ('Confirmed', 'Pending')
    GROUP BY u.user_id
    ORDER BY total_spent DESC
    LIMIT ?
  `;

  db.query(query, [limit], (err, results) => {
    if (err) {
      console.error('Error fetching top guests:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ topGuests: results });
  });
};

exports.getTopEarningRooms = (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const query = `
    SELECT 
      r.room_id,
      r.room_number,
      r.room_type,
      COUNT(b.booking_id) AS total_bookings,
      SUM(IFNULL(b.total_amount, 0)) AS total_earned
    FROM Rooms r
    JOIN Bookings b ON r.room_id = b.room_id
    WHERE b.status IN ('Confirmed', 'Pending')
    GROUP BY r.room_id
    ORDER BY total_earned DESC
    LIMIT ?
  `;

  db.query(query, [limit], (err, results) => {
    if (err) {
      console.error('Error fetching top earning rooms:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ topRooms: results });
  });
};


exports.getDailyBookingActivity = (req, res) => {
  const { startDate, endDate } = req.query;

  // Fallback to last 30 days if no dates provided
  const query = `
    SELECT 
      DATE(b.check_in) AS booking_day,
      COUNT(b.booking_id) AS total_bookings,
      SUM(IFNULL(b.total_amount, 0)) AS total_revenue
    FROM Bookings b
    WHERE b.status IN ('confirmed', 'pending')
      AND DATE(b.check_in) BETWEEN ? AND ?
    GROUP BY booking_day
    ORDER BY booking_day DESC
  `;

  const now = new Date();
  const defaultEndDate = now.toISOString().split('T')[0]; // Today
  const defaultStartDate = new Date(now.setDate(now.getDate() - 29)).toISOString().split('T')[0]; // 30 days ago

  const start = startDate || defaultStartDate;
  const end = endDate || defaultEndDate;

  db.query(query, [start, end], (err, results) => {
    if (err) {
      console.error('Error fetching daily booking activity:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ dailyActivity: results });
  });
};

exports.getMonthlyReport = (req, res) => {
  const query = `
    SELECT 
      YEAR(created_at) AS year, 
      MONTH(created_at) AS month, 
      AVG(rating) AS average_rating, 
      COUNT(*) AS total_reviews
    FROM Reviews
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY year DESC, month DESC;
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).send('Error fetching monthly report');
    res.status(200).json(result);
  });
};

exports.getBookingsByDateRange = (req, res) => {
  const { startDate, endDate } = req.query;

  // Calculate default date range (last 30 days)
  const now = new Date();
  const defaultEndDate = now.toISOString().split('T')[0]; // today
  const defaultStartDate = new Date(now.setDate(now.getDate() - 29)).toISOString().split('T')[0]; // 30 days ago

  const start = startDate || defaultStartDate;
  const end = endDate || defaultEndDate;

  const query = `
    SELECT 
      b.booking_id,
      CONCAT(u.first_name, ' ', u.last_name) AS guest_name,
      r.room_number,
      b.check_in,
      b.check_out,
      b.status,
      b.total_amount
    FROM Bookings b
    JOIN Users u ON b.user_id = u.user_id
    JOIN Rooms r ON b.room_id = r.room_id
    WHERE b.status IN ('confirmed', 'pending')
      AND DATE(b.check_in) BETWEEN ? AND ?
    ORDER BY b.check_in DESC
  `;

  db.query(query, [start, end], (err, results) => {
    if (err) {
      console.error('Error fetching bookings by date range:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ bookings: results });
  });
};

exports.getGuestStayDuration = (req, res) => {
  const query = `
    SELECT 
      b.booking_id,
      CONCAT(u.first_name, ' ', u.last_name) AS guest_name,
      r.room_number,
      b.check_in,
      b.check_out,
      DATEDIFF(b.check_out, b.check_in) AS stay_duration_days
    FROM Bookings b
    JOIN Users u ON b.user_id = u.user_id
    JOIN Rooms r ON b.room_id = r.room_id
    WHERE b.status IN ('confirmed', 'pending')
    ORDER BY b.check_in DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching guest stay durations:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ stays: results });
  });
};

exports.getRepeatGuests = (req, res) => {
  const query = `
    SELECT 
      u.user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS guest_name,
      COUNT(b.booking_id) AS total_bookings
    FROM Users u
    JOIN Bookings b ON u.user_id = b.user_id
    WHERE b.status IN ('confirmed', 'pending')
    GROUP BY u.user_id
    HAVING total_bookings > 1
    ORDER BY total_bookings DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching repeat guests:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ repeatGuests: results });
  });
};

exports.getGuestsWithoutBookings = (req, res) => {
  const query = `
    SELECT 
      u.user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS guest_name,
      u.email
    FROM Users u
    LEFT JOIN Bookings b ON u.user_id = b.user_id
    WHERE b.booking_id IS NULL
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching guests without bookings:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ noBookingGuests: results });
  });
};
