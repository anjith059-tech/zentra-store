import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  onClick,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`group flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 hover:text-slate-900 transition-colors mb-6 md:mb-8 w-fit ${className}`.trim()}
    >
      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
};
