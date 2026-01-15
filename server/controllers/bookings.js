const db = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL, // your Gmail address
    pass: process.env.ADMIN_PASSWORD // 16-character app password from Google
  }
});

const createBooking = (req, res) => {
  const { user_id, room_id, check_in, check_out, total_amount, bookingaddons } = req.body;

  // Validation checks
  if (!user_id || !room_id || !check_in || !check_out || total_amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Parse the dates from the request body
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);

  // Check if the parsed dates are valid
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format. Please provide valid dates for check-in and check-out.' });
  }

  // Check if check-out date is after check-in date
  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: 'Check-out must be after check-in.' });
  }

  // Fetching room price from DB
  const roomPriceQuery = 'SELECT price, room_type FROM Rooms WHERE room_id = ?';
  db.query(roomPriceQuery, [room_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch room price' });
    }

    const roomPrice = result[0]?.price;
    const roomName = result[0]?.room_type;
    if (!roomPrice) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const parsedTotalAmount = parseFloat(total_amount);
    if (isNaN(parsedTotalAmount)) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // Get user info
    const getUserEmailQuery = 'SELECT email, first_name, last_name FROM Users WHERE user_id = ?';
    db.query(getUserEmailQuery, [user_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch user email' });
      }

      const userEmail = result[0]?.email;
      const fullName = `${result[0]?.first_name} ${result[0]?.last_name}`;
      if (!userEmail) return res.status(404).json({ error: 'User not found' });

      // Insert booking
      const insertBookingQuery = `
        INSERT INTO Bookings (user_id, room_id, check_in, check_out, total_amount, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `;
      db.query(insertBookingQuery, [user_id, room_id, check_in, check_out, parsedTotalAmount], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create booking' });
        }

        const bookingId = result.insertId;

        // Insert addons if provided
        if (Array.isArray(bookingaddons) && bookingaddons.length > 0) {
          const bookingAddonValues = bookingaddons.map(addonId => [bookingId, addonId]);
          const insertBookingAddonsQuery = `
            INSERT INTO BookingAddons (booking_id, addon_id)
            VALUES ?
          `;
          db.query(insertBookingAddonsQuery, [bookingAddonValues], (err) => {
            if (err) {
              console.error('Error inserting booking addons:', err);
              return res.status(500).json({ error: 'Booking saved, but failed to save addons to BookingAddons' });
            }
            sendConfirmationEmail(bookingId, roomName);  // Proceed with sending confirmation
          });
        } else {
          sendConfirmationEmail(bookingId, roomName);  // Call function if no addons
        }

        // Send confirmation email function
        function sendConfirmationEmail(bookingId, roomName) {
          const getAddonsQuery = `
            SELECT addon_name, addon_price
            FROM AddonTypes 
            WHERE addon_id IN (
              SELECT addon_id 
              FROM BookingAddons 
              WHERE booking_id = ?
            )
          `;
          db.query(getAddonsQuery, [bookingId], (err, addonsResult) => {
            if (err) {
              console.error('Error fetching addons for email:', err);
              return res.status(500).json({ error: 'Booking saved, but failed to send email' });
            }
        
            const addonsText = addonsResult.length > 0
              ? addonsResult.map(addon =>
                  `• ${addon.addon_name} - Ksh ${parseFloat(addon.addon_price).toFixed(2)}` 
                ).join('\n')
              : 'None';
        
            const checkInFormatted = checkInDate.toString();
            const checkOutFormatted = checkOutDate.toString();

            const mailOptions = {
              from: process.env.ADMIN_EMAIL,
              to: userEmail,
              subject: 'Booking Confirmation',
              text: `Dear ${fullName},
        
        Thank you for your booking! Below are the details:
        
        🛏️ Room: ${roomName}
        📅 Check-in: ${checkInFormatted}
        📅 Check-out: ${checkOutFormatted}
        🛏️ Booking ID: ${bookingId}
        💵 Total Amount: Ksh ${parsedTotalAmount.toFixed(2)}
        
        🧾 Add-ons Included:
        ${addonsText}
        
        We look forward to your stay!
        
        Warm regards,  
        Osnet Resort Management Team`.trim()
            };
        
            transporter.sendMail(mailOptions, (emailErr, info) => {
              if (emailErr) {
                console.error('Email error:', emailErr);
              }
        
              return res.status(201).json({
                bookingId,
                totalAmount: parsedTotalAmount,
                addons: addonsResult,
                message: 'Booking successful, check your email for confirmation.'
              });
            });
          });
        }        
      });
    });
  });
};




