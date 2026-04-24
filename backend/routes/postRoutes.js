const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
    createPost,
    getFeed,
    getFarmerPosts,
    deletePost,
    toggleLike,
    getComments,
    addComment,
} = require('../controllers/postController');

router.get('/feed', getFeed);
router.get('/farmer/:farmerId', getFarmerPosts);
router.post('/', upload.single('image'), createPost);
router.post('/:id/like', toggleLike);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);
router.delete('/:id', deletePost);

module.exports = router;
