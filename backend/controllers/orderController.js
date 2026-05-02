const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Payout = require('../models/Payout');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendPushNotification } = require('../services/oneSignalService');
const { 
    sendOrderConfirmationEmail, 
    sendNewOrderAlertEmail 
} = require('../services/emailService');

// Helper to simulate SMS
const sendSimulatedSMS = (phone, message) => {
    console.log('-----------------------------------');
    console.log(`📱 SMS SENT TO ${phone}:`);
    console.log(`"${message}"`);
    console.log('-----------------------------------');
};

// @desc  Create a new order
// @route POST /api/orders
// @access Private
const createOrder = async (req, res) => {
    console.log('DEBUG: V2 Order Controller Active - Numeric Quantity Logic');
    try {
        const { items, totalAmount, deliveryAddress, paymentMethod, buyerId } = req.body;

        if (!items || items.length === 0 || !totalAmount || !deliveryAddress || !buyerId) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Process inventory subtraction
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                const newQty = Math.max(0, Number(product.quantity) - Number(item.quantity));
                await Product.updateOne({ _id: item.product }, { $set: { quantity: newQty } });
            }
        }

        const order = await Order.create({
            buyerId,
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod,
        });

        // Calculate and create Payouts for each farmer
        const farmerTotals = {};
        for (const item of items) {
            const fId = item.farmerId?.toString();
            if (fId) {
                if (!farmerTotals[fId]) {
                    farmerTotals[fId] = 0;
                }
                farmerTotals[fId] += (item.price * item.quantity);
            }
        }

        for (const fId of Object.keys(farmerTotals)) {
            await Payout.create({
                farmerId: fId,
                orderId: order._id,
                amount: farmerTotals[fId],
                status: 'Pending'
            });
        }

        // Notify Buyer & Farmers
        const buyer = await User.findById(buyerId);
        
        if (buyer) {
            // Internal Notification
            await Notification.create({
                recipient: buyerId,
                message: `Order for Rs ${totalAmount} has been placed successfully!`,
                type: 'Order Placed'
            });

            // Email Confirmation
            await sendOrderConfirmationEmail(buyer, order);

            // Push Notification
            sendPushNotification(
                [buyerId.toString()],
                'Order Confirmed! 🌾',
                `Hi ${buyer.firstName}, your Farm2Home order for Rs ${totalAmount} is confirmed!`,
                { orderId: order._id }
            );

            // Simulated SMS
            sendSimulatedSMS(buyer.phone, `Hi ${buyer.firstName}, your Farm2Home order for Rs ${totalAmount} is confirmed! 🌾`);
        }

        // Notify Farmers
        const farmerIds = [...new Set(items.map(item => item.farmerId?.toString()).filter(Boolean))];
        const buyerName = buyer ? `${buyer.firstName} ${buyer.lastName}` : 'A customer';

        for (const fId of farmerIds) {
            const farmer = await User.findById(fId);
            if (farmer) {
                // Internal Notification
                await Notification.create({
                    recipient: fId,
                    message: `New order received from ${buyerName} for Rs ${totalAmount}! 🚜`,
                    type: 'New Order'
                });

                // Email Alert
                await sendNewOrderAlertEmail(farmer, order);

                // Push Notification
                sendPushNotification(
                    [fId],
                    'New Order Received! 🚜',
                    `Hi, you have a new order from ${buyerName} for Rs ${totalAmount}. Check your portal for details!`,
                    { orderId: order._id }
                );
            }
        }

        res.status(201).json({
            message: 'Order placed successfully!',
            order,
        });
    } catch (error) {
        console.error('CRITICAL: Create order error:', error.message);
        res.status(500).json({ message: 'Server error while placing order' });
    }
};

// @desc  Update order status
// @route PUT /api/orders/:id/status
// @access Private
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('buyerId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // Notify Buyer
        if (oldStatus !== status) {
            await Notification.create({
                recipient: order.buyerId._id,
                message: `Your order status has been updated to: ${status}`,
                type: 'Order Update'
            });

            // Simulate SMS for "Delivered"
            if (status === 'Delivered') {
                sendSimulatedSMS(order.buyerId.phone, `Hi ${order.buyerId.firstName}, your farm produce has been DELIVERED! Enjoy the fresh harvest! 🥕🥦`);
            } else if (status === 'Out for Delivery') {
                sendSimulatedSMS(order.buyerId.phone, `Your order is OUT FOR DELIVERY! 🚚 See you soon!`);
            }

            // Send push notification via OneSignal
            sendPushNotification(
                [order.buyerId._id.toString()],
                'Order Update 🚜',
                `Your order status has been updated to: ${status}`,
                { orderId: order._id }
            );
        }

        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error while updating status' });
    }
};

// @desc  Get orders for a buyer
// @route GET /api/orders/buyer/:buyerId
// @access Private
const getBuyerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.params.buyerId })
            .populate('items.product', 'name image')
            .populate('items.farmerId', 'firstName lastName avatar phone')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get buyer orders error:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

// @desc  Get orders for a farmer (where farmer's items are present)
// @route GET /api/orders/farmer/:farmerId
// @access Private
const getFarmerOrders = async (req, res) => {
    try {
        // Find orders where at least one item has the farmer's ID
        const orders = await Order.find({ 'items.farmerId': req.params.farmerId })
            .populate('buyerId', 'firstName lastName phone')
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });

        // Filter items to only show the farmer's items in each order if needed, 
        // or return the full order if the farmer is involved.
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get farmer orders error:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

// @desc  Create a Razorpay order before frontend checkout
// @route POST /api/orders/razorpay
// @access Private
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };

        const razorpayOrder = await instance.orders.create(options);
        res.status(200).json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
        });
    } catch (error) {
        console.error('Razorpay create order error:', error);
        res.status(500).json({ message: 'Failed to initialize payment', error: error.message });
    }
};

// @desc  Verify Razorpay payment signature
// @route POST /api/orders/razorpay/verify
// @access Private
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Signature is valid, create actual order in DB
            req.body = orderDetails;
            req.body.paymentMethod = 'RAZORPAY';
            req.body.paymentDetails = {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            };
            
            // Delegate back to the reliable createOrder function!
            return await createOrder(req, res);
        } else {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Razorpay verify error:', error);
        res.status(500).json({ message: 'Failed to verify payment', error: error.message });
    }
};

module.exports = { createOrder, getBuyerOrders, getFarmerOrders, updateOrderStatus, createRazorpayOrder, verifyRazorpayPayment };
