// models/AccessModule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Admin = require('./adminModel');
const User = require('./userModel');

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
    type: DataTypes.INTEGER, // or ENUM if predefined types
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status:{
    type:DataTypes.BOOLEAN,
    defaultValue:false
  }
}, {
  tableName: 'access_modules',
  timestamps: true
});
// Export the model and define an associate method
AccessModule.associate = models => {
  const opts = { foreignKey: 'userId', constraints: false };
  AccessModule.belongsTo(models.Admin, { ...opts, as: 'admin', scope: { userType: 'admin' } });
  AccessModule.belongsTo(models.User,  { ...opts, as: 'user',  scope: { userType: 'user' } });
};

module.exports = AccessModule;
