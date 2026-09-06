import React, { useState, useRef, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageSquarePlus,
  X,
  Award,
  Camera,
  ZoomIn,
  Upload,
  Image as ImageIcon,
  Plus,
  SlidersHorizontal,
  Filter,
  Check,
  User,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

export interface ReviewItem {
  id: string;
  productId?: string;
  author: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  variant?: string;
  helpfulCount: number;
  unhelpfulCount: number;
  images?: string[];
  userLiked?: boolean;
  userUnliked?: boolean;
  reported?: boolean;
}

const DEFAULT_REVIEWS: ReviewItem[] = [];

export interface ProductReviewsProps {
  productId?: string;
  initialRating?: number;
  initialReviewCount?: number;
  onRatingStatsChange?: (stats: { avgRating: number; totalReviews: number }) => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  onRatingStatsChange,
}) => {
  const { reviews: globalReviews, getReviewsByProductId, addReview: addGlobalReview } = useData();
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getReviewsByProductId(productId || ''));

  useEffect(() => {
    setReviews(getReviewsByProductId(productId || ''));
  }, [productId, globalReviews, getReviewsByProductId]);

  const onRatingStatsChangeRef = useRef(onRatingStatsChange);
  useEffect(() => {
    onRatingStatsChangeRef.current = onRatingStatsChange;
  }, [onRatingStatsChange]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'top' | 'recent' | 'photos'>('top');
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newVariant, setNewVariant] = useState('Color: Pure Slate White');
  const [newImageInput, setNewImageInput] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reportToast, setReportToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  useEffect(() => {
    if (onRatingStatsChangeRef.current) {
      onRatingStatsChangeRef.current({
        avgRating: Number(avgRating),
        totalReviews,
      });
    }
  }, [avgRating, totalReviews]);

  const handleToggleHelpful = (id: string, isHelpful: boolean) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (isHelpful) {
            const nextUserLiked = !r.userLiked;
            return {
              ...r,
              userLiked: nextUserLiked,
              userUnliked: false,
              helpfulCount: nextUserLiked ? r.helpfulCount + 1 : r.helpfulCount - 1,
              unhelpfulCount: r.userUnliked ? Math.max(0, r.unhelpfulCount - 1) : r.unhelpfulCount,
            };
          } else {
            const nextUserUnliked = !r.userUnliked;
            return {
              ...r,
              userUnliked: nextUserUnliked,
              userLiked: false,
              unhelpfulCount: nextUserUnliked ? r.unhelpfulCount + 1 : r.unhelpfulCount - 1,
              helpfulCount: r.userLiked ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount,
            };
          }
        }
        return r;
      })
    );
  };

  const handleReportReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reported: true } : r))
    );
    setReportToast('Review reported to Zentra moderation team for review.');
    setTimeout(() => setReportToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrlPhoto = () => {
    if (!newImageInput.trim()) return;
    setUploadedPhotos((prev) => [...prev, newImageInput.trim()]);
    setNewImageInput('');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const reviewId = `rev-${Date.now()}`;
    const targetProductId = productId || '1';
    const currentDateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const newRev: ReviewItem = {
      id: reviewId,
      productId: targetProductId,
      author: newAuthor.trim(),
      rating: newRating,
      date: 'Just now',
      variant: newVariant,
      title: newTitle.trim(),
      comment: newComment.trim(),
      verified: true,
      helpfulCount: 0,
      unhelpfulCount: 0,
      images: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
    };

    setReviews([newRev, ...reviews]);
    addGlobalReview(newRev);
    setFormSubmitted(true);

    const authorName = newAuthor.trim();
    const initials = authorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AZ';

    const payload = {
      type: 'review',
      reviewId: reviewId,
      productId: targetProductId,
      author: authorName,
      initials: initials,
      rating: newRating,
      date: currentDateStr,
      verified: true,
      title: newTitle.trim(),
      content: newComment.trim(),
      images: uploadedPhotos.length > 0 ? uploadedPhotos.join('|') : '',
      variant: newVariant || '',
    };

    fetch(
      'https://script.google.com/macros/s/AKfycbycdfssgJItaZiE-zuPfTI0MP6vXxoKT6i7czMoAJVwTkSSt9PbJmCqgGftolcb6VBBHQ/exec',
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      }
    ).catch((err) => {
      console.error('Failed to post review to Google Sheet:', err);
    });

    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
      setNewAuthor('');
      setNewTitle('');
      setNewComment('');
      setNewImageInput('');
      setUploadedPhotos([]);
      setNewRating(5);
    }, 1500);
  };

  const filteredReviews = reviews.filter((r) => {
    if (starFilter !== null && r.rating !== starFilter) return false;
    if (sortBy === 'photos' && (!r.images || r.images.length === 0)) return false;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'top') {
      return b.helpfulCount - a.helpfulCount;
    }
    if (sortBy === 'photos') {
      return (b.images?.length || 0) - (a.images?.length || 0);
    }
    return 0;
  });

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: Math.round(
      (reviews.filter((r) => r.rating === star).length / (reviews.length || 1)) *
        100
    ),
  }));

  return (
    <div className="py-10 space-y-8 border-t border-slate-200">
      {reportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{reportToast}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Customer Reviews
            </h2>
            <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100">
              Verified Feedback
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real experiences and photos from verified Zentra smart appliance owners.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-200 shadow-sm active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {avgRating}
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4.5 h-4.5 ${
                  star <= Math.round(Number(avgRating))
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-slate-600">
            Based on {totalReviews} Customer {totalReviews === 1 ? 'Review' : 'Reviews'}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <Award className="w-3.5 h-3.5" />
            <span>98% Recommended by Owners</span>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col justify-center space-y-2.5 bg-white p-4.5 rounded-xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rating Breakdown</span>
            {starFilter !== null && (
              <button
                onClick={() => setStarFilter(null)}
                className="text-[11px] text-blue-600 hover:underline font-bold"
              >
                Clear Rating Filter
              </button>
            )}
          </div>
          {ratingCounts.map(({ star, count, percentage }) => (
            <button
              key={star}
              onClick={() => setStarFilter(starFilter === star ? null : star)}
              className={`flex items-center gap-3 text-xs w-full group rounded-lg p-1 transition-colors ${
                starFilter === star ? 'bg-blue-50/80 ring-1 ring-blue-200' : 'hover:bg-slate-50'
              }`}
            >
              <span className="font-bold text-slate-700 w-12 flex items-center gap-1">
                {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
              </span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    starFilter === star ? 'bg-blue-600' : 'bg-slate-800 group-hover:bg-blue-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-16 text-right font-medium text-slate-500 text-[11px]">
                {percentage}% ({count})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No reviews found matching filters</p>
            <button
              onClick={() => {
                setStarFilter(null);
                setSortBy('top');
              }}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          sortedReviews.map((rev, revIdx) => (
            <div
              key={`${rev.id || 'review'}-${revIdx}`}
              className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5 transition-all hover:border-slate-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-100 to-slate-200/90 border border-slate-200/90 flex items-center justify-center shrink-0 shadow-xs overflow-hidden ring-1 ring-slate-900/5">
                    {rev.avatarUrl ? (
                      <img
                        src={rev.avatarUrl}
                        alt={rev.author}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100/90 text-slate-500">
                        <User className="w-5 h-5 text-slate-500 stroke-[1.75]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-xs md:text-sm text-slate-900">
                        {rev.author}
                      </h4>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400 mt-0.5">
                      <span>{rev.date}</span>
                      {rev.variant && (
                        <>
                          <span> </span>
                          <span className="text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                            {rev.variant}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                {rev.title ? (
                  <h5 className="font-extrabold text-sm text-slate-900 mb-1">
                    {rev.title}
                  </h5>
                ) : null}
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {rev.images && rev.images.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer Photos ({rev.images.length})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {rev.images.map((imgUrl, idx) => {
                      const formattedUrl = formatImageUrl(imgUrl);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageModal(formattedUrl)}
                          className="group relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all hover:scale-105 active:scale-95 shadow-2xs"
                        >
                          <img
                            src={formattedUrl}
                            alt={`Customer upload ${idx + 1} by ${rev.author}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                          />
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-2"
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={formatImageUrl(activeImageModal)}
              alt="Customer review full resolution"
              className="w-full h-auto max-h-[78vh] object-contain rounded-xl"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Write a Review
                </h3>
                <p className="text-xs text-slate-500">
                  Share your experience and photos from your device gallery.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Thank You for Your Review!
                </h4>
                <p className="text-xs text-slate-500">
                  Your review and gallery photos have been published successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || newRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Variant / Purchased Style
                  </label>
                  <select
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  >
                    <option value="Color: Pure Slate White">Color: Pure Slate White</option>
                    <option value="Color: Obsidian Black / 2.0L Pro">Color: Obsidian Black / 2.0L Pro</option>
                    <option value="Color: Brushed Titanium">Color: Brushed Titanium</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Review Title
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Summarize your overall impression (optional)"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Review Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What did you like or dislike? How does it perform in daily smart home routines?"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Add Photos from Device Gallery
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-4 text-center transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Choose files from Gallery
                        </button>{' '}
                        <span className="text-slate-400">or drag & drop</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Supports PNG, JPG, WEBP photos directly from camera or photo gallery
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex gap-2">
                    <div className="relative flex-1">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="url"
                        value={newImageInput}
                        onChange={(e) => setNewImageInput(e.target.value)}
                        placeholder="Or paste an image URL (https://...)"
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddUrlPhoto}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {uploadedPhotos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-bold text-slate-600 mb-1.5">
                        Selected Photos ({uploadedPhotos.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uploadedPhotos.map((photo, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group shadow-2xs bg-slate-100"
                          >
                            <img
                              src={photo}
                              alt={`Selected ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 bg-slate-900/80 hover:bg-red-600 text-white p-1 rounded-full text-xs transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;