const express = require('express');
const router = express.Router();
const { createOrder, getBuyerOrders, getFarmerOrders, updateOrderStatus, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/orderController');

// POST /api/orders - Create order
router.post('/', createOrder);

// POST /api/orders/razorpay - Create Razorpay order
router.post('/razorpay', createRazorpayOrder);

// POST /api/orders/razorpay/verify - Verify Razorpay payment
router.post('/razorpay/verify', verifyRazorpayPayment);

// GET /api/orders/buyer/:buyerId - Get buyer's orders
router.get('/buyer/:buyerId', getBuyerOrders);

// GET /api/orders/farmer/:farmerId - Get orders for a farmer
router.get('/farmer/:farmerId', getFarmerOrders);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

module.exports = router;
