const mysql = require('mysql2');

// Use environment variables for production
const db = mysql.createPool({
  host: process.env.DB_HOST,     // Railway host
  user: process.env.DB_USER,     // Railway user
  password: process.env.DB_PASS, // Railway password
  database: process.env.DB_NAME, // Railway database name
  port: process.env.DB_PORT      // Railway port
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
  } else {
    console.log("Connected to MySQL database!");
    connection.release();
  }
});

module.exports = db;
