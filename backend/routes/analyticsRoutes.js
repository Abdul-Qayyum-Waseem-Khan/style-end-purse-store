const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const { getMarketingAnalytics } = require('../controllers/analyticsController');

router.get('/marketing', authenticateUser, authorizeAdmin, getMarketingAnalytics);

module.exports = router;
