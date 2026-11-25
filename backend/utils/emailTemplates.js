const STORE_NAME = process.env.STORE_NAME || 'Style End Purse';
const STORE_URL = process.env.STORE_URL || process.env.CLIENT_URL || 'http://localhost:5173';

const getBaseLayout = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f6f6f6;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f6f6f6;
      padding: 40px 15px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #eaeaea;
    }
    .header {
      background-color: #111111;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .header p {
      color: #C5A880;
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin: 6px 0 0 0;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.65;
      font-size: 15px;
      color: #333333;
    }
    .content h2 {
      color: #111111;
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background-color: #111111;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #2a2a2a;
    }
    .link-fallback {
      background-color: #f9f9f9;
      border: 1px dashed #d1d5db;
      padding: 14px;
      border-radius: 8px;
      word-break: break-all;
      font-size: 12px;
      color: #4b5563;
      margin-top: 20px;
    }
    .link-fallback a {
      color: #111111;
      text-decoration: underline;
    }
    .note-box {
      background-color: #fbfbfb;
      border-left: 3px solid #111111;
      padding: 12px 16px;
      margin: 20px 0;
      font-size: 13px;
      color: #555555;
    }
    .footer {
      background-color: #fafafa;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #888888;
      border-top: 1px solid #eeeeee;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${STORE_NAME}</h1>
        <p>LUXURY COLLECTION</p>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
        <p style="font-size: 11px; color: #aaaaaa; margin-top: 8px;">
          This message was sent regarding your account on ${STORE_NAME}. If you received this by mistake, you can safely disregard it.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const verificationEmail = (name, verifyLink) => {
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Dear ${name || 'Customer'},</p>
    <p>Thank you for creating an account with <strong>${STORE_NAME}</strong>. To activate your account and access your personal dashboard, wishlist, and order tracking, please verify your email address.</p>
    
    <div class="btn-container">
      <a href="${verifyLink}" class="btn">Verify Email Address</a>
    </div>

    <div class="note-box">
      <strong>Security Notice:</strong> This verification link will expire in <strong>24 hours</strong>. If it expires, you can easily request a new link from the login page.
    </div>

    <p style="font-size: 13px; color: #666666;">
      If the button above does not work, copy and paste the following link into your browser:
    </p>
    <div class="link-fallback">
      <a href="${verifyLink}">${verifyLink}</a>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #888888;">
      If you did not create an account with ${STORE_NAME}, please ignore this email.
    </p>
  `;
  return getBaseLayout('Verify your email - ' + STORE_NAME, content);
};

const welcomeEmail = (name) => {
  const content = `
    <h2>Welcome to ${STORE_NAME}! 🎉</h2>
    <p>Dear ${name || 'Customer'},</p>
    <p>Your email has been successfully verified! Your account is now active and ready to use.</p>
    <p>Explore our latest collection of handcrafted bags, luxury purses, and footwear designed for elegance and durability.</p>
    
    <div class="btn-container">
      <a href="${STORE_URL}" class="btn">Explore Collection</a>
    </div>

    <div class="note-box">
      <strong>Your Member Benefits:</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 20px;">
        <li>Real-time order tracking & delivery updates</li>
        <li>Saved shipping addresses for rapid checkout</li>
        <li>Exclusive access to member-only seasonal drops</li>
      </ul>
    </div>
  `;
  return getBaseLayout('Welcome to ' + STORE_NAME, content);
};

const passwordResetEmail = (name, resetLink) => {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Dear ${name || 'Customer'},</p>
    <p>We received a request to reset the password for your <strong>${STORE_NAME}</strong> account. Click the button below to choose a new password.</p>
    
    <div class="btn-container">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </div>

    <div class="note-box">
      <strong>Important:</strong> For your security, this password reset link will expire in <strong>15 minutes</strong>.
    </div>

    <p style="font-size: 13px; color: #666666;">
      If the button above does not work, copy and paste this link into your browser:
    </p>
    <div class="link-fallback">
      <a href="${resetLink}">${resetLink}</a>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #888888;">
      If you did not request a password reset, please ignore this email or contact our support team. Your current password remains secure.
    </p>
  `;
  return getBaseLayout('Reset your password - ' + STORE_NAME, content);
};

const orderConfirmationEmail = (name, order) => {
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name || item.product?.name || 'Product'}</td>
      <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.quantity || item.qty || 1}</td>
      <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">PKR ${((item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString()}</td>
    </tr>
  `).join('');

  const orderId = (order._id || order.id || '').toString().substring(16).toUpperCase();

  const content = `
    <h2>Order Confirmation</h2>
    <p>Dear ${name || 'Customer'},</p>
    <p>Thank you for shopping with <strong>${STORE_NAME}</strong>. We have received your order and our team is preparing it for dispatch.</p>
    
    <p><strong>Order ID:</strong> #${orderId}</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr>
          <th style="padding: 12px; text-align: left; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Item</th>
          <th style="padding: 12px; text-align: center; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Qty</th>
          <th style="padding: 12px; text-align: right; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="font-weight: bold; font-size: 16px; border-top: 2px solid #e5e7eb;">
          <td colspan="2" style="text-align: right; padding: 12px;">Grand Total:</td>
          <td style="text-align: right; padding: 12px;">PKR ${(order.total || order.totalAmount || 0).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <h3 style="margin-top: 0; font-size: 15px; color: #111111;">Delivery Details</h3>
      <p style="margin: 4px 0;"><strong>Recipient:</strong> ${order.shippingAddress?.fullName || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Address:</strong> ${order.shippingAddress?.addressLine1 || order.shippingAddress?.address1 || ''}, ${order.shippingAddress?.city || ''}</p>
      <p style="margin: 4px 0;"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}</p>
    </div>
  `;
  return getBaseLayout('Order Confirmation - ' + STORE_NAME, content);
};

const orderDeliveredEmail = (name, order) => {
  const orderId = (order._id || order.id || '').toString().substring(16).toUpperCase();
  const content = `
    <h2>Your Order Has Been Delivered! 🎉</h2>
    <p>Dear ${name || 'Customer'},</p>
    <p>Your order <strong>#${orderId}</strong> has been successfully delivered to your address.</p>
    <p>We hope you love your new purchase! If you have a moment, we would greatly appreciate your feedback.</p>
    <div class="btn-container">
      <a href="${STORE_URL}/account/orders" class="btn">View Order Details</a>
    </div>
  `;
  return getBaseLayout('Your Order Has Been Delivered - ' + STORE_NAME, content);
};

const orderStatusEmail = (name, order, status) => {
  const statusMessages = {
    in_progress: {
      heading: 'Your Order is Confirmed ✅',
      line: 'Great news! Your order has been confirmed and our packaging team is preparing it for shipment.'
    },
    dispatched: {
      heading: 'Your Order Has Been Dispatched 🚚',
      line: 'Your order is on its way! Our courier partner will deliver it shortly. Please keep your phone reachable.'
    },
    delivered: {
      heading: 'Your Order Has Been Delivered 🎉',
      line: 'Your order has been successfully delivered. We hope you adore your items!'
    },
    cancelled: {
      heading: 'Your Order Has Been Cancelled',
      line: 'Your order has been cancelled. If you believe this is in error, please contact our support team.'
    },
  };

  const msg = statusMessages[status] || {
    heading: 'Order Status Update',
    line: `Your order status has been updated to: ${status.replace(/_/g, ' ')}.`
  };

  const orderId = (order._id || order.id || '').toString().substring(16).toUpperCase();

  const content = `
    <h2>${msg.heading}</h2>
    <p>Dear ${name || 'Customer'},</p>
    <p>${msg.line}</p>
    <p><strong>Order ID:</strong> #${orderId}</p>
    <p><strong>Total:</strong> PKR ${(order.totalAmount || order.total || 0).toLocaleString()}</p>
    <div class="btn-container">
      <a href="${STORE_URL}/account/orders" class="btn">Track Your Order</a>
    </div>
  `;
  return getBaseLayout(msg.heading + ' - ' + STORE_NAME, content);
};

const newOrderAlertEmail = (order) => {
  const orderId = (order._id || order.id || '').toString().substring(16).toUpperCase();
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name || item.product?.name || 'Product'}</td>
      <td style="text-align: center; padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.quantity || 1}</td>
      <td style="text-align: right; padding: 10px; border-bottom: 1px solid #e5e7eb;">PKR ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
    </tr>
  `).join('');

  const content = `
    <h2>🛒 New Order Received!</h2>
    <p>A new customer order has just been placed on the store.</p>
    <table style="width:100%; border-collapse: collapse; margin: 10px 0;">
      <tr><td style="padding: 8px; color: #6b7280;">Order ID</td><td style="padding: 8px; font-weight: bold;">#${orderId}</td></tr>
      <tr><td style="padding: 8px; color: #6b7280;">Customer</td><td style="padding: 8px;">${order.shippingAddress?.fullName || 'N/A'}</td></tr>
      <tr><td style="padding: 8px; color: #6b7280;">Phone</td><td style="padding: 8px;">${order.shippingAddress?.phone || 'N/A'}</td></tr>
      <tr><td style="padding: 8px; color: #6b7280;">City</td><td style="padding: 8px;">${order.shippingAddress?.city || 'N/A'}</td></tr>
      <tr><td style="padding: 8px; color: #6b7280;">Payment</td><td style="padding: 8px;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</td></tr>
      <tr><td style="padding: 8px; color: #6b7280; font-weight: bold;">Total</td><td style="padding: 8px; font-weight: bold; font-size: 18px; color: #111111;">PKR ${(order.total || order.totalAmount || 0).toLocaleString()}</td></tr>
    </table>

    <h3 style="margin-top: 24px;">Items Ordered</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">Item</th>
          <th style="padding: 10px; text-align: center; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">Qty</th>
          <th style="padding: 10px; text-align: right; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="btn-container">
      <a href="${STORE_URL}/admin/orders" class="btn">View in Admin Dashboard</a>
    </div>
  `;
  return getBaseLayout('New Order #' + orderId + ' Received', content);
};

