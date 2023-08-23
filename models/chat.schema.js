const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({}, { timestamps: true });

// Model
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
