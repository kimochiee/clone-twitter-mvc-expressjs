const Chat = require('../models/chat.schema');
const Message = require('../models/message.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');
const { ObjectId } = require('mongodb');

const getChatListForUser = catchAsync(async (req, res, next) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate('users')
    .populate({ path: 'latestMessage', populate: { path: 'sender' } })
    .sort({ updatedAt: -1 });

  if (req.query.unreadOnly != undefined && req.query.unreadOnly == 'true') {
    chats = chats.filter(
      (chat) => !chat.latestMessage.readBy.includes(req.user._id)
    );
  }

  res.status(200).json({ status: 'success', chats });
});

const getChatById = catchAsync(async (req, res, next) => {
  const chat = await Chat.findOne({
    _id: req.params.id,
    users: { $elemMatch: { $eq: req.user._id } },
  }).populate(['users', 'latestMessage']);

  res.status(200).json({ status: 'success', chat });
});

const getAllMessagesFromChat = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ chat: req.params.id }).populate(
    'sender'
  );

  if (!messages) {
    throw new CustomError('Invalid chat id', 400);
  }

  res.status(200).json({ status: 'success', messages });
});

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

const updateChat = catchAsync(async (req, res, next) => {
  const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res
    .status(200)
    .json({ status: 'success', msg: 'update chat successfully', chat });
});

module.exports = {
  getChatListForUser,
  getChatById,
  createChat,
  updateChat,
  getAllMessagesFromChat,
};
