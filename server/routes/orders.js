const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(authenticate);

router.post('/checkout', orderController.checkout);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;

