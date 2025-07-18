const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Ensure this loads your Sequelize instance

const VirtulaTransaction = sequelize.define('VirtulaTransaction', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
    virtual_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue:0
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
    approved_by: {
    type: DataTypes.INTEGER,
    defaultValue:0
  },
}, {
  tableName: 'virtulaTransaction',
  timestamps: true,
  paranoid: true,      // ✅ Enables soft deletes with deletedAt
});

module.exports = VirtulaTransaction;
