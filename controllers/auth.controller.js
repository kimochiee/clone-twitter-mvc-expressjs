const User = require('../models/user.schema');
const catchAsync = require('../utils/catchAsync');
const CustomError = require('../utils/customError');
const { createRefreshToken } = require('../utils/jwt');

const register = catchAsync(async (req, res, next) => {
  const { firstname, lastname, username, email, password } = req.body;

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (user) {
    throw new CustomError('Username or Email already exists!', 403);
  }

  const newUser = await User.create({
    firstname,
    lastname,
    username,
    email,
    password,
  });

  res
    .status(201)
    .json({ status: 'success', msg: 'please login', user: newUser });
});

const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new CustomError('Incorrect username or password', 401);
  }

  const refreshToken = createRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: 'success',
      msg: 'login successfully',
    });
});

const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new CustomError('you already logout', 401);
  }

  const user = await User.findOne({ refreshToken });
  user.refreshToken = undefined;
  await user.save();

  res
    .clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({ status: 'success', msg: 'logout successfully' });
});

module.exports = { register, login, logout };
