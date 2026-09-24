import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaUser } from 'react-icons/fa';
import API, { getImageUrl } from '../services/api';

export const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/blogs/${slug}`);
        setBlog(res.data.blog);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-20 font-sans">
        <p className="text-sm text-gray-400">Blog post not found.</p>
        <button onClick={() => navigate('/blogs')} className="mt-4 px-6 py-2 bg-primary text-white rounded-full">
          Back to Journal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans space-y-8 animate-fade-in">
      <button
        onClick={() => navigate('/blogs')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-500 transition-colors"
      >
        <FaArrowLeft /> Back to Journal
      </button>

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
          {blog.title}
        </h1>
        
        {/* Meta */}
        <div className="flex gap-6 items-center text-xs text-gray-400 font-semibold border-b dark:border-gray-850 pb-4">
          <div className="flex items-center gap-2">
            <FaUser className="text-sm text-gray-400" />
            <span>By {blog.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-sm text-gray-400" />
            <span>{blog.readTime}</span>
          </div>
        </div>
      </div>

      {/* Large Featured Image */}
      <div className="rounded-3xl overflow-hidden aspect-[16/9] shadow-premium bg-gray-50">
        <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-light leading-relaxed space-y-6">
        <p className="font-serif font-bold text-lg text-gray-900 dark:text-white italic leading-relaxed">
          "{blog.excerpt}"
        </p>
        <div className="space-y-4 whitespace-pre-line pt-2">
          {blog.content}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
