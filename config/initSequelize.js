const sequelize = require('./sequelize');

// initSequelize.js
require('../model/userModel');
require('../model/accessModule');
require('../model/Transaction');
require('../model/adminModel');
require('../model/providerModel');
require('../model/virtualTransactionModel');
require('../model/resetMpinModel');
require('../model/transactionPinModel');
require('../model/InvestorModel');
// import additional models here as needed

async function initSequelize() {
  await sequelize.authenticate();
  console.log('✅ MySQL connected.');
  const models = {
  Admin: sequelize.models.Admin,
  AccessModule: sequelize.models.AccessModule,
  User: sequelize.models.User,
};

Object.values(models).forEach(m => {
  if (typeof m.associate === 'function') {
    m.associate(models);
  }
});

  await sequelize.sync({ alter: true });
//  await sequelize.sync({ force: true });

  console.log('📦 All models synced with database (tables created/altered)');  // cite turn0search0

  const qi = sequelize.getQueryInterface();
  const tables = await qi.showAllTables();
  console.log('🗂️ MySQL tables:', tables);
}

module.exports = initSequelize;
