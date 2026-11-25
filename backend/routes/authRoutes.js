const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  saveFcmToken,
  verifyLoginTotp,
  generateLoginWebAuthnOptions,
  verifyLoginWebAuthn,
} = require('../controllers/authController');

const { authenticateUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/login/totp', verifyLoginTotp);
router.post('/login/webauthn/generate', generateLoginWebAuthnOptions);
router.post('/login/webauthn/verify', verifyLoginWebAuthn);
router.post('/logout', logout);

// Verification & Password Reset
router.get('/verify-email/:token', verifyEmail);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/reset-password', resetPassword);

// User & Token management
router.get('/me', authenticateUser, getCurrentUser);
router.post('/fcm-token', authenticateUser, saveFcmToken);

module.exports = router;
