const jwt = require('jsonwebtoken');

const TOKEN_PURPOSE = 'newsletter-unsubscribe';
const TOKEN_EXPIRY = '365d';

const createNewsletterUnsubscribeToken = (email) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign({ email, purpose: TOKEN_PURPOSE }, secret, { expiresIn: TOKEN_EXPIRY });
};

const verifyNewsletterUnsubscribeToken = (token) => {
  if (typeof token !== 'string' || !token) {
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  try {
    const payload = jwt.verify(token, secret);
    if (
      typeof payload === 'string' ||
      payload.purpose !== TOKEN_PURPOSE ||
      typeof payload.email !== 'string'
    ) {
      return null;
    }

    return payload.email.toLowerCase().trim();
  } catch (error) {
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return null;
    }
    throw error;
  }
};

module.exports = {
  createNewsletterUnsubscribeToken,
  verifyNewsletterUnsubscribeToken,
};
