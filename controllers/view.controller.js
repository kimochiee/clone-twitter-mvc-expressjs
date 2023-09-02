const User = require('../models/user.schema');
const Chat = require('../models/chat.schema');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

//------------------------------------------------------
const getChatByUserId = (userLoggedInId, otherUserId) => {
  return Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: userLoggedInId } },
          { $elemMatch: { $eq: otherUserId } },
        ],
      },
    },
    {
      $setOnInsert: {
        users: [userLoggedInId, otherUserId],
      },
    },
    { new: true, upsert: true }
  ).populate('users');
};

//------------------------------------------------------
const renderHomepage = (req, res) => {
  res.status(200).render('home', {
    title: 'Home',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
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
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
  });
};

const renderProfile = catchAsync(async (req, res, next) => {
  let user = await User.findOne({ username: req.params.username });

  if (!user) {
    user = await User.findById(req.params.username);
  }

  res.status(200).render('profile', {
    title: user ? user.username : 'User not found',
    user,
    userJS: user && JSON.stringify(user._id),
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
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
    userRequestJS: JSON.stringify(req.user),
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
  const isValidId = mongoose.isValidObjectId(req.params.id);
  let payload = {
    title: 'chat',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
  };

  if (!isValidId) {
    payload.errorMessage =
      'Chat does not exist or you do not have permission to access';

    return res.status(200).render('chat', payload);
  }

  let chat = await Chat.findOne({
    _id: req.params.id,
    users: { $elemMatch: { $eq: req.user._id } },
  }).populate('users');

  if (!chat) {
    const userFound = await User.findById(req.params.id);

    if (userFound) {
      chat = await getChatByUserId(req.user._id, userFound._id);
    }
  }

  if (!chat) {
    payload.errorMessage =
      'Chat does not exist or you do not have permission to access';
  } else {
    payload.chat = chat;
    payload.chatJS = JSON.stringify(chat);
  }

  res.status(200).render('chat', payload);
});

const renderNotificationsPage = (req, res) => {
  res.status(200).render('notifications', {
    title: 'Notifications',
    userRequest: req.user,
    userRequestJS: JSON.stringify(req.user),
  });
};

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
  renderNotificationsPage,
};
