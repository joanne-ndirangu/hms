const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,      // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // App Password generated from Gmail
  },
});

// Send email
async function sendEmail(req, res) {
  const { to, subject, body } = req.body;

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to,
    subject,
    text: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!', info });
  } catch (error) {
    console.error('Email send error:', error.message);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}

module.exports = { sendEmail };
