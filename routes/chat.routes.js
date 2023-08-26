const express = require('express');
const router = express.Router();

const {
  getChatListForUser,
  getChatById,
  createChat,
  updateChat,
} = require('../controllers/chat.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.route('/').get(getChatListForUser).post(createChat);
router.route('/:id').get(getChatById).patch(updateChat);

module.exports = router;
