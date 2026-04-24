const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// GET /api/notifications/:userId - Get all notifications for user
router.get('/:userId', getNotifications);

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', markAsRead);

module.exports = router;
