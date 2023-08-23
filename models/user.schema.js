const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    photo: {
      type: String,
      default: '/images/default.jpg',
    },
    cover: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hashing password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = bcrypt.hashSync(this.password, 10);

  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Model
const User = mongoose.model('User', userSchema);

module.exports = User;
