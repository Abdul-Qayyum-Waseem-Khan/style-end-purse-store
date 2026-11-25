const Product = require('../models/Product');
const Category = require('../models/Category');
const Blog = require('../models/Blog');

const generateSitemap = async (req, res) => {
  const host = req.get('host');
  const dynamicOrigin = host && !host.includes('localhost') ? `${req.protocol}://${host}` : null;
  const baseUrl = (process.env.CLIENT_URL || dynamicOrigin || 'https://styleendpurse.com').replace(/\/$/, '');

  try {
    // Fetch dynamic data
    const products = await Product.find({ isActive: true }).select('slug updatedAt');
    const categories = await Category.find({ isActive: true }).select('slug updatedAt');
    const blogs = await Blog.find({ isActive: true }).select('slug updatedAt');

    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/category/all', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/returns', priority: '0.6', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.6', changefreq: 'monthly' },
      { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add products
    products.forEach(product => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product/${product.slug}</loc>\n`;
      if (product.updatedAt) {
        xml += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add categories
    categories.forEach(category => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/category/${category.slug}</loc>\n`;
      if (category.updatedAt) {
        xml += `    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add blogs
    blogs.forEach(blog => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blogs/${blog.slug}</loc>\n`;
      if (blog.updatedAt) {
        xml += `    <lastmod>${blog.updatedAt.toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};

module.exports = { generateSitemap };
