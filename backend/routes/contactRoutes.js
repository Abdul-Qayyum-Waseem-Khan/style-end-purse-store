const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const { createContactMessage, getAllMessages, markAsRead, deleteMessage } = require('../controllers/contactController');

router.route('/')
  .post(createContactMessage) // Public route to send message
  .get(authenticateUser, authorizeAdmin, getAllMessages); // Admin route to see messages

router.route('/:id')
  .put(authenticateUser, authorizeAdmin, markAsRead)
  .delete(authenticateUser, authorizeAdmin, deleteMessage);

module.exports = router;
