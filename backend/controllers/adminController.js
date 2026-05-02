const Order = require('../models/Order');
const User = require('../models/User');
const Payout = require('../models/Payout');

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

module.exports = {
    getAdminStats,
    getAllOrders,
    getAllFarmers,
    getAllPayouts,
    markPayoutPaid
};
