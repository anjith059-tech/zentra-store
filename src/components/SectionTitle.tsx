import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  seeAllLink?: string;
  seeAllText?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  seeAllLink,
  seeAllText = 'See All',
}) => {
  return (
    <div className="flex items-end justify-between mb-3.5">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {seeAllLink && (
        <Link
          to={seeAllLink}
          className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 active:opacity-80 transition-opacity"
        >
          <span>{seeAllText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
};
