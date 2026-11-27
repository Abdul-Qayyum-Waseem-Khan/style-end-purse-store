const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send an email using Nodemailer
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 */
const sendEmail = async ({ to, subject, html }) => {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  if (!emailUser || !emailPass) {
    throw new Error('Email credentials (EMAIL_USER / EMAIL_PASS) are not configured.');
  }

  try {
    const transporter = createTransporter();
    
    // Auto-generate text alternative from HTML to reduce spam score
    const textAlternative = html
      .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove style tags and their content
      .replace(/<br\s*[\/]?>/gi, '\n') // Convert <br> to newlines
      .replace(/<\/p>/gi, '\n\n') // Convert </p> to double newlines
      .replace(/<[^>]*>?/gm, '') // Remove all other HTML tags
      .replace(/&nbsp;/g, ' ') // Replace html entities
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
      .trim();

    const mailOptions = {
      from: `"${process.env.STORE_NAME || 'Style End Purse'}" <${emailUser}>`,
      replyTo: emailUser,
      to,
      subject,
      html,
      text: textAlternative,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: email error logged.');
    }
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;
