const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Ensure this loads your Sequelize instance

const Provider = sequelize.define('Provider', {
  provider: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'providers',
  timestamps: true,
  paranoid: true,      // ✅ Enables soft deletes with deletedAt
});

module.exports = Provider;
