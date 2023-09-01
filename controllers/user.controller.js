const User = require('../models/user.schema');
const Notification = require('../models/notification.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');

const getAllUsers = catchAsync(async (req, res, next) => {
  let queryObj = { ...req.query };

  if (queryObj.name != undefined) {
    queryObj = {
      $or: [
        { firstname: { $regex: queryObj.name, $options: 'i' } },
        { lastname: { $regex: queryObj.name, $options: 'i' } },
        { username: { $regex: queryObj.name, $options: 'i' } },
      ],
    };
    delete queryObj.name;
  }

  const users = await User.find(queryObj);

  res.status(200).json({
    status: 'success',
    msg: 'get all users successfully',
    users,
    userRequest: req.user,
  });
});

const getFollowingList = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('following');

  res.status(200).json({
    status: 'success',
    msg: 'get all users successfully',
    followingList: user.following,
  });
});

const getFollowersList = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('followers');

  res.status(200).json({
    status: 'success',
    msg: 'get all users successfully',
    followersList: user.followers,
  });
});

const follow = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const isFollowing = req.user.following && req.user.following.includes(userId);
  const option = isFollowing ? '$pull' : '$addToSet';

  const requestUser = await User.findByIdAndUpdate(
    req.user._id,
    { [option]: { following: userId } },
    { new: true }
  );
  req.user = requestUser;
  res.locals.user = requestUser;

  const user = await User.findByIdAndUpdate(
    userId,
    { [option]: { followers: requestUser._id } },
    { new: true }
  );

  if (!isFollowing) {
    await Notification.insertNotification(
      userId,
      req.user._id,
      'follow',
      req.user._id
    );
  }

  res
    .status(200)
    .json({ status: 'success', msg: 'follow successfully', user, requestUser });
});

const uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw new CustomError('Missing file', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { photo: req.file.path },
    { new: true }
  );

  res
    .status(200)
    .json({ status: 'success', msg: 'upload image successfully', user });
});

const uploadCoverPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw new CustomError('Missing file', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { cover: req.file.path },
    { new: true }
  );

  res
    .status(200)
    .json({ status: 'success', msg: 'upload image successfully', user });
});

module.exports = {
  getAllUsers,
  getFollowingList,
  getFollowersList,
  follow,
  uploadImage,
  uploadCoverPhoto,
};
