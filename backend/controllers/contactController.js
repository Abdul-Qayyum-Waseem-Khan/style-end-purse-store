const Contact = require('../models/Contact');
const sendEmail = require('../utils/mailer');

const createContactMessage = async (req, res) => {
  const message = await Contact.create(req.body);
  
  try {
    // Send email to admin
    await sendEmail({
      to: process.env.EMAIL_USER, // sending to admin's own email or a configured admin email
      subject: `New Appointment/Contact Request from ${message.name}`,
      html: `
        <h2>New Request Received</h2>
        <p><strong>Name:</strong> ${message.name}</p>
        <p><strong>Email:</strong> ${message.email}</p>
        <p><strong>Phone:</strong> ${message.phone || 'N/A'}</p>
        <p><strong>Age:</strong> ${message.age || 'N/A'}</p>
        <p><strong>Disease/Condition:</strong> ${message.disease || 'N/A'}</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.message}</p>
      `
    });

    // Send confirmation to user
    await sendEmail({
      to: message.email,
      subject: `We've received your request - Style End Purse`,
      html: `
        <h2>Hello ${message.name},</h2>
        <p>Thank you for reaching out to us. We have received your request and will contact you shortly.</p>
        <p><strong>Your Message Summary:</strong></p>
        <p>${message.message}</p>
        <br/>
        <p>Best regards,<br/>Style End Purse Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    // Continue even if emails fail, as the DB record is already saved
  }

  res.status(201).json({ data: message, message: 'Your message has been sent successfully!' });
};

const getAllMessages = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const messages = await Contact.paginate({}, {
    page,
    limit,
    sort: { createdAt: -1 },
  });

  res.status(200).json({ data: messages.docs, pagination: messages });
};

const markAsRead = async (req, res) => {
  const message = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { returnDocument: 'after' });
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.status(200).json({ data: message });
};

const deleteMessage = async (req, res) => {
  const message = await Contact.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.status(200).json({ message: 'Message deleted' });
};

module.exports = { createContactMessage, getAllMessages, markAsRead, deleteMessage };
