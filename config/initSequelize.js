const sequelize = require('./sequelize');

// initSequelize.js
require('../model/userModel');
require('../model/accessModule');
require('../model/Transaction');
require('../model/adminModel');
// import additional models here as needed

async function initSequelize() {
  await sequelize.authenticate();
  console.log('✅ MySQL connected.');

  await sequelize.sync({ alter: true });
  console.log('📦 All models synced with database (tables created/altered)');  // cite turn0search0

  const qi = sequelize.getQueryInterface();
  const tables = await qi.showAllTables();
  console.log('🗂️ MySQL tables:', tables);
}

module.exports = initSequelize;
