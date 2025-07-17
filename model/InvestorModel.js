// models/Investor.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Investor = sequelize.define('Investor', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 255] }
  },
  investmentAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'investment_amount',
    validate: { min: 0 }
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'commission',
    validate: { min: 0 }
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'created_by',
    validate: { isInt: true }
  }
}, {
  tableName: 'investors',
  underscored: true,
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['created_by'] },
    { fields: ['status'] }
  ],
  defaultScope: {
    attributes: { exclude: ['commission'] }
  },
  scopes: {
    withCommission: { attributes: {} }
  }
});

module.exports = Investor;
