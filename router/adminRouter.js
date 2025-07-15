const express = require('express');
const staff = express.Router();


staff.post('/create-staff',  );
staff.post('/update-staff/:id',  );
staff.get('/get-all-staff',  );
staff.get('/get-staff-by-id/:id',  );
staff.post('/update-main-module-permission-by-staff-id/:id',  );
staff.post('/update-sub-module-permission-by-staff-id/:id',  );
staff.post('/soft-delete-staff',  );
staff.get('/get-staff-logs-activity/:id',  );
staff.get('/get-staff-logs-activity-all',  );



module.exports = staff;
// ✅ This code defines the user rou