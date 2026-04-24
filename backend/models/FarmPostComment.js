const mongoose = require('mongoose');

const farmPostCommentSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FarmPost',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

farmPostCommentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model('FarmPostComment', farmPostCommentSchema);
