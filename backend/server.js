require('dotenv').config();
require('express-async-errors');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

// Serverless DB Connection Middleware
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null,
  'https://styleendpurse.com',
  'https://www.styleendpurse.com',
  'http://localhost:5173',
  'http://localhost:5000'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, or same-origin GET)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        // Do not throw an error, just disable CORS headers.
        // Throwing an error causes a 500 response, which breaks same-origin POST requests.
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Base Route (dev/API health check)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/categories', require('./routes/categoryRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));
app.use('/api/v1/blogs', require('./routes/blogRoutes'));
app.use('/api/v1/visitors', require('./routes/visitorRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/pages', require('./routes/pageRoutes'));
app.use('/api/v1/banners', require('./routes/bannerRoutes'));
app.use('/api/v1/contact', require('./routes/contactRoutes'));
app.use('/api/v1/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/v1/campaigns', require('./routes/campaignRoutes'));
app.use('/api/v1/coupons', require('./routes/couponRoutes'));
app.use('/api/v1/returns', require('./routes/returnRoutes'));
app.use('/api/v1/store-reviews', require('./routes/storeReviewRoutes'));
app.use('/api/v1/store', require('./routes/storeRoutes'));
app.use('/api/v1/settings', require('./routes/settingRoutes'));
app.use('/api/hero-banner', require('./routes/heroBanner.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/sitemap', require('./routes/sitemapRoutes'));
app.use('/sitemap.xml', require('./routes/sitemapRoutes'));
app.use('/api/v1/security', require('./routes/securityRoutes'));


const PORT = process.env.PORT || 5000;

// Serve Frontend Static Build (for custom hosting / VPS / cPanel)
const distPath = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // API 404 handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
  });

  // SPA Fallback for React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Handle 404 for unknown routes in dev
  app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
  });
}

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error', stack: err.stack });
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
