const Page = require('../models/Page');

const createOrUpdatePage = async (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'Slug is required' });

  let page = await Page.findOne({ slug });
  if (page) {
    page = await Page.findOneAndUpdate({ slug }, req.body, { returnDocument: 'after', runValidators: true });
  } else {
    page = await Page.create(req.body);
  }

  res.status(200).json({ data: page });
};

const getPage = async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, isActive: true });
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.status(200).json({ data: page });
};

const getAllPages = async (req, res) => {
  const pages = await Page.find({}).sort({ createdAt: -1 });
  res.status(200).json({ data: pages });
};

module.exports = { createOrUpdatePage, getPage, getAllPages };
