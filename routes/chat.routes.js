const express = require('express');
const router = express.Router();

const {
  getChatListForUser,
  getChatById,
  createChat,
  updateChat,
  getAllMessagesFromChat,
} = require('../controllers/chat.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.route('/').get(getChatListForUser).post(createChat);
router.route('/:id').get(getChatById).patch(updateChat);
router.route('/:id/messages').get(getAllMessagesFromChat);

module.exports = router;
