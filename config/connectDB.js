const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const connectDB = (uri) => {
  try {
    return mongoose.connect(uri).catch(console.log("connect DB success!"));
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = connectDB;
