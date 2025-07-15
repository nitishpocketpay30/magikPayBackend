const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const createError = require('http-errors');
const { createUser } = require('../models/userModel');
const sendCredentialEmail = require('../../service/sendCredential');

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
const addUser=async (req,res,next)=>{
  try {
    const {
      companyName, mobile, email, gstNumber,
      panNumber, panHolderNumber, contactPersonName, contactPersonMobile
    } = req.body;

    if (!companyName || !mobile || !email || !gstNumber) {
      throw createError(400, 'Missing required fields');
    }

    const userData = { companyName, mobile, email, gstNumber, panNumber, panHolderNumber, contactPersonName, contactPersonMobile };

    const files = req.files || {};
    for (const field of ['panCard', 'aadhaarCard', 'gstDocument']) {
      const fileArr = files[field];
      if (fileArr && fileArr[0]) {
        userData[field + 'Url'] = await uploadToS3(fileArr[0]);
      }
    }

    const result = await createUser(userData);
    await sendCredentialEmail(email);
    res.status(201).json({ data: result, message: 'User Created Successfully!', status: 200 });
  } catch (err) {
    next(err);
  }
}
module.exports={
    addUser
}