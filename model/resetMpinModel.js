const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Ensure this loads your Sequelize instance

const ResetMpin = sequelize.define('ResetMpin', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  otpHash: { type: DataTypes.STRING(255), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'resetMpin',
  timestamps: true,
  paranoid: true,      // ✅ Enables soft deletes with deletedAt
});

module.exports = ResetMpin;
