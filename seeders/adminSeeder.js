const bcrypt = require('bcrypt')
// const adminSchema = require('../model/adminSchema');

async function seedSuperAdmin() {
//   const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME } = process.env;

//   if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
//     console.warn('SUPER_ADMIN credentials not set; skipping seeding.');
//     return;
//   }
  

//   const existing = await adminSchema.findOne({ email: SUPER_ADMIN_EMAIL, role: 'superAdmin' });
//   if (!existing){
//  let hashedPassword = null;
//     if (SUPER_ADMIN_PASSWORD) {
//       const salt = await bcrypt.genSalt(10);
//       hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, salt);
//     }
//   const admin = new adminSchema({
//     name: SUPER_ADMIN_NAME || 'Super Admin',
//     email: SUPER_ADMIN_EMAIL,
//     password: hashedPassword,
//     role: 'superAdmin',
//   });

//   await admin.save();
//   console.log(' Super admin created:', SUPER_ADMIN_EMAIL);
//   }


}

module.exports = seedSuperAdmin;
