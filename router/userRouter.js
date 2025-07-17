const express = require('express');
const user = express.Router();

const userController = require('../controller/userController/userController');
const upload = require('../config/multer'); // ✅ MATCHES THE EXPORT
const { validateBody } = require('../middleware/schemaMiddleware/userMiddleware');
const { loginSchema, userSchema, verifyOtpSchema, verifyMpinSchema } = require('../validators/schemaValidator/userSchemaValidator');
const { verifyAdmin, verifyUser } = require('../middleware/auth.middleware');

user.post('/register', verifyAdmin, upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstDocument', maxCount: 1 },
]), validateBody(userSchema), userController.addUser);
user.post('/login', validateBody(loginSchema), userController.loginUserAdmin);
user.get('/get-user-list', verifyAdmin, userController.getUserList);
user.post('/update-user-details/:id', verifyAdmin, upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstDocument', maxCount: 1 },
]), userController.updateUserByAdmin);
// user.post('/soft-delete-user',  );
// user.get('/user-activity-logs',  );
// user.get('/user-recent-activity',  );
user.post('/user-change-password/:id', verifyUser, userController.userChangePassword);
user.post('/user-transection-pin-setup/:id', verifyUser, userController.createOrUpdateTransactionPinByUser); // need to add 2factor authentication for reset pin by otp
// mpin flow start
user.post('/request-otp-for-mpin', verifyUser, userController.resetRequest);
user.post('/verify-otp-for-mpin',validateBody(verifyOtpSchema), verifyUser, userController.verifyOTP);
user.post('/user-mpin-setup',validateBody(verifyMpinSchema), verifyUser, userController.setMPIN);
// transaction pin flow start
user.post('/request-otp-for-transactionpin', verifyUser, userController.resetTransactionRequest);
user.post('/verify-otp-for-transactionpin',validateBody(verifyOtpSchema), verifyUser, userController.verifyTransactionPinOTP);
user.post('/user-transactionpin-setup',validateBody(verifyMpinSchema), verifyUser, userController.setTransactionPin);
// user.get('/user-activity-logs',  );
// user.get('/get-user-dashboard-data',  );


module.exports = user;