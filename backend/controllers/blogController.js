const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const createBlog = async (req, res) => {
  let blogData = { ...req.body };
  blogData.author = req.user.userId;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'style_end_purse_blogs' });
    fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    blogData.coverImage = result.secure_url;
  }

  if (typeof blogData.tags === 'string') {
    blogData.tags = blogData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }
  if (typeof blogData.gallery === 'string') {
    try {
      blogData.gallery = JSON.parse(blogData.gallery);
    } catch (err) {
      blogData.gallery = [];
    }
  }
  if (blogData.isActive === 'true') blogData.isActive = true;
  if (blogData.isActive === 'false') blogData.isActive = false;

  const blog = await Blog.create(blogData);
  res.status(201).json({ data: blog });
};

const getAllBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const query = {};
  // Public route only shows active blogs
  if (req.query.admin !== 'true') {
    query.isActive = true;
  }

  const blogs = await Blog.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: { path: 'author', select: 'name avatar' },
  });

  res.status(200).json({ data: blogs.docs, pagination: blogs });
};

const getBlog = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name avatar');
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.status(200).json({ data: blog });
};

const updateBlog = async (req, res) => {
  let blogData = { ...req.body };

  const existingBlog = await Blog.findOne({ slug: req.params.slug });
  if (!existingBlog) return res.status(404).json({ error: 'Blog not found' });

  if (req.file) {
    // Delete old image from cloudinary if it exists
    if (existingBlog.coverImage && existingBlog.coverImage.includes('cloudinary')) {
      const publicId = existingBlog.coverImage.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting image from cloudinary:', err);
      }
    }

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'style_end_purse_blogs' });
    fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    blogData.coverImage = result.secure_url;
  }

  if (typeof blogData.tags === 'string') {
    blogData.tags = blogData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }
  if (typeof blogData.gallery === 'string') {
    try {
      blogData.gallery = JSON.parse(blogData.gallery);
    } catch (err) {
      blogData.gallery = [];
    }
  }
  if (blogData.isActive === 'true') blogData.isActive = true;
  if (blogData.isActive === 'false') blogData.isActive = false;

  const blog = await Blog.findOneAndUpdate({ slug: req.params.slug }, blogData, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.status(200).json({ data: blog });
};

const deleteBlog = async (req, res) => {
  const blog = await Blog.findOneAndDelete({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ error: 'Blog not found' });

  // Delete image from cloudinary if it exists
  if (blog.coverImage && blog.coverImage.includes('cloudinary')) {
    const publicId = blog.coverImage.split('/').slice(-2).join('/').split('.')[0];
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Error deleting image from cloudinary:', err);
    }
  }

  res.status(200).json({ message: 'Blog deleted' });
};

module.exports = { createBlog, getAllBlogs, getBlog, updateBlog, deleteBlog };
