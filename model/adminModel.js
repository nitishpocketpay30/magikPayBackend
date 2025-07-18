// models/Admin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');  // ensure you're importing the same Sequelize instance
const AccessModule = require('./accessModule');

const Admin = sequelize.define('Admin', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 50] }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 50] }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [60, 60] }  // e.g. bcrypt hashes
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
    role: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIP: true }
  }
}, {
  tableName: 'admins',
  timestamps: true
});
Admin.associate = models => {
  models.Admin.hasMany(models.AccessModule, {
    foreignKey: 'userId',
    as: 'permissions',
    scope: { userType:1 }
  });
};


module.exports = Admin;
