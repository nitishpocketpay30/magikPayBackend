const express = require('express');
const transaction = express.Router();

const VTXNController = require('../controller/userController/virtualTransaction');
const PayOutController=require('../controller/adminController/payoutController')
const { verifyAccessToken } = require('../service/token');
const upload = require('../middleware/upload'); // ✅ MATCHES THE EXPORT
const { verifyUser, verifyAdmin } = require('../middleware/auth.middleware');

// virtual transaction start
transaction.post('/request-for-topup',verifyUser,VTXNController.requestTopUpByUser)
transaction.post('/approved-for-topup',verifyAdmin,VTXNController.approvedRequestByAdmin)
// virtual transaction end

// real transaction start
transaction.post('/payout-by-user',verifyUser,PayOutController.createPayoutByUser)
// real transaction end 

// transaction.post('/create-transaction',  );
// transaction.get('/get-all-transaction',  );
// transaction.get('/get-transaction-details/:id',  );
// transaction.post('/soft-delete-transaction',  ); // optional
// transaction.get('/get-all-transaction-logs',  );
// transaction.get('/user-specific-transaction-logs',  );
// transaction.post('/user-change-password',  );
// transaction.get('/user-activity-logs',  );
// transaction.post('/create-fund-load-or-topup',  );
// transaction.get('/get-balance-logs',  );


module.exports = transaction;
// ✅ This code defines the user router for handling user-related routes in the application.