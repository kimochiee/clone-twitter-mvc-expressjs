const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/view.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');

router.get('/', isLoggedIn, renderHomepage);
router.get('/login', renderLoginPage);
router.get('/register', renderRegisterPage);

router.get('/messages', isLoggedIn, renderInboxPage);
router.get('/messages/new', isLoggedIn, renderNewMessagePage);
router.get('/messages/:id', isLoggedIn, renderChatPage);

router.get('/search', isLoggedIn, renderSearchPageForPosts);
router.get('/search/posts', isLoggedIn, renderSearchPageForPosts);
router.get('/search/users', isLoggedIn, renderSearchPageForUsers);

router.get('/posts/:id', isLoggedIn, renderPostPage);

router.get('/profile/:username', isLoggedIn, renderProfile);
router.get('/profile/:username/replies', isLoggedIn, renderProfileWithReplies);
router.get('/profile/:username/following', isLoggedIn, renderFollowing);
router.get('/profile/:username/followers', isLoggedIn, renderFollowers);

router.get('/notifications', isLoggedIn, renderNotificationsPage);

module.exports = router;
