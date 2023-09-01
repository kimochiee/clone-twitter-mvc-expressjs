const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userTo: { type: mongoose.Types.ObjectId, ref: 'User' },
    userFrom: { type: mongoose.Types.ObjectId, ref: 'User' },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: mongoose.Types.ObjectId,
  },
  { timestamps: true }
);

// Create notification
notificationSchema.statics.insertNotification = async (
  userTo,
  userFrom,
  notificationType,
  entityId
) => {
  const data = { userTo, userFrom, notificationType, entityId };

  await Notification.deleteOne(data);
  return await Notification.create(data);
};

// Model
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
