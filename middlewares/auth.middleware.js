const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json('Unauthenticated: No token provided');
  }

  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) {
      logger.warn(`Authentication failure: ${err.message} from IP: ${req.ip}`);
      return res.status(401).json('Unauthenticated: Invalid token');
    }
    req.user = userData;
    next();
  });
};

module.exports = authMiddleware;
