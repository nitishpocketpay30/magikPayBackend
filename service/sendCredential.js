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



function sendCredentialEmail(to, { email, password }) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your Account Credentials',
    html: `
      <p>Hello,</p>
      <p>Your account has been created. Below are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password after your first login for security reasons.</p>
      <p>Thank you!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendCredentialEmail;
