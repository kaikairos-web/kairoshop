const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const contactController = require('../controllers/contactController');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('message').trim().notEmpty().isLength({ max: 2000 }),
  ],
  validate,
  contactController.sendMessage
);

module.exports = router;
