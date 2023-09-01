const Message = require('../models/message.schema');
const Chat = require('../models/chat.schema');
const Notification = require('../models/notification.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');

//------------------------------------------------------
const insertNotifications = (chat, message) => {
  chat.users.forEach((userId) => {
    console.log(userId, message.sender._id);
    if (userId == message.sender._id.toString()) {
      return;
    } else {
      Notification.insertNotification(
        userId,
        message.sender._id,
        'newMessage',
        message.chat._id
      );
    }
  });
};

//------------------------------------------------------
const createMessage = catchAsync(async (req, res, next) => {
  const { content, chatId } = req.body;
  if (!content && !chatId) {
    throw new CustomError('Invalid input', 400);
  }

  const message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  await (
    await message.populate(['sender', 'readBy'])
  ).populate({ path: 'chat', populate: { path: 'users' } });

  const chat = await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
  });

  insertNotifications(chat, message);

  res
    .status(201)
    .json({ status: 'success', msg: 'create message success', message });
});

module.exports = { createMessage };
