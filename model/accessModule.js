// models/AccessModule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AccessModule = sequelize.define('AccessModule', {
  moduleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
   submoduleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sub_module_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  create: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  update: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  delete: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  userType: {
    type: DataTypes.STRING, // or ENUM if predefined types
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'access_modules',
  timestamps: true
});

module.exports = AccessModule;
