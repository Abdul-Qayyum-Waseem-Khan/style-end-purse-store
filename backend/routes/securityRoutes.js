const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const {
  generateTotpSecret,
  verifyAndEnableTotp,
  disable2FA,
  generateWebAuthnRegistration,
  verifyWebAuthnRegistration,
  removeWebAuthnCredential,
  getSecuritySettings
} = require('../controllers/securityController');

// All security routes require user to be authenticated and an admin
router.use(authenticateUser);
router.use(authorizeAdmin);

router.get('/settings', getSecuritySettings);

// TOTP
router.post('/2fa/generate', generateTotpSecret);
router.post('/2fa/verify', verifyAndEnableTotp);
router.post('/2fa/disable', disable2FA);

// WebAuthn
router.get('/webauthn/generate-registration-options', generateWebAuthnRegistration);
router.post('/webauthn/verify-registration', verifyWebAuthnRegistration);
router.delete('/webauthn/remove/:credentialID', removeWebAuthnCredential);

module.exports = router;
