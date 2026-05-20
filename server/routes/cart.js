const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post(
  '/add',
  [
    body('product_id').isUUID(),
    body('quantity').optional().isInt({ min: 1 }),
  ],
  validate,
  cartController.addToCart
);
router.put('/:id', [body('quantity').isInt({ min: 1 })], validate, cartController.updateCartItem);
router.delete('/remove/:id', cartController.removeFromCart);

router.get('/wishlist', cartController.getWishlist);
router.post('/wishlist', [body('product_id').isUUID()], validate, cartController.toggleWishlist);

module.exports = router;

