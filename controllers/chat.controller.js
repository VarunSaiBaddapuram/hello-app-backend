const Message = require('../models/Message');
const User = require('../models/User');

exports.getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === 'undefined') {
      return res.status(400).json('userId missing');
    }
    
    const ourUserId = req.user.userId;

    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.getPeople = async (req, res, next) => {
  try {
    const users = await User.find({}, { '_id': 1, username: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
