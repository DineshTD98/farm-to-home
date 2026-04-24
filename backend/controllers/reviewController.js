const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Create a new review or update an existing one
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
    try {
        const { farmer, buyer, rating, comment } = req.body;

        if (!farmer || !buyer || !rating) {
            return res.status(400).json({ message: 'Farmer, buyer, and rating are required' });
        }

        const farmerUser = await User.findById(farmer);
        if (!farmerUser || farmerUser.role !== 'farmer') {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const alreadyReviewed = await Review.findOne({ farmer, buyer });
        if (alreadyReviewed) {
            // Update existing review
            alreadyReviewed.rating = rating;
            alreadyReviewed.comment = comment || alreadyReviewed.comment;
            await alreadyReviewed.save();
            return res.status(200).json(alreadyReviewed);
        }

        const review = await Review.create({
            farmer,
            buyer,
            rating,
            comment,
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
};

// @desc    Get all reviews for a specific farmer
// @route   GET /api/reviews/farmer/:farmerId
// @access  Public
const getFarmerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ farmer: req.params.farmerId })
            .populate('buyer', 'firstName lastName avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Get Farmer Reviews Error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

// @desc    Get all reviews written by a specific buyer
// @route   GET /api/reviews/buyer/:buyerId
// @access  Public
const getBuyerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ buyer: req.params.buyerId })
            .populate('farmer', 'firstName lastName avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Get Buyer Reviews Error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

module.exports = { createReview, getFarmerReviews, getBuyerReviews };