// Update booking details  
const updateBooking = (req, res) => {
  const { booking_id, user_id, room_id, check_in, check_out, total_amount, bookingaddons } = req.body;

  if (!booking_id || !user_id || !room_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: 'Check-out must be after check-in' });
  }

  const roomPriceQuery = 'SELECT price, room_type FROM Rooms WHERE room_id = ?';
  db.query(roomPriceQuery, [room_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch room price' });
    }

    const roomPrice = result[0]?.price;
    const roomName = result[0]?.room_type;
    if (!roomPrice) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const parsedTotalAmount = parseFloat(total_amount);
    if (isNaN(parsedTotalAmount)) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // Get user info
    const getUserEmailQuery = 'SELECT email, first_name, last_name FROM Users WHERE user_id = ?';
    db.query(getUserEmailQuery, [user_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch user email' });
      }

      const userEmail = result[0]?.email;
      const fullName = `${result[0]?.first_name} ${result[0]?.last_name}`;
      if (!userEmail) return res.status(404).json({ error: 'User not found' });

      // Update booking details
      const updateBookingQuery = `
        UPDATE Bookings
        SET user_id = ?, room_id = ?, check_in = ?, check_out = ?, total_amount = ?
        WHERE booking_id = ?
      `;
      db.query(updateBookingQuery, [user_id, room_id, check_in, check_out, parsedTotalAmount, booking_id], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update booking' });
        }

        // Update addons if provided
        if (bookingaddons && bookingaddons.length > 0) {
          // Remove old addons first
          const deleteOldAddonsQuery = 'DELETE FROM BookingAddons WHERE booking_id = ?';
          db.query(deleteOldAddonsQuery, [booking_id], (err) => {
            if (err) {
              console.error('Error deleting old addons:', err);
              return res.status(500).json({ error: 'Failed to update addons' });
            }
        
            // Insert new addons
            const bookingAddonValues = bookingaddons.map(addonId => [booking_id, addonId]);
            const insertBookingAddonsQuery = `
              INSERT INTO BookingAddons (booking_id, addon_id)
              VALUES ?
            `;
            db.query(insertBookingAddonsQuery, [bookingAddonValues], (err) => {
              if (err) {
                console.error('Error inserting booking addons:', err);
                return res.status(500).json({ error: 'Booking updated, but failed to save addons' });
              }
        
              sendConfirmationEmail(booking_id, roomName, parsedTotalAmount);
            });
          });
        } else {
          // If no addons provided, just send the email
          sendConfirmationEmail(booking_id, roomName, parsedTotalAmount);
        }

        // Send confirmation email function
        function sendConfirmationEmail(bookingId, roomName, parsedTotalAmount) {
          const getAddonsQuery = `
            SELECT addon_name, addon_price
            FROM AddonTypes 
            WHERE addon_id IN (
              SELECT addon_id 
              FROM BookingAddons 
              WHERE booking_id = ?
            )
          `;
          db.query(getAddonsQuery, [bookingId], (err, addonsResult) => {
            if (err) {
              console.error('Error fetching addons for email:', err);
              return res.status(500).json({ error: 'Booking updated, but failed to send email' });
            }
        
            const addonsText = addonsResult.length > 0
              ? addonsResult.map(addon =>
                  `• ${addon.addon_name} - Ksh ${parseFloat(addon.addon_price).toFixed(2)}`
                ).join('\n')
              : 'None';
        
            const mailOptions = {
              from: process.env.ADMIN_EMAIL,
              to: userEmail,
              subject: 'Booking Update Confirmation',
              text: `Dear ${fullName},
        
        Your booking has been updated successfully. Here are the details:
        
        🛏️ Room: ${roomName}
        📅 Check-in: ${checkInDate.toString()}
        📅 Check-out: ${checkOutDate.toString()}
        💵 Total Amount: Ksh ${parsedTotalAmount.toFixed(2)}
        
        🧾 Add-ons:
        ${addonsText}
        
        Warm regards,  
        Osnet Resort Management Team`.trim()
            };
        
            transporter.sendMail(mailOptions, (emailErr, info) => {
              if (emailErr) {
                console.error('Email error:', emailErr);
                return res.status(500).json({ error: 'Booking updated, but email failed' });
              }
        
              return res.status(200).json({
                bookingId,
                totalAmount: parsedTotalAmount,
                addons: addonsResult,
                message: 'Booking updated and confirmation email sent.'
              });
            });
          });
        };        
      });
    });
  });
};




