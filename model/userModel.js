// models/userModel.js
const pool = require('../config/mysqlConnection');

/**
 * Fetch all users (with pagination).
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Array>}
 */
async function getAllUsers(limit = 10, offset = 0) {
  const sql = `
    SELECT id, name, email, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.execute(sql, [limit, offset]);
  return rows;
}

/**
 * Create a new user.
 * @param {string} name
 * @param {string} email
 * @returns {Promise<Object>} Insert result
 */
async function createUser(name, email) {
  const sql = `
    INSERT INTO users (name, email)
    VALUES (?, ?)
  `;
  const [result] = await pool.execute(sql, [name, email]);
  return result;
}

module.exports = {
  getAllUsers,
  createUser
};
