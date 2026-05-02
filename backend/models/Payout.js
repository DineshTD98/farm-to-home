const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending',
        },
        paidAt: {
            type: Date,
        },
        transactionReference: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);
