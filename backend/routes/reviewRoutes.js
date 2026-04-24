const express = require('express');
const router = express.Router();
const { createReview, getFarmerReviews, getBuyerReviews } = require('../controllers/reviewController');

// POST /api/reviews
router.post('/', createReview);

// GET /api/reviews/farmer/:farmerId
router.get('/farmer/:farmerId', getFarmerReviews);

// GET /api/reviews/buyer/:buyerId
router.get('/buyer/:buyerId', getBuyerReviews);

module.exports = router;
