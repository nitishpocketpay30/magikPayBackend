// 📦 Core Node.js Libraries
const fs = require('fs');
const path = require('path');

// 🌐 Third-Party Dependencies
const mime = require('mime-types');
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// 🛠️ Internal Services & Utilities
const sendCredentialEmail = require('../../service/sendCredential');
const {sendOTPMPIN, sendOTPTXNPIN} = require('../../service/sendMail');
const { generateRefreshToken, generateAccessToken } = require('../../service/token');
const generatePassword = require('../../service/passwordGenerator');

// 👥 Models
const Admin = require('../../model/adminModel');
const User = require('../../model/userModel');
const RefreshToken = require('../../model/RefreshToken');
const ResetMpin = require('../../model/resetMpinModel');
const TransactionPin = require('../../model/transactionPinModel');
const AccessModule = require('../../model/accessModule');


const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function uploadToS3(file) {
  const localPath = file.path;
  const ext = path.extname(file.originalname);
  const stream = fs.createReadStream(localPath);
  const s3Key = `users/${Date.now()}-${file.fieldname}${ext}`;

  const uploader = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: stream,
      ContentType: mime.lookup(ext) || 'application/octet-stream',
      ACL: 'public-read'
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024
  });

  await uploader.done();
  fs.unlinkSync(localPath);
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
}
const addUser = async (req, res, next) => {
  try {
    const {
      companyName, mobileNumber, email, gstNumber,
      panNumber, panHolderName, contactPersonName, contactPersonMobile
    } = req.body;
    const exists = await User.findOne({ where: { email: email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    if (!companyName || !mobileNumber || !email) {
      throw createError(400, 'Missing required fields');
    }
    const raw = generatePassword(12);
    const hashed = await bcrypt.hash(raw, 12);
    const userData = {
      companyName,
      mobileNumber,
      email,
      gstNumber: gstNumber || null,
      panNumber: panNumber || null,
      panHolderName: panHolderName || null,
      contactPersonName: contactPersonName || null,
      contactPersonMobile: contactPersonMobile || null,
      password: hashed
    };

    const files = req.files || {};
    for (const field of ['panCard', 'aadhaarCard', 'gstDocument']) {
      const fileArr = files[field];
      if (fileArr && fileArr[0]) {
        userData[field + 'Upload'] = await uploadToS3(fileArr[0]);
      }
    }
    const result = await User.create(userData);
    await sendCredentialEmail(email, { email, password: raw });
    res.status(201).json({ data:{}, message: 'User Created Successfully!', status: 201 });
  } catch (err) {
    next(err);
  }
}
const loginUserAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = JSON.parse(JSON.stringify(await Admin.findOne({ where: { email, status: true } })));
    if (admin && await bcrypt.compare(password, admin.passwordHash)) {
      const accessToken = await generateAccessToken('admin', admin);
      console.log("hello",accessToken)
      const refreshToken = generateRefreshToken(admin);

      await RefreshToken.create({
        token: refreshToken,
        adminId: admin.id,
        expires: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        isActive: true
      });

      return res.status(201).json({
        status: 201,
        message: "Admin login Successfully !",
        data: {
          type: 'admin',
          user: { id: admin.id, firstName: admin.firstName, email: admin.email },
          accessToken,
          refreshToken
        }

      });
    }

    // —— Then try User
    const user = await User.findOne({ where: { email, status: true } });
    if (user && await bcrypt.compare(password, user.password)) {
      const accessToken = generateAccessToken('user', user);
      await user.update({ access_token: accessToken });

      return res.status(201).json({
        status: 201,
        message: "User Login Successfully !",
        data: {
          type: 'user',
          user: { id: user.id, companyName: user.companyName, email: user.email },
          accessToken
        }

      });
    }

    // —— No match
    res.status(401).json({ message: 'Invalid credentials', status: 401 });
  } catch (err) {
    next(err);
  }
};
const getUserList = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const { count: total, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      offset,
      limit,
      order: [['id', 'ASC']],
    });


    res.status(200).json({
      status: 200,
      message: 'User data fetched successfully!',
      page,
      limit,
      total,
      count: users.length,
      data: users
    });
  }
  catch (err) {
    next(err)
  }
}
const updateUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("hello", id, req.body)
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) throw createError(400, "Invalid user")
    // Determine base query:
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });

    // Whitelist allowed fields:
    const editable = ['companyName', 'mobileNumber', 'max_amount', 'min_amount', 'contactPersonName', 'panHolderName', 'panNumber', 'gstNumber', 'companyName', 'user_ip1', 'user_ip2', 'user_ip3', 'topup', 'contactPersonMobile'];
    let updates = {};
    editable.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Admins: allow file uploads to be updated
    if (isAdmin && req.files) {
      ['panCard', 'aadhaarCard', 'gstDocument'].forEach(async field => {
        if (req.files[field]?.[0]) {
          updates[field + 'Upload'] = await uploadToS3(req.files[field][0]);
        }
      });
    }

    if (!isAdmin && Object.keys(req.files || {}).length) {
      return res.status(403).json({ message: 'Only admins can update files' });
    }

    // Calculate fields list:
    const fields = Object.keys(updates);

    await user.update(updates, { fields });
    // logger.info('User updated', { admin: req.user.id, userId: id, isAdmin });

    res.json({
      status: 200,
      message: 'User updated',
      data: { id, ...updates }
    });
  } catch (err) {
    next(err);
  }
};
const userChangePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = parseInt(req.params.id, 10);
    if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });

    const user = await User.findByPk(userId, { attributes: ['id', 'password'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { currentPassword, newPassword } = req.body;
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      // logger.warn('Password change failed – incorrect current password', { userId });
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: newHash });
    // logger.info('Password changed successfully', { userId, timestamp: new Date().toISOString() });

    res.status(200).json({ status: 200, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
const createOrUpdateTransactionPinByUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = parseInt(req.params.id, 10);
    if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });

    const user = await User.findByPk(userId, {
      attributes: ['id', 'transactionPin', 'pinFailedAttempts', 'pinLockedUntil']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check lockout (Brute-force prevention)
    if (user.pinLockedUntil && new Date() < user.pinLockedUntil) {
      return res.status(423).json({ message: 'PIN is temporarily locked. Try later.' });
    }

    // Hash and set new PIN
    const saltRounds = 12;
    const hashedPin = await bcrypt.hash(req.body.pin, saltRounds);
    await user.update({
      transactionPin: hashedPin,
      pinFailedAttempts: 0,
      pinLockedUntil: null,
    });

    // Log event (audit trail)
    // logger.info('Transaction PIN updated', { userId });

    res.status(200).json({ status: 200, message: 'Transaction PIN set/updated successfully' });
  } catch (err) {
    next(err);
  }
};
const resetRequest = async (req, res, next) => {
  try {
    // Generate secure, unpredictable 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP using bcrypt (cost ≥12)
    const otpHash = await bcrypt.hash(otp, 12);

    // Store in DB: hashed OTP, user ID, expiry, attempt counter
    await ResetMpin.create({
      userId: req.user.id,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0
    });
 console.log("logs",req.user)
    // Send via trusted channel (email/SMS)
    await sendOTPMPIN(req?.user?.email, otp);

    return res.status(200).json({ status: 200, message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
};
const verifyOTP = async (req, res, next) => {
  try {
    const otp = String(req.body.otp || '');
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ status: 400, message: 'Invalid OTP format' });
    }

    // Fetch OTP record properly
    const pr = await ResetMpin.findOne({
      where: {
        userId: parseInt(req.user.id, 10),
        expiresAt: { [Op.gt]: new Date() },
        attempts: { [Op.lt]: 5 }
      }
    });
    console.log('Record fetched:', pr && pr.toJSON(), 'for user:', req.user);

    if (!pr) {
      return res.status(400).json({ status: 400, message: 'No valid OTP or expired' });
    }

    // Use the instance property directly
    const isMatch = await bcrypt.compare(otp, pr.otpHash);
    if (!isMatch) {
      pr.attempts += 1;
      if (pr.attempts >= 5) pr.expiresAt = new Date();
      await pr.save();
      return res.status(401).json({ status: 401, message: 'Incorrect OTP' });
    }

    await pr.destroy(); // one-time use
 await User.update(
      { mpinOtpVerified: true },
      { where: { id: req.user.id } }
    );

    return res.status(200).json({ status: 200, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP verification error:', err);
    next(err);
  }
};
const setMPIN = async (req, res, next) => {
  try {
    const { mpin } = req.body;
    if (!/^\d{4,6}$/.test(mpin)) {
      return res.status(400).json({ status: 400, message: 'Invalid mPIN format—must be 4–6 digits.' });
    }
   const mpinStatusCheck=await User.findOne({
    where:{
      id:req.user.id,
      mpinOtpVerified:true
    }
   });
   if(!mpinStatusCheck) throw createError(400,"Otp not verified")
    const user = await User.findByPk(req.user.id, { attributes: ['id'] });
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found.' });
    }

    // Use bcrypt with cost factor 12 (recommended minimum for production) :contentReference[oaicite:1]{index=1}
    const mpinHash = await bcrypt.hash(mpin, 12);

    await user.update({
      mpin: mpinHash,
      mpin_failed_attempts: 0,
      mpin_locked_until: null
    }, { fields: ['mpin', 'mpin_failed_attempts', 'mpin_locked_until'] });


    return res.status(200).json({ status: 200, message: 'mPIN successfully set.' });
  } catch (err) {
    next(err);
  }
};
const resetTransactionRequest = async (req, res, next) => {
  try {
    // Generate secure, unpredictable 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP using bcrypt (cost ≥12)
    const otpHash = await bcrypt.hash(otp, 12);

    // Store in DB: hashed OTP, user ID, expiry, attempt counter
    await TransactionPin.create({
      userId: req.user.id,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0
    });
 console.log("logs",req.user)
    // Send via trusted channel (email/SMS)
    await sendOTPTXNPIN(req?.user?.email, otp);

    return res.status(200).json({ status: 200, message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
};
const verifyTransactionPinOTP = async (req, res, next) => {
  try {
    const otp = String(req.body.otp || '');
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ status: 400, message: 'Invalid OTP format' });
    }

    // Fetch OTP record properly
    const pr = await TransactionPin.findOne({
      where: {
        userId: parseInt(req.user.id, 10),
        expiresAt: { [Op.gt]: new Date() },
        attempts: { [Op.lt]: 5 }
      }
    });
    console.log('Record fetched:', pr && pr.toJSON(), 'for user:', req.user);

    if (!pr) {
      return res.status(400).json({ status: 400, message: 'No valid OTP or expired' });
    }

    // Use the instance property directly
    const isMatch = await bcrypt.compare(otp, pr.otpHash);
    if (!isMatch) {
      pr.attempts += 1;
      if (pr.attempts >= 5) pr.expiresAt = new Date();
      await pr.save();
      return res.status(401).json({ status: 401, message: 'Incorrect OTP' });
    }

    await pr.destroy(); // one-time use
 await User.update(
      { txnPinOtpVerified: true },
      { where: { id: req.user.id } }
    );

    return res.status(200).json({ status: 200, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP verification error:', err);
    next(err);
  }
};
const setTransactionPin = async (req, res, next) => {
  try {
    const { txnpin } = req.body;
    if (!/^\d{4,6}$/.test(txnpin)) {
      return res.status(400).json({ status: 400, message: 'Invalid txnPIN format—must be 4–6 digits.' });
    }
   const txnpinStatusCheck=await User.findOne({
    where:{
      id:req.user.id,
      txnPinOtpVerified:true
    }
   });
   if(!txnpinStatusCheck) throw createError(400,"Otp not verified")
    const user = await User.findByPk(req.user.id, { attributes: ['id'] });
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found.' });
    }

    // Use bcrypt with cost factor 12 (recommended minimum for production) :contentReference[oaicite:1]{index=1}
    const txnpinHash = await bcrypt.hash(txnpin, 12);

    await user.update({
      transactionPin: txnpinHash,
      pin_failed_attempts: 0,
      pin_locked_until: null
    }, { fields: ['transactionPin', 'pin_failed_attempts', 'pin_locked_until'] });


    return res.status(200).json({ status: 200, message: 'Txn PIN successfully set.' });
  } catch (err) {
    next(err);
  }
};
const getUserDetails = async (req, res, next) => {
  try {

    const { id } = req.user;
    if (req.user.role !== 'user') {
      return res.status(403).json({ status: 403, message: 'Forbidden' });
    }

    const staff = await User.findOne({
      where: { id: parseInt(id)},
      attributes: { exclude: ['password','access_token'] },
      include: [{
        model: AccessModule,
        as: 'permissions', // must match your association alias
        required: false,
        where: {        // optional filtering; remove to get all
          userType: 2 // or 'admin', consistent with stored enum
        }
      }]
    });

    if (!staff) {
      return res.status(404).json({ status: 404, message: 'user not found' });
    }

    res.status(200).json({
      message: 'user fetched successfully',
      status: 200,
      data: staff
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  addUser,
  loginUserAdmin,
  getUserList,
  updateUserByAdmin,
  userChangePassword,
  createOrUpdateTransactionPinByUser,
  resetRequest,
  verifyOTP,
  setMPIN,
  resetTransactionRequest,
  verifyTransactionPinOTP,
  setTransactionPin,
  getUserDetails
}