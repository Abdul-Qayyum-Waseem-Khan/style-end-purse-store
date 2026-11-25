const express = require('express');
const router = express.Router();
const { getStoreStats } = require('../controllers/storeController');

router.get('/stats', getStoreStats);

module.exports = router;
