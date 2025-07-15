const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const createError = require('http-errors');
const CryptoJS = require("crypto-js");
dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name,tenant_id:user.tenant_id },
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name,tenant_id:user.tenant_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' } // Refresh token expiration (30 days)
  );
};
const verifyAccessToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw createError(401, 'Access token is missing');
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw createError(401, 'Invalid or expired access token');
      }

      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    });
  } catch (err) {
    next(err);
  }
};
const encryptDataFromText=(text)=>{
  const ciphertext = CryptoJS.AES.encrypt(text, process.env.CRYPTO_SECRET_KEY).toString();
  return ciphertext;
}
const decryptTextFromData=(data)=>{
  const bytes  = CryptoJS.AES.decrypt(data, process.env.CRYPTO_SECRET_KEY);
const originalText = bytes.toString(CryptoJS.enc.Utf8);
return originalText;
}
module.exports = { generateAccessToken, generateRefreshToken,verifyAccessToken,encryptDataFromText,decryptTextFromData };
