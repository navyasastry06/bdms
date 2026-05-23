const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  clearAll
} = require('../controllers/notificationController');

/* All notification routes require authentication */
router.use(authMiddleware);

router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/clear', clearAll);

module.exports = router;
