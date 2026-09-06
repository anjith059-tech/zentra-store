import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading Zentra...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-blue-600">
          Z
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 animate-pulse">{label}</p>
    </div>
  );
};
