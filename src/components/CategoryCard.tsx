import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shop?category=${category.slug}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.97, y: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="group rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all cursor-pointer active:brightness-95"
    >
      <img
        src={formatImageUrl(category.image)}
        alt={category.name}
        className="w-full h-32 md:h-56 md:aspect-[16/10] object-cover bg-slate-50/50"
        referrerPolicy="no-referrer"
        onError={handleImageError}
      />
      <motion.div
        className="py-3 px-4 flex flex-col items-center text-center bg-gradient-to-r from-white via-slate-100 to-white bg-[length:200%_200%] border-t border-slate-100"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      >
        <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
          {category.name}
        </h4>
      </motion.div>
    </motion.div>
  );
};
