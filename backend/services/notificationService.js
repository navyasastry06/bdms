const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (recipientId, title, message, type = 'info', portalRole = null) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      portalRole
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

const notifyAdmins = async (title, message, type = 'info') => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      title,
      message,
      type
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error notifying admins:', error.message);
  }
};

module.exports = {
  createNotification,
  notifyAdmins
};
