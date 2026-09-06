import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../types';
import { ReviewItem } from '../components/ProductReviews';
import { CATEGORIES as BASE_CATEGORIES } from '../data/mockData';
import { formatImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

const API_URL = 'https://script.google.com/macros/s/AKfycbycdfssgJItaZiE-zuPfTI0MP6vXxoKT6i7czMoAJVwTkSSt9PbJmCqgGftolcb6VBBHQ/exec';

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  if (value === null || value === undefined || value === '') return fallback;
  const str = String(value).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? fallback : parsed;
}

function parseColorFinish(colorsInput: unknown): {
  name: string;
  hex: string;
  variantPrice?: number;
  variantOriginalPrice?: number;
  variantImage?: string;
}[] {
  if (!colorsInput) return [];
  let rawList: string[] = [];
  if (Array.isArray(colorsInput)) {
    rawList = colorsInput.map(String);
  } else if (typeof colorsInput === 'string') {
    rawList = colorsInput.split('|').map((s) => s.trim()).filter(Boolean);
  }

  const getColorHex = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('black') || n.includes('obsidian') || n.includes('dark')) return '#1e293b';
    if (n.includes('white') || n.includes('pure') || n.includes('slate white')) return '#f8fafc';
    if (n.includes('steel') || n.includes('titanium') || n.includes('brushed') || n.includes('silver') || n.includes('slate')) return '#94a3b8';
    if (n.includes('rose') || n.includes('pink') || n.includes('red')) return '#f43f5e';
    if (n.includes('blue') || n.includes('navy')) return '#3b82f6';
    if (n.includes('gold') || n.includes('brass') || n.includes('yellow')) return '#eab308';
    if (n.includes('purple') || n.includes('violet')) return '#a855f7';
    if (n.includes('green') || n.includes('emerald') || n.includes('sage')) return '#10b981';
    return '#64748b';
  };

  return rawList.map((variantStr) => {
    let variantImage: string | undefined = undefined;
    let textWithoutImage = variantStr;

    // Extract any http/https URL from the string
    const urlMatch = variantStr.match(/(https?:\/\/[^\s|]+)/i);
    if (urlMatch) {
      variantImage = formatImageUrl(urlMatch[1]);
      textWithoutImage = variantStr.replace(urlMatch[1], '').trim();
    }

    // Clean up trailing and leading colons
    textWithoutImage = textWithoutImage.replace(/^:+|:+$/g, '').trim();

    const segments = textWithoutImage.split(':').map((s) => s.trim()).filter(Boolean);

    let name = '';
    let variantPrice: number | undefined = undefined;
    let variantOriginalPrice: number | undefined = undefined;

    if (segments.length === 0) {
      name = 'Default';
    } else if (segments.length === 1) {
      name = segments[0].replace(/^color\s*:\s*/i, '').trim();
    } else if (segments[0].toLowerCase() === 'color') {
      name = segments[1] || 'Default';
      if (segments[2] && !isNaN(Number(segments[2].replace(/[^0-9.-]+/g, '')))) {
        variantPrice = parseNumber(segments[2]);
      }
      if (segments[3] && !isNaN(Number(segments[3].replace(/[^0-9.-]+/g, '')))) {
        variantOriginalPrice = parseNumber(segments[3]);
      }
    } else {
      name = segments[0].replace(/^color\s*:\s*/i, '').trim();
      if (segments[1] && !isNaN(Number(segments[1].replace(/[^0-9.-]+/g, '')))) {
        variantPrice = parseNumber(segments[1]);
      }
      if (segments[2] && !isNaN(Number(segments[2].replace(/[^0-9.-]+/g, '')))) {
        variantOriginalPrice = parseNumber(segments[2]);
      }
    }

    if (!name) name = 'Variant';

    return {
      name,
      hex: getColorHex(name),
      variantPrice,
      variantOriginalPrice,
      variantImage,
    };
  });
}

function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    if (normalized === 'TRUE' || normalized === '1' || normalized === 'YES') return true;
    if (normalized === 'FALSE' || normalized === '0' || normalized === 'NO' || normalized === '') return false;
  }
  return fallback;
}

