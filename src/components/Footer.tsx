import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="bg-[#0b0f19] border-t border-slate-800/60 text-slate-300 pt-16 pb-14 px-6 text-center mt-auto">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Logo & Tagline */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xl font-bold tracking-[0.25em] uppercase text-white">ZENTRA</span>
          <p className="text-xs text-slate-400 font-light tracking-wide leading-relaxed max-w-sm mx-auto">
            Premium home and kitchen appliances designed for comfort, convenience, and modern living.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-300 text-left">
          <div className="flex items-center gap-3 bg-slate-900/40 hover:bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-blue-400" strokeWidth={1.75} />
            </div>
            <span className="font-medium text-slate-200">Premium Quality Guaranteed</span>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/40 hover:bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            </div>
            <span className="font-medium text-slate-200">100% Genuine Certified</span>
          </div>
        </div>

        {/* Quick Nav Links & Social */}
        <div className="space-y-8">
          <nav className="flex items-center justify-center flex-wrap gap-6 sm:gap-8 py-4 border-y border-slate-800/40 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link to="/orders" className="hover:text-white transition-colors">
              My Orders
            </Link>
          </nav>

          <div className="flex items-center justify-center">
            <a
              href="https://instagram.com/zentra_global"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 inline-flex items-center justify-center"
            >
              <Instagram size={18} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-2 text-xs text-slate-500 font-light tracking-wider space-y-1">
          <p>© {new Date().getFullYear()} Zentra Appliances Inc. All rights reserved.</p>
          <p className="text-[11px] text-slate-600 tracking-wider font-light">
            Crafted for Smart Living
          </p>
        </div>
      </div>
    </footer>
  );
};
