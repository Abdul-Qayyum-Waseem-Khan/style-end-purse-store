const Newsletter = require('../models/Newsletter');
const Setting = require('../models/Setting');
const sendEmail = require('../utils/mailer');
const { newsletterWelcomeEmail } = require('../utils/emailTemplates');
const { validateEmail } = require('../utils/emailValidator');

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
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Please provide an email' });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ error: emailCheck.error });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingSubscriber = await Newsletter.findOne({ email: cleanEmail });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        
        // Send email upon resubscribing if they haven't received it recently, but it's simpler to just send it
        await sendWelcomeEmailWithDiscount(email);

        return res.status(200).json({ message: 'Successfully re-subscribed to the newsletter!' });
      }
      return res.status(400).json({ error: 'Email is already subscribed' });
    }

    const subscriber = await Newsletter.create({ email });
    
    // Send welcome discount email for new subscribers
    await sendWelcomeEmailWithDiscount(email);

    res.status(201).json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to the newsletter!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
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
  getSubscribers,
};
