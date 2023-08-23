const jwt = require("jsonwebtoken");

const createRefreshToken = (userID) => {
  return jwt.sign({ _id: userID }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_JWT_LIFETIME,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { createRefreshToken, verifyToken };
