const Product = require('../models/Product');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('../services/oneSignalService');



// Helper to simulate SMS
const sendSimulatedSMS = (phone, message) => {
    console.log('-----------------------------------');
    console.log(`📱 SMS SENT TO ${phone}:`);
    console.log(`"${message}"`);
    console.log('-----------------------------------');
};

// @desc  Get products for a specific farmer
// @route GET /api/products/farmer/:farmerId
// @access Private (Farmer only)
const getFarmerProducts = async (req, res) => {
    try {
        const products = await Product.find({ farmerId: req.params.farmerId }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Get farmer products error:', error);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
};

// @desc  Add a new product
// @route POST /api/products
// @access Private (Farmer)
const addProduct = async (req, res) => {
    try {
        const { name, category, quantity, pricePerUnit, unit, farmerId, description } = req.body;

        // image comes from multer req.file
        let image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop';
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        const product = await Product.create({
            name,
            category,
            quantity,
            pricePerUnit,
            unit,
            farmerId,
            image,
            description
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error while adding product' });
    }
};

// @desc  Get all products
// @route GET /api/products
// @access Public (For buyers)
const getAllProducts = async (req, res) => {
    try {
        const { lat, lng, radius, category } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const maxDistance = parseFloat(radius || 50) * 1000; // km to meters

            // Find farmers within radius
            const farmersInRange = await User.find({
                role: 'farmer',
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                        $maxDistance: maxDistance
                    }
                }
            }).select('_id');

            const farmerIds = farmersInRange.map(f => f._id);
            query.farmerId = { $in: farmerIds };
        }

        const products = await Product.find(query)
            .populate('farmerId', 'firstName lastName location address avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
};

// @desc  Update a product
// @route PUT /api/products/:id
// @access Private (Farmer)
const updateProduct = async (req, res) => {
    try {
        const { name, category, quantity, pricePerUnit, unit, description } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const oldQty = product.quantity || 0;

        if (name) product.name = name;
        if (category) product.category = category;
        if (quantity !== undefined) product.quantity = Number(quantity);
        if (pricePerUnit !== undefined) product.pricePerUnit = Number(pricePerUnit);
        if (unit) product.unit = unit;
        if (description) product.description = description;

        if (req.file) {
            product.image = `/uploads/${req.file.filename}`;
        }

        const updatedProduct = await product.save();
        const newQty = updatedProduct.quantity;

        // Check if stock became available (from 0 to positive)
        if (oldQty === 0 && newQty > 0) {
            // Find the farmer explicitly
            const farmer = await User.findById(product.farmerId);
            const farmerName = (farmer && (farmer.firstName || farmer.lastName))
                ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim()
                : 'a local farmer';

            console.log(`[Notification Engine] stock updated for ${updatedProduct.name}. Farmer: ${farmerName}`);

            const subscriptions = await Subscription.find({ productId: updatedProduct._id }).populate('userId');
            
            for (const sub of subscriptions) {
                if (sub.userId) {
                    const message = `🌟 Fresh restock! ${updatedProduct.name} from Farmer ${farmerName} is now available at Farm2Home! 🚜`;
                    
                    // Create in-app notification
                    await Notification.create({
                        recipient: sub.userId._id,
                        message,
                        type: 'Stock Update'
                    });

                    // Simulate SMS
                    if (sub.userId.phone) {
                        sendSimulatedSMS(sub.userId.phone, message);
                    }

                    // Send push notification via OneSignal
                    sendPushNotification(
                        [sub.userId._id.toString()],
                        'Stock Update 🍎',
                        message,
                        { productId: updatedProduct._id }
                    );
                }
            }
            // Once notified, we delete the subscriptions for this product
            await Subscription.deleteMany({ productId: updatedProduct._id });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error while updating product' });
    }
};

// @desc  Delete a product
// @route DELETE /api/products/:id
// @access Private (Farmer only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
};

module.exports = { getAllProducts, getFarmerProducts, addProduct, updateProduct, deleteProduct };
