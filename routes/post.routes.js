const express = require('express');
const router = express.Router();

const {
  getAllPosts,
  getAllPostsFromUser,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  retweet,
  pinPost,
} = require('../controllers/post.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

router.use(authenticateUser);

router.route('/').get(getAllPosts).post(createPost);

router
  .route('/:id')
  .get(getPost)
  .patch(authenticateUser, updatePost)
  .delete(authenticateUser, deletePost);

router.route('/:id/like').patch(likePost);
router.route('/:id/retweet').post(retweet);
router.route('/:id/pinPost').patch(pinPost);

router.route('/user/:id').get(getAllPostsFromUser);

module.exports = router;
