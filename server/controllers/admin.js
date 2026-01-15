// Admin Login
const adminEmail = 'admin@hotel.com';
const adminPassword = 'admin123'; // In a real app, hash this password!

exports.login = (req, res) => {
    const { email, password } = req.body;
  
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin credentials' 
      });
    }
    res.status(200).json({ 
      success: true, 
      message: 'Admin login successful' 
    });
  };
  