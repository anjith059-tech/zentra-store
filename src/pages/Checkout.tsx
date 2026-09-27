import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BackButton } from '../components/BackButton';
import { OrderCustomerDetails } from '../types';

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'India',
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, deliveryCharge, discountAmount, grandTotal, placeOrder, clearCart, showToast } =
    useCart();

  const [form, setForm] = useState<OrderCustomerDetails>(() => ({
    fullName: '',
    email: localStorage.getItem('zentra_user_email') || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  }));

  const [country, setCountry] = useState('United States');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [countryCode, setCountryCode] = useState('+1');
  const [isCountryCodeTouched, setIsCountryCodeTouched] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [countrySearch]);

  const [apt, setApt] = useState('');
  const isOrderSubmitted = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('zentra_user_email');
    if (!email) {
      navigate('/login?redirect=/checkout', { replace: true });
    } else {
      setForm((prev) => ({ ...prev, email }));
    }
  }, [navigate]);

  const [razorpayKeyId, setRazorpayKeyId] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
      'rzp_live_TZZlF4VIFX065X'
    );
  });

  // Fetch Razorpay configuration from server on mount if available
  useEffect(() => {
    fetch('/api/payment/razorpay-config')
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data?.keyId) {
          // Never overwrite if user already configured a live key locally
          const localKey = localStorage.getItem('zentra_razorpay_key_id');
          if (!localKey || !localKey.startsWith('rzp_live_')) {
            setRazorpayKeyId(data.keyId);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch Razorpay config:', err);
      });
  }, []);

  const ensureRazorpayLoaded = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        return resolve(true);
      }
      const existing = document.getElementById('razorpay-checkout-sdk');
      if (existing) {
        if ((window as any).Razorpay) return resolve(true);
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        setTimeout(() => resolve(Boolean((window as any).Razorpay)), 1200);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    ensureRazorpayLoaded();
  }, []);

  useEffect(() => {
    // Only redirect if cart was empty when first landing on checkout and not during/after order placement
    if (cart.length === 0 && !isOrderSubmitted.current) {
      navigate('/cart', { replace: true });
    }
  }, [cart.length, navigate]);

  if (cart.length === 0 && !isOrderSubmitted.current) {
    return null;
  }

  const handleInputChange = (field: keyof OrderCustomerDetails, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handlePaymentSuccess = async (response: {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => {
    const paymentId = response?.razorpay_payment_id;
    if (!paymentId) {
      setIsProcessing(false);
      showToast('Payment could not be verified. Please try again.', 'error');
      return;
    }

    // Set order submitted immediately so cart clearing will never redirect to /cart
    isOrderSubmitted.current = true;

    // Verify signature on backend if signature and order ID are available
    if (response.razorpay_order_id && response.razorpay_signature) {
      try {
        const verifyRes = await fetch('/api/payment/verify-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: paymentId,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData && verifyData.verified === false) {
            setIsProcessing(false);
            showToast('Payment verification failed. Please contact support.', 'error');
            return;
          }
        }
      } catch (verifyErr) {
        console.warn('Verification request notice:', verifyErr);
      }
    }
    
    const fullNameParts = form.fullName.trim().split(' ');
    const derivedFirstName = firstName || fullNameParts[0] || '';
    const derivedLastName = lastName || fullNameParts.slice(1).join(' ') || '';
    const fullPhoneNumber = `${countryCode.trim()} ${form.phone.trim()}`;

    if (form.email) {
      try {
        localStorage.setItem('zentra_user_email', form.email.trim());
      } catch (e) {
        console.warn('Could not save user email to local storage:', e);
      }
    }

    try {
      await placeOrder({
        ...form,
        phone: fullPhoneNumber,
        country,
        firstName: derivedFirstName,
        lastName: derivedLastName,
        addressLine1: form.street,
        addressLine2: apt,
        zipCode: form.zip,
      }, `Razorpay Payment (${paymentId})`);
      
      showToast('Payment successful! Your order has been placed.', 'success');
      setIsProcessing(false);
      navigate('/order-success', { replace: true });
    } catch (orderErr) {
      console.error('Error recording confirmed order:', orderErr);
      setIsProcessing(false);
      navigate('/order-success', { replace: true });
    }
  };

  const handleOpenPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = localStorage.getItem('zentra_user_email');
    if (!email) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.street || !form.city) {
      showToast('Please fill in all required shipping fields', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
        showToast('Razorpay payment gateway failed to load. Please check your internet or disable ad-blockers and try again.', 'error');
        setIsProcessing(false);
        return;
      }

      let activeKey = razorpayKeyId;
      let serverOrderId: string | undefined = undefined;

      const cleanPhone = form.phone.trim().replace(/\D/g, '');
      const isIndianCustomer =
        country.toLowerCase() === 'india' ||
        countryCode.trim() === '+91' ||
        cleanPhone.startsWith('91') ||
        (/^[6-9]\d{9}$/.test(cleanPhone));
      const orderCurrency = isIndianCustomer ? 'INR' : 'USD';
      const orderAmount = isIndianCustomer ? Math.round(grandTotal * 85) : grandTotal;
      const amountInSmallestUnit = Math.round(orderAmount * 100);

      // Try creating backend order if server is active (with 3s timeout)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            amount: orderAmount,
            currency: orderCurrency,
            receipt: `rcpt_${Date.now()}`,
            keyId: activeKey,
            notes: {
              customer_name: form.fullName,
              customer_email: form.email,
              shipping_address: `${form.street}, ${form.city}, ${form.state} ${form.zip}, ${country}`,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (orderRes.ok) {
          const contentType = orderRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const orderData = await orderRes.json();
            // NEVER downgrade if client already has a live key configured
            if (orderData?.keyId) {
              if (orderData.keyId.startsWith('rzp_live_') || !activeKey.startsWith('rzp_live_')) {
                activeKey = orderData.keyId;
              }
            }
            if (orderData?.orderId && !orderData.mock) {
              serverOrderId = orderData.orderId;
            }
          }
        }
      } catch (backendErr) {
        console.warn('Backend order API not available, launching direct Razorpay standard checkout:', backendErr);
      }

      // Configure official Razorpay Standard Checkout
      const options: any = {
        key: activeKey,
        amount: amountInSmallestUnit,
        currency: orderCurrency,
        name: 'ZENTRA',
        description: 'Order Payment',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=128&q=80',
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: `${countryCode} ${form.phone}`.trim(),
        },
        notes: {
          address: `${form.street}, ${form.city}, ${form.state} ${form.zip}, ${country}`,
          currency: orderCurrency,
        },
        theme: {
          color: '#0f172a',
        },
        handler: (response: any) => {
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      if (serverOrderId) {
        options.order_id = serverOrderId;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        const errMsg = resp?.error?.description || resp?.error?.reason || 'Payment was unsuccessful or cancelled';
        showToast(errMsg, 'error');
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay launch error:', err);
      showToast(err?.message || 'Could not launch payment gateway. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="checkout-page" className="px-4 py-4 space-y-5 pb-28">
      <div className="flex items-center justify-between">
        <BackButton onClick={() => navigate(-1)} />
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5 mb-6 md:mb-8">
          <Lock className="w-3 h-3 text-slate-600" />
          Secure Checkout
        </span>
      </div>

      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>

      <form onSubmit={handleOpenPayment} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3.5"
        >
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-800" />
            <span>1. Customer Details</span>
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Country/region *</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300 text-left flex items-center justify-between cursor-pointer"
                >
                  <span>{country}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCountryDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => {
                        setIsCountryDropdownOpen(false);
                        setCountrySearch('');
                      }}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto py-1.5 text-xs">
                      <div className="px-2.5 pb-1.5 border-b border-slate-100">
                        <div className="relative flex items-center">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <ul className="divide-y divide-slate-50 max-h-40 overflow-y-auto">
                        {filteredCountries.map((c) => (
                          <li key={c}>
                            <button
                              type="button"
                              onClick={() => {
                                setCountry(c);
                                setIsCountryDropdownOpen(false);
                                setCountrySearch('');
                              }}
                              className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer ${
                                c === country ? 'font-bold text-slate-900 bg-slate-50/80' : 'text-slate-700 font-medium'
                              }`}
                            >
                              <span>{c}</span>
                              {c === country && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 shrink-0" />}
                            </button>
                          </li>
                        ))}
                        {filteredCountries.length === 0 && (
                          <li className="px-3.5 py-3 text-xs text-slate-400 text-center">
                            No countries found
                          </li>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-1 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
                Contact information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">First name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFirstName(val);
                      handleInputChange('fullName', `${val} ${lastName}`.trim());
                    }}
                    placeholder="First name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Last name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLastName(val);
                      handleInputChange('fullName', `${firstName} ${val}`.trim());
                    }}
                    placeholder="Last name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile number *</label>
                  <div className="flex items-center rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-slate-900 focus-within:bg-white transition-all duration-300">
                    <input
                      type="text"
                      value={countryCode}
                      onFocus={() => setIsCountryCodeTouched(true)}
                      onBlur={() => setIsCountryCodeTouched(true)}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setIsCountryCodeTouched(true);
                      }}
                      placeholder="+1"
                      className="w-14 bg-slate-200/70 text-slate-900 font-bold text-xs text-center py-3 border-r border-slate-200 focus:outline-none shrink-0"
                    />
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Mobile number"
                      className="w-full bg-transparent px-3 py-3 text-xs text-slate-900 font-medium focus:outline-none"
                    />
                  </div>
                  {isCountryCodeTouched && !countryCode.trim() && (
                    <p className="text-red-500 text-xs mt-1 font-medium">Please enter a country code</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3.5"
        >
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-800" />
            <span>2. Shipping Address</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Street *</label>
              <input
                type="text"
                required
                value={form.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Street address"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Apt, suite, unit, etc (optional)</label>
              <input
                type="text"
                value={apt}
                onChange={(e) => setApt(e.target.value)}
                placeholder="Apt, suite, unit, etc (optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State / Province"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">ZIP/Postal code *</label>
                <input
                  type="text"
                  required
                  value={form.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  placeholder="ZIP / Postal code"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-3.5"
        >
          <h2 className="text-sm font-extrabold text-slate-900">
            3. Order Summary ({cart.length} Item{cart.length > 1 ? 's' : ''})
          </h2>

          <div className="divide-y divide-slate-100">
            {cart.map((item, itemIdx) => (
              <div key={`${item.product.id}-${item.selectedColor || ''}-${itemIdx}`} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover rounded-xl bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span>
                {deliveryCharge === 0 ||
                deliveryCharge === 'FREE' ||
                (typeof deliveryCharge === 'string' &&
                  deliveryCharge.trim().toUpperCase() === 'FREE')
                  ? 'FREE'
                  : `$${(typeof deliveryCharge === 'number' ? deliveryCharge : parseFloat(String(deliveryCharge)) || 0).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-100 text-slate-900 font-black text-sm">
              <span>Total Payable</span>
              <span className="text-lg text-slate-900 font-black">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl shadow-slate-950/50 space-y-4 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 shrink-0">
                <CreditCard className="w-5 h-5 text-slate-100" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-wide uppercase">Payment Method</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Official Razorpay Checkout</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[10px] font-bold text-slate-300 tracking-wider shadow-xs shrink-0">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed relative z-10">
            Clicking below opens the official Razorpay modal to pay securely with UPI, Credit/Debit Cards, Netbanking, or Wallets.
          </p>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex items-center justify-between bg-white hover:bg-slate-50 text-slate-900 py-3.5 px-5 rounded-xl text-xs font-black shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer group relative z-10 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2.5">
              {isProcessing ? (
                <div className="w-4 h-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin shrink-0" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5 text-slate-800 group-hover:text-emerald-600 transition-colors duration-300 shrink-0" />
              )}
              <span className="font-extrabold text-xs">
                {isProcessing ? 'Opening Razorpay...' : 'Pay with Razorpay'}
              </span>
            </div>
            <span className="font-black text-sm tracking-tight text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg group-hover:bg-slate-200 transition-colors duration-300">
              ${grandTotal.toFixed(2)}
            </span>
          </button>
        </motion.div>
      </form>
    </div>
  );
};