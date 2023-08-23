const Post = require('../models/post.schema');
const User = require('../models/user.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');

const getAllPosts = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };

  //Select post from user's followers
  const followersList = req.user.following;
  followersList.push(req.user._id);

  if (req.query.postedBy) {
    queryObj.postedBy = { $eq: queryObj.postedBy, $in: followersList };
  } else {
    queryObj.postedBy = { $in: followersList };
  }

  //Is reply?
  if (queryObj.isReply !== undefined) {
    const isReply = queryObj.isReply == 'true';
    queryObj.replyTo = { $exists: isReply };
    delete queryObj.isReply;
  }

  //Find content
  if (queryObj.content != undefined) {
    queryObj.content = { $regex: queryObj.content, $options: 'i' };
  }

  //Filtering
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let query = Post.find(JSON.parse(queryStr));

  //Sorting
  if (req.query.sort) {
    const sortby = req.query.sort.split(',').join(' ');
    query = query.sort(sortby);
  } else {
    query = query.sort('-createdAt');
  }

  //Limiting fields
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  //Pagination
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  //Execute

  const posts = await query;

  res.status(200).json({
    status: 'success',
    msg: 'Get all posts successfully',
    posts,
    user: req.user,
  });
});

const getAllPostsFromUser = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ postedBy: req.params.id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: 'success',
    msg: 'Get all posts successfully',
    posts,
    user: req.user,
  });
});

const getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new CustomError('post not found', 404);
  }

  const replies = await Post.find({ replyTo: req.params.id });

  if (!replies) {
    throw new CustomError('replies not found', 404);
  }

  res.status(200).json({
    status: 'success',
    msg: 'Get post successfully',
    post,
    user: req.user,
    replies,
  });
});

const createPost = catchAsync(async (req, res, next) => {
  const { content, replyTo } = req.body;

  if (!content) {
    throw new CustomError('No content sent with request', 400);
  }

  const post = await (
    await Post.create({
      content,
      postedBy: req.user._id,
      replyTo: replyTo ? replyTo : null,
    })
  ).populate(['postedBy', 'replyTo']);

  res.status(200).json({
    status: 'success',
    msg: 'Create post successfully',
    post,
    user: req.user,
  });
});

const updatePost = catchAsync(async (req, res, next) => {
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res
    .status(200)
    .json({ status: 'success', msg: 'Update post successfully', updatedPost });
});

const pinPost = catchAsync(async (req, res, next) => {
  if (!req?.body?.pinned) {
    const post = await Post.findById(req.params.id);
    const option = post.pinned ? false : true;
    req.body.pinned = option;
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      pinned: req.body.pinned,
    },
    { new: true }
  );

  res
    .status(200)
    .json({ status: 'success', msg: 'Update post successfully', updatedPost });
});

const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new CustomError('Could not delete this post', 400);
  }

  res.status(202).json({ status: 'success', msg: 'Delete post successfully' });
});

const likePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const isLiked = req.user.likes && req.user.likes.includes(postId);
  const option = isLiked ? '$pull' : '$addToSet';

  const user = await User.findByIdAndUpdate(
    userId,
    { [option]: { likes: postId } },
    { new: true }
  );
  req.user = user;
  res.locals.user = user;

  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true }
  );

  res
    .status(200)
    .json({ status: 'success', msg: 'Like post successfully', post, user });
});

const retweet = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  });

  const option = deletedPost ? '$pull' : '$addToSet';

  if (deletedPost) {
    const user = await User.findByIdAndUpdate(
      userId,
      { [option]: { retweets: deletedPost._id } },
      { new: true }
    );
    req.user = user;
    res.locals.user = user;

    const post = await Post.findByIdAndUpdate(
      postId,
      { [option]: { retweetUsers: userId } },
      { new: true }
    );

    res
      .status(200)
      .json({ status: 'success', msg: 'unretweet successfully!', post, user });
  } else {
    const repost = await Post.create({ postedBy: userId, retweetData: postId });

    const user = await User.findByIdAndUpdate(
      userId,
      { [option]: { retweets: repost._id } },
      { new: true }
    );
    req.user = user;
    res.locals.user = user;

    const post = await Post.findByIdAndUpdate(
      postId,
      { [option]: { retweetUsers: userId } },
      { new: true }
    );

    res
      .status(200)
      .json({ status: 'success', msg: 'retweet successfully!', post, user });
  }
});

module.exports = {
  getAllPosts,
  getAllPostsFromUser,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  retweet,
  pinPost,
};
