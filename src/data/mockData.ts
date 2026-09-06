import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-kitchen',
    name: 'Kitchen Appliances',
    slug: 'kitchen',
    icon: 'CookingPot',
    description: 'Precision air fryers, espresso machines & smart kettles designed for gourmet living.',
    itemCount: 0,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat-home',
    name: 'Home Essentials',
    slug: 'home',
    icon: 'Wind',
    description: 'Quiet HEPA air purifiers, smart humidifiers and climate control systems.',
    itemCount: 0,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat-cleaning',
    name: 'Cleaning Appliances',
    slug: 'cleaning',
    icon: 'Sparkles',
    description: 'AI-guided robot vacuums, lightweight cordless sticks & deep steam mops.',
    itemCount: 0,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-smart',
    name: 'Smart Home',
    slug: 'smart',
    icon: 'Cpu',
    description: 'Automated thermostats, smart door security locks and connected hubs.',
    itemCount: 0,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
  },
];

export const PRODUCTS: Product[] = [];

export const WHY_CHOOSE_ZENTRA = [
  {
    icon: 'Truck',
    title: 'Fast Delivery',
    description: 'Premium products delivered quickly to your doorstep with real-time tracking.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Secure Payments',
    description: 'Safe and trusted checkout powered by 256-bit encryption & instant support.'
  },
  {
    icon: 'Award',
    title: 'Premium Quality',
    description: 'Carefully selected appliances built with high-grade materials to last for years.'
  }
];

export const PROMO_CODES: Record<string, number> = {
  'ZENTRA10': 0.10, // 10% off
  'SMARTLIVING': 0.15, // 15% off
  'WELCOME20': 0.20 // 20% off
};
