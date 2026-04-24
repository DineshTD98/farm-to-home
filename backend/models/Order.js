const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                farmerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        deliveryAddress: {
            type: String,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'Card', 'UPI', 'RAZORPAY'],
            default: 'COD',
        },
        paymentDetails: {
            type: Object, // Stores Razorpay transaction IDs securely
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
