const Category = require('../models/Category');
const slugify = require('slugify');

const getAllCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parentCategory', 'name slug')
    .sort('name');
  res.status(200).json({ success: true, data: categories });
};

const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, isActive: true })
    .populate('parentCategory', 'name slug');

  if (!category) {
    return res.status(404).json({ success: false, error: `No category with slug : ${slug}` });
  }

  // We'll leave fetching products to the product routes by querying ?category=id
  res.status(200).json({ success: true, data: category });
};

const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  }

  const category = await Category.findByIdAndUpdate(id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!category) {
    return res.status(404).json({ success: false, error: `No category with id : ${id}` });
  }

  res.status(200).json({ success: true, data: category });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({ success: false, error: `No category with id : ${id}` });
  }

  await category.deleteOne();
  res.status(200).json({ success: true, data: {} });
};

const getAdminCategories = async (req, res) => {
  const categories = await Category.find({})
    .populate('parentCategory', 'name slug')
    .sort('name');
  res.status(200).json({ success: true, data: categories });
};

module.exports = {
  getAllCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
