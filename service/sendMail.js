const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your OTP Code',
    html: `
      <p>Your <strong>One-Time Password</strong> is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for <strong>10 minutes</strong>.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}
function sendOTPMPIN(to, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your OTP Code',
    html: `
      <p>Your <strong>One-Time Password</strong> is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for <strong>10 minutes</strong>.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}
function sendOTPTXNPIN(to, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your OTP Code',
    html: `
      <p>Your <strong>One-Time Password For Transaction Pin Update</strong> is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for <strong>10 minutes</strong>.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {sendOTPEmail,sendOTPMPIN,sendOTPTXNPIN};
