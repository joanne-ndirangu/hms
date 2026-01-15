const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// Route to send email using App Password
router.post('/send', async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.GMAIL_ADDRESS,
      to,
      subject,
      text: body,
    });

    res.status(200).json({ message: 'Email sent successfully!', info });
  } catch (error) {
    console.error('Email send error:', error.message);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;
