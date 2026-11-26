const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('slugify');

// Helper to resolve category query into MongoDB filter
const buildCategoryFilter = async (categoryParam, categoriesParam) => {
  const rawParams = [
    ...(categoryParam && categoryParam !== 'all' ? [categoryParam] : []),
    ...(categoriesParam ? categoriesParam.split(',').map(c => c.trim()).filter(Boolean) : [])
  ];

  if (rawParams.length === 0) return null;

  const objectIds = [];
  const slugs = [];

  rawParams.forEach(p => {
    if (p.match(/^[0-9a-fA-F]{24}$/)) {
      objectIds.push(p);
    } else {
      slugs.push(p.toLowerCase());
    }
  });

  // Find categories matching by slug or regex
  const matchedCategories = await Category.find({
    $or: [
      { _id: { $in: objectIds } },
      { slug: { $in: slugs } },
      ...slugs.map(s => ({ slug: { $regex: s.replace(/s$/, ''), $options: 'i' } })),
      ...slugs.map(s => ({ name: { $regex: s.replace(/s$/, ''), $options: 'i' } }))
    ]
  });

  const catIds = [...new Set([...objectIds, ...matchedCategories.map(c => c._id)])];

  const orConditions = [];
  if (catIds.length > 0) {
    orConditions.push({ category: { $in: catIds } });
  }

  // Also match by productType or keyword if special category
  for (const s of slugs) {
    if (s.includes('set') || s.includes('piece') || s.includes('peice')) {
      orConditions.push({ productType: 'set' });
      orConditions.push({ name: { $regex: 'set|piece|3-in-1|trio', $options: 'i' } });
      orConditions.push({ tags: { $in: [/set/i, /3-piece/i, /trio/i] } });
    }
    if (s.includes('shoe') || s.includes('heel') || s.includes('footwear')) {
      orConditions.push({ name: { $regex: 'shoe|heel|stiletto|pump|sandal|footwear', $options: 'i' } });
      orConditions.push({ tags: { $in: [/shoe/i, /heel/i, /footwear/i] } });
    }
    if (s.includes('pouch') || s.includes('wallet') || s.includes('walelt') || s.includes('clutch')) {
      orConditions.push({ name: { $regex: 'pouch|wallet|clutch|cardholder', $options: 'i' } });
      orConditions.push({ tags: { $in: [/pouch/i, /wallet/i, /clutch/i] } });
    }
    if (s.includes('handbag') || s.includes('bag') || s.includes('tote') || s.includes('purse')) {
      orConditions.push({ name: { $regex: 'bag|tote|purse|crossbody|handbag|satchel', $options: 'i' } });
      orConditions.push({ tags: { $in: [/bag/i, /tote/i, /purse/i, /handbag/i] } });
    }
  }

  if (orConditions.length === 0) return null;
  return orConditions.length === 1 ? orConditions[0] : { $or: orConditions };
};

// Smart search query parser handling typos, multiple words, and category terms
const buildSearchFilter = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return null;

  const raw = searchTerm.trim().toLowerCase();

  // Normalize common typos and words
  const normalized = raw
    .replace(/\bpeice\b/g, 'piece')
    .replace(/\bwalelts\b/g, 'wallets')
    .replace(/\bwalelt\b/g, 'wallet')
    .replace(/\band\b/g, ' ')
    .replace(/[,&+]/g, ' ');

  const tokens = normalized.split(/\s+/).filter(Boolean);

  // If user searched "new arrivals" or "latest"
  if (normalized.includes('new arrival') || normalized.includes('latest') || normalized === 'new') {
    return null; // Will sort by newest
  }

  // Find any category that matches search tokens
  const matchingCategories = await Category.find({
    $or: tokens.map(t => ({ name: { $regex: t, $options: 'i' } }))
  });

  const categoryIds = matchingCategories.map(c => c._id);

  const orClauses = [
    // Full search string match
    { name: { $regex: raw, $options: 'i' } },
    { description: { $regex: raw, $options: 'i' } },
    { tags: { $in: [new RegExp(raw, 'i')] } },
  ];

  if (categoryIds.length > 0) {
    orClauses.push({ category: { $in: categoryIds } });
  }

  // Token matches
  tokens.forEach(token => {
    if (token.length > 1) {
      orClauses.push({ name: { $regex: token, $options: 'i' } });
      orClauses.push({ description: { $regex: token, $options: 'i' } });
      orClauses.push({ tags: { $in: [new RegExp(token, 'i')] } });
      
      if (token === 'set' || token === 'piece' || token === '3') {
        orClauses.push({ productType: 'set' });
      }
    }
  });

  return { $or: orClauses };
};

const getProducts = async (req, res) => {
  const { category, categories, search, minPrice, maxPrice, sort, page, limit } = req.query;

  const andConditions = [{ isActive: true }];

  // 1. Category Filtering
  const categoryFilter = await buildCategoryFilter(category, categories);
  if (categoryFilter) {
    andConditions.push(categoryFilter);
  }

  // 2. Search Filtering
  const searchFilter = await buildSearchFilter(search);
  if (searchFilter) {
    andConditions.push(searchFilter);
  }

  // 3. Price Range
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    andConditions.push({ price: priceFilter });
  }

  const queryObject = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

  // 4. Sorting
  const sortOptions = {};
  if (sort === 'price_asc') sortOptions.price = 1;
  else if (sort === 'price_desc') sortOptions.price = -1;
  else sortOptions.createdAt = -1; // default newest / new arrivals

  // Pagination Config
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 12,
    sort: sortOptions,
    populate: { path: 'category', select: 'name slug' }
  };

  const products = await Product.paginate(queryObject, options);

  res.status(200).json({
    success: true,
    data: products.docs,
    pagination: {
      totalDocs: products.totalDocs,
      limit: products.limit,
      totalPages: products.totalPages,
      page: products.page,
      pagingCounter: products.pagingCounter,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
    }
  });
};

const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .limit(8);
  res.status(200).json({ success: true, data: products });
};

const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ success: false, error: `No product with slug: ${slug}` });
  }

  res.status(200).json({ success: true, data: product });
};

// Helper to safely parse JSON-stringified fields from multipart/form-data
const parseProductBody = (rawBody) => {
  const data = { ...rawBody };
  const jsonFields = ['colors', 'setOptions', 'dimensions', 'badges', 'tags', 'images'];

  for (const field of jsonFields) {
    if (typeof data[field] === 'string') {
      const trimmed = data[field].trim();
      if (!trimmed) {
        data[field] = field === 'dimensions' || field === 'badges' ? {} : [];
      } else {
        try {
          data[field] = JSON.parse(trimmed);
        } catch {
          if (field === 'tags') {
            data[field] = trimmed.split(',').map((t) => t.trim()).filter(Boolean);
          }
        }
      }
    }
  }

  for (const boolField of ['isActive', 'isFeatured', 'isOnSale']) {
    if (data[boolField] === 'true') data[boolField] = true;
    else if (data[boolField] === 'false') data[boolField] = false;
  }

  for (const numField of ['price', 'comparePrice', 'stock']) {
    if (data[numField] === '' || data[numField] === 'undefined' || data[numField] === 'null') {
      delete data[numField];
    } else if (typeof data[numField] === 'string' && !Number.isNaN(Number(data[numField]))) {
      data[numField] = Number(data[numField]);
    }
  }

  return data;
};

const createProduct = async (req, res) => {
  const productData = parseProductBody(req.body);
  const { name, category, price, stock, description } = productData;
  if (!name || !category || price === undefined || stock === undefined || !description) {
    return res.status(400).json({ success: false, error: 'Please provide all required fields' });
  }

  let slug = slugify(name, { lower: true, strict: true });
  const slugExists = await Product.findOne({ slug });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }
  productData.slug = slug;

  const product = await Product.create(productData);
  res.status(201).json({ success: true, data: product });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const productData = parseProductBody(req.body);

  if (productData.name) {
    productData.slug = slugify(productData.name, { lower: true, strict: true });
  }

  const product = await Product.findByIdAndUpdate(id, productData, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ success: false, error: `No product with id: ${id}` });
  }

  res.status(200).json({ success: true, data: product });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ success: false, error: `No product with id: ${id}` });
  }

  await product.deleteOne();
  res.status(200).json({ success: true, data: {} });
};

const getAdminProducts = async (req, res) => {
  const { category, search, status, sort, page, limit } = req.query;

  const queryObject = {};

  if (status && status !== 'all') {
    queryObject.isActive = status === 'active';
  }

  if (category && category !== 'all') {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      queryObject.category = category;
    } else {
      const cat = await Category.findOne({ slug: category });
      if (cat) queryObject.category = cat._id;
    }
  }

  if (search) {
    queryObject.name = { $regex: search, $options: 'i' };
  }

  const sortOptions = {};
  if (sort === 'price_asc') sortOptions.price = 1;
  else if (sort === 'price_desc') sortOptions.price = -1;
  else sortOptions.createdAt = -1;

  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 12,
    sort: sortOptions,
    populate: { path: 'category', select: 'name slug' }
  };

  const products = await Product.paginate(queryObject, options);

  res.status(200).json({
    success: true,
    data: products.docs,
    pagination: {
      totalDocs: products.totalDocs,
      limit: products.limit,
      totalPages: products.totalPages,
      page: products.page,
      pagingCounter: products.pagingCounter,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
    }
  });
};

const bulkUpdateProducts = async (req, res) => {
  const { updates } = req.body;
  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ success: false, error: 'Please provide array of updates' });
  }

  const bulkOps = updates.map(item => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: item.data }
    }
  }));

  await Product.bulkWrite(bulkOps);
  res.status(200).json({ success: true, message: 'Products updated successfully' });
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  bulkUpdateProducts,
};
