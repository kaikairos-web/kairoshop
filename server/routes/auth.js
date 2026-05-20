const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('access_token').notEmpty(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  authController.resetPassword
);

router.get('/profile', authenticate, authController.getProfile);
router.put(
  '/profile',
  authenticate,
  [body('full_name').optional().trim().isLength({ max: 100 })],
  validate,
  authController.updateProfile
);

module.exports = router;

