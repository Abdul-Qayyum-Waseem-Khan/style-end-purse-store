const Campaign = require('../models/Campaign');
const Newsletter = require('../models/Newsletter');
const sendEmail = require('../utils/mailer');
const { createNewsletterUnsubscribeToken } = require('../utils/newsletterUnsubscribeToken');

// @desc    Get all campaigns
// @route   GET /api/v1/campaigns
// @access  Private/Admin
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Create new campaign
// @route   POST /api/v1/campaigns
// @access  Private/Admin
const createCampaign = async (req, res) => {
  try {
    const { title, subject, content } = req.body;
    if (!title || !subject || !content) {
      return res.status(400).json({ error: 'Please provide title, subject, and content' });
    }
    const campaign = await Campaign.create({ title, subject, content });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Send campaign to subscribers
// @route   POST /api/v1/campaigns/:id/send
// @access  Private/Admin
const sendCampaign = async (req, res) => {
  let lockedCampaign = null;
  try {
    // Atomically lock campaign from 'draft' -> 'sending' to prevent concurrent double-sends
    lockedCampaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, status: 'draft' },
      { $set: { status: 'sending' } },
      { returnDocument: 'after' }
    );

    if (!lockedCampaign) {
      const existing = await Campaign.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      return res.status(400).json({
        error: existing.status === 'sending' ? 'Campaign is already being sent' : 'Campaign already sent',
      });
    }

    const subscribers = await Newsletter.find({ isActive: true });

    if (subscribers.length === 0) {
      lockedCampaign.status = 'draft';
      await lockedCampaign.save();
      return res.status(400).json({ error: 'No active subscribers found' });
    }

    const apiBaseUrl = (process.env.API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

    const buildEmailHtml = (subscriberEmail) => {
      const token = createNewsletterUnsubscribeToken(subscriberEmail);
      const unsubscribeUrl = `${apiBaseUrl}/api/v1/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${lockedCampaign.subject}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: #374151; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: #111827; padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px; }
            .content { padding: 40px 30px; line-height: 1.6; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Style End Purse</h1>
            </div>
            <div class="content">
              ${lockedCampaign.content}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Style End Purse. All rights reserved.</p>
              <p style="font-size: 11px; color: #9ca3af; margin-top: 10px;">
                You are receiving this email because you subscribed to our newsletter.
                <br />
                <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    const results = await Promise.allSettled(
      subscribers.map((sub) =>
        sendEmail({
          to: sub.email,
          subject: lockedCampaign.subject,
          html: buildEmailHtml(sub.email),
        })
      )
    );

    const succeededCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedCount = results.length - succeededCount;

    results.forEach((r, idx) => {
      if (r.status === 'rejected') {
        console.error(`Failed to send campaign to ${subscribers[idx].email}:`, r.reason?.message || r.reason);
      }
    });

    if (succeededCount === 0) {
      lockedCampaign.status = 'draft';
      await lockedCampaign.save();
      return res.status(500).json({
        error: 'Failed to deliver campaign emails. Please verify email configuration.',
      });
    }

    lockedCampaign.status = 'sent';
    lockedCampaign.sentAt = new Date();
    lockedCampaign.sentCount = succeededCount;
    await lockedCampaign.save();

    res.status(200).json({
      success: true,
      data: lockedCampaign,
      delivery: { sent: succeededCount, failed: failedCount },
    });
  } catch (error) {
    console.error(error);
    if (lockedCampaign && lockedCampaign.status === 'sending') {
      try {
        lockedCampaign.status = 'draft';
        await lockedCampaign.save();
      } catch (rollbackError) {
        console.error('Failed to release campaign send lock:', rollbackError);
      }
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/v1/campaigns/:id
// @access  Private/Admin
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  sendCampaign,
  deleteCampaign,
};
