const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/mailer');
const { orderDeliveredEmail, orderStatusEmail, newOrderAlertEmail } = require('../utils/emailTemplates');

// @route   POST /api/v1/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentDetails, orderNotes, subtotal, deliveryFee, discount, total, couponCode, freeGiftDescription, attribution, visitorId, eventId } = req.body;
    
    const formatPhoneNumber = require('../utils/phoneFormatter');
    if (shippingAddress && shippingAddress.phone) {
      shippingAddress.phone = formatPhoneNumber(shippingAddress.phone);
    }
    if (paymentDetails && paymentDetails.phone) {
      paymentDetails.phone = formatPhoneNumber(paymentDetails.phone);
    }

    // Check user auth token if present to link order to user
    const userId = req.user?.id;

    const crypto = require('crypto');
    const trackingId = 'TRK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 7);

    let finalAttribution = attribution;
    if (!finalAttribution || Object.keys(finalAttribution).length === 0) {
      finalAttribution = { utmSource: 'Direct' };
    } else if (!finalAttribution.utmSource) {
      finalAttribution.utmSource = 'Direct';
    }

    const order = await Order.create({
      user: userId, // undefined if guest
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      orderNotes,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode,
      freeGiftDescription,
      trackingId,
      expectedDeliveryDate,
      attribution: finalAttribution,
      visitorId
    });

    if (couponCode) {
      const Coupon = require('../models/Coupon');
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      ).catch(err => console.error('Failed to update coupon usage:', err));
    }

    // Fire Meta Conversions API
    if (eventId) {
      const { sendMetaCAPIEvent } = require('../utils/metaCapi');
      
      // Fetch user email if logged in, for better matching
      let userObj = null;
      if (userId) {
        userObj = await require('../models/User').findById(userId);
      } else if (shippingAddress && shippingAddress.email) {
        userObj = { email: shippingAddress.email }; // Fallback to provided email
      }

      // Fire and forget (don't block the response)
      sendMetaCAPIEvent('Purchase', { user: userObj, order }, eventId, req).catch(console.error);
    }

    try {
      const Notification = require('../models/Notification');
      const User = require('../models/User');

      // Create Notification documents for all admins
      const admins = await User.find({ role: 'admin' });
      const adminNotifications = admins.map(admin => ({
        user: admin._id,
        title: 'New Order Received',
        body: `Order ${order._id.toString().substring(16).toUpperCase()} - Rs. ${total} via ${paymentMethod}`,
        type: 'order_placed',
        relatedId: order._id
      }));
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }
    } catch (notifErr) {
      console.error('Failed to create db notification:', notifErr);
    }

    // Send Order Confirmation Email
    try {
      const emailObj = req.user.email;
      if (emailObj) {
        const { orderConfirmationEmail } = require('../utils/emailTemplates');
        const sendEmail = require('../utils/mailer');
        const customerName = order.shippingAddress?.fullName || req.user.name || 'Customer';
        
        // Populate products so email has names
        const populatedOrder = await Order.findById(order._id).populate('items.product', 'name price');
        
        const html = orderConfirmationEmail(customerName, populatedOrder);
        await sendEmail({
          to: emailObj,
          subject: `Order Confirmation - #${order._id.toString().substring(16).toUpperCase()}`,
          html,
          text: `Thank you for your order! Your Order ID is #${order._id.toString().substring(16).toUpperCase()}`
        });
      }
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr);
    }

    // Send admin alert email about new order
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const populatedForAdmin = await Order.findById(order._id).populate('items.product', 'name price');
        const html = newOrderAlertEmail(populatedForAdmin);
        await sendEmail({
          to: adminEmail,
          subject: `🛒 New Order #${order._id.toString().substring(16).toUpperCase()} — PKR ${total}`,
          html,
          text: `New order received! Order ID: #${order._id.toString().substring(16).toUpperCase()} | Total: PKR ${total} | Customer: ${order.shippingAddress?.fullName}`
        });
      }
    } catch (adminEmailErr) {
      console.error('Failed to send admin alert email:', adminEmailErr);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message || 'Failed to create order' });
  }
});

// @route   GET /api/v1/orders/my-orders
// @desc    Get logged in user orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images price slug')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/v1/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      // Search by order ID or customer email/name
      query.$or = [
        { _id: isValidObjectId(search) ? search : null },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ].filter(cond => cond._id !== null); // remove null ID if not valid objectId
      // Note: searching user email requires aggregation or populate filtering, which is complex.
      // We'll stick to shipping info and ID for now.
    }

    // Since we don't have mongoosePaginate on Order yet, we'll do manual pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Helper for ObjectId check
function isValidObjectId(id) {
  if(id.match(/^[0-9a-fA-F]{24}$/)) {
    return true;
  }
  return false;
}

// @route   GET /api/v1/orders/track/:trackingId
// @desc    Track order by trackingId
// @access  Public
router.get('/track/:trackingId', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId })
      .populate('items.product', 'name images price');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/v1/orders/bulk-confirm
