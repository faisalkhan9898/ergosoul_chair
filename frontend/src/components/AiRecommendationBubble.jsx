import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes, FaSearch, FaArrowRight } from 'react-icons/fa';
import API from '../services/api';
import { Link } from 'react-router-dom';

export const AiRecommendationBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState(
    "Describe your ideal chair or seating issue (e.g. 'I sit for 10 hours and my shoulders ache', 'minimalist green velvet stool') and our AI matching engine will suggest the perfect option."
  );

  const handleAiSearch = async (prefilledText) => {
    const searchText = prefilledText || query;
    if (!searchText.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setQuery(searchText);

    try {
      // Fetch products
      const response = await API.get('/products', { params: { limit: 100 } });
      const allProducts = response.data.products;

      const words = searchText.toLowerCase();
      
      // Basic keyword scoring algorithm
      let scored = allProducts.map(p => {
        let score = 0;
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        const category = p.category.toLowerCase();
        const purpose = p.purpose.toLowerCase();
        const mat = p.specs?.material?.toLowerCase() || '';
        const arm = p.specs?.armRest?.toLowerCase() || '';
        const head = p.specs?.headRest?.toLowerCase() || '';

        // Match categories
        if (words.includes('gaming') && category.includes('gaming')) score += 10;
        if (words.includes('office') && (category.includes('office') || category.includes('mesh') || purpose.includes('office'))) score += 10;
        if (words.includes('dining') && category.includes('dining')) score += 10;
        if (words.includes('wood') && (mat.includes('wood') || mat.includes('oak') || mat.includes('pine'))) score += 8;
        if (words.includes('mesh') && mat.includes('mesh')) score += 8;
        if (words.includes('leather') && mat.includes('leather')) score += 8;
        if (words.includes('velvet') && mat.includes('velvet')) score += 8;
        if (words.includes('child') || words.includes('kids') && category.includes('kids')) score += 10;
        
        // Match complaints
        if (words.includes('pain') || words.includes('ache') || words.includes('back') || words.includes('neck') || words.includes('posture')) {
          if (arm.includes('4d') || arm.includes('3d') || head.includes('adjustable') || desc.includes('lumbar') || desc.includes('ergonomic')) {
            score += 8;
          }
        }
        
        // General text match
        if (name.includes(words)) score += 5;
        const queryTerms = words.split(' ');
        queryTerms.forEach(term => {
          if (term.length > 2) {
            if (name.includes(term)) score += 3;
            if (desc.includes(term)) score += 1;
            if (category.includes(term)) score += 2;
          }
        });

        return { product: p, score };
      });

      // Filter and sort
      const filtered = scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product)
        .slice(0, 3); // limit top 3

      setResults(filtered);

      if (filtered.length > 0) {
        setRecommendationMessage(
          `Based on your description, I found ${filtered.length} matches featuring specialized ergonomics, lumbar contours, or designer fabrics.`
        );
      } else {
        setRecommendationMessage(
          "I couldn't identify specific matches for that description. Try general keywords like 'mesh office support', 'dining solid oak', or 'velvet lobby seat'."
        );
      }
    } catch (err) {
      console.error(err);
      setRecommendationMessage("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-full shadow-luxury transition-all duration-300 transform hover:scale-105 active:scale-95 border border-amber-400"
        >
          <FaRobot className="text-xl animate-bounce" />
          <span className="font-semibold text-sm hidden sm:inline">AI Recommend</span>
        </button>
      )}

      {/* Recommend Window */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-luxury flex flex-col border border-gray-100 dark:border-gray-800 transition-all duration-300">
          {/* Header */}
          <div className="p-4 bg-primary text-white rounded-t-2xl flex items-center justify-between dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FaRobot className="text-amber-500 text-lg" />
              <h4 className="font-semibold text-sm font-serif">Ergosoul AI Advisor</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors text-white"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* AI content */}
          <div className="p-4 flex-1 space-y-4 max-h-[350px] overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              {recommendationMessage}
            </div>

            {/* Suggestions buttons */}
            {!hasSearched && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase block">Suggested Prompts</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    'Ergonomic chair for lower back pain',
                    'Solid oak wooden dining chair',
                    'Velvet lounge accent chair'
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAiSearch(p)}
                      className="text-left text-xs px-3 py-2 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-gray-700 dark:text-gray-300 rounded-lg border dark:border-gray-700 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {hasSearched && results.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold tracking-wider uppercase block">Top Recommendations</span>
                <div className="space-y-2">
                  {results.map((product) => (
                    <div
                      key={product._id}
                      className="flex gap-3 bg-white dark:bg-gray-800 p-2.5 rounded-xl border dark:border-gray-700 shadow-sm items-center"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold truncate text-gray-900 dark:text-white">
                          {product.name}
                        </h5>
                        <p className="text-[10px] text-gray-400 truncate">
                          {product.specs?.material} • {product.specs?.armRest || 'Fixed Arms'}
                        </p>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          ${product.price}
                        </span>
                      </div>
                      <Link
                        to={`/product/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="p-2 bg-gray-100 hover:bg-amber-500 hover:text-gray-900 text-gray-500 rounded-lg transition-all dark:bg-gray-700 dark:text-white"
                        title="View details"
                      >
                        <FaArrowRight className="text-xs" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Form Search input */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              placeholder="Search specifications or posture needs..."
              className="flex-1 px-3 py-1.5 border rounded-lg text-xs outline-none focus:border-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              onClick={() => handleAiSearch()}
              className="px-3 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg flex items-center justify-center font-semibold text-xs transition-colors"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRecommendationBubble;
