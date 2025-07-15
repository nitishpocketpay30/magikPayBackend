const express = require('express');
const user = express.Router();

const userController = require('../controller/userController/userController');
const { verifyAccessToken } = require('../service/token');
const upload = require('../middleware/upload'); // ✅ MATCHES THE EXPORT

user.post('/register',  );
user.post('/login',  );
user.get('/get-user-list',  );
user.post('/update-user-details/:id',  );
user.post('/soft-delete-user',  );
user.get('/user-activity-logs',  );
user.get('/user-recent-activity',  );
user.post('/user-change-password',  );
user.post('/user-transection-pin-setup',  );
user.post('/user-mpin-setup',  );
user.get('/user-activity-logs',  );
user.get('/get-user-dashboard-data',  );


module.exports = user;
// ✅ This code defines the user router for handling user-related routes in the application.