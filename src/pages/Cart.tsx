import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BackButton } from '../components/BackButton';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryCharge,
    appliedCoupon,
    discountAmount,
    grandTotal,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="p-10 py-24 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <ShoppingBag size={44} strokeWidth={1} className="text-slate-300" />
        <h3 className="mt-5 text-lg font-medium tracking-[0.15em] text-slate-900 uppercase">
          Your Cart is Empty
        </h3>
        <p className="mt-3 text-sm font-light text-slate-500 max-w-[280px] mx-auto leading-relaxed">
          Discover smart appliances designed for effortless home living.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-8 px-8 py-3 bg-slate-900 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-slate-800 transition-all duration-300 active:scale-95"
        >
          Explore Appliances
        </button>
      </div>
    );
  }

  return (
    <div id="cart-page" className="px-4 py-4 space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <BackButton onClick={() => navigate(-1)} />
        <span className="text-xs font-bold text-slate-500 mb-6 md:mb-8">
          {cart.length} item{cart.length > 1 ? 's' : ''}
        </span>
      </div>

      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>

      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.product.id + (item.selectedColor || '')}
            className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm"
          >
            <Link to={`/product/${item.product.id}`} className="shrink-0">
              <img
                src={formatImageUrl(item.product.image)}
                alt={item.product.name}
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="w-20 h-20 object-cover rounded-xl bg-slate-50"
              />
            </Link>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <Link
                  to={`/product/${item.product.id}`}
                  className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-slate-600"
                >
                  {item.product.name}
                </Link>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {item.selectedColor && (
                <p className="text-[10px] text-slate-400 font-medium">Color: {item.selectedColor}</p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-black text-slate-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-900 w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-2.5 text-xs">
        <h3 className="font-extrabold text-slate-900 text-sm mb-2">Order Summary</h3>
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Discount ({appliedCoupon})</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600">
          <span>Delivery Charge</span>
          <span className="font-bold text-slate-900">
            {deliveryCharge === 0 ||
            deliveryCharge === 'FREE' ||
            (typeof deliveryCharge === 'string' &&
              deliveryCharge.trim().toUpperCase() === 'FREE') ? (
              <span className="text-emerald-600 font-bold uppercase">FREE</span>
            ) : (
              `$${(typeof deliveryCharge === 'number' ? deliveryCharge : parseFloat(String(deliveryCharge)) || 0).toFixed(2)}`
            )}
          </span>
        </div>
        <div className="border-t border-slate-100 pt-2.5 flex justify-between items-baseline text-slate-900">
          <span className="text-sm font-extrabold">Grand Total</span>
          <span className="text-xl font-black text-slate-900">${grandTotal.toFixed(2)}</span>
        </div>
        <button
          onClick={() => {
            const isLoggedIn = localStorage.getItem('zentra_user_email');
            if (isLoggedIn) {
              navigate('/checkout');
            } else {
              navigate('/login');
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-3.5 rounded-2xl text-xs font-bold shadow-md active:scale-98 transition-all mt-4"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-2">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <span>Encrypted 256-Bit Secure Checkout</span>
      </div>
    </div>
  );
};