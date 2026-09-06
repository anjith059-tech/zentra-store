export interface Product {
  id: string;
  name: string;
  category: 'Kitchen Appliances' | 'Home Essentials' | 'Cleaning Appliances' | 'Smart Home';
  categorySlug: 'kitchen' | 'home' | 'cleaning' | 'smart';
  price: number;
  originalPrice?: number;
  cogs?: number; // Cost of Goods Sold (Supplier Cost)
  rating: number;
  reviewCount: number;
  image: string;
  galleryImages: string[];
  description: string;
  features: string[];
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isNew?: boolean;
  badge?: string;
  inStock: boolean;
  colors?: { 
    name: string; 
    hex: string;
    variantPrice?: number;
    variantOriginalPrice?: number;
    variantImage?: string;
  }[];
  deliveryTime?: string;
  deliveryCharge?: number | string;
}

export interface Category {
  id: string;
  name: 'Kitchen Appliances' | 'Home Essentials' | 'Cleaning Appliances' | 'Smart Home';
  slug: 'kitchen' | 'home' | 'cleaning' | 'smart';
  icon: string;
  description: string;
  itemCount: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface OrderCustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  zipCode?: string;
}

export interface Order {
  orderId: string;
  items: CartItem[];
  customer: OrderCustomerDetails;
  subtotal: number;
  deliveryCharge: number | string;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  estimatedDelivery: string;
  createdAt: string;
  status?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  trackingNumber?: string;
}

export interface AbandonedCart {
  id: string;
  customerEmail: string;
  customerName?: string;
  items: { productName: string; quantity: number; price: number; image: string }[];
  cartTotal: number;
  abandonedAt: string;
  recoverySent: boolean;
  recoveryCode?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  status: 'VIP' | 'Active' | 'New' | 'Inactive';
}

export interface FilterState {
  category: string;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating';
  minPrice?: number;
  maxPrice?: number;
}