const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/v1/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Orders Stats
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Total Revenue (only paid orders that are not cancelled or returned)
    const revenueAgg = await Order.aggregate([
      { $match: { 
          paymentStatus: 'paid',
          status: { $nin: ['cancelled', 'returned'] }
      } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Pending Payments (unpaid orders that are not cancelled or returned)
    const pendingPaymentsAgg = await Order.aggregate([
      { $match: { 
          paymentStatus: 'pending', 
          status: { $nin: ['cancelled', 'return_requested', 'returned'] } 
      } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pendingPaymentsAmount = pendingPaymentsAgg.length > 0 ? pendingPaymentsAgg[0].total : 0;

    // 2. Users Stats
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: firstDayOfMonth } });

    // 3. Products Stats
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name stock price images slug');

    // 4. Revenue by Day (last 30 days, only paid non-returned/cancelled orders)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueByDayAgg = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'paid',
          status: { $nin: ['cancelled', 'returned'] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for frontend: { date: 'YYYY-MM-DD', revenue: number }
    const revenueByDay = revenueByDayAgg.map(item => ({
      date: item._id,
      revenue: item.revenue
    }));

    // 5. Top Products (by units sold, only for paid non-returned/cancelled orders)
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 
          paymentStatus: 'paid',
          status: { $nin: ['cancelled', 'returned'] }
      } },
      {
        $group: {
          _id: '$items.product',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          name: '$productInfo.name',
          unitsSold: 1,
          revenue: 1
        }
      }
    ]);

    // 6. Orders by Status
    const ordersByStatusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const ordersByStatus = {};
    ordersByStatusAgg.forEach(item => {
      ordersByStatus[item._id] = item.count;
    });

    // 7. Recent Orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        ordersToday,
        pendingOrders,
        pendingPaymentsAmount,
        totalUsers,
        newUsersThisMonth,
        totalProducts,
        lowStockProducts,
        revenueByDay,
        topProducts: topProductsAgg,
        ordersByStatus,
        recentOrders
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error in Admin Stats' });
  }
});

// @route   GET /api/v1/admin/users
// @desc    Get all users for admin
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get order counts for each user
    const usersWithOrderCount = await Promise.all(users.map(async (user) => {
      const orderCount = await Order.countDocuments({ user: user._id });
      return { ...user.toObject(), orderCount };
    }));

    res.status(200).json({
      success: true,
      data: usersWithOrderCount,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/v1/admin/transactions
// @desc    Get all transactions (orders simplified)
// @access  Private/Admin
router.get('/transactions', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const total = await Order.countDocuments();
    const transactions = await Order.find()
      .populate('user', 'name email')
      .select('user total paymentMethod paymentStatus status createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/v1/admin/settings
// @desc    Get global settings
// @access  Private/Admin
router.get('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await Setting.find();
    
    // Convert array of key-value documents into a single object for the frontend
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    res.status(200).json({ success: true, data: settingsObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/v1/admin/settings
// @desc    Update global settings
// @access  Private/Admin
router.put('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const settingsUpdates = req.body;
    
    for (const [key, value] of Object.entries(settingsUpdates)) {
      await Setting.findOneAndUpdate(
        { key },
        { value, key },
        { upsert: true, new: true }
      );
    }

    // Return the updated settings
    const settings = await Setting.find();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    res.status(200).json({ success: true, data: settingsObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/v1/admin/offers/apply-discount
// @desc    Apply store-wide discount
// @access  Private/Admin
router.post('/offers/apply-discount', protect, authorize('admin'), async (req, res) => {
  try {
    const { discountPercentage } = req.body;
    const products = await Product.find({});
    
    if (discountPercentage > 0) {
      // Apply discount
      for (const product of products) {
        if (!product.comparePrice) {
          // If no comparePrice exists, the current price becomes the comparePrice
          product.comparePrice = product.price;
        }
        // Calculate new discounted price based on the original (comparePrice)
        const discountAmount = product.comparePrice * (discountPercentage / 100);
        product.price = Math.max(0, product.comparePrice - discountAmount);
        await product.save({ validateBeforeSave: false });
      }
    } else {
      // Remove discount
      for (const product of products) {
        if (product.comparePrice) {
          product.price = product.comparePrice;
          product.comparePrice = null;
          await product.save({ validateBeforeSave: false });
        }
      }
    }

    res.status(200).json({ success: true, message: `Discount of ${discountPercentage}% applied successfully to all products.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
