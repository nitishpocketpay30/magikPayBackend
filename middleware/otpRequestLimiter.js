const rateLimit = require('express-rate-limit');

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,                   // limit: 3 OTP requests/hour
  keyGenerator: req => `user:${req.user.id}`, // custom user-based key
  message: { message: 'Too many OTP requests – try again later', status: 429 },
  skipFailedRequests: false,
  standardHeaders: true
});
module.exports={
    otpRequestLimiter
}