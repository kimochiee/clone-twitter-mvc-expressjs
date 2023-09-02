const Post = require('../models/post.schema');
const User = require('../models/user.schema');
const Notification = require('../models/notification.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');

const getAllNotificationsToUser = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({
    userTo: req.user._id,
    notificationType: { $ne: 'newMessage' },
  })
    .populate(['userTo', 'userFrom'])
    .sort({ createdAt: -1 });

  if (!notifications) {
    throw new CustomError('user id not found', 400);
  }

  res.status(200).json({ status: 'success', notifications });
});

const markAsOpened = catchAsync(async (req, res, next) => {
  await Notification.findByIdAndUpdate(
    req.params.id,
    { opened: true },
    { new: true }
  );

  res.status(200).json({ status: 'success' });
});

const markAllAsOpened = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { userTo: req.user._id },
    { opened: true },
    { new: true }
  );

  res.status(200).json({ status: 'success' });
});

module.exports = { getAllNotificationsToUser, markAsOpened, markAllAsOpened };
