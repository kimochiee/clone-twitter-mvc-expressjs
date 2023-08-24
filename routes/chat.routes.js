const express = require('express');
const router = express.Router();

const {
  getChatListForUser,
  createChat,
} = require('../controllers/chat.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.route('/').get(getChatListForUser).post(createChat);

module.exports = router;
