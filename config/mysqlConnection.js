// mysqlPool.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || '',
  database: process.env.MYSQL_DB || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeout: 60000
});

async function initMySQL() {
  try {
    // Test a connection from the pool
    const conn = await pool.getConnection();
    console.log('✅ MySQL pool established');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL pool error:', err);
    process.exit(1);
  }
}

module.exports = initMySQL;
module.exports.pool = pool;
