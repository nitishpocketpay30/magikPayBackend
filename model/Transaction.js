// models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // ensure this loads your Sequelize instance

const Transaction = sequelize.define('Transaction', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { isInt: true }
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: { isDate: true }
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: true }
  },
    gatwayId: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  mode: {
    type: DataTypes.ENUM('IMPS', 'NEFT', 'RTGS', 'UPI'),
    allowNull: false
  },
  bankDetails: {
    type: DataTypes.JSON,
    allowNull: false
  },
  utrNo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  charge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  gst: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tds: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: { min: 0 }
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // 0=PENDING, 1=SUCCESS, 2=FAIL
    validate: {
      isIn: [[0, 1, 2]]
    }
  },
  apiName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['transactionId'] },
    { fields: ['orderId'] },
    { fields: ['transactionDate'] }
  ]
});

module.exports = Transaction;
