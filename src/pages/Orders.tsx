import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, ShoppingBag, Truck, MapPin, Calendar, ArrowRight, CreditCard } from 'lucide-react';
import { Order } from '../types';
import { BackButton } from '../components/BackButton';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzFjtjdM_7lssQ0lJnTyRqcH8R1QaPESy9yAz8UYRLiEHrOEYggkRzuapuwWifAx0lF1A/exec';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const email = localStorage.getItem('zentra_user_email');
      
      if (!email) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${WEBHOOK_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.orders) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.error('Failed to load orders from server:', e);
        // Fallback to local storage if network fails
        const rawList = localStorage.getItem('zentra_orders_list_v1');
        const loadedOrders: Order[] = rawList ? JSON.parse(rawList) : [];
        setOrders(Array.isArray(loadedOrders) ? loadedOrders : []);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div id="orders-page" className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <BackButton label="Back to Shop" onClick={() => navigate('/shop')} />
        <Link
          to="/shop"
          className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
          View and manage your appliance purchases with ease.
        </p>
      </div>

      {loading ? (
        <div className="space-y-5 pt-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-200 rounded-md w-1/3" />
              <div className="h-20 bg-slate-100 rounded-2xl w-full" />
              <div className="h-12 bg-slate-100 rounded-xl w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-14 text-center space-y-6 shadow-xl shadow-slate-200/50 my-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10 text-slate-400 stroke-[1.5]" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">No orders yet</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              When you complete a purchase, your order history will appear here.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black active:scale-98 text-white px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all duration-200 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6 pt-2">
          {orders.map((order, index) => (
            <motion.div
              key={order.orderId || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.08,
                ease: 'easeOut',
              }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden"
            >
              <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 shadow-2xs shrink-0">
                    <Package className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Order ID
                      </span>
                      <span className="font-mono text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-2xs">
                        #{order.orderId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Placed on {formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Confirmed
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                      Items Ordered
                    </p>
                    <span className="text-xs font-semibold text-slate-500">
                      Grand Total:{' '}
                      <span className="text-slate-900 font-bold">
                        ${order.grandTotal ? Number(order.grandTotal).toFixed(2) : '0.00'}
                      </span>
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs font-medium text-slate-700 whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {order.itemsString || (
                      order.items?.map((item) => (
                        `${item.product?.name || 'Product'} ${item.selectedColor ? `[Color: ${item.selectedColor}]` : ''} Qty: ${item.quantity} $${((item.product?.price || 0) * item.quantity).toFixed(2)}`
                      )).join('\n')
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Shipping Destination</span>
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <p className="text-slate-900 font-bold text-xs sm:text-sm">
                        {order.customer?.fullName || 'Valued Customer'}
                      </p>
                      <p className="text-slate-600 leading-relaxed font-normal">
                        {order.customer?.street || order.customer?.addressLine1}
                        {order.customer?.city ? `, ${order.customer.city}` : ''}
                        {order.customer?.state ? `, ${order.customer.state}` : ''}
                        {order.customer?.zip || order.customer?.zipCode ? ` ${order.customer?.zip || order.customer?.zipCode}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Payment Details</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-medium text-slate-600">
                        <span>Payment Method</span>
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {order.paymentMethod || 'Online Payment'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};