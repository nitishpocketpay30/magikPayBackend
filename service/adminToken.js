const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const createError = require('http-errors');
dotenv.config();

const generateAdminAccessToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email, name: admin.name,role:admin.role,appId:admin.appID },
    process.env.JWT_SECRET_ADMIN, 
    { expiresIn: '1d' }
  );
};

const generateAdminRefreshToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email, name: admin.name,role:admin.role,appId:admin.appID },
    process.env.JWT_REFRESH_SECRET_ADMIN,
    { expiresIn: '30d' }
  );
};
const verifyAdminAccessToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw createError(401, 'Access token is missing');
    }

    jwt.verify(token, process.env.JWT_SECRET_ADMIN, (err, decoded) => {
      if (err) {
        throw createError(401, 'Invalid or expired access token');
      }

      req.user = decoded;

      next();
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { generateAdminAccessToken, generateAdminRefreshToken,verifyAdminAccessToken };
