import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MobileDrawer } from './MobileDrawer';
import { SearchModal } from './SearchModal';

export const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('zentra_user_email'));
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setUserEmail(localStorage.getItem('zentra_user_email'));
    };
    window.addEventListener('zentra_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('zentra_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('zentra_user_email');
    window.dispatchEvent(new Event('zentra_auth_change'));
    setUserEmail(null);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs"
      >
        <div className="flex items-center justify-between px-4 h-14 w-full relative">
          {/* Left: Hamburger Menu */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 text-slate-700 hover:text-blue-600 rounded-full active:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Brand Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center active:scale-95 transition-transform" aria-label="Zentra Home">
            <span className="text-xl font-bold tracking-[0.25em] uppercase text-slate-900">
              ZENTRA
            </span>
          </Link>

          {/* Right: Search, Account & Cart */}
          <div className="flex items-center gap-1 -mr-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-700 hover:text-blue-600 rounded-full active:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Icon / Dropdown */}
            {!userEmail ? (
              <Link
                to="/login"
                className="p-2 text-slate-700 hover:text-blue-600 rounded-full active:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Sign In"
                title="Sign In"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="relative p-2 text-slate-700 hover:text-blue-600 rounded-full active:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="User Account Menu"
                  title={userEmail}
                >
                  <User className="w-5 h-5" />
                  <span className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        SIGNED IN AS
                      </p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={userEmail}>
                        {userEmail}
                      </p>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-slate-700 hover:text-blue-600 rounded-full active:bg-slate-100 transition-colors cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer & Search Overlays */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

