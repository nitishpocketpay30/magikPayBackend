const express = require('express');
const { verifyAdmin } = require('../middleware/auth.middleware');
const staff = express.Router();
const adminController =require("../controller/adminController/adminController");
const { validateBody } = require('../middleware/schemaMiddleware/userMiddleware');
const { adminSchema, adminSchemaUpdate } = require('../validators/schemaValidator/adminSchemaValidation');
const { accessModuleSchema, removeAllUserPermissionsSchema } = require('../validators/schemaValidator/permissionSchemaValidation');

staff.post('/create-staff',verifyAdmin,validateBody(adminSchema), adminController.addStaffByAdmin);
staff.post('/update-staff/:id',verifyAdmin,validateBody(adminSchemaUpdate),adminController.updateStaffByAdmin  );
staff.get('/get-all-staff',verifyAdmin,adminController.getAllStaff);
staff.get('/get-admin-details',verifyAdmin,adminController.getAdminDetails);
staff.get('/get-all-user',verifyAdmin,adminController.getAllUsers);
staff.get('/get-staff-by-id/:id',verifyAdmin,adminController.getAllStaffById  );
staff.post('/add-module-permission-for-staff',verifyAdmin,validateBody(accessModuleSchema),adminController.createAccessModule);
staff.post('/update-module-permission-for-staff/:id',verifyAdmin,validateBody(accessModuleSchema),adminController.updateAccessModule);
staff.post('/remove-all-module-permission-for-staff',verifyAdmin,validateBody(removeAllUserPermissionsSchema),adminController.removeAllUserStaffPermission);
staff.post('/remove-specific-module-permission',verifyAdmin,validateBody(removeAllUserPermissionsSchema),adminController.removeAllUserStaffPermission);
// staff.post('/soft-delete-staff',  );
// staff.get('/get-staff-logs-activity/:id',  );
// staff.get('/get-staff-logs-activity-all',  );



module.exports = staff;
// ✅ This code defines the user rou