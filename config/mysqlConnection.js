// mysqlConnection.js
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

async function initMySQL() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('✅ MySQL pool created');
  }
  return pool;
}

module.exports = initMySQL;
