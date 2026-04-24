const express = require('express');
const router = express.Router();
const {
    getOrCreateConversation,
    listConversations,
    getMessages,
    sendMessage,
    getUnreadCount,
} = require('../controllers/chatController');

router.post('/conversations', getOrCreateConversation);
router.get('/conversations', listConversations);
router.get('/unread-count', getUnreadCount);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

module.exports = router;
