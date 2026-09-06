import React from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useCart();

  const wishlisted = isWishlisted(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const imageUrl = formatImageUrl(product.image);

  return (
    <motion.div
      onClick={handleCardClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col cursor-pointer transition-all duration-500 ease-out hover:shadow-[0_0_25px_rgba(0,0,0,0.08)] rounded-2xl p-2"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            wishlisted
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="text-left mt-4 pb-2 px-1">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-slate-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <p className="text-base font-extrabold text-slate-900">
              ${product.price.toFixed(2)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

