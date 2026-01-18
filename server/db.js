const mysql = require('mysql2');
require('dotenv').config({ path: __dirname + '/.env' });

// Create a connection to the database
const db = mysql.createPool({
  uri: process.env.DB_URL,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test MySQL connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to Railway DB:', err);
  } else {
    console.log('Connected to the Railway MySQL database');
    connection.release();
  }
});

// Export the db connection
module.exports = db;
