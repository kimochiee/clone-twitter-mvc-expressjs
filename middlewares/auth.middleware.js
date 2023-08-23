const User = require('../models/user.schema');
const CustomError = require('../utils/customError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/jwt');

const authenticateUser = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    throw new CustomError('your session has expired. please log in', 401);
  }

  const payload = verifyToken(token);

  if (!payload) {
    throw new CustomError('Invalid token', 401);
  }

  const currentUser = await User.findById(payload._id);

  if (!currentUser) {
    throw new CustomError('User not found', 404);
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

const authorizeUser = (...roles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!roles.includes(role)) {
      throw new CustomError(
        'You do not have permission to access this route',
        403
      );
    }

    next();
  };
};

const isLoggedIn = async (req, res, next) => {
  if (req.cookies.refreshToken) {
    try {
      const payload = verifyToken(req.cookies.refreshToken);

      const currentUser = await User.findById(payload._id);

      if (!currentUser) {
        return next();
      }

      req.user = currentUser;
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  } else {
    return res.redirect('/login');
  }
};

module.exports = { authenticateUser, authorizeUser, isLoggedIn };
