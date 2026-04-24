const Subscription = require('../models/Subscription');

// @desc  Subscribe to product stock notifications
// @route POST /api/subscriptions
// @access Private
const subscribe = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        if (!userId || !productId) {
            return res.status(400).json({ message: 'User ID and Product ID are required' });
        }

        const existing = await Subscription.findOne({ userId, productId });
        if (existing) {
            return res.status(400).json({ message: 'Already subscribed to this product' });
        }

        const subscription = await Subscription.create({ userId, productId });
        res.status(201).json(subscription);
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ message: 'Server error while subscribing' });
    }
};

// @desc  Unsubscribe from product notifications
// @route DELETE /api/subscriptions/:userId/:productId
// @access Private
const unsubscribe = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        await Subscription.findOneAndDelete({ userId, productId });
        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ message: 'Server error while unsubscribing' });
    }
};

// @desc  Check if user is subscribed to a product
// @route GET /api/subscriptions/check/:userId/:productId
// @access Private
const checkSubscription = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const exists = await Subscription.findOne({ userId, productId });
        res.status(200).json({ subscribed: !!exists });
    } catch (error) {
        res.status(500).json({ message: 'Error checking subscription' });
    }
};

module.exports = { subscribe, unsubscribe, checkSubscription };
