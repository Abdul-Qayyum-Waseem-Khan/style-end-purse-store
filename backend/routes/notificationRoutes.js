const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} = require('../controllers/notificationController');

router.use(protect); // All routes are protected

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead); // Put this before /:id/read to avoid conflicting
router.delete('/clear-all', clearAllNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
