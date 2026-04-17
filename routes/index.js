const express = require('express');
const authController = require('../controllers/auth.controller');
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Auth Routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authMiddleware, authController.profile);

// Chat & Users Routes
router.get('/messages/:userId', authMiddleware, chatController.getMessages);
router.get('/people', authMiddleware, chatController.getPeople);

module.exports = router;
