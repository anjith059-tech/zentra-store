import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Order, OrderCustomerDetails } from '../types';
import { PROMO_CODES } from '../data/mockData';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  deliveryCharge: number | string;
  freeDeliveryThreshold: number;
  appliedCoupon: string | null;
  discountPercent: number;
  discountAmount: number;
  grandTotal: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  lastOrder: Order | null;
  placeOrder: (customer: OrderCustomerDetails, paymentMethod: string) => Promise<Order>;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zentra_cart_v1';
const WISHLIST_STORAGE_KEY = 'zentra_wishlist_v1';
const LAST_ORDER_STORAGE_KEY = 'zentra_last_order_v1';
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzFjtjdM_7lssQ0lJnTyRqcH8R1QaPESy9yAz8UYRLiEHrOEYggkRzuapuwWifAx0lF1A/exec';

const waitForGoogleSheetConfirmation = (orderId: string, timeoutMs = 30000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    let finished = false;

    const cleanup = () => {
      const oldScript = document.getElementById(`zentra-order-check-${orderId}`);
      if (oldScript) oldScript.remove();
      delete (window as any)[callbackName];
    };

    const callbackName = `zentraOrderCallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const checkStatus = () => {
      if (finished) return;
      if (Date.now() - startedAt > timeoutMs) {
        finished = true;
        cleanup();
        reject(new Error('Google Sheets did not confirm the order within 30 seconds.'));
        return;
      }

      const oldScript = document.getElementById(`zentra-order-check-${orderId}`);
      if (oldScript) oldScript.remove();
      
      (window as any)[callbackName] = (result: { status?: string; message?: string }) => {
        if (finished) return;
        if (result?.status === 'success') {
          finished = true;
          cleanup();
          resolve();
          return;
        }
        setTimeout(checkStatus, 1500);
      };
      
      const script = document.createElement('script');
      script.id = `zentra-order-check-${orderId}`;
      script.src = `${WEBHOOK_URL}?action=checkOrder&orderId=${encodeURIComponent(orderId)}&callback=${encodeURIComponent(callbackName)}&_=${Date.now()}`;
      script.onerror = () => {
        if (!finished) setTimeout(checkStatus, 1500);
      };
      document.body.appendChild(script);
    };

    checkStatus();
  });
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    const defaultColor = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id && item.selectedColor === defaultColor);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prevCart, { product, quantity, selectedColor: defaultColor }];
    });

    showToast(`Added ${product.name} to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cart.find((item) => item.product.id === productId);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (itemToRemove) showToast(`Removed ${itemToRemove.product.name} from cart`, 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const totalItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const freeDeliveryThreshold = 99;

  const maxItemDeliveryCharge = cart.reduce((max, item) => {
    const charge = item.product.deliveryCharge;
    if (charge === 'FREE' || (typeof charge === 'string' && charge.trim().toUpperCase() === 'FREE')) return max;
    const num = typeof charge === 'number' ? charge : parseFloat(String(charge).replace(/[^0-9.-]+/g, '')) || 0;
    return Math.max(max, num);
  }, 0);

  const hasAnyExplicitFree = cart.some(
    (item) => item.product.deliveryCharge === 'FREE' || (typeof item.product.deliveryCharge === 'string' && item.product.deliveryCharge.trim().toUpperCase() === 'FREE')
  );

  const deliveryCharge: number | string = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : maxItemDeliveryCharge > 0 ? maxItemDeliveryCharge : hasAnyExplicitFree ? 'FREE' : 0;
  const numericDeliveryCharge = typeof deliveryCharge === 'number' ? deliveryCharge : deliveryCharge === 'FREE' ? 0 : parseFloat(String(deliveryCharge).replace(/[^0-9.-]+/g, '')) || 0;
  
  const discountAmount = subtotal * discountPercent;
  const grandTotal = Math.max(0, subtotal + numericDeliveryCharge - discountAmount);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (PROMO_CODES[cleanCode]) {
      const percent = PROMO_CODES[cleanCode];
      setAppliedCoupon(cleanCode);
      setDiscountPercent(percent);
      showToast(`Coupon '${cleanCode}' applied (${percent * 100}% off)`, 'success');
      return { success: true, message: `Applied ${percent * 100}% discount!` };
    }
    showToast('Invalid coupon code. Try ZENTRA10 or SMARTLIVING', 'error');
    return { success: false, message: 'Invalid promo code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    showToast('Promo code removed', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      }
      showToast('Added to wishlist', 'success');
      return [...prev, productId];
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const placeOrder = async (customer: OrderCustomerDetails, paymentMethod: string): Promise<Order> => {
    if (cart.length === 0) throw new Error('Your cart is empty.');
    
    const orderId = `ZENTRA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const customerWithDefaults: OrderCustomerDetails = {
      ...customer,
      country: customer.country || 'United States',
      firstName: customer.firstName || customer.fullName?.split(' ')[0] || '',
      lastName: customer.lastName || customer.fullName?.split(' ').slice(1).join(' ') || '',
      addressLine1: customer.addressLine1 || customer.street || '',
      addressLine2: customer.addressLine2 || '',
      zipCode: customer.zipCode || customer.zip || '',
    };

    const dynamicDeliveryTime = cart.map((item) => item.product.deliveryTime).find(Boolean) || '3 - 5 Business Days';

    const newOrder: Order = {
      orderId,
      items: [...cart],
      customer: customerWithDefaults,
      subtotal,
      deliveryCharge,
      discount: discountAmount,
      grandTotal,
      paymentMethod,
      estimatedDelivery: dynamicDeliveryTime,
      createdAt: new Date().toISOString(),
    };

    const rawPhone = String(newOrder.customer.phone || '').trim();
    const customPrefix = (newOrder.customer as any).phoneCode || (newOrder.customer as any).countryCode || '';
    let formattedPhone = rawPhone;
    if (rawPhone && !rawPhone.startsWith('+') && customPrefix) {
      formattedPhone = `${customPrefix.startsWith('+') ? customPrefix : '+' + customPrefix} ${rawPhone}`;
    }

    const payload = {
      type: 'order',
      orderId: newOrder.orderId,
      countryRegion: newOrder.customer.country,
      firstName: newOrder.customer.firstName,
      lastName: newOrder.customer.lastName,
      mobileNumber: formattedPhone,
      emailAddress: newOrder.customer.email,
      street: newOrder.customer.addressLine1,
      aptSuite: newOrder.customer.addressLine2 || '',
      state: newOrder.customer.state,
      city: newOrder.customer.city,
      zipCode: newOrder.customer.zipCode,
      items: newOrder.items.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price.toFixed(2),
        Variant: item.selectedColor || "Default",
      })),
      subtotal: newOrder.subtotal,
      deliveryCharge: newOrder.deliveryCharge,
      totalPayable: newOrder.grandTotal,
      paymentMethod: newOrder.paymentMethod,
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      await waitForGoogleSheetConfirmation(newOrder.orderId);

      setLastOrder(newOrder);

      try {
        localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(newOrder));
        const existingOrdersRaw = localStorage.getItem('zentra_orders_list_v1');
        const existingOrders: Order[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
        localStorage.setItem('zentra_orders_list_v1', JSON.stringify([newOrder, ...existingOrders]));
      } catch (e) {
        console.error('Failed to save confirmed order locally:', e);
      }

      clearCart();
      return newOrder;

    } catch (error) {
      console.error('Order confirmation failed:', error);
      showToast('Order could not be confirmed. Your cart has been kept. Please try again.', 'error');
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart,
        totalItemsCount, subtotal, deliveryCharge, freeDeliveryThreshold,
        appliedCoupon, discountPercent, discountAmount, grandTotal,
        applyCoupon, removeCoupon, wishlist, toggleWishlist, isWishlisted,
        lastOrder, placeOrder, toasts, showToast, addToast: showToast, removeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};