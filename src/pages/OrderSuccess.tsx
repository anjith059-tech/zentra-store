import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, PackageCheck, FileText, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { lastOrder } = useCart();
  const [countdown, setCountdown] = useState(3);

  const orderId = lastOrder?.orderId || 'ZENTRA-ORDER';
  const customerName = lastOrder?.customer.fullName || 'Valued Customer';

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/orders', { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div
      id="order-success-page"
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-6"
      >
        {/* Refined Emerald Success Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="relative"
          >
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-emerald-50 border border-emerald-100/80 flex items-center justify-center ring-8 ring-emerald-50/60 shadow-xs">
              <svg
                className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, ease: 'easeInOut', delay: 0.25 }}
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <div>
            <span className="inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100">
              Payment Confirmed
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Thank you! Your order has been placed.
          </h1>

          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed pt-1">
            Thank you, <strong className="text-slate-700 font-semibold">{customerName}</strong>. We've received your order and are preparing it for shipment.
          </p>
        </div>

        {/* Order Reference Card */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-700 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Order Number</p>
              <p className="font-mono font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                {orderId}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/orders', { replace: true })}
            className="text-xs font-bold text-slate-900 hover:text-slate-600 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ultra-Slim Progress Bar */}
        <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100/90 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-[11px]">
              <PackageCheck className="w-3.5 h-3.5 text-slate-700" />
              Redirecting to My Orders...
            </span>
            <span className="font-mono font-bold text-[11px] text-slate-800 bg-white border border-slate-200/60 px-2 py-0.5 rounded-md shadow-2xs">
              {countdown}s
            </span>
          </div>

          <div className="w-full h-1 bg-slate-200/70 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-full bg-slate-900 rounded-full"
            />
          </div>
        </div>

        {/* Sophisticated Dark Mode Action Button & Security Guarantee */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => navigate('/orders', { replace: true })}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-semibold shadow-lg shadow-slate-900/10 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span>Go to My Orders</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
