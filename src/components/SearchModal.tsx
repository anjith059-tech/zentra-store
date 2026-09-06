import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Star, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { products } = useData();

  // Reset query on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query, products]);

  // Derive similar products: products not in search results
  const similarProducts = useMemo(() => {
    if (!query.trim()) return [];

    if (results.length > 0) {
      const resultIds = new Set(results.map((r) => r.id));
      const mainCategory = results[0].category;

      const categoryMatches = products.filter(
        (p) => !resultIds.has(p.id) && p.category === mainCategory
      );

      if (categoryMatches.length >= 2) {
        return categoryMatches.slice(0, 3);
      }

      const otherMatches = products.filter((p) => !resultIds.has(p.id));
      return [...categoryMatches, ...otherMatches].slice(0, 3);
    } else {
      // If no exact results found, display top recommended items
      return products.slice(0, 3);
    }
  }, [query, results, products]);

  const handleSelectProduct = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Top Search Bar Header */}
        <div className="flex items-center gap-3 px-4 py-3 sm:py-3.5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-500 stroke-[1.5] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search appliances, e.g. Air Fryer, Vacuum..."
              className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-bold tracking-[0.15em] text-slate-500 hover:text-slate-900 uppercase transition-colors shrink-0 px-1 py-2"
          >
            Cancel
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Search className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">Type to search Zentra smart appliances</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Exact Results Section */}
              {results.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Search Results ({results.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {results.map((product, idx) => (
                      <div
                        key={`${product.id}-${idx}`}
                        onClick={() => handleSelectProduct(product.id)}
                        className="flex items-center gap-3.5 p-3 bg-white hover:bg-slate-50/80 rounded-2xl cursor-pointer border border-slate-100 shadow-2xs active:scale-[0.99] transition-all group"
                      >
                        <img
                          src={formatImageUrl(product.image)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                          className="w-14 h-14 object-cover rounded-xl bg-slate-50 shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {product.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-slate-800">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-extrabold text-slate-900">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[11px] text-slate-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 ml-auto bg-amber-50 px-1.5 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{product.rating}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">No exact matches for "{query}"</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Check spelling or try browsing similar products below.</p>
                </div>
              )}

              {/* Similar Products Section */}
              {similarProducts.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Similar Products
                    </p>
                  </div>
                  <div className="space-y-2">
                    {similarProducts.map((product, idx) => (
                      <div
                        key={`${product.id}-${idx}`}
                        onClick={() => handleSelectProduct(product.id)}
                        className="flex items-center gap-3.5 p-3 bg-slate-50/60 hover:bg-slate-100/70 rounded-2xl cursor-pointer border border-slate-100/80 active:scale-[0.99] transition-all group"
                      >
                        <img
                          src={formatImageUrl(product.image)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                          className="w-14 h-14 object-cover rounded-xl bg-white shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            {product.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-extrabold text-slate-900">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[11px] text-slate-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
