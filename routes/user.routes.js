const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinary');

const {
  getAllUsers,
  getFollowersList,
  getFollowingList,
  follow,
  uploadImage,
  uploadCoverPhoto,
} = require('../controllers/user.controller');
const {
  authenticateUser,
  authorizeUser,
} = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.get('/', authenticateUser, getAllUsers);

router.post(
  '/profilePicture',
  authenticateUser,
  uploadCloud.single('croppedImage'),
  uploadImage
);
router.post(
  '/coverPhoto',
  authenticateUser,
  uploadCloud.single('croppedImage'),
  uploadCoverPhoto
);

router.patch('/:id/follow', follow);
router.get('/:id/following', getFollowingList);
router.get('/:id/followers', getFollowersList);

module.exports = router;
