const express = require('express');
const router = express.Router();
const { signup, login, updateProfile, deleteAccount, forgotPassword, resetPassword, getUserProfile } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);
router.post('/reset-password/:token', resetPassword);

// GET /api/auth/profile/:id
router.get('/profile/:id', getUserProfile);

// PUT /api/auth/profile/:id
router.put('/profile/:id', upload.single('avatar'), updateProfile);

// DELETE /api/auth/profile/:id
router.delete('/profile/:id', deleteAccount);

module.exports = router;
