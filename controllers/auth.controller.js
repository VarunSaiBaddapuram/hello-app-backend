const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || !!process.env.RENDER;

const cookieConfig = { 
  sameSite: 'none', // Set to none + secure for cross-domain usage in production
  secure: true, 
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// For local development, allow lax/non-secure cookies
if (!isProduction) {
  cookieConfig.sameSite = 'lax';
  cookieConfig.secure = false;
}

exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });
    
    jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) return next(err);
      res.cookie('token', token, cookieConfig).status(201).json({
        id: createdUser._id,
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(400).json('User not found');
    }

    const passOk = await bcrypt.compare(password, foundUser.password);
    if (!passOk) {
      return res.status(400).json('Wrong password');
    }

    jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) return next(err);
      res.cookie('token', token, cookieConfig).json({
        id: foundUser._id,
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', cookieConfig).json('ok');
};

exports.profile = (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json('No profile data found');
  }
};
