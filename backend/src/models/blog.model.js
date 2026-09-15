const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  author: { type: String, default: 'Ergosoul Team' },
  readTime: { type: String, default: '5 mins read' },
  tags: [{ type: String }],
  published: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', BlogSchema);
