import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, Heart, HeartOff, SearchX, X, ChevronDown, Grid, Coffee, Home, Sparkles, Cpu } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { BackButton } from '../components/BackButton';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';

const getCategoryIcon = (catName: string) => {
  const lowerCat = catName.toLowerCase();
  if (lowerCat.includes('kitchen')) return Coffee;
  if (lowerCat.includes('essential') || lowerCat.includes('home')) return Home;
  if (lowerCat.includes('clean')) return Sparkles;
  if (lowerCat.includes('smart')) return Cpu;
  return Grid;
};

const sortOptions = [
  { value: 'featured', label: 'Featured First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
] as const;

export const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useCart();
  const { products, categories } = useData();

  const categoryParam = searchParams.get('category') || 'all';
  const filterParam = searchParams.get('filter');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(filterParam === 'wishlist');

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state with URL params
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (filterParam === 'wishlist') {
      setShowOnlyWishlist(true);
    } else {
      setShowOnlyWishlist(false);
    }
  }, [categoryParam, filterParam]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setShowOnlyWishlist(false);
    setVisibleCount(6);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    searchParams.delete('filter');
    setSearchParams(searchParams);
  };

  const handleWishlistToggle = () => {
    const nextState = !showOnlyWishlist;
    setShowOnlyWishlist(nextState);
    if (nextState) {
      searchParams.set('filter', 'wishlist');
    } else {
      searchParams.delete('filter');
    }
    setSearchParams(searchParams);
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Wishlist filter
    if (showOnlyWishlist) {
      result = result.filter((p) => wishlist.includes(p.id));
    } else if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, showOnlyWishlist, wishlist]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const categoriesTabs = [
    { name: 'All Appliances', slug: 'all' },
    ...categories.map((c) => ({ name: c.name, slug: c.slug })),
  ];

  return (
    <div id="shop-page" className="px-4 py-4 space-y-5 pb-16 max-w-4xl md:max-w-7xl mx-auto md:px-6 lg:px-8 md:py-8 md:space-y-8">
      <BackButton onClick={() => navigate(-1)} />

      {/* Header Title & Badge */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {showOnlyWishlist
            ? 'Your Saved Wishlist'
            : selectedCategory === 'all'
            ? 'All Appliances'
            : categories.find((c) => c.slug === selectedCategory)?.name || 'Shop Appliances'}
        </h1>
        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit mt-2">
          {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products in catalog..."
          className="w-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 rounded-2xl p-4 pl-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Category Scroll Pill Buttons */}
      <div className="flex overflow-x-auto gap-2.5 pb-2 pt-1 no-scrollbar -mx-4 px-4 items-center">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold shrink-0 transition-all duration-300 border ${
            showOnlyWishlist
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20 font-bold'
              : 'bg-white border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500'
          }`}
        >
          <Heart
            className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
              showOnlyWishlist
                ? 'fill-white text-white scale-110'
                : 'fill-rose-500 text-rose-500 group-hover:fill-white group-hover:text-white'
            }`}
          />
          <span>Wishlist ({wishlist.length})</span>
        </button>

        {categoriesTabs.map((tab) => {
          const isActive = !showOnlyWishlist && selectedCategory === tab.slug;
          const IconComponent = getCategoryIcon(tab.slug || tab.name);

          return (
            <button
              key={tab.slug}
              onClick={() => handleCategoryChange(tab.slug)}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold shrink-0 transition-all duration-300 border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900'
              }`}
            >
              <IconComponent
                className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                }`}
              />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sorting Selector */}
      <div className="flex items-center justify-between text-xs py-1">
        <span className="text-slate-500 font-medium">Sort by:</span>
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 text-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span>{sortOptions.find((o) => o.value === sortBy)?.label || 'Featured First'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
              {sortOptions.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors ${
                      isActive ? 'font-bold text-slate-900 bg-slate-50/60' : ''
                    }`}
                  >
                    {option.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid with Stagger Animation */}
      {displayedProducts.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {displayedProducts.map((product, idx) => (
            <motion.div
              key={`${product.id}-${idx}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', damping: 20 },
                },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.12,
                delayChildren: 0.05,
              },
            },
          }}
          className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm my-2"
        >
          {/* Continuous Floating Icon */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 20, stiffness: 100 },
              },
            }}
            className="inline-block mb-5"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-16 h-16 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-2xs"
            >
              {showOnlyWishlist ? (
                <HeartOff className="w-7 h-7 text-rose-500" />
              ) : (
                <SearchX className="w-7 h-7 text-blue-600" />
              )}
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h3
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 20, stiffness: 100 },
              },
            }}
            className="text-xl font-bold text-slate-900 mb-2 tracking-tight"
          >
            {showOnlyWishlist ? 'Your Wishlist is Empty' : 'No Matches Found'}
          </motion.h3>

          {/* Subtitle */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 20, stiffness: 100 },
              },
            }}
            className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed"
          >
            {showOnlyWishlist
              ? 'Explore our collection and save your favorite appliances here.'
              : "We couldn't find any appliances matching your current criteria. Try adjusting your search or clearing your filters."}
          </motion.p>

          {/* Ghost Button with Scale-Up on Hover */}
          <motion.button
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 20, stiffness: 100 },
              },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setShowOnlyWishlist(false);
              searchParams.delete('category');
              searchParams.delete('filter');
              setSearchParams(searchParams);
            }}
            className="inline-flex items-center justify-center gap-2 border border-blue-600/30 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-xs cursor-pointer"
          >
            {showOnlyWishlist ? 'Browse Appliances' : 'Clear Filters'}
          </motion.button>
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 py-3.5 rounded-2xl text-xs font-bold shadow-xs active:scale-98 transition-all"
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

