// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // your Sequelize instance

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
    validate: { isEmail: true }
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
    allowNull: false,
    unique: true,
    validate: { len: [15, 15] }
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
minAmount: {
  type: DataTypes.DECIMAL(10, 2),  // correct for money
  allowNull: true,
  validate: { min: 0 }
},
maxAmount: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  validate: { min: 0 }
},
userIp1: {
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
    type: DataTypes.STRING,
    allowNull: true
  },
  contactPersonMobile: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: { is: /^[0-9+\-() ]*$/ }
  },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
});

module.exports = User;