const newsletterWelcomeEmail = (email, discountCode) => {
  const codeHtml = discountCode ? `
    <div style="background-color: #f7f5f0; border: 2px dashed #C5A880; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; color: #555555; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Exclusive Welcome Discount:</p>
      <div style="font-size: 28px; font-weight: 900; color: #111111; letter-spacing: 3px; margin-top: 6px;">${discountCode}</div>
      <p style="margin: 8px 0 0 0; color: #777777; font-size: 13px;">Apply this coupon code at checkout for your discount!</p>
    </div>
  ` : '';

  const content = `
    <h2 style="text-align: center;">Welcome to the ${STORE_NAME} Inner Circle ✨</h2>
    <p>Dear Valued Customer,</p>
    <p>Thank you for subscribing to our newsletter. You'll be the first to receive updates on exclusive handbag arrivals, flash sales, and private styling previews.</p>
    ${codeHtml}
    <div class="btn-container">
      <a href="${STORE_URL}" class="btn">Shop New Arrivals</a>
    </div>
  `;
  
  return getBaseLayout('Welcome to ' + STORE_NAME + ' 🎁', content);
};

module.exports = {
  verificationEmail,
  welcomeEmail,
  passwordResetEmail,
  orderConfirmationEmail,
  orderDeliveredEmail,
  orderStatusEmail,
  newOrderAlertEmail,
  newsletterWelcomeEmail,
};
