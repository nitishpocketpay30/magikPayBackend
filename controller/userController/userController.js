const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
// const { createUser } = require('../models/userModel');
const sendCredentialEmail = require('../../service/sendCredential');
const Admin = require('../../model/adminModel');
const User = require('../../model/userModel');
const { generateRefreshToken, generateAccessToken } = require('../../service/token');
const RefreshToken = require('../../model/RefreshToken');
const generatePassword = require('../../service/passwordGenerator');

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
    res.status(201).json({ data: result, message: 'User Created Successfully!', status: 201 });
  } catch (err) {
    next(err);
  }
}
const loginUserAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email, status: true } });
    if (admin && await bcrypt.compare(password, admin.password)) {
      const accessToken = generateAccessToken('admin', admin);
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
    const user = await User.findOne({ where: { email,status: true } });
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
module.exports = {
  addUser,
  loginUserAdmin
}