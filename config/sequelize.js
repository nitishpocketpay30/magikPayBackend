// config/sequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: console.log,  // set to false in production
    define: {
      freezeTableName: true,  // tables match model names exactly
      timestamps: true
    }
  }
);

module.exports = sequelize;
