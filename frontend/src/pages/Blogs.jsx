import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaUser, FaArrowRight } from 'react-icons/fa';
import API, { getImageUrl } from '../services/api';

export const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get('/blogs');
        setBlogs(res.data.blogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-12 animate-fade-in">
      <div className="text-center space-y-3 max-w-lg mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">Ergosoul Design Journal</h1>
        <p className="text-xs text-gray-400">Insights into active ergonomics, luxury interior styling, and bespoke manufacturing.</p>
      </div>

      {blogs.length === 0 ? (
        <p className="text-center text-xs text-gray-400 italic">No blog posts available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <article
              key={blog._id}
              className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl overflow-hidden shadow-premium hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <Link to={`/blog/${blog.slug}`} className="block aspect-[16/10] overflow-hidden bg-gray-50">
                  <img
                    src={getImageUrl(blog.image)}
                    alt={blog.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="p-6 space-y-3">
                  {/* Meta tags */}
                  <div className="flex gap-2">
                    {blog.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/blog/${blog.slug}`}
                    className="block font-serif font-bold text-base text-gray-900 dark:text-white hover:text-amber-500 leading-snug"
                  >
                    {blog.title}
                  </Link>

                  <p className="text-xs text-gray-400 font-light line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              {/* Author & Actions footer */}
              <div className="p-6 pt-0 flex justify-between items-center text-[10px] text-gray-450 border-t dark:border-gray-850 mt-4">
                <div className="flex items-center gap-1.5">
                  <FaUser className="text-[10px] text-gray-400" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClock className="text-[10px] text-gray-400" />
                  <span>{blog.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
