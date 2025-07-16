// models/RefreshToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const RefreshToken = sequelize.define('RefreshToken', {
  token: { type: DataTypes.STRING, allowNull: false },
  expires: { type: DataTypes.DATE, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'refresh_tokens',
  timestamps: true
});

RefreshToken.associate = models => {
  RefreshToken.belongsTo(models.Admin, { foreignKey: 'adminId' });
};

module.exports = RefreshToken;
