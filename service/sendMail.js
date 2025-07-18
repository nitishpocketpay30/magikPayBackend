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
function sendTopUpToAdmin(to, FROM, { userName, amount }) {
  const mailOptions = {
    from: FROM,
    to:"rejohix714@jxbav.com" || to,
    subject: 'Top-Up Request Received',
    html: `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Top-Up Request</title>
        <style>
          body {
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .container {
            max-width: 600px;
            background-color: #ffffff;
            margin: 30px auto;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 16px;
          }
          p {
            color: #555555;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 16px;
          }
          .otp {
            display: inline-block;
            padding: 12px 20px;
            margin: 16px 0;
            font-size: 20px;
            font-weight: bold;
            background-color: #f0f8ff;
            border: 1px dashed #00aaff;
            border-radius: 4px;
            letter-spacing: 2px;
          }
          .footer {
            font-size: 14px;
            color: #888888;
            margin-top: 20px;
            text-align: center;
          }
          @media only screen and (max-width: 620px) {
            .container {
              margin: 10px;
              padding: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📥 New Top-Up Request</h1>
          <p>Hello <strong>ADMIN</strong>,</p>
          <p>You have getting a top-up request  of <strong>₹${amount}</strong> from ${userName}. To confirm this request</p>
          <p class="footer">Thank you,<br/>The MagikPay Team</p>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}


module.exports = {sendOTPEmail,sendOTPMPIN,sendOTPTXNPIN,sendTopUpToAdmin};
