// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // your Sequelize instance
const AccessModule = require('./accessModule');

const User = sequelize.define('User', {
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobileNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { is: /^[0-9+\-() ]+$/ } // basic phone format
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  panCardUpload: {
    type: DataTypes.STRING, // store file path or URL
    allowNull: true
  },
  aadhaarCardUpload: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gstNumber: {
    type: DataTypes.STRING(15),
    allowNull: true,
    // unique: true,
    validate: { len: [0, 15] }
  },
  panNumber: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: { len: [10, 10] }
  },
  panHolderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gstDocumentUpload: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactPersonName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otp: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 999999 }
  },
  min_amount: {
    type: DataTypes.DECIMAL(10, 2),  // correct for money
    allowNull: true,
    validate: { min: 0 }
  },
  max_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: { min: 0 }
  },
  user_ip1: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isIP: true }
  },
  user_ip2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_ip3: {
    type: DataTypes.STRING,
    allowNull: true
  },
  access_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payment_provider:{
      type: DataTypes.INTEGER,
    allowNull: true,
  },
  topup: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0

  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  contactPersonMobile: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: { is: /^[0-9+\-() ]*$/ }
  },
  transactionPin: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'transaction_pin'
  },
  pinFailedAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'pin_failed_attempts'
  },
  pinLockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'pin_locked_until'
  },
  mpinFailedAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'mpin_failed_attempts'
  },
  mpinLockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'mpin_locked_until'
  },
  mpin: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mpin'
  },
  mpinOtpVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'mpinOtpVerified'
  },
  txnPinOtpVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'txnPinOtpVerified'
  }
}, {
  tableName: 'users',
  underscored: false,
  timestamps: true,
});
User.associate = models => {
  models.User.hasMany(models.AccessModule, {
    foreignKey: 'userId',
    as: 'permissions',
    scope: { userType: 2 }
  });
};

module.exports = User;