// Delete booking (expecting booking_id in request body)
const deleteBooking = (req, res) => {
  const { booking_id } = req.body;
  if (!booking_id) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  // Fetch full booking + user + room info before deleting
  const emailQuery = `
    SELECT b.booking_id, b.check_in, b.check_out, b.total_amount,
           u.email, u.first_name, u.last_name,
    r.room_type AS room_name
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN rooms r ON b.room_id = r.room_id
    WHERE b.booking_id = ?
  `;
  db.query(emailQuery, [booking_id], (err, result) => {
    if (err || result.length === 0) {
      console.error('Error fetching booking info:', err);
      return res.status(404).json({ error: 'Booking not found or user data unavailable' });
    }

    const { email, first_name, last_name, check_in, check_out, total_amount, room_name } = result[0];

    // Fetch any addons
    const addonsQuery = `
      SELECT at.addon_name, at.addon_price
      FROM BookingAddons ba
      JOIN AddonTypes at ON ba.addon_id = at.addon_id
      WHERE ba.booking_id = ?
    `;
    db.query(addonsQuery, [booking_id], (addonErr, addonResult) => {
      if (addonErr) {
        console.error('Error fetching addons:', addonErr);
      }

      const addonsText = addonResult && addonResult.length > 0
        ? addonResult.map(a => `• ${a.addon_name} - Ksh ${parseFloat(a.addon_price).toFixed(2)}`).join('\n')
        : 'None';

      // Proceed to delete booking
      const deleteQuery = `DELETE FROM bookings WHERE booking_id = ?`;
      db.query(deleteQuery, [booking_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete booking' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }

        // Send email
        const mailOptions = {
          from: process.env.ADMIN_EMAIL,
          to: email,
          subject: 'Booking Cancellation Confirmation',
          text: `Dear ${first_name} ${last_name},

Your booking has been successfully cancelled. Here are the details:

🛏️ Room: ${room_name}
🆔 Booking ID: ${booking_id}
📅 Check-in: ${check_in}
📅 Check-out: ${check_out}
💵 Total Amount: Ksh ${parseFloat(total_amount).toFixed(2)}

🧾 Add-ons (if any):
${addonsText}

If you did not request this cancellation, please contact us immediately.

Warm regards,  
Osnet Resort Management Team`.trim()
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.error('Failed to send cancellation email:', err);
          } else {
            console.log('Cancelation email sent successfully.');
          }
        });

        return res.status(200).json({ message: 'Booking deleted and email sent.' });
      });
    });
  });
};



// Check room availability for selected dates
const checkAvailability = (req, res) => {
  const { roomId, check_in, check_out } = req.body;
  const query = `
    SELECT * FROM bookings
    WHERE room_id = ? AND NOT (
      check_out <= ? OR check_in >= ?
    )
  `;
  db.query(query, [roomId, check_in, check_out], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error checking availability' });
    }
    if (result.length === 0) {
      return res.status(200).json({ available: true });
    } else {
      return res.status(200).json({ available: false });
    }
  });
};

