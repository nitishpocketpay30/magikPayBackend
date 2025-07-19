const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const createError = require('http-errors');
const verifyAccessToken = (entity) => (req, res, next) => {
  const auth = req.header('Authorization')?.replace('Bearer ', '');
  if (!auth) return res.status(401).json({ message: 'Token missing',status:401  });

  const secret = entity === 'admin'
    ? process.env.JWT_SECRET_ADMIN
    : process.env.JWT_SECRET_USER;

  jwt.verify(auth, secret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token',status:401 });
    req.user = decoded;
    next();
  });
};
const verifyAccessKey = async (req, res, next) => {
  try {
    const accessKey = req.body.access_token;

    if (!accessKey) {
      return res.status(403).json({ result: 0, message: 'Access token is required' });
    }

    // Proper IP extraction (trust proxy-aware)
    const userIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.connection.remoteAddress ||
      req.socket?.remoteAddress;

    const userData = await User.findOne({
      where: {
        access_token: accessKey,
        status: 1,
      },
      raw: true
    });
 console.log("userData",userData,accessKey)
    if (!userData) {
      return res.status(403).json({
        result: 0,
        message: 'SORRY YOUR LIVE CREDENTIALS ARE NOT ACTIVE'
      });
    }

    if (!userData.payment_provider) {
      return res.status(403).json({
        result: 0,
        message: 'PG Service is not enabled or approved. Please reach out to admin'
      });
    }

    const allowedIps = [userData.user_ip1, userData.user_ip2, userData.user_ip3].filter(Boolean);

    // if (!allowedIps.includes(userIp)) {
    //   return res.status(403).json({
    //     result: 0,
    //     message: `${userIp} is IP not whitelisted`
    //   });
    // }

    // All good — pass user to next handler
    req.apiUser = userData;
    console.log('Access granted to', userData.email || userData.mobileNumber, 'from IP', userIp);
    next();
  } catch (err) {
    next(err);
  }
};
module.exports = {
  verifyAdmin: verifyAccessToken('admin'),
  verifyUser: verifyAccessToken('user'),
  verifyAccessKey
};
