const express = require('express');
const router = express.Router();
const { getAllProducts, getFarmerProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// GET /api/products - List all products (Public)
router.get('/', getAllProducts);

// Secure remaining routes
router.use(protect);

// GET /api/products/farmer/:farmerId - List products by farmer
router.get('/farmer/:farmerId', getFarmerProducts);

// POST /api/products - Add product (Farmer)
router.post('/', upload.single('image'), addProduct);

// PUT /api/products/:id - Update product (Farmer)
router.put('/:id', upload.single('image'), updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

module.exports = router;
