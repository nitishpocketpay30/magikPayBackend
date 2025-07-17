const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const createError = require('http-errors');
const CryptoJS = require("crypto-js");
dotenv.config();

const generateAccessToken = (entity, user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.firstName || user.companyName,
    role:entity==="admin" ? "admin":entity==="admin" ?"staff": "user",
    permission:[]
  };
  const secret = entity === 'admin'
    ? process.env.JWT_SECRET_ADMIN
    : process.env.JWT_SECRET_USER;
  const expiresIn = '1d';
  return jwt.sign(payload, secret, { expiresIn });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
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
module.exports = { generateAccessToken, generateRefreshToken,encryptDataFromText,decryptTextFromData };
