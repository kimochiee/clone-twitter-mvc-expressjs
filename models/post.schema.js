const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    retweetUsers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    retweetData: { type: mongoose.Types.ObjectId, ref: 'Post' },
    replyTo: { type: mongoose.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
);

// Populate user
postSchema.pre(/^find/, function (next) {
  this.populate('postedBy').populate('retweetData').populate('replyTo');

  next();
});

// Model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
