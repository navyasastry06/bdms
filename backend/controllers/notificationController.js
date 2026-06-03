const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const { role } = req.query; // optional: 'donor' | 'patient' | 'hospital' | 'admin'
    const query = { recipient: req.user.id };

    // If a role is provided, show notifications matching that portal role
    // OR notifications with no portalRole (shared/generic)
    if (role) {
      query.$or = [{ portalRole: role }, { portalRole: null }];
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const { role } = req.query;
    const query = { recipient: req.user.id, read: false };
    if (role) {
      query.$or = [{ portalRole: role }, { portalRole: null }];
    }
    await Notification.updateMany(query, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};

const clearAll = async (req, res) => {
  try {
    const { role } = req.query;
    const query = { recipient: req.user.id };
    if (role) {
      query.$or = [{ portalRole: role }, { portalRole: null }];
    }
    await Notification.deleteMany(query);
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear notifications.' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  clearAll
};

