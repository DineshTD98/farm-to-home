const mongoose = require('mongoose');

const farmPostSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            trim: true,
            maxlength: 2000,
        },
        image: {
            type: String,
            default: '',
        },
        likedBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: [],
        },
    },
    { timestamps: true }
);

farmPostSchema.index({ createdAt: -1 });
farmPostSchema.index({ farmerId: 1, createdAt: -1 });

module.exports = mongoose.model('FarmPost', farmPostSchema);