function parseArrayField(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return value.split('|').map((s) => s.trim()).filter(Boolean);
  return [];
}

function getCategorySlug(categoryName: string): 'kitchen' | 'home' | 'cleaning' | 'smart' {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('kitchen')) return 'kitchen';
  if (cat.includes('cleaning')) return 'cleaning';
  if (cat.includes('smart')) return 'smart';
  if (cat.includes('home')) return 'home';
  return 'kitchen';
}

function normalizeId(id: unknown): string {
  if (id === null || id === undefined) return '';
  return String(id).trim().toLowerCase().replace(/^p/, '');
}

interface DataContextType {
  products: Product[];
  reviews: ReviewItem[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  getReviewsByProductId: (productId: string) => ReviewItem[];
  addReview: (review: ReviewItem) => void;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('zentra_cached_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached products', e);
    }
    return [];
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('zentra_cached_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached reviews', e);
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(BASE_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zentra_cached_products');
      if (saved && JSON.parse(saved).length > 0) return false;
    } catch {}
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const rawProducts: any[] = Array.isArray(data?.products) ? data.products : [];
      const rawReviews: any[] = Array.isArray(data?.reviews) ? data.reviews : [];

      const seenReviewIds = new Set<string>();
      const mappedReviews: ReviewItem[] = rawReviews.map((r, index) => {
        let revId = String(r.reviewId || `rev-${index + 1}`).trim();
        if (!revId || seenReviewIds.has(revId)) {
          revId = `${revId || 'rev'}-${index + 1}`;
        }
        seenReviewIds.add(revId);

        const pId = String(r.productId || '');
        const dateVal = r.date;
        const rawDate = dateVal ? new Date(dateVal) : null;
        let formattedDate = String(dateVal || 'Recently');
        if (rawDate && !isNaN(rawDate.getTime())) {
          formattedDate = rawDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          });
        }
        const revImages = parseArrayField(r.images).map((img) => formatImageUrl(img)).filter(Boolean);
        return {
          id: revId,
          productId: pId,
          author: String(r.author || 'Anonymous'),
          rating: parseNumber(r.rating, 5),
          date: formattedDate,
          verified: parseBoolean(r.verified, true),
          title: String(r.title || ''),
          comment: String(r.content || r.comment || ''),
          variant: r.variant ? String(r.variant) : undefined,
          helpfulCount: parseNumber(r.helpfulCount, 0),
          unhelpfulCount: parseNumber(r.unhelpfulCount, 0),
          images: revImages.length > 0 ? revImages : undefined,
        };
      });

      const seenProductIds = new Set<string>();
      const mappedProducts: Product[] = rawProducts.map((p, index) => {
        let rawId = String(p.id !== undefined && p.id !== null && String(p.id).trim() !== '' ? p.id : index + 1).trim();
        if (seenProductIds.has(rawId)) {
          rawId = `${rawId}-${index + 1}`;
        }
        seenProductIds.add(rawId);

        const normProdId = normalizeId(rawId);
        const prodReviews = mappedReviews.filter((rev) => {
          const revPId = String(rev.productId).trim().toLowerCase();
          const targetPId = rawId.trim().toLowerCase();
          return revPId === targetPId || normalizeId(rev.productId) === normProdId;
        });

        const calculatedReviewCount = prodReviews.length;
        const calculatedRating = calculatedReviewCount > 0
            ? Number((prodReviews.reduce((sum, rev) => sum + rev.rating, 0) / calculatedReviewCount).toFixed(1))
            : parseNumber(p.rating, 5.0);

        const categoryName = String(p.category || 'Kitchen Appliances') as Product['category'];
        const categorySlug = getCategorySlug(categoryName);
        const price = parseNumber(p.price, 0);
        let originalPrice: number | undefined = undefined;

        if (p.originalPrice !== undefined && p.originalPrice !== null && String(p.originalPrice).trim() !== '') {
          const parsedOrig = parseNumber(p.originalPrice);
          if (parsedOrig > price) originalPrice = parsedOrig;
        } else if (price > 0) {
          originalPrice = Number((price * 1.15).toFixed(2));
        }

        const rawImageStrings: string[] = parseArrayField(p.image);
        const allFormattedImages: string[] = [];
        for (const rawImg of rawImageStrings) {
          const formatted = formatImageUrl(rawImg);
          if (formatted && !allFormattedImages.includes(formatted)) {
            allFormattedImages.push(formatted);
          }
        }

        const mainImage = allFormattedImages.length > 0 ? allFormattedImages[0] : DEFAULT_PRODUCT_IMAGE;
        const galleryImages = allFormattedImages.length > 0 ? allFormattedImages : [DEFAULT_PRODUCT_IMAGE];
        const features = parseArrayField(p.features);

        let specifications: Record<string, string> = {};
        if (p.specifications && typeof p.specifications === 'object' && !Array.isArray(p.specifications)) {
          specifications = p.specifications as Record<string, string>;
        } else if (typeof p.specifications === 'string' && p.specifications.trim()) {
          const specStr = p.specifications.trim();
          if (specStr.includes('|')) {
            specStr.split('|').forEach((pair: string) => {
              const parts = pair.split(':');
              if (parts.length >= 2) {
                specifications[parts[0].trim()] = parts.slice(1).join(':').trim();
              } else {
                specifications[`Spec ${Object.keys(specifications).length + 1}`] = pair.trim();
              }
            });
          } else {
            specifications['Overview'] = specStr;
          }
        }

        return {
          id: rawId,
          name: String(p.name || 'Smart Appliance'),
          category: categoryName,
          categorySlug,
          price,
          originalPrice,
          cogs: p.cogs ? parseNumber(p.cogs) : undefined,
          rating: calculatedRating,
          reviewCount: calculatedReviewCount || parseNumber(p.reviewCount, 0),
          image: mainImage,
          galleryImages,
          description: String(p.description || p.specifications || ''),
          features: features.length > 0 ? features : ['Smart connectivity', 'High efficiency'],
          specifications,
          isFeatured: parseBoolean(p.isFeatured, false),
          isNew: parseBoolean(p.isNew, false),
          badge: p.badge ? String(p.badge) : undefined,
          inStock: parseBoolean(p.inStock, true),
          colors: parseColorFinish(p.colors),
          deliveryTime: p.deliveryTime ? String(p.deliveryTime) : '3 - 5 Business Days',
          deliveryCharge: (() => {
            if (p.deliveryCharge === undefined || p.deliveryCharge === null || String(p.deliveryCharge).trim() === '') return 0;
            const rawStr = String(p.deliveryCharge).trim();
            if (rawStr.toUpperCase() === 'FREE') return 'FREE';
            return parseNumber(p.deliveryCharge, 0);
          })(),
        };
      });

      setProducts(mappedProducts);
      setReviews(mappedReviews);
      try {
        localStorage.setItem('zentra_cached_products', JSON.stringify(mappedProducts));
        localStorage.setItem('zentra_cached_reviews', JSON.stringify(mappedReviews));
      } catch (e) {
        console.warn('Failed to save to local cache', e);
      }
      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          const count = mappedProducts.filter(
            (prod) => prod.categorySlug === cat.slug || prod.category === cat.name
          ).length;
          return { ...cat, itemCount: count };
        })
      );
    } catch (err: any) {
      console.error('Failed to fetch product data:', err);
      setError(err.message || 'Error fetching data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getProductById = useCallback(
    (id: string): Product | undefined => {
      if (!id) return undefined;
      const targetNorm = normalizeId(id);
      return products.find((p) => p.id === id) || products.find((p) => normalizeId(p.id) === targetNorm);
    },
    [products]
  );

  const getReviewsByProductId = useCallback(
    (productId: string): ReviewItem[] => {
      if (!productId) return reviews;
      const targetNorm = normalizeId(productId);
      const matched = reviews.filter((r) => normalizeId(r.productId) === targetNorm);
      return matched.length > 0 ? matched : reviews;
    },
    [reviews]
  );

  const addReview = useCallback((newReview: ReviewItem) => {
    setReviews((prev) => [newReview, ...prev]);
  }, []);

  return (
    <DataContext.Provider
      value={{
        products, reviews, categories, isLoading, error,
        getProductById, getReviewsByProductId, addReview, refetch: fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};