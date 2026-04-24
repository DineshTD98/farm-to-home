const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, checkSubscription } = require('../controllers/subscriptionController');

router.post('/', subscribe);
router.delete('/:userId/:productId', unsubscribe);
router.get('/check/:userId/:productId', checkSubscription);

module.exports = router;
