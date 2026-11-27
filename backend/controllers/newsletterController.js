const Newsletter = require('../models/Newsletter');
const Setting = require('../models/Setting');
const sendEmail = require('../utils/mailer');
const { newsletterWelcomeEmail } = require('../utils/emailTemplates');
const { validateEmail } = require('../utils/emailValidator');
const { verifyNewsletterUnsubscribeToken } = require('../utils/newsletterUnsubscribeToken');

// Helper to send welcome email
const sendWelcomeEmailWithDiscount = async (email) => {
  try {
    const setting = await Setting.findOne({ key: 'newsletterDiscountCode' });
    const discountCode = setting ? setting.value : '';
    const html = newsletterWelcomeEmail(email, discountCode);
    const storeName = process.env.STORE_NAME || 'Style End Purse';

    await sendEmail({
      to: email,
      subject: `Welcome to ${storeName}! Here is your gift 🎁`,
      html,
    });
  } catch (err) {
    console.error('Failed to send welcome discount email:', err);
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/v1/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const cleanEmail = typeof rawEmail === 'string' ? rawEmail.toLowerCase().trim() : '';

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Please provide an email' });
    }

    const emailCheck = validateEmail(cleanEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({ error: emailCheck.error });
    }

    const existingSubscriber = await Newsletter.findOne({ email: cleanEmail });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        await sendWelcomeEmailWithDiscount(cleanEmail);
        return res.status(200).json({ message: 'Successfully re-subscribed to the newsletter!' });
      }
      return res.status(400).json({ error: 'Email is already subscribed' });
    }

    const subscriber = await Newsletter.create({ email: cleanEmail });
    await sendWelcomeEmailWithDiscount(cleanEmail);

    res.status(201).json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to the newsletter!',
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email is already subscribed' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Unsubscribe from newsletter
// @route   GET/POST /api/v1/newsletter/unsubscribe
// @access  Public
const unsubscribe = async (req, res) => {
  try {
    const token = req.method === 'GET' ? req.query?.token : req.body?.token;
    const email = verifyNewsletterUnsubscribeToken(token);
    if (req.method === 'GET') {
      if (!email) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><title>Invalid unsubscribe link</title></head>
            <body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#111;">
              <h2>This unsubscribe link is invalid or expired</h2>
              <p>Please contact the store if you still need help.</p>
            </body>
          </html>
        `);
      }

      const action = `${req.baseUrl}/unsubscribe`;
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Confirm unsubscribe</title></head>
          <body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#111;">
            <h2>Confirm newsletter unsubscribe</h2>
            <p>Click below to stop receiving newsletter emails.</p>
            <form method="post" action="${action}">
              <input type="hidden" name="token" value="${token}">
              <button type="submit">Unsubscribe</button>
            </form>
          </body>
        </html>
      `);
    }

    if (!email) {
      return res.status(400).send('This unsubscribe link is invalid or expired.');
    }

    await Newsletter.updateOne({ email }, { $set: { isActive: false } });
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Unsubscribed</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#111;">
          <h2>You have been unsubscribed</h2>
          <p>You will no longer receive newsletter emails.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to process the unsubscribe request.');
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
};
