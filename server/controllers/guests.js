const bcrypt = require('bcrypt');
const db = require('../db');

// Sign Up Guest
exports.signup = (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Ensure first_name and last_name start with uppercase letters
  const nameRegex = /^[A-Z][a-zA-Z]*$/;
  if (!nameRegex.test(first_name)) {
    return res.status(400).json({ error: 'First name must start with an uppercase letter and contain only letters.' });
  }
  if (!nameRegex.test(last_name)) {
    return res.status(400).json({ error: 'Last name must start with an uppercase letter and contain only letters.' });
  }
  
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' }); 

    const query = `INSERT INTO Users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, 'guest')`;
    db.query(query, [first_name, last_name, email, hashedPassword], (err, result) => {
      if (err) {
        // Check if it's a duplicate email error
        if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already in use.' });
        }
        return res.status(500).json({ error: 'Error signing up guest' });
    }
      res.status(201).json({ message: 'Signup Successful' });
    });
  });
};

// Login Guest
exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM Users WHERE email = ? AND role = 'guest'`;
  db.query(query, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error while logging in' });
    }

    if (result.length === 0) {
      // No user found with this email
      return res.status(401).json({ message: 'Incorrect email' });
    }

    // Compare password
    bcrypt.compare(password, result[0].password, (err, match) => {
      if (err) {
        return res.status(500).json({ error: 'Server error while checking password' });
      }

      if (!match) {
        // Password does not match
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Successful login
      res.status(200).json({
        message: 'Login successful',
        userId: result[0].user_id, 
        first_name: result[0].first_name,
        last_name: result[0].last_name,
        email: result[0].email
      });
    });
  });
};

// Get individual guest profile by user_id
exports.getUserProfile = (req, res) => {
  const { user_id } = req.params;

  const query = 'SELECT user_id, first_name, last_name, email, password FROM Users WHERE user_id = ? AND role = "guest"';
  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching user profile' });
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result[0]);
  });
};


// Update Guest Profile (Change Email/Password)
exports.updateProfile = (req, res) => {
  const { guestId, firstName, lastName, email, newPassword } = req.body;

  // Validate inputs
  if (!guestId || !firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Provide guestId, first name, last name, and email' });
  }
  
   // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Validate name format (must start with uppercase and only letters)
  const nameRegex = /^[A-Z][a-zA-Z]*$/;
  if (!nameRegex.test(firstName)) {
    return res.status(400).json({ error: 'First name must start with an uppercase letter and contain only letters.' });
  }
  if (!nameRegex.test(lastName)) {
    return res.status(400).json({ error: 'Last name must start with an uppercase letter and contain only letters.' });
  }
  
  let query = 'UPDATE Users SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?';
  let queryParams = [firstName, lastName, email, guestId];

  // If newPassword is provided, hash it
  if (newPassword) {
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: 'Error hashing new password' });
      }

      query = 'UPDATE Users SET first_name = ?, last_name = ?, email = ?, password = ? WHERE user_id = ?';
      queryParams.push(hashedPassword);  // Add the hashed password to the parameters

      db.query(query, queryParams, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Error updating profile' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
      });
    });
  } else {
    // If no password is provided, just update the first name, last name, and email
    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error updating profile' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ message: 'Profile updated successfully' });
    });
  }
};

  
  // Delete Guest Account
  exports.deleteAccount = (req, res) => {
    const { email } = req.body;
  
    const query = 'DELETE FROM Users WHERE email = ?';
    db.query(query, [email], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error deleting account' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
      res.status(200).json({ message: 'Account deleted successfully' });
    });
  };

// Get all guests
  exports.getGuests = (req, res) => {
    const query = 'SELECT user_id, first_name, last_name, email FROM Users WHERE role = "guest"';
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching guests' });
      res.status(200).json(results);
    });
  };
  
// Get 3 most recent guests by booking creation time
exports.getRecentGuests = (req, res) => {
  const query = `
    SELECT 
      u.user_id, 
      u.first_name, 
      u.last_name, 
      u.email, 
      r.room_type, 
      b.status AS booking_status, 
      b.check_in, 
      b.check_out,
      b.created_at
    FROM Users u
    JOIN Bookings b ON u.user_id = b.user_id
    JOIN Rooms r ON b.room_id = r.room_id
    WHERE u.role = "guest"
    ORDER BY b.created_at DESC
    LIMIT 3
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching recent guests' });
    res.status(200).json(results);
  });
};
