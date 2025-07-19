const express = require('express');
const transaction = express.Router();

const VTXNController = require('../controller/userController/virtualTransaction');
const PayOutController=require('../controller/adminController/payoutController')
const { verifyUser, verifyAdmin, verifyAccessKey } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/schemaMiddleware/userMiddleware');
const { PayoutSchema, paymentRequestSchemaPublic, publicPayoutSchema } = require('../validators/payoutSchema/payoutSchema');

// virtual transaction start
transaction.post('/request-for-topup',verifyUser,VTXNController.requestTopUpByUser)
transaction.post('/approved-for-topup',verifyAdmin,VTXNController.approvedRequestByAdmin)
// virtual transaction end

// real transaction start
transaction.post('/payout-by-user',verifyUser,validateBody(PayoutSchema),PayOutController.createPayoutByUser);
transaction.post('/get-all-transaction-by-user',verifyUser,PayOutController.getAllTransactionByUser);
transaction.post('/get-all-transaction-by-admin',verifyAdmin,PayOutController.getAllTransactionByUser);
// public payout api 
transaction.post('/payout',verifyAccessKey,validateBody(publicPayoutSchema),PayOutController.createPublicPayoutByUser);



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