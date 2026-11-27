const Product = require('../models/Product');
const Category = require('../models/Category');
const Blog = require('../models/Blog');
const Page = require('../models/Page');

const escapeXml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const generateSitemap = async (req, res) => {
  const forwardedHost = req.get('x-forwarded-host');
  const isFrontendHost =
    forwardedHost &&
    !forwardedHost.includes('localhost') &&
    !forwardedHost.includes('style-end-purse-store.vercel.app');
  const baseUrl = (
    process.env.CLIENT_URL ||
    (isFrontendHost ? `https://${forwardedHost}` : 'https://styleendpurse.com')
  ).replace(/\/$/, '');

  try {
    // Fetch dynamic data in parallel
    const [products, categories, blogs, pages] = await Promise.all([
      Product.find({ isActive: true }).select('slug updatedAt').lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
      Blog.find({ isActive: true }).select('slug updatedAt').lean(),
      Page.find({ isActive: true }).select('slug updatedAt').lean(),
    ]);

    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/category/all', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/returns', priority: '0.6', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.6', changefreq: 'monthly' },
      { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
    ];

    const staticSlugs = new Set(staticPages.map((p) => p.path.replace(/^\//, '')));

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const appendUrl = (locPath, changefreq, priority, updatedAt) => {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}${locPath}`)}</loc>\n`;
      if (updatedAt) {
        xml += `    <lastmod>${new Date(updatedAt).toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    };

    // Add static pages
    staticPages.forEach((page) => {
      appendUrl(page.path, page.changefreq, page.priority);
    });

    // Add dynamic CMS pages (if not already in staticPages)
    pages.forEach((page) => {
      if (page.slug && !staticSlugs.has(page.slug)) {
        appendUrl(`/${page.slug}`, 'monthly', '0.7', page.updatedAt);
      }
    });

    // Add products
    products.forEach((product) => {
      if (product.slug) {
        appendUrl(`/product/${product.slug}`, 'daily', '0.9', product.updatedAt);
      }
    });

    // Add categories
    categories.forEach((category) => {
      if (category.slug) {
        appendUrl(`/category/${category.slug}`, 'weekly', '0.8', category.updatedAt);
      }
    });

    // Add blogs
    blogs.forEach((blog) => {
      if (blog.slug) {
        appendUrl(`/blogs/${blog.slug}`, 'monthly', '0.7', blog.updatedAt);
      }
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};

module.exports = { generateSitemap };
