const rateLimit = require('express-rate-limit');

// Aggressive throttle for Login and Registration to stop Bot attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Standard throttle for basic API queries to prevent DDoS
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 300, 
  message: 'Too many API requests, please slow down your interaction.',
  standardHeaders: true,
  legacyHeaders: false, 
});

module.exports = {
  authLimiter,
  apiLimiter
};
