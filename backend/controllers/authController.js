const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const { verificationEmail, welcomeEmail, passwordResetEmail } = require('../utils/emailTemplates');
const { validateEmail } = require('../utils/emailValidator');
const speakeasy = require('speakeasy');
const { generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

const getOrigin = () => process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
const getRpID = () => {
  const origin = getOrigin();
  try { return new URL(origin).hostname; } catch (e) { return 'localhost'; }
};
const authChallengesStore = {};

// Helper to attach cookies
const attachCookiesToResponse = ({ res, user }) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    signed: false,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'none',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    signed: false,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'none',
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all values' });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ error: emailValidation.error });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailAlreadyExists = await User.findOne({ email: normalizedEmail });
  if (emailAlreadyExists) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  // By default, everyone is registered as a user
  const role = 'user';
  
  const verificationToken = crypto.randomBytes(40).toString('hex');
  const verificationExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    verificationToken,
    verificationExpiry,
    isVerified: false,
  });

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${user.verificationToken}`;
  
  try {
    await sendEmail({
      to: user.email,
      subject: `Verify your email address - ${process.env.STORE_NAME || 'Style End Purse'}`,
      html: verificationEmail(user.name, verifyUrl)
    });
  } catch (emailErr) {
    console.error('Failed to send verification email during registration:', emailErr);
  }

  try {
    const sendPushNotification = require('../utils/sendPushNotification');
    const Notification = require('../models/Notification');

    await sendPushNotification({
      topic: 'admins',
      title: 'New Account Created',
      body: `A new user account was created: ${user.name} (${user.email})`
    });

    // Create Notification documents for all admins
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = admins.map(admin => ({
      user: admin._id,
      title: 'New Account Created',
      body: `A new user account was created: ${user.name} (${user.email})`,
      type: 'account_created',
      relatedId: user._id
    }));
    if (adminNotifications.length > 0) {
      await Notification.insertMany(adminNotifications);
    }
  } catch (pushErr) {
    console.error('Failed to send admin push notification or create db notification:', pushErr);
  }

  res.status(201).json({
    message: 'Success! Please check your email to verify your account.',
    email: user.email,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: 'Invalid Credentials' });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: 'Invalid Credentials' });
  }

  if (!user.isVerified) {
    return res.status(401).json({ 
      error: 'Please verify your email address before logging in.',
      isUnverified: true,
      email: user.email,
    });
  }

  // 2FA Check for Admins
  if (user.role === 'admin' && user.twoFactorEnabled) {
    const tempToken = jwt.sign(
      { userId: user._id, role: user.role, isTemp: true },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    
    return res.status(200).json({
      requires2FA: true,
      tempToken,
      methods: {
        totp: !!user.twoFactorSecret,
        webAuthn: user.webAuthnCredentials && user.webAuthnCredentials.length > 0
      },
      message: 'Two-Factor Authentication required'
    });
  }

  attachCookiesToResponse({ res, user });

  res.status(200).json({
    user: { name: user.name, role: user.role, userId: user._id, email: user.email },
    message: 'Logged in successfully',
  });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: 'User logged out!' });
};

const verifyEmail = async (req, res) => {
  const token = req.params.token || req.query.token || req.body.token;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).json({ error: 'Invalid or already used verification token' });
  }

  if (user.verificationExpiry && user.verificationExpiry < Date.now()) {
    return res.status(400).json({ 
      error: 'Verification token has expired. Please request a new verification link.',
      isExpired: true,
      email: user.email,
    });
  }

  user.isVerified = true;
  user.verificationToken = '';
  user.verificationExpiry = null;
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: `Welcome to ${process.env.STORE_NAME || 'Style End Purse'}!`,
      html: welcomeEmail(user.name)
    });
  } catch (emailErr) {
    console.error('Welcome email delivery error:', emailErr);
  }

  res.status(200).json({ 
    message: 'Email verified successfully! You can now log in to your account.',
    email: user.email,
  });
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please provide your email address' });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ error: emailValidation.error });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address' });
  }

  if (user.isVerified) {
    return res.status(400).json({ error: 'This email is already verified. You can sign in immediately.' });
  }

  const verificationToken = crypto.randomBytes(40).toString('hex');
  const verificationExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  user.verificationToken = verificationToken;
  user.verificationExpiry = verificationExpiry;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${user.verificationToken}`;
  
  await sendEmail({
    to: user.email,
    subject: `Verify your email address - ${process.env.STORE_NAME || 'Style End Purse'}`,
    html: verificationEmail(user.name, verifyUrl)
  });

  res.status(200).json({ 
    message: 'A new verification link has been sent to your email address. Please check your inbox.' 
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ error: emailValidation.error });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    const resetPasswordExpiry = new Date(Date.now() + 1000 * 60 * 15); // 15 mins
    
    user.resetPasswordToken = passwordToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${user.resetPasswordToken}`;
    
    await sendEmail({
      to: user.email,
      subject: `Reset your password - ${process.env.STORE_NAME || 'Style End Purse'}`,
      html: passwordResetEmail(user.name, resetUrl)
    });
  }

  res.status(200).json({ 
    message: 'If an account exists with that email, a password reset link has been dispatched. Please check your inbox.' 
  });
};

const resetPassword = async (req, res) => {
  const token = req.params.token || req.query.token || req.body.token;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Please provide both token and new password' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const user = await User.findOne({ resetPasswordToken: token });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired password reset token' });
  }

  if (user.resetPasswordExpiry && user.resetPasswordExpiry < Date.now()) {
    return res.status(400).json({ error: 'Password reset link has expired. Please request a new one.' });
  }

  user.password = password;
  user.resetPasswordToken = '';
  user.resetPasswordExpiry = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successful! You can now log in with your new password.' });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('wishlist');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Refresh cookies with latest user role from DB
    attachCookiesToResponse({ res, user });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

const saveFcmToken = async (req, res) => {
  res.status(200).json({ message: 'Push notifications disabled' });
};

const verifyLoginTotp = async (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) return res.status(400).json({ error: 'Missing token or code' });

  try {
    const payload = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!payload.isTemp) return res.status(400).json({ error: 'Invalid token' });

    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (isVerified) {
      attachCookiesToResponse({ res, user });
      res.status(200).json({
        user: { name: user.name, role: user.role, userId: user._id },
        message: 'Logged in successfully',
      });
    } else {
      res.status(400).json({ error: 'Invalid 2FA code' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
};

const generateLoginWebAuthnOptions = async (req, res) => {
  const { tempToken } = req.body;
  if (!tempToken) return res.status(400).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const options = await generateAuthenticationOptions({
      rpID: getRpID(),
      allowCredentials: user.webAuthnCredentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification: 'preferred',
    });

    authChallengesStore[user._id.toString()] = options.challenge;
    res.status(200).json(options);
  } catch (error) {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
};

const verifyLoginWebAuthn = async (req, res) => {
  const { tempToken, response } = req.body;
  if (!tempToken || !response) return res.status(400).json({ error: 'Missing token or response' });

  try {
    const payload = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const expectedChallenge = authChallengesStore[user._id.toString()];
    if (!expectedChallenge) return res.status(400).json({ error: 'No challenge found' });

    const authenticator = user.webAuthnCredentials.find(
      cred => cred.credentialID === response.id
    );

    if (!authenticator) return res.status(400).json({ error: 'Authenticator is not registered with this site' });

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: getOrigin(),
        expectedRPID: getRpID(),
        credential: {
          id: authenticator.credentialID,
          publicKey: Buffer.from(authenticator.credentialPublicKey),
          counter: authenticator.counter,
          transports: authenticator.transports,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      authenticator.counter = authenticationInfo.newCounter;
      await user.save();
      delete authChallengesStore[user._id.toString()];

      attachCookiesToResponse({ res, user });
      res.status(200).json({
        user: { name: user.name, role: user.role, userId: user._id },
        message: 'Logged in successfully',
      });
    } else {
      res.status(400).json({ error: 'Verification failed' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
};

module.exports = {
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
};
