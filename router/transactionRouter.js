const express = require('express');
const transaction = express.Router();

const userController = require('../controller/userController/userController');
const { verifyAccessToken } = require('../service/token');
const upload = require('../middleware/upload'); // ✅ MATCHES THE EXPORT

transaction.post('/create-transaction',  );
transaction.get('/get-all-transaction',  );
transaction.get('/get-transaction-details/:id',  );
// transaction.post('/soft-delete-transaction',  ); // optional
transaction.get('/get-all-transaction-logs',  );
transaction.get('/user-specific-transaction-logs',  );
transaction.post('/user-change-password',  );
transaction.get('/user-activity-logs',  );
transaction.post('/create-fund-load-or-topup',  );
transaction.get('/get-balance-logs',  );


module.exports = user;
// ✅ This code defines the user router for handling user-related routes in the application.