const express = require('express');
const router = express.Router();
const { 
    getAdminStats, 
    getAllOrders, 
    getAllFarmers, 
    getAllBuyers,
    getAllPayouts, 
    markPayoutPaid,
    verifyBankDetails,
    updateUserStatus,
    deleteUser,
    sendUserNotification,
    updateAdminOrderStatus
} = require('../controllers/adminController');


const { protect, admin } = require('../middleware/authMiddleware');

// Secure all routes with both auth (protect) and admin role check
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);
router.get('/farmers', getAllFarmers);
router.get('/buyers', getAllBuyers);
router.get('/payouts', getAllPayouts);
router.put('/payouts/:id/pay', markPayoutPaid);
router.put('/orders/:id/status', updateAdminOrderStatus);
router.put('/farmers/:id/verify-bank', verifyBankDetails);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/notify', sendUserNotification);

module.exports = router;
