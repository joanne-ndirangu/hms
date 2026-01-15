const fetch = require('node-fetch');

// Your credentials (replace with actual ones)
const credentials = Buffer.from('pgMqfqsWo6fT6wJHLOJYU72Xds9SYCSRCtp3Me4vpHknZUh1:XTXAy14xeJfKP0LUjbt96YskmtgHTzGK0rYSaKWsWX4LAqyQDkdiYGivK7pBFxXE').toString('base64');
const oauthUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

// Variable to store the access token and its expiry time
let accessToken = null;
let tokenExpiryTime = null; // Store the expiry time in milliseconds

const generateTimestamp = () => {
    const date = new Date();
    return date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
  };
  
  const generatePassword = () => {
    const shortcode = '174379'; // Your test shortcode
    const passkey = 'YOUR_TEST_PASSKEY';
    const timestamp = generateTimestamp();
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');
    return password;
  };
  
// Controller function to get OAuth token
async function getOAuthToken(req, res) {
    try {
         // If token already exists and is not expired, return it
         const currentTime = Date.now();
         if (accessToken && tokenExpiryTime > currentTime) {
             return res.json({ access_token: accessToken });
         }
 
         // Otherwise, fetch a new token
        const response = await fetch(oauthUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + credentials,
            },
        });

        const data = await response.json();
        if (data.access_token) {
            // Store the token and its expiry time
            accessToken = data.access_token;
            tokenExpiryTime = currentTime + 3600 * 1000; // Token expiry after 1 hour
            res.json({ access_token: data.access_token });
        } else {
            res.status(500).json({ error: 'Failed to retrieve OAuth token' });
        }
    } catch (error) {
        console.error('Error fetching OAuth Token:', error);
        res.status(500).json({ error: 'Error fetching OAuth token' });
    }
}

module.exports = {
    getOAuthToken,
    generatePassword,
    generateTimestamp
  };