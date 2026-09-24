import React, { useState } from 'react';
import { FaBook } from 'react-icons/fa';
import API from '../services/api';
import ImageUploadField from '../components/ImageUploadField';

export const AdminBlogs = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [readTime, setReadTime] = useState('5 mins read');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const handlePostBlog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await API.post('/blogs', {
        title,
        excerpt,
        content,
        readTime,
        tags,
        image: image || undefined
      });

      setFormSuccess('Article posted successfully!');
      setTitle('');
      setExcerpt('');
      setContent('');
      setTags('');
      setImage('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post blog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
          <FaBook className="text-amber-500" />
          Manage Blogs
        </h1>
        <p className="text-[10px] text-gray-400">Post seating guidelines, luxury templates, or ergonomic posture checks.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 font-semibold">
        <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white border-b dark:border-gray-850 pb-2.5">
          Write Design Journal Article
        </h3>

        {formError && <p className="text-red-500 font-semibold">{formError}</p>}
        {formSuccess && <p className="text-green-500 font-semibold">{formSuccess}</p>}

        <form onSubmit={handlePostBlog} className="space-y-4">
          <div className="space-y-1">
            <span>Article Title</span>
            <input
              type="text"
              required
              placeholder="e.g. Setting Up an Ergonomic Home Office"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <span>Excerpt (Brief Abstract Summary)</span>
            <input
              type="text"
              required
              placeholder="A brief 1-sentence abstract summary of the article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <span>Full Markdown/HTML Content</span>
            <textarea
              rows="6"
              required
              placeholder="Write the full body content details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span>Read Time</span>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <span>Tags (Comma separated)</span>
              <input
                type="text"
                placeholder="e.g. Ergonomics, Office, Health"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <ImageUploadField
            label="Featured Image"
            subtitle="Optional"
            value={image}
            onChange={setImage}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-lg uppercase tracking-wider transition-colors"
          >
            {submitting ? 'Posting...' : 'Publish Article'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminBlogs;
