import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  ChevronLeft,
  Check,
  Minus,
  Plus,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductReviews } from '../components/ProductReviews';
import { BackButton } from '../components/BackButton';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { products, getProductById } = useData();

  const [isLoaded, setIsLoaded] = useState(false);

  const product =
    (id ? getProductById(id) : undefined) ||
    products.find((p) => String(p.id).toLowerCase() === id?.toLowerCase()) ||
    products[0];

  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [selectedColor, setSelectedColor] = useState(
    product?.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'features'>('features');
  const [isAdded, setIsAdded] = useState(false);
  const [currentRating, setCurrentRating] = useState(product?.rating || 4.9);
  const [currentReviewCount, setCurrentReviewCount] = useState(product?.reviewCount || 128);

  const handleRatingStatsChange = useCallback(
    ({ avgRating, totalReviews }: { avgRating: number; totalReviews: number }) => {
      setCurrentRating(avgRating);
      setCurrentReviewCount(totalReviews);
    },
    []
  );

  // --- DYNAMIC VARIANT LOGIC ---
  const activeVariant = product?.colors?.find((c) => c.name === selectedColor);
  
  const displayPrice =
    activeVariant?.variantPrice !== undefined
      ? activeVariant.variantPrice
      : (product?.price || 0);

  const displayOriginalPrice =
    activeVariant?.variantOriginalPrice !== undefined
      ? activeVariant.variantOriginalPrice
      : product?.originalPrice;

  // Switch main image if variant has its own photo
  useEffect(() => {
    if (activeVariant?.variantImage) {
      setSelectedImage(activeVariant.variantImage);
    } else if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [selectedColor, product?.image, activeVariant?.variantImage]);
  // -----------------------------

  useEffect(() => {
    if (product) {
      setSelectedColor(
        product.colors && product.colors.length > 0 ? product.colors[0].name : ''
      );
      setQuantity(1);
      window.scrollTo(0, 0);
      setIsLoaded(true);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested appliance could not be found.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-black transition-all active:scale-[0.98]"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const relatedProducts = products.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    const productToAdd: Product = {
      ...product,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      image: activeVariant?.variantImage || product.image,
    };
    addToCart(productToAdd, quantity, selectedColor);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    const productToAdd: Product = {
      ...product,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      image: activeVariant?.variantImage || product.image,
    };
    addToCart(productToAdd, quantity, selectedColor);
    navigate('/cart');
  };

  return (
    <div
      id="product-detail-page"
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-3 transition-opacity duration-500 ease-out ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <BackButton onClick={() => navigate(-1)} />
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`p-2.5 rounded-full border transition-all active:scale-95 mb-6 md:mb-8 ${
            wishlisted
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200/80 hover:text-rose-500 hover:border-rose-200'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-4">
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden group">
            <img
              src={formatImageUrl(selectedImage)}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full aspect-square object-cover object-center rounded-2xl transition-transform duration-500 hover:scale-105"
            />
            {product.badge && (
              <span className="absolute top-6 left-6 bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-xl shadow-xs">
                {product.badge}
              </span>
            )}
          </div>

          {product.galleryImages && product.galleryImages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                Product Gallery ({product.galleryImages.length})
              </span>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {product.galleryImages.map((imgUrl, idx) => {
                  const formattedThumb = formatImageUrl(imgUrl);
                  const isSelected = selectedImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        // 1. Change the big image
                        setSelectedImage(imgUrl);
                        
                        // 2. Check if this gallery image matches any variant image
                        const matchedVariant = product.colors?.find(c => c.variantImage === imgUrl);
                        
                        // 3. If it matches, automatically select that variant to trigger price change
                        if (matchedVariant) {
                          setSelectedColor(matchedVariant.name);
                        }
                      }}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 active:scale-95 ${
                        isSelected
                          ? 'border-slate-900 scale-105 shadow-md ring-2 ring-slate-900/10'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={formattedThumb}
                        alt={`Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-lg">
                {product.category}
              </span>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('customer-reviews')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentRating}</span>
                <span className="text-slate-400 font-medium">({currentReviewCount})</span>
              </button>
            </div>
            
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mt-2">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-2.5 md:gap-3 mt-2 md:mt-3">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
                ${displayPrice.toFixed(2)}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <>
                  <span className="text-sm md:text-base font-semibold text-slate-400 line-through">
                    ${displayOriginalPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md uppercase tracking-wider">
                    Save ${(displayOriginalPrice - displayPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] md:text-xs font-bold text-slate-800 tracking-wider uppercase">
                  Variant / Model:
                </span>
                <span className="text-xs font-semibold text-slate-900 capitalize bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {selectedColor}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5 md:gap-3 flex-wrap">
                {product.colors.map((color, idx) => {
                  const isSelected = selectedColor?.toLowerCase() === color.name.toLowerCase();

                  if (color.variantImage) {
                    return (
                      <button
                        key={`${color.name}-${idx}`}
                        type="button"
                        title={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`group relative flex flex-col items-center gap-1.5 p-1 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-95 bg-white ${
                          isSelected
                            ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={color.variantImage}
                            alt={color.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className={`text-[11px] px-1 capitalize line-clamp-1 max-w-[70px] ${
                          isSelected ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'
                        }`}>
                          {color.name}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={`${color.name}-${idx}`}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs capitalize transition-all duration-200 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs'
                          : 'border-slate-200 text-slate-700 bg-white hover:border-slate-400 hover:bg-slate-50/80 font-medium'
                      }`}
                    >
                      <span>{color.name}</span>
                      {color.variantPrice !== undefined && color.variantPrice !== product.price && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          ${color.variantPrice.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-white p-2.5 md:p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quantity
            </span>
            <div className="flex items-center gap-2.5 md:gap-3 bg-slate-100/80 rounded-xl p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </button>
              <span className="text-xs font-extrabold text-slate-900 w-5 md:w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1 md:pt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full font-semibold text-xs md:text-sm tracking-wider uppercase py-2.5 md:py-3 px-5 md:px-6 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isAdded ? (
                <>
                  <span>ADDED</span>
                  <Check className="w-4 h-4 animate-in fade-in duration-200" />
                </>
              ) : (
                <>
                  <span>Add to Cart</span>
                  <ShoppingBag className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200/80">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('features')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 tracking-wider uppercase transition-all ${
                  activeTab === 'features'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 tracking-wider uppercase transition-all ${
                  activeTab === 'specs'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Specifications
              </button>
            </div>

            {activeTab === 'features' ? (
              <ul className="space-y-2.5 text-xs text-slate-700 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    <span className="leading-relaxed font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5 text-xs">
                {Object.entries(product.specifications).map(([key, val], idx) => (
                  <div key={`${key}-${idx}`} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-500">{key}</span>
                    <span className="font-bold text-slate-800 text-right">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="customer-reviews">
        <ProductReviews
          productId={product.id}
          onRatingStatsChange={handleRatingStatsChange}
        />
      </div>

      {relatedProducts.length > 0 && (
        <div className="pt-14 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
              Related Appliances
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relProduct, idx) => (
              <ProductCard key={`${relProduct.id}-${idx}`} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};