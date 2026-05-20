const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const productController = require('../controllers/productController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

const categories = ['Bike Frames', 'Tires', 'Chains', 'Helmets', 'Brakes', 'Accessories'];

router.get('/', productController.listProducts);

router.post(
  '/upload',
  authenticate,
  requireAdmin,
  upload.single('image'),
  productController.uploadImage
);

router.get('/:id', productController.getProduct);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().isLength({ max: 200 }),
    body('category').isIn(categories),
    body('price').isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
  ],
  validate,
  productController.createProduct
);

router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;

