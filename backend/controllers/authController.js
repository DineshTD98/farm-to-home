const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { 
    sendWelcomeEmail, 
    sendOTPEmail 
} = require('../services/emailService');

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc  Register a new user
// @route POST /api/auth/signup
// @access Public
const signup = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, role, password, confirmPassword } = req.body;

        // Basic validation
        if (!firstName || !lastName || !phone || !email || !role || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length <= 8) {
            return res.status(400).json({ message: 'Password must be more than 8 characters (at least 9)' });
        }
        
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one capital letter' });
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one special character' });
        }

        // Check if user already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(409).json({ message: 'User with this phone number already exists' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Create user (password hashed via pre-save hook)
        const user = await User.create({ firstName, lastName, phone, email, role, password });

        // Send Welcome Email
        await sendWelcomeEmail(user);

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'Signup successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: 'Phone and password are required' });
        }

        // Find user
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ message: 'Invalid phone number or password' });
        }

        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid phone number or password' });
        }
        console.log(`[LOGIN DEBUG] Password matched successfully for user: "${phone}"`);

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc  Update user profile
// @route PUT /api/auth/profile/:id
// @access Private
const updateProfile = async (req, res) => {
    try {
        console.log("=== UPDATE PROFILE HIT ===");
        console.log("Body:", req.body);
        console.log("File:", req.file ? req.file.originalname : "No file");
        
        const { firstName, lastName, phone, email, address, pincode, latitude, longitude } = req.body;

        if (!firstName || !lastName || !phone || !email) {
            return res.status(400).json({ message: 'All mandatory fields are required' });
        }

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        const existingPhone = await User.findOne({ phone, _id: { $ne: req.params.id } });
        if (existingPhone) {
            return res.status(409).json({ message: 'Phone number already in use' });
        }

        const existingEmail = await User.findOne({ email, _id: { $ne: req.params.id } });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email address already in use' });
        }

        const updateData = { firstName, lastName, phone, email };
        
        if (address) updateData.address = address;
        if (pincode) updateData.pincode = pincode;
        if (latitude && longitude) {
            updateData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)] // [longitude, latitude]
            };
        }

        if (req.file) {
            updateData.avatar = `/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                address: user.address,
                pincode: user.pincode,
                location: user.location,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

// @desc  Delete user account
// @route DELETE /api/auth/profile/:id
// @access Private
const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error during account deletion' });
    }
};

// @desc  Forgot password (OTP based)
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save hashed OTP to DB
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpires = Date.now() + 600000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Send OTP Email
        await sendOTPEmail(user, otp);

        res.status(200).json({ message: 'A 6-digit verification code has been sent to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during forgot password' });
    }
};

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
// @access Public
const resetPassword = async (req, res) => {
    try {
        const { password, code } = req.body;
        const tokenSource = req.params.token !== 'otp' ? req.params.token : code;

        if (!tokenSource) {
            return res.status(400).json({ message: 'Verification code is required' });
        }

        const resetPasswordToken = crypto.createHash('sha256').update(tokenSource).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Set new password (pre-save hook will hash it)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Your password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

module.exports = { signup, login, updateProfile, deleteAccount, forgotPassword, resetPassword };
