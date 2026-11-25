const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const { createOrUpdatePage, getPage, getAllPages } = require('../controllers/pageController');

router.route('/')
  .post(authenticateUser, authorizeAdmin, createOrUpdatePage)
  .get(getAllPages);

router.route('/:slug')
  .get(getPage);

module.exports = router;
