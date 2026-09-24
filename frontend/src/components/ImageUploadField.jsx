import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaTrashAlt, FaLink, FaImage, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import API, { getImageUrl } from '../services/api';

export const ImageUploadField = ({
  value = '',
  onChange,
  label = 'Cover Image',
  subtitle = '',
  required = false,
  className = ''
}) => {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const compressImageToBase64 = (file, maxWidth = 900, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data?.url) {
        onChange(res.data.url);
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      console.warn('Backend image upload error, attempting client-side fallback:', err);
      // Graceful fallback: If backend returns 404 or network issue, compress image to Base64 so user is never blocked
      if (err.response?.status === 404 || !err.response) {
        try {
          const fallbackDataUrl = await compressImageToBase64(file);
          onChange(fallbackDataUrl);
          setUploadError('');
          return;
        } catch (fallbackErr) {
          console.error('Fallback compression failed:', fallbackErr);
        }
      }
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resolvedPreviewUrl = value ? getImageUrl(value) : '';

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <span>{label}</span>
          {subtitle && (
            <span className="text-[10px] text-gray-400 font-normal">({subtitle})</span>
          )}
          {required && <span className="text-red-500">*</span>}
        </label>

        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'upload' ? 'url' : 'upload');
            setUploadError('');
          }}
          className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium transition-colors"
        >
          {mode === 'upload' ? (
            <>
              <FaLink className="text-[9px]" /> Paste URL instead
            </>
          ) : (
            <>
              <FaCloudUploadAlt className="text-[11px]" /> Upload file instead
            </>
          )}
        </button>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="https://images.unsplash.com/photo-..."
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setUploadError('');
            }}
            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none text-xs focus:border-amber-500 transition-colors"
          />
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />

          {!value && !uploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-amber-500/5 ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/10 scale-[0.99]'
                  : 'border-gray-300 dark:border-gray-700 hover:border-amber-500/60'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
                <FaCloudUploadAlt />
              </div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Click to upload cover image
              </div>
              <div className="text-[10px] text-gray-400">
                Drag & drop or browse from device (JPG, PNG, WEBP up to 5MB)
              </div>
            </div>
          )}

          {uploading && (
            <div className="border border-dashed border-amber-500/60 rounded-xl p-6 text-center bg-amber-500/5 flex flex-col items-center justify-center gap-2">
              <FaSpinner className="animate-spin text-amber-500 text-xl" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Uploading image, please wait...
              </span>
            </div>
          )}

          {value && !uploading && (
            <div className="relative group rounded-xl overflow-hidden border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2 flex items-center gap-3">
              <img
                src={resolvedPreviewUrl}
                alt="Cover Preview"
                className="w-16 h-16 object-cover rounded-lg bg-gray-200 dark:bg-gray-900 border dark:border-gray-700 flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/100x100?text=Invalid+Image';
                }}
              />
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400 mb-0.5">
                  <FaCheckCircle className="text-[10px]" /> Image Ready
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-mono">
                  {value}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors"
                  >
                    Change Image
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <FaTrashAlt className="text-[9px]" /> Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-500 font-semibold mt-1">
          {uploadError}
        </p>
      )}
    </div>
  );
};

export default ImageUploadField;
