const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.listUsers);
router.patch(
  '/users/:id',
  [
    body('is_blocked').optional().isBoolean(),
    body('role').optional().isIn(['user', 'admin']),
  ],
  validate,
  adminController.updateUser
);

module.exports = router;

