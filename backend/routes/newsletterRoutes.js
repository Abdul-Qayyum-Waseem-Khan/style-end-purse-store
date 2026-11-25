const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers } = require('../controllers/newsletterController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.get('/', protect, authorizeAdmin, getSubscribers);

module.exports = router;
