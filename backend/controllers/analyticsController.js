const Order = require('../models/Order');
const Visitor = require('../models/Visitor');

// @desc    Get marketing analytics
// @route   GET /api/v1/analytics/marketing
// @access  Private/Admin
const getMarketingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    let visitorDateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Include full end day when a date-only string or midnight timestamp is passed
      if (
        (typeof endDate === 'string' && endDate.length <= 10) ||
        (end.getUTCHours() === 0 && end.getUTCMinutes() === 0 && end.getUTCSeconds() === 0 && end.getUTCMilliseconds() === 0)
      ) {
        end.setUTCHours(23, 59, 59, 999);
      }

      dateFilter = {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      };
      visitorDateFilter = {
        lastVisit: {
          $gte: start,
          $lte: end,
        },
      };
    }

    const [
      totalVisitorsData,
      orderMetrics,
      ordersBySource,
      ordersByCampaign,
      topLandingPages,
      topCampaigns,
      topReferrers
    ] = await Promise.all([
      Visitor.countDocuments(visitorDateFilter),
      
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$paymentStatus", "paid"] },
                      { $ne: ["$status", "returned"] },
                      { $ne: ["$status", "cancelled"] }
                    ] 
                  }, 
                  "$total", 
                  0
                ] 
              } 
            },
            aov: { $avg: "$total" }
          }
        }
      ]),

      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $ifNull: ["$attribution.utmSource", "Direct"] },
            orders: { $sum: 1 },
            revenue: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$paymentStatus", "paid"] },
                      { $ne: ["$status", "returned"] },
                      { $ne: ["$status", "cancelled"] }
                    ] 
                  }, 
                  "$total", 
                  0
                ] 
              } 
            }
          }
        },
        { $sort: { revenue: -1, orders: -1 } }
      ]),

      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $ifNull: ["$attribution.utmCampaign", "None"] },
            orders: { $sum: 1 },
            revenue: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$paymentStatus", "paid"] },
                      { $ne: ["$status", "returned"] },
                      { $ne: ["$status", "cancelled"] }
                    ] 
                  }, 
                  "$total", 
                  0
                ] 
              } 
            }
          }
        },
        { $sort: { revenue: -1, orders: -1 } }
      ]),

      Visitor.aggregate([
        { $match: visitorDateFilter },
        {
          $group: {
            _id: "$landingPage",
            visitors: { $sum: 1 }
          }
        },
        { $sort: { visitors: -1 } },
        { $limit: 10 }
      ]),

      Visitor.aggregate([
        { $match: visitorDateFilter },
        {
          $group: {
            _id: { $ifNull: ["$utmParameters.campaign", "None"] },
            visitors: { $sum: 1 }
          }
        },
        { $sort: { visitors: -1 } },
        { $limit: 10 }
      ]),

      Visitor.aggregate([
        { $match: visitorDateFilter },
        {
          $group: {
            _id: { $ifNull: ["$referrer", "Direct"] },
            visitors: { $sum: 1 }
          }
        },
        { $sort: { visitors: -1 } },
        { $limit: 10 }
      ])
    ]);

    const totalVisitors = totalVisitorsData || 0;
    const metrics = orderMetrics[0] || { totalOrders: 0, totalRevenue: 0, aov: 0 };
    const conversionRate = totalVisitors > 0 ? ((metrics.totalOrders / totalVisitors) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalVisitors,
          totalOrders: metrics.totalOrders,
          totalRevenue: metrics.totalRevenue,
          aov: metrics.aov,
          conversionRate: Number(conversionRate)
        },
        ordersBySource: ordersBySource.map(x => ({ source: x._id, orders: x.orders, revenue: x.revenue })),
        ordersByCampaign: ordersByCampaign.map(x => ({ campaign: x._id, orders: x.orders, revenue: x.revenue })),
        topLandingPages: topLandingPages.map(x => ({ page: x._id, visitors: x.visitors })),
        topCampaigns: topCampaigns.map(x => ({ campaign: x._id, visitors: x.visitors })),
        topReferrers: topReferrers.map(x => ({ referrer: x._id, visitors: x.visitors }))
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, error: 'Server Error generating analytics' });
  }
};

module.exports = {
  getMarketingAnalytics
};
