const express = require('express');
const router = express.Router();

const { createMessage } = require('../controllers/message.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.route('/').post(createMessage);

module.exports = router;
