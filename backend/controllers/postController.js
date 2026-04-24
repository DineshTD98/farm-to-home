const FarmPost = require('../models/FarmPost');
const FarmPostComment = require('../models/FarmPostComment');
const User = require('../models/User');

async function commentCountsForPosts(postIds) {
    if (!postIds.length) return {};
    const rows = await FarmPostComment.aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: '$postId', n: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
}

function formatPostDoc(post, viewerId, commentCount = 0) {
    const o = post.toObject ? post.toObject() : { ...post };
    const likedBy = o.likedBy || [];
    const likeCount = likedBy.length;
    const liked = Boolean(viewerId && likedBy.some((id) => String(id) === String(viewerId)));
    delete o.likedBy;
    return {
        ...o,
        likeCount,
        liked,
        commentCount,
    };
}

async function attachCommentCountsAndFormat(posts, viewerId) {
    const ids = posts.map((p) => p._id);
    const countMap = await commentCountsForPosts(ids);
    return posts.map((p) =>
        formatPostDoc(p, viewerId, countMap[String(p._id)] || 0)
    );
}

const createPost = async (req, res) => {
    try {
        const { farmerId, content } = req.body;
        if (!farmerId || !content?.trim()) {
            return res.status(400).json({ message: 'farmerId and content are required' });
        }

        const farmer = await User.findById(farmerId);
        if (!farmer || farmer.role !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can publish farm updates' });
        }

        let image = '';
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        const post = await FarmPost.create({
            farmerId,
            content: content.trim(),
            image,
            likedBy: [],
        });

        const populated = await FarmPost.findById(post._id).populate(
            'farmerId',
            'firstName lastName avatar role'
        );
        const [formatted] = await attachCommentCountsAndFormat([populated], null);
        res.status(201).json(formatted);
    } catch (error) {
        console.error('createPost error:', error);
        res.status(500).json({ message: 'Server error while creating post' });
    }
};

const getFeed = async (req, res) => {
    try {
        const viewerId = req.query.userId || null;
        const posts = await FarmPost.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('farmerId', 'firstName lastName avatar role');
        const out = await attachCommentCountsAndFormat(posts, viewerId);
        res.status(200).json(out);
    } catch (error) {
        console.error('getFeed error:', error);
        res.status(500).json({ message: 'Server error while loading feed' });
    }
};

const getFarmerPosts = async (req, res) => {
    try {
        const viewerId = req.query.userId || null;
        const farmerParam = req.params.farmerId;
        const posts = await FarmPost.find({ farmerId: farmerParam })
            .sort({ createdAt: -1 })
            .populate('farmerId', 'firstName lastName avatar role');
        let out = await attachCommentCountsAndFormat(posts, viewerId);

        const viewerIsOwner =
            viewerId && String(viewerId) === String(farmerParam);
        if (viewerIsOwner && out.length) {
            const allLikerIds = [
                ...new Set(
                    posts.flatMap((p) =>
                        (p.likedBy || []).map((id) => String(id))
                    )
                ),
            ];
            let nameById = {};
            if (allLikerIds.length) {
                const likers = await User.find({
                    _id: { $in: allLikerIds },
                }).select('firstName lastName');
                nameById = Object.fromEntries(
                    likers.map((u) => [
                        String(u._id),
                        `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                    ])
                );
            }
            out = out.map((fp, i) => {
                const raw = posts[i];
                const names = (raw.likedBy || [])
                    .map((id) => nameById[String(id)])
                    .filter(Boolean);
                return { ...fp, likerNames: names };
            });
        }

        res.status(200).json(out);
    } catch (error) {
        console.error('getFarmerPosts error:', error);
        res.status(500).json({ message: 'Server error while loading posts' });
    }
};

const deletePost = async (req, res) => {
    try {
        const { farmerId } = req.body;
        const post = await FarmPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (String(post.farmerId) !== String(farmerId)) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }
        await FarmPostComment.deleteMany({ postId: post._id });
        await FarmPost.deleteOne({ _id: post._id });
        res.status(200).json({ message: 'Post removed' });
    } catch (error) {
        console.error('deletePost error:', error);
        res.status(500).json({ message: 'Server error while deleting post' });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = await FarmPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (!Array.isArray(post.likedBy)) {
            post.likedBy = [];
        }

        const uid = String(userId);
        const idx = post.likedBy.map((id) => String(id)).indexOf(uid);
        if (idx >= 0) {
            post.likedBy.splice(idx, 1);
        } else {
            post.likedBy.push(userId);
        }
        post.markModified('likedBy');
        await post.save();

        const populated = await FarmPost.findById(post._id).populate(
            'farmerId',
            'firstName lastName avatar role'
        );
        const countMap = await commentCountsForPosts([post._id]);
        const commentCount = countMap[String(post._id)] || 0;
        const formatted = formatPostDoc(populated, userId, commentCount);
        res.status(200).json(formatted);
    } catch (error) {
        console.error('toggleLike error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getComments = async (req, res) => {
    try {
        const comments = await FarmPostComment.find({ postId: req.params.id })
            .sort({ createdAt: 1 })
            .limit(100)
            .populate('userId', 'firstName lastName role');
        res.status(200).json(comments);
    } catch (error) {
        console.error('getComments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addComment = async (req, res) => {
    try {
        const { userId, text } = req.body;
        if (!userId || !text?.trim()) {
            return res.status(400).json({ message: 'userId and text are required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = await FarmPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await FarmPostComment.create({
            postId: post._id,
            userId,
            text: text.trim(),
        });
        const populated = await FarmPostComment.findById(comment._id).populate(
            'userId',
            'firstName lastName role'
        );
        res.status(201).json(populated);
    } catch (error) {
        console.error('addComment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPost,
    getFeed,
    getFarmerPosts,
    deletePost,
    toggleLike,
    getComments,
    addComment,
};
