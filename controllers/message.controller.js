const Message = require('../models/message.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');

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

  res
    .status(201)
    .json({ status: 'success', msg: 'create message success', message });
});

module.exports = { createMessage };
