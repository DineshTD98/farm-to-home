const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
    },
    { timestamps: true }
);

// Unique index to prevent duplicate subscriptions
subscriptionSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
