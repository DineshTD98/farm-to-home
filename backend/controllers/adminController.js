const Order = require('../models/Order');
const User = require('../models/User');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('../services/oneSignalService');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        
        const payouts = await Payout.find({ status: 'Pending' });
        const pendingPayoutAmount = payouts.reduce((acc, p) => acc + p.amount, 0);

        res.json({
            totalOrders,
            totalFarmers,
            pendingPayoutAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyerId', 'firstName lastName email phone')
            .populate('items.product', 'name price')
            .populate('items.farmerId', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all farmers
// @route   GET /api/admin/farmers
// @access  Private (Admin)
const getAllFarmers = async (req, res) => {
    try {
        const farmers = await User.find({ role: 'farmer' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(farmers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all payouts
// @route   GET /api/admin/payouts
// @access  Private (Admin)
const getAllPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find()
            .populate('farmerId', 'firstName lastName phone')
            .populate('orderId', 'totalAmount paymentMethod status createdAt')
            .sort({ createdAt: -1 });
        res.json(payouts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark payout as paid
// @route   PUT /api/admin/payouts/:id/pay
// @access  Private (Admin)
const markPayoutPaid = async (req, res) => {
    try {
        const { transactionReference } = req.body;
        const payout = await Payout.findById(req.params.id);

        if (!payout) {
            return res.status(404).json({ message: 'Payout not found' });
        }

        payout.status = 'Paid';
        payout.paidAt = Date.now();
        if (transactionReference) {
            payout.transactionReference = transactionReference;
        }

        await payout.save();
        res.json(payout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify farmer bank details
// @route   PUT /api/admin/farmers/:id/verify-bank
// @access  Private (Admin)
const verifyBankDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'farmer') {
            return res.status(404).json({ message: 'Farmer not found' });
        }
        
        if (!user.bankDetails) {
            user.bankDetails = {};
        }
        user.bankDetails.verified = true;
        await user.save();
        
        res.json({ message: 'Bank details verified successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all buyers
// @route   GET /api/admin/buyers
// @access  Private (Admin)
const getAllBuyers = async (req, res) => {
    try {
        const buyers = await User.find({ role: 'buyer' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(buyers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user status (suspend/active)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        await user.save();

        res.json({ message: `User status updated to ${status}`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send notification to user
// @route   POST /api/admin/users/:id/notify
// @access  Private (Admin)
const sendUserNotification = async (req, res) => {
    try {
        const { message, type } = req.body;
        const notification = await Notification.create({
            recipient: req.params.id,
            message,
            type: type || 'Admin Message'
        });

        // Try push notification
        try {
            sendPushNotification([req.params.id], 'Message from Admin', message);
        } catch (err) {
            console.error('Push error', err);
        }

        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status (Admin Override)
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
const updateAdminOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAdminStats,
    getAllOrders,
    getAllFarmers,
    getAllBuyers,
    getAllPayouts,
    markPayoutPaid,
    verifyBankDetails,
    updateUserStatus,
    deleteUser,
    sendUserNotification,
    updateAdminOrderStatus
};
