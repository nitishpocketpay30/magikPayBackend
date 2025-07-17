// src/setupAdmin.js
const bcrypt = require('bcrypt');
const sequelize = require('./sequelize');
const Admin = require('../model/adminModel');

async function seedSuperAdmin() {
  await sequelize.authenticate();         // connect to DB
  await sequelize.sync();                 // optionally sync tables (not recommended in prod)
  
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com';
  const exists = await Admin.findOne({ where: { email } });
  if (exists) {
    console.log('Super-admin already exists:', email);
    return;
  }

  const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123';
  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.create({
    firstName:process.env.SUPER_ADMIN_FNAME || 'Super',
    lastName: process.env.SUPER_ADMIN_LNAME || 'Admin',
    email,
    passwordHash,
    status: true,
    role:1, // 1 for super admin 2 for staff
    ip: process.env.SUPER_ADMIN_IP || '127.0.0.1'
  });

  console.log('✅ Super-admin created:', email);
}

seedSuperAdmin()
  .catch(err => {
    console.error('🔴 Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => sequelize.close());
// cok