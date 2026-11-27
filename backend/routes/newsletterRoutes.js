const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscribers } = require('../controllers/newsletterController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.get('/unsubscribe', unsubscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/', protect, authorizeAdmin, getSubscribers);

module.exports = router;
