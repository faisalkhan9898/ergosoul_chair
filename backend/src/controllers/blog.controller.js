const Blog = require('../models/blog.model');

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      res.status(404);
      throw new Error('Blog post not found');
    }
    res.json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a blog post (Admin only)
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, image, tags, readTime } = req.body;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    const blogExists = await Blog.findOne({ slug });
    if (blogExists) {
      res.status(400);
      throw new Error('A blog post with a similar title already exists');
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      image: image || 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600',
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      readTime
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post (Admin only)
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  deleteBlog
};