// @desc    Bulk confirm orders
// @access  Private/Admin
router.put('/bulk-confirm', protect, authorize('admin'), async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ success: false, error: 'Please provide an array of order IDs' });
    }

    await Order.updateMany(
      { _id: { $in: orderIds }, status: 'pending' },
      { 
        $set: { status: 'confirmed' },
        $push: { 
          statusHistory: { 
            status: 'confirmed', 
            note: 'Bulk confirmed by admin', 
            timestamp: Date.now() 
          } 
        } 
      }
    );

    res.status(200).json({ success: true, message: 'Orders confirmed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/v1/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images SKU stock');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check if user is admin or the order belongs to them
    const orderUserId = order.user ? (order.user._id || order.user).toString() : null;
    if (req.user.role !== 'admin' && orderUserId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/v1/orders/:id/status
// @desc    Update order status and optionally expectedDeliveryDate
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, expectedDeliveryDate, note } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (status) {
      order.status = status;
      order.statusHistory.push({
        status,
        note: note || `Status updated to ${status}`,
        timestamp: Date.now()
      });

      // Create Web Notification for the user
      try {
        const Notification = require('../models/Notification');
        let title = 'Order Update';
        let body = `Your order #${order._id.toString().substring(16).toUpperCase()} status changed to: ${status.replace(/_/g, ' ')}.`;
        let notifType = 'order_update';
        
        if (status === 'delivered') {
          title = 'Order Delivered! 🎉';
          body = `Great news! Your order has been successfully delivered.`;
          notifType = 'order_delivered';
        } else if (status === 'dispatched' || status === 'at_delivery') {
          title = 'Order Dispatched! 🚚';
          body = `Your order #${order._id.toString().substring(16).toUpperCase()} is on its way!`;
          notifType = 'order_shipped';
        } else if (status === 'cancelled') {
          title = 'Order Cancelled';
          body = `Your order #${order._id.toString().substring(16).toUpperCase()} has been cancelled.`;
          notifType = 'order_cancelled';
        } else if (status === 'returned' || status === 'return_requested') {
          title = 'Return Update';
          body = `Your return request for order #${order._id.toString().substring(16).toUpperCase()} has been processed.`;
          notifType = 'order_returned';
        } else if (status === 'in_progress') {
          title = 'Order Confirmed ✅';
          body = `Your order #${order._id.toString().substring(16).toUpperCase()} is being processed.`;
          notifType = 'order_confirmed';
        }

        await Notification.create({
          user: order.user._id,
          title,
          body,
          type: notifType,
          relatedId: order._id
        });
      } catch (notiErr) {
        console.error('Failed to create status notification:', notiErr);
      }
    }

    if (expectedDeliveryDate) {
      order.expectedDeliveryDate = expectedDeliveryDate;
    }

    await order.save();

    // Sync with Return Request if applicable
    if (status === 'returned') {
      try {
        const ReturnRequest = require('../models/ReturnRequest');
        await ReturnRequest.findOneAndUpdate({ order: order._id }, { status: 'completed' });
      } catch (err) {
        console.error('Failed to sync return request status to completed:', err);
      }
    } else if (status === 'return_requested') {
      try {
        const ReturnRequest = require('../models/ReturnRequest');
        await ReturnRequest.findOneAndUpdate({ order: order._id }, { status: 'pending' });
      } catch (err) {
        console.error('Failed to sync return request status to pending:', err);
      }
    }

    // Trigger status-specific email to user
    const emailStatuses = ['in_progress', 'dispatched', 'delivered', 'cancelled'];
    if (status && emailStatuses.includes(status)) {
      try {
        const userEmail = order.user?.email;
        if (userEmail) {
          const customerName = order.shippingAddress?.fullName || order.user?.name || 'Customer';
          
          let emailHtml, emailSubject, emailText;
          
          if (status === 'delivered') {
            // Use the existing dedicated delivery email
            emailHtml = orderDeliveredEmail(customerName, order);
            emailSubject = `Your order #${order._id.toString().substring(16).toUpperCase()} has been delivered! 🎉`;
            emailText = `Great news! Your order has been delivered. Thank you for shopping with us!`;
          } else {
            // Use the new generic status email for other statuses
            emailHtml = orderStatusEmail(customerName, order, status);
            const subjectMap = {
              in_progress: `Your order #${order._id.toString().substring(16).toUpperCase()} is confirmed ✅`,
              dispatched: `Your order #${order._id.toString().substring(16).toUpperCase()} is on its way 🚚`,
              cancelled: `Your order #${order._id.toString().substring(16).toUpperCase()} has been cancelled`,
            };
            emailSubject = subjectMap[status] || `Order #${order._id.toString().substring(16).toUpperCase()} Update`;
            emailText = `Your order status has been updated to: ${status.replace(/_/g, ' ')}.`;
          }

          await sendEmail({
            to: userEmail,
            subject: emailSubject,
            html: emailHtml,
            text: emailText
          }).catch(err => console.error(`Failed to send ${status} email:`, err));
        }
      } catch (statusEmailErr) {
        console.error('Failed to send status update email:', statusEmailErr);
      }
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/v1/orders/:id/payment-status
// @desc    Update order payment status
// @access  Private/Admin
router.put('/:id/payment-status', protect, authorize('admin'), async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid payment status' });
    }

    order.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'paid' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      
      // Optionally add a note to history
      order.statusHistory.push({
        status: order.status,
        note: `Payment marked as received by admin.`,
        timestamp: Date.now()
      });
    }

    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
