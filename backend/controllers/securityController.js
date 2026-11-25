const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');
const User = require('../models/User');

const getOrigin = () => process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
const getRpID = () => {
  const origin = getOrigin();
  try {
    return new URL(origin).hostname;
  } catch (e) {
    return 'localhost';
  }
};

const challengesStore = {};

// ==========================================
// TOTP (Google Authenticator) Setup
// ==========================================

const generateTotpSecret = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const appName = process.env.STORE_NAME || 'Style End Purse';
  const secret = speakeasy.generateSecret({ 
    name: `${appName} Admin (${user.email})`,
    issuer: appName 
  });

  user.twoFactorSecret = secret.base32;
  await user.save();

  QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) return res.status(500).json({ error: 'Error generating QR code' });
    res.status(200).json({
      secret: secret.base32,
      qrCodeUrl: data_url,
      otpauthUrl: secret.otpauth_url
    });
  });
};

const verifyAndEnableTotp = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!user.twoFactorSecret) {
    return res.status(400).json({ error: 'Please generate a QR code first' });
  }

  const isVerified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 2 // Allow slight clock drift
  });

  if (isVerified) {
    user.twoFactorEnabled = true;
    await user.save();
    res.status(200).json({ message: 'Google Authenticator 2FA enabled successfully!' });
  } else {
    res.status(400).json({ error: 'Invalid verification code. Please check your Google Authenticator app.' });
  }
};

const disable2FA = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.twoFactorSecret = null;
  if (!user.webAuthnCredentials || user.webAuthnCredentials.length === 0) {
    user.twoFactorEnabled = false;
  }
  await user.save();
  res.status(200).json({ message: 'Google Authenticator disabled' });
};

// ==========================================
// WebAuthn (Windows Security Passkey / FIDO2)
// ==========================================

const generateWebAuthnRegistration = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const rpName = process.env.STORE_NAME || 'Style End Purse';
  const options = await generateRegistrationOptions({
    rpName,
    rpID: getRpID(),
    userID: Buffer.from(user._id.toString()),
    userName: user.email,
    userDisplayName: user.name || 'Admin User',
    attestationType: 'none',
    excludeCredentials: (user.webAuthnCredentials || []).map(cred => ({
      id: cred.credentialID,
      type: 'public-key',
      transports: cred.transports,
    })),
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
  });

  challengesStore[user._id.toString()] = options.challenge;
  res.status(200).json(options);
};

const verifyWebAuthnRegistration = async (req, res) => {
  const { body } = req;
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const expectedChallenge = challengesStore[user._id.toString()];
  if (!expectedChallenge) return res.status(400).json({ error: 'No active passkey registration challenge found' });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpID(),
    });
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    return res.status(400).json({ error: error.message || 'Passkey verification failed' });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { publicKey, id, counter, transports } = registrationInfo.credential;

    if (!user.webAuthnCredentials) {
      user.webAuthnCredentials = [];
    }

    user.webAuthnCredentials.push({
      credentialID: id,
      credentialPublicKey: Buffer.from(publicKey),
      counter,
      transports: transports || body.response?.transports || ['internal'],
    });

    user.twoFactorEnabled = true;
    await user.save();
    delete challengesStore[user._id.toString()];

    res.status(200).json({ verified: true, message: 'Windows Security Passkey registered successfully!' });
  } else {
    res.status(400).json({ error: 'Passkey verification failed' });
  }
};

const removeWebAuthnCredential = async (req, res) => {
  const { credentialID } = req.params;
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.webAuthnCredentials = (user.webAuthnCredentials || []).filter(cred => cred.credentialID !== credentialID);
  
  if (user.webAuthnCredentials.length === 0 && !user.twoFactorSecret) {
    user.twoFactorEnabled = false;
  }
  
  await user.save();
  res.status(200).json({ message: 'Passkey removed successfully' });
};

const getSecuritySettings = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({
    twoFactorEnabled: !!user.twoFactorEnabled,
    hasTotp: !!user.twoFactorSecret,
    webAuthnKeys: (user.webAuthnCredentials || []).map((cred, index) => ({
      id: cred.credentialID,
      label: `Passkey / Windows Security #${index + 1}`
    }))
  });
};

module.exports = {
  generateTotpSecret,
  verifyAndEnableTotp,
  disable2FA,
  generateWebAuthnRegistration,
  verifyWebAuthnRegistration,
  removeWebAuthnCredential,
  getSecuritySettings,
  challengesStore
};
