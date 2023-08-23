const Chat = require('../models/chat.schema');
const User = require('../models/user.schema');
const { ObjectId } = require('mongodb');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');

const createChat = catchAsync(async (req, res, next) => {
  let users = req.body.users;

  if (!users) {
    throw new CustomError('Users not sent with request', 400);
  }

  if (users.length == 0) {
    throw new CustomError('Users is empty', 400);
  }

  users = users.map((user) => ({ _id: new ObjectId(user._id) }));

  users.push({
    _id: req.user._id,
  });

  const chatData = {
    users,
    isGroupChat: true,
  };
  console.log(chatData);

  const chat = await Chat.create(chatData);

  res.status(200).json({ status: 'success', chat });
});

module.exports = { createChat };
