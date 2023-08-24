const User = require('../models/user.schema');
const Chat = require('../models/chat.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');

const renderHomepage = (req, res) => {
  res.status(200).render('home', {
    title: 'Home',
  });
};

const renderLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Login page',
  });
};

const renderRegisterPage = (req, res) => {
  res.status(200).render('register', {
    title: 'Register page',
  });
};

const renderPostPage = (req, res) => {
  res.status(200).render('post', {
    title: 'View page',
  });
};

const renderProfile = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  res.status(200).render('profile', {
    title: user ? user.username : 'User not found',
    user,
    userJS: user && JSON.stringify(user._id),
    userRequest: req.user,
    selectedTab: 'posts',
    selectedTabJS: JSON.stringify('posts'),
  });
});

const renderProfileWithReplies = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  res.status(200).render('profile', {
    title: user ? user.username : 'User not found',
    user,
    userJS: JSON.stringify(user._id),
    userRequest: req.user,
    selectedTab: 'replies',
    selectedTabJS: JSON.stringify('replies'),
  });
});

const renderFollowing = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  res.status(200).render('followingAndFollowers', {
    user,
    userJS: user && JSON.stringify(user._id),
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
    selectedTab: 'following',
    selectedTabJS: JSON.stringify('following'),
  });
});

const renderFollowers = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  res.status(200).render('followingAndFollowers', {
    user,
    userJS: user && JSON.stringify(user._id),
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
    selectedTab: 'followers',
    selectedTabJS: JSON.stringify('followers'),
  });
});

const renderSearchPageForPosts = (req, res) => {
  res.status(200).render('search', {
    title: 'Search',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
    selectedTab: 'posts',
    selectedTabJS: JSON.stringify('posts'),
  });
};

const renderSearchPageForUsers = (req, res) => {
  res.status(200).render('search', {
    title: 'Search',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
    selectedTab: 'users',
    selectedTabJS: JSON.stringify('users'),
  });
};

const renderInboxPage = (req, res) => {
  res.status(200).render('inbox', {
    title: 'Inbox',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
  });
};

const renderNewMessagePage = (req, res) => {
  res.status(200).render('newMessage', {
    title: 'New message',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
  });
};

const renderChatPage = catchAsync(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.user._id;

  const chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate('users');

  if (!chat) {
  }

  res.status(200).render('chat', {
    title: 'chat',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
    chat,
    chatJS: JSON.stringify(chat),
  });
});

module.exports = {
  renderHomepage,
  renderLoginPage,
  renderRegisterPage,
  renderPostPage,
  renderProfile,
  renderProfileWithReplies,
  renderFollowing,
  renderFollowers,
  renderSearchPageForPosts,
  renderSearchPageForUsers,
  renderInboxPage,
  renderNewMessagePage,
  renderChatPage,
};