// Admin creates booking (as reservation)
const createAdminBooking = (req, res) => {
  const { user_id, room_id, check_in, check_out, total_amount, status } = req.body;
  if (!user_id || !room_id || !check_in || !check_out || !total_amount || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const query = `
    INSERT INTO bookings (user_id, room_id, check_in, check_out, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [user_id, room_id, check_in, check_out, total_amount, status], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
    return res.status(201).json({ bookingId: result.insertId });
  });
};


// Get all bookings for a specific user
const getBookingsByUser = (req, res) => {
  const user_id = req.params.user_id;

  const query = `
    SELECT 
      b.booking_id, 
      b.check_in, 
      b.check_out, 
      b.total_amount, 
      b.status,
      b.room_id, 
      r.room_number,
      r.room_type,
      r.description,
      at.addon_id,  
      at.addon_name,
      at.addon_price
    FROM bookings b
    JOIN rooms r ON b.room_id = r.room_id
    LEFT JOIN BookingAddons ba ON b.booking_id = ba.booking_id
    LEFT JOIN AddonTypes at ON ba.addon_id = at.addon_id
    WHERE b.user_id = ?
    ORDER BY b.check_in DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    const bookings = {};

    results.forEach(row => {
      if (!bookings[row.booking_id]) {
        bookings[row.booking_id] = {
          booking_id: row.booking_id,
          check_in: row.check_in,
          check_out: row.check_out,
          total_amount: row.total_amount,
          status: row.status,
          room_id: row.room_id, 
          room_number: row.room_number,
          room_type: row.room_type,
          description: row.description,
          addons: []
        };
      }
      if (row.addon_name) {
        bookings[row.booking_id].addons.push({
          addon_id: row.addon_id,
          name: row.addon_name,
          price: row.addon_price
        });
      }
    });

    res.status(200).json(Object.values(bookings));
  });
};



const getAllBookingsWithAddons = (req, res) => {
  const query = `
    SELECT  
      b.booking_id,
      u.user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,       
      r.room_id, 
      r.room_number,
      r.room_type,
      b.check_in,
      b.check_out,
      b.total_amount,
      b.status,
      at.addon_name,
      at.addon_price
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN rooms r ON b.room_id = r.room_id
    LEFT JOIN BookingAddons ba ON b.booking_id = ba.booking_id
    LEFT JOIN AddonTypes at ON ba.addon_id = at.addon_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    const bookings = {};

    results.forEach(row => {
      if (!bookings[row.booking_id]) {
        bookings[row.booking_id] = {
          booking_id: row.booking_id,
          user_id: row.user_id,
          user_name: row.user_name, 
          room_id: row.room_id,
          room_number: row.room_number, 
          room_type: row.room_type,
          check_in: row.check_in,
          check_out: row.check_out,
          total_amount: row.total_amount,
          status: row.status,
          addons: []
        };
      }
      if (row.addon_name) {
        bookings[row.booking_id].addons.push({
          name: row.addon_name,
          price: row.addon_price
        });
      }
    });

    res.json(Object.values(bookings));
  });
};


const getBookingDetails = (req, res) => {
  const { booking_id } = req.params;

  if (!booking_id) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  const query = `
    SELECT b.booking_id, b.user_id, b.room_id, b.check_in, b.check_out, b.total_amount,
           r.room_type, r.price
    FROM bookings b
    JOIN rooms r ON b.room_id = r.room_id
    WHERE b.booking_id = ?
  `;
  
  db.query(query, [booking_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(result[0]);
  });
};


module.exports = { 
  createBooking, 
  updateBooking, 
  deleteBooking, 
  checkAvailability, 
  createAdminBooking,
  getBookingsByUser,
  getAllBookingsWithAddons
};



