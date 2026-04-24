const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative']
        },
        pricePerUnit: {
            type: Number,
            required: [true, 'Price per unit is required'],
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            enum: ['kg', 'g', 'bunch', 'piece', 'litre', 'dozen'],
            default: 'kg'
        },
        image: {
            type: String,
            default: 'https://via.placeholder.com/150', // Placeholder image URL
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            default: 'Vegetables',
        },
        description: {
            type: String,
            trim: true,
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
