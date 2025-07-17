const express = require('express');
const { verifyAdmin } = require('../middleware/auth.middleware');
const staff = express.Router();
const adminController =require("../controller/adminController/adminController")

staff.post('/create-staff',verifyAdmin,adminController.addStaffByAdmin);
staff.post('/update-staff/:id',verifyAdmin,adminController.updateStaffByAdmin  );
staff.get('/get-all-staff',verifyAdmin,adminController.getAllStaff);
staff.get('/get-staff-by-id/:id',verifyAdmin,adminController.getAllStaffById  );
staff.post('/add-module-permission-for-staff',verifyAdmin,adminController.createAccessModule);
staff.post('/update-module-permission-for-staff/:id',verifyAdmin,adminController.updateAccessModule  );
// staff.post('/soft-delete-staff',  );
// staff.get('/get-staff-logs-activity/:id',  );
// staff.get('/get-staff-logs-activity-all',  );



module.exports = staff;
// ✅ This code defines the user rou