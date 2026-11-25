const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');

// @desc    Create a new return request
// @route   POST /api/v1/returns
// @access  Private (or public if allowing guest returns with trackingId)
exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, reason, details } = req.body;
    
    // Extract uploaded images
    let proofImages = [];
    if (req.files && req.files.length > 0) {
      proofImages = req.files.map(file => file.path);
    } else if (req.body.proofImages) {
      proofImages = Array.isArray(req.body.proofImages) ? req.body.proofImages : [req.body.proofImages];
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify ownership
    if (req.user && order.user && order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to return this order' });
    }

    // Check if within 3-day return window
    const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;
    const timeSinceOrder = Date.now() - new Date(order.createdAt).getTime();
    if (timeSinceOrder > threeDaysInMillis) {
      return res.status(400).json({ success: false, error: 'Return period has expired. Returns are only accepted within 3 days of the order date.' });
    }

    const returnRequest = await ReturnRequest.create({
      order: orderId,
      user: req.user ? req.user.id : null, // Support guest returns if needed
      reason,
      details,
      proofImages
    });

    // Update order status to return_requested
    order.status = 'return_requested';
    order.statusHistory.push({
      status: 'return_requested',
      note: 'Customer requested a return',
      timestamp: Date.now()
    });
    await order.save();

    res.status(201).json({ success: true, data: returnRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all return requests (Admin)
// @route   GET /api/v1/returns
// @access  Private/Admin
exports.getReturnRequests = async (req, res) => {
  try {
    const returns = await ReturnRequest.find()
      .populate({
        path: 'order',
        populate: { path: 'items.product', select: 'name SKU price images' }
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: returns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update return request status (Admin)
// @route   PUT /api/v1/returns/:id/status
// @access  Private/Admin
exports.updateReturnStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const returnReq = await ReturnRequest.findById(req.params.id);
    if (!returnReq) {
      return res.status(404).json({ success: false, error: 'Return request not found' });
    }

    returnReq.status = status;
    if (adminNotes) {
      returnReq.adminNotes = adminNotes;
    }
    await returnReq.save();

    // If completed, update the main order status to 'returned'
    if (status === 'completed') {
      const order = await Order.findById(returnReq.order);
      if (order) {
        order.status = 'returned';
        order.statusHistory.push({
          status: 'returned',
          note: 'Return completed by admin',
          timestamp: Date.now()
        });
        await order.save();
      }
    }

    res.status(200).json({ success: true, data: returnReq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get return request by ID
// @route   GET /api/v1/returns/:id
// @access  Private
exports.getReturnRequestById = async (req, res) => {
  try {
    const returnReq = await ReturnRequest.findById(req.params.id)
      .populate({
        path: 'order',
        populate: { path: 'items.product', select: 'name images price' }
      })
      .populate('user', 'name email');

    if (!returnReq) {
      return res.status(404).json({ success: false, error: 'Return request not found' });
    }

    res.status(200).json({ success: true, data: returnReq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
