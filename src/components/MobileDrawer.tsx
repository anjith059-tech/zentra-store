import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Home,
  Package,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Sliding Panel */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="absolute inset-y-0 left-0 w-[82%] max-w-[320px] bg-white shadow-2xl flex flex-col z-10"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <span className="text-xl font-bold tracking-[0.25em] uppercase text-slate-900 block leading-tight">
                ZENTRA
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Smart Living Store</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* Primary Menu */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Navigation
              </p>

              <NavLink
                to="/"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Home className="w-4 h-4" />
                Home
              </NavLink>

              <NavLink
                to="/orders"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Package className="w-4 h-4" />
                My Orders
              </NavLink>
            </div>
          </div>

          {/* Drawer Footer Banner */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <p className="text-[11px] font-semibold text-slate-800">Zentra Guarantee</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Built for Everyday Use</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
