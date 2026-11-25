const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/optionalAuth');
const { trackVisitor } = require('../controllers/visitorController');

router.post('/track', optionalAuth, trackVisitor);

module.exports = router;
