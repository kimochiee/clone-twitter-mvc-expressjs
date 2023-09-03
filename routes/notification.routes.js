const express = require('express');
const router = express.Router();

const {
  getAllNotificationsToUser,
  getLatestNotifcation,
  markAsOpened,
  markAllAsOpened,
} = require('../controllers/notification.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.get('/', getAllNotificationsToUser);
router.patch('/:id/markAsOpened', markAsOpened);
router.get('/latest', getLatestNotifcation);
router.patch('/markAsOpened', markAllAsOpened);

module.exports = router;
