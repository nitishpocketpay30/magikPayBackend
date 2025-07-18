const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const createError = require('http-errors');
const CryptoJS = require("crypto-js");
const crypto = require('crypto');

const AccessModule = require('../model/accessModule');
dotenv.config();
async function fetchUserPermissions(user) {
  const perms = JSON.parse(JSON.stringify(await AccessModule.findAll({
    where: {
      userId: user.id,
      userType: user.role
    },
    attributes: ['moduleName','submoduleName','create','read','update','delete'],
    raw: true
  })));
  return perms.map(p => ({
    module: p.moduleName,
    submodule: p.submoduleName,
    create: p.create,
    read: p.read,
    update: p.update,
    delete: p.delete
  }));
}

const generateAccessToken = async(entity, user) => {
  const permissions = await fetchUserPermissions(user) || [];

  const payload = {
    id: user.id,
    email: user.email,
    name: user.firstName || user.companyName,
    role:user?.role===1 ? "admin" :user?.role===2 ? "staff" : "user",
  };

  const secret = entity === 'admin'
    ? process.env.JWT_SECRET_ADMIN
    : process.env.JWT_SECRET_USER;
  console.log("HELLO",payload,user,entity)

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

function generateVirtualId(length = 8) {
  return `VIR${Math.random().toString(36).substr(2, length).toUpperCase()}`;
}
function generateApiTxnId() {
  return crypto.randomUUID(); // e.g. "9b9c8a30-5d0f-4f11-9c2a-4d3e92b3f7f2"
}
module.exports = { generateAccessToken, generateRefreshToken,encryptDataFromText,decryptTextFromData,generateVirtualId,generateApiTxnId };
