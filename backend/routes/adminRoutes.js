const express = require('express');
const router = express.Router();
const { 
    getAdminStats, 
    getAllOrders, 
    getAllFarmers, 
    getAllPayouts, 
    markPayoutPaid,
    verifyBankDetails
} = require('../controllers/adminController');


// In a real app with JWT auth, we would add authMiddleware and an admin check here.
// For this MVP, relying on user ID or simply leaving it open since it's local/prototype.

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);
router.get('/farmers', getAllFarmers);
router.get('/payouts', getAllPayouts);
router.put('/payouts/:id/pay', markPayoutPaid);
router.put('/farmers/:id/verify-bank', verifyBankDetails);

module.exports = router;
