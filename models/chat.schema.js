const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    latestMessage: { type: mongoose.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

// Model
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
