const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const tokenPath = path.join(__dirname, '../token.json');

// 🔁 Step 0: Generate consent screen URL
function getAuthUrl(req, res) {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Ensures refresh_token is always returned
  });

  res.status(200).json({ authUrl });
}

// 🔐 Step 1: Callback after user approves
async function oauth2Callback(req, res) {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
  const { code } = req.query;

  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));
    res.status(200).json({ message: 'Authentication successful!', tokens });
  } catch (error) {
    console.error('OAuth2 callback error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error during authentication', error: error.message });
  }
}

// ✅ Step 2: Confirm if token is valid
function authenticate(req, res) {
  try {
    const token = fs.readFileSync(tokenPath);
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials(JSON.parse(token));

    res.status(200).json({ message: 'Authenticated successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Token not found. Go to /api/gmail/init first.' });
  }
}

// 📧 Step 3: Send email
async function sendEmail(req, res) {
  const { to, subject, body } = req.body;

  try {
    const token = fs.readFileSync(tokenPath);
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials(JSON.parse(token));

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const rawMessage = [
      `From: ${process.env.GMAIL_ADDRESS}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      `${body}`
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      resource: { raw: encodedMessage },
    });

    res.status(200).json({ message: 'Email sent successfully!', result });
  } catch (error) {
    console.error('Send error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}

module.exports = { getAuthUrl, oauth2Callback, authenticate, sendEmail };
