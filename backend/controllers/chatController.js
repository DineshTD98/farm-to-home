const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const getOrCreateConversation = async (req, res) => {
    try {
        const { buyerId, farmerId } = req.body;
        if (!buyerId || !farmerId) {
            return res.status(400).json({ message: 'buyerId and farmerId are required' });
        }
        if (String(buyerId) === String(farmerId)) {
            return res.status(400).json({ message: 'Invalid conversation' });
        }

        const buyer = await User.findById(buyerId);
        const farmer = await User.findById(farmerId);
        if (!buyer || buyer.role !== 'buyer') {
            return res.status(403).json({ message: 'Invalid buyer' });
        }
        if (!farmer || farmer.role !== 'farmer') {
            return res.status(403).json({ message: 'Invalid farmer' });
        }

        let conversation = await Conversation.findOne({ buyerId, farmerId });
        if (!conversation) {
            conversation = await Conversation.create({ buyerId, farmerId });
        }

        const populated = await Conversation.findById(conversation._id)
            .populate('buyerId', 'firstName lastName')
            .populate('farmerId', 'firstName lastName');
        res.status(200).json(populated);
    } catch (error) {
        if (error.code === 11000) {
            const existing = await Conversation.findOne({
                buyerId: req.body.buyerId,
                farmerId: req.body.farmerId,
            })
                .populate('buyerId', 'firstName lastName')
                .populate('farmerId', 'firstName lastName');
            return res.status(200).json(existing);
        }
        console.error('getOrCreateConversation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const listConversations = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Valid userId is required' });
        }

        const conversations = await Conversation.find({
            $or: [{ buyerId: userId }, { farmerId: userId }],
        })
            .sort({ updatedAt: -1 })
            .populate('buyerId', 'firstName lastName')
            .populate('farmerId', 'firstName lastName');

        // Add unread count to each conversation
        const enriched = await Promise.all(
            conversations.map(async (c) => {
                const count = await ChatMessage.countDocuments({
                    conversationId: c._id,
                    senderId: { $ne: userId },
                    isRead: false,
                });
                return { ...c.toObject(), unreadCount: count };
            })
        );

        res.status(200).json(enriched);
    } catch (error) {
        console.error('listConversations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMessages = async (req, res) => {
    try {
        const { userId } = req.query;
        const { id: conversationId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Valid userId is required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const uid = String(userId);
        if (String(conversation.buyerId) !== uid && String(conversation.farmerId) !== uid) {
            return res.status(403).json({ message: 'Not part of this conversation' });
        }

        const messages = await ChatMessage.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(500)
            .populate('senderId', 'firstName lastName role');

        // Mark messages as read where current user is NOT the sender
        await ChatMessage.updateMany(
            { conversationId, senderId: { $ne: userId }, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('getMessages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { userId, text } = req.body;
        const { id: conversationId } = req.params;

        if (!userId || !text?.trim()) {
            return res.status(400).json({ message: 'userId and text are required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const uid = String(userId);
        if (String(conversation.buyerId) !== uid && String(conversation.farmerId) !== uid) {
            return res.status(403).json({ message: 'Not part of this conversation' });
        }

        const message = await ChatMessage.create({
            conversationId,
            senderId: userId,
            text: text.trim(),
        });

        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        const populated = await ChatMessage.findById(message._id).populate(
            'senderId',
            'firstName lastName role'
        );
        res.status(201).json(populated);
    } catch (error) {
        console.error('sendMessage error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        // Find all conversations where user is buyer or farmer
        const conversations = await Conversation.find({
            $or: [{ buyerId: userId }, { farmerId: userId }]
        }).select('_id');

        const convIds = conversations.map(c => c._id);

        // Count messages in those conversations where sender is NOT this user and isRead is false
        const count = await ChatMessage.countDocuments({
            conversationId: { $in: convIds },
            senderId: { $ne: userId },
            isRead: false
        });

        res.status(200).json({ count });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getOrCreateConversation,
    listConversations,
    getMessages,
    sendMessage,
    getUnreadCount,
};
