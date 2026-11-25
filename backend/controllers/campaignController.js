const Campaign = require('../models/Campaign');
const Newsletter = require('../models/Newsletter');
const sendEmail = require('../utils/mailer');
const { getBaseLayout } = require('../utils/emailTemplates'); // Use base layout for consistency

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
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ error: 'Campaign already sent' });
    }

    const subscribers = await Newsletter.find({ isActive: true });
    
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No active subscribers found' });
    }

    // Optional: We can write a custom layout or just use the raw content.
    // Assuming content is HTML from a rich text editor.
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject}</title>
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
            ${campaign.content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Style End Purse. All rights reserved.</p>
            <p style="font-size: 10px; color: #9ca3af; margin-top: 10px;">You are receiving this email because you subscribed to our newsletter.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails in batches or parallel (for small lists, Promise.all is fine)
    // Note: For large lists (>100), consider a queueing system like Bull or AWS SES batching.
    const sendPromises = subscribers.map(sub => 
      sendEmail({
        to: sub.email,
        subject: campaign.subject,
        html: emailHtml,
        text: campaign.subject // fallback text
      }).catch(err => console.error(`Failed to send to ${sub.email}:`, err))
    );

    await Promise.all(sendPromises);

    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.sentCount = subscribers.length;
    await campaign.save();

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
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
  deleteCampaign
};
