const express = require('express');
const router = express.Router();

const { createChat } = require('../controllers/chat.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.route('/').post(createChat);

module.exports = router;
