const fetch = require('node-fetch');
const db = require('../db');
const { generatePassword, generateTimestamp } = require('../controllers/mpesa');

const lipaNaMpesaUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

const processPayment = async (req, res) => {
  const { booking_id, amount, payment_method, payment_status, phone_number } = req.body;

  if (!booking_id || !amount || !payment_method || !payment_status || !phone_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const tokenResponse = await fetch('http://localhost:5000/api/mpesa/get-oauth-token');
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const payload = {
      BusinessShortCode: '174379',
      Password: generatePassword(),
      Timestamp: generateTimestamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone_number,
      PartyB: '174379',
      PhoneNumber: phone_number,
      CallBackURL: "https://yourdomain.com/api/mpesa/callback",
      AccountReference: "Booking",
      TransactionDesc: "Hotel room booking payment"
    };

    const response = await fetch(lipaNaMpesaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.ResponseCode === '0') {
      const query = `
        INSERT INTO payments (booking_id, amount, payment_method, payment_status)
        VALUES (?, ?, ?, ?)
      `;
    
      db.query(query, [booking_id, amount, payment_method, 'pending'], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to process payment' });
        }
        return res.status(201).json({ paymentId: result.insertId, message: 'Payment initiated successfully' });
      });
    } else {
      res.status(400).json({ error: 'M-Pesa payment initiation failed', details: data });
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ error: 'Error initiating payment with M-Pesa' });
  }
};

const getAllPayments = (req, res) => {
  const query = `
    SELECT payments.*, bookings.check_in, bookings.check_out, bookings.total_amount
    FROM payments
    JOIN bookings ON payments.booking_id = bookings.id
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve payments' });
    }
    return res.status(200).json(result);
  });
};

module.exports = { processPayment, getAllPayments };
