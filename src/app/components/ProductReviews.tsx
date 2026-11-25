import { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';

export function ProductReviews({ productId }: { productId: string }) {
  const { reviews, isLoading, fetchReviews, submitReview, deleteReview } = useReviews(productId);
  const { isAuthenticated, user } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    const success = await submitReview(rating, comment);
    if (success) {
      setRating(5);
      setComment('');
    }
    setIsSubmitting(false);
  };

  const userHasReviewed = reviews.some((r) => r.user?._id === user?.userId);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="mt-6 md:mt-8 bg-white rounded-lg p-6 md:p-8 border border-gray-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-6 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A67C38] block mb-1">
            Client Feedback
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-[#111111] font-serif-luxury">
            Customer Reviews
          </h3>
        </div>
        {avgRating && (
          <div className="flex items-center gap-2 bg-[#FAF8F5] px-3.5 py-2 rounded-md border border-[#C5A880]/30">
            <Star className="w-4 h-4 fill-[#A67C38] text-[#A67C38]" />
            <span className="text-sm font-bold text-[#111111]">{avgRating}</span>
            <span className="text-xs text-gray-500">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {/* Write a Review Section */}
      {isAuthenticated ? (
        !userHasReviewed ? (
          <form onSubmit={handleSubmit} className="mb-8 bg-[#FAF8F5] p-5 md:p-6 rounded-lg border border-gray-200/80">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#111111] mb-4">Write a Review</h4>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Your Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating
                          ? 'fill-[#A67C38] text-[#A67C38]'
                          : 'fill-gray-200 text-gray-200 hover:fill-[#C5A880]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Your Experience</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full min-h-[96px] rounded-md border border-gray-300 bg-white p-3 text-sm focus:ring-1 focus:ring-[#111111] focus:border-[#111111] outline-none"
                placeholder="Share your thoughts on the craftsmanship, finish, or fit..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="bg-[#111111] hover:bg-black text-white rounded-md text-xs font-semibold uppercase tracking-wider px-5 py-2.5"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        ) : (
          <div className="mb-8 bg-[#FAF8F5] p-4 rounded-lg border border-[#C5A880]/40 text-xs font-medium text-[#111111] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A67C38] shrink-0" />
            You have already submitted a review for this piece. Thank you!
          </div>
        )
      ) : (
        <div className="mb-8 bg-[#FAF8F5] p-5 rounded-lg border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-gray-600">Sign in to share your review on this piece.</p>
          <Link to="/login">
            <Button className="bg-[#111111] hover:bg-black text-white rounded-md text-xs font-semibold uppercase tracking-wider px-5">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <div>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to review this piece!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="p-4 rounded-lg border border-gray-200/80 bg-[#FAF8F5]/50 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-[#111111] flex items-center justify-center text-[#C5A880] text-xs font-bold uppercase shrink-0">
                        {review.user?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-[#111111] leading-tight">
                          {review.user?.name || 'Verified Client'}
                        </h5>
                        <span className="text-[11px] text-gray-400">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {(user?.role === 'admin' || user?.userId === review.user?._id) && (
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating ? 'fill-[#A67C38] text-[#A67C38]' : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
