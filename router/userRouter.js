const express = require('express');
const user = express.Router();

const userController = require('../controller/userController/userController');
const { verifyAccessToken } = require('../service/token');
const upload = require('../middleware/upload'); // ✅ MATCHES THE EXPORT

user.post('/register',  upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstDocument', maxCount: 1 }
  ]), userController.addUser);


module.exports = user;
// ✅ This code defines the user router for handling user-related routes in the application.