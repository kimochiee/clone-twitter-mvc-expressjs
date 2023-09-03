const express = require('express');
const router = express.Router();

const {
  getChatListForUser,
  getChatById,
  createChat,
  updateChat,
  getAllMessagesFromChat,
  markAllMessageAsRead,
} = require('../controllers/chat.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.route('/').get(getChatListForUser).post(createChat);
router.route('/:id').get(getChatById).patch(updateChat);
router.route('/:id/messages').get(getAllMessagesFromChat);
router.route('/:id/messages/markAsRead').patch(markAllMessageAsRead);

module.exports = router;
