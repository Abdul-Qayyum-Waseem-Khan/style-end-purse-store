import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import api from '../../api/axios';
import { sessionCache } from '../../utils/sessionCache';

interface StoreReview {
  _id: string;
  rating: number;
  comment: string;
  user?: { name?: string };
  createdAt: string;
}

const STORE_REVIEWS_CACHE_KEY = 'public_store_reviews';

export function StoreReviewsSection() {
  const [reviews, setReviews] = useState<StoreReview[]>(() => {
    return sessionCache.get<StoreReview[]>(STORE_REVIEWS_CACHE_KEY) || [];
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/api/v1/store-reviews/public');
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setReviews(list);
        sessionCache.set(STORE_REVIEWS_CACHE_KEY, list);
      } catch {
        // Silent fallback
      }
    };

    const cached = sessionCache.get<StoreReview[]>(STORE_REVIEWS_CACHE_KEY);
    if (cached) {
      setReviews(cached);
      if (!sessionCache.isFresh(STORE_REVIEWS_CACHE_KEY, 1000 * 60 * 5)) {
        fetchReviews();
      }
    } else {
      fetchReviews();
    }
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-14 bg-[#FAF8F5] border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A67C38] block mb-1">
              Client Testimonials
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111111] font-serif-luxury">
              Loved by Our Clients
            </h2>
          </div>
          <p className="text-xs text-gray-500">Verified experiences across Pakistan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.slice(0, 6).map((rev) => (
            <div
              key={rev._id}
              className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-4 luxury-card-hover"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-[#A67C38] text-[#A67C38]' : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="w-4 h-4 text-[#C5A880]/60" />
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#111111] text-[#C5A880] flex items-center justify-center text-xs font-bold uppercase shrink-0">
                  {rev.user?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111111]">{rev.user?.name || 'Verified Client'}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
