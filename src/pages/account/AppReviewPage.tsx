import { useState, useEffect } from 'react';
import { Button } from '../../app/components/ui/button';
import { Star, MessageSquare, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'sonner';

export function AppReviewPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    fetchMyReview();
  }, []);

  const fetchMyReview = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/v1/store-reviews/me');
      if (data.data) {
        setExistingReview(data.data);
        setRating(data.data.rating);
        setComment(data.data.comment);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axiosInstance.post('/api/v1/store-reviews', { rating, comment });
      setExistingReview(data.data);
      toast.success(data.message || 'Thank you for sharing your experience!');
    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Loading Review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-2 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif-luxury">Rate Your Experience</h1>
        <p className="text-xs text-gray-500 mt-0.5">Let us know how your experience with Style End Purse has been</p>
      </div>

      <div className="bg-[#FAFAFA] rounded-2xl border border-gray-200/80 p-6 sm:p-8 space-y-6">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            Your Valued Feedback
          </div>
          <p className="text-xs text-gray-500">
            Approved client testimonials are featured on our official store homepage.
          </p>
        </div>

        {existingReview && !existingReview.isApproved && (
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            Your review was submitted and is pending verification. You can update your thoughts below anytime.
          </div>
        )}

        {existingReview && existingReview.isApproved && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Your review is approved and live on the Style End Purse boutique!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200/60 shadow-xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-hidden transition-transform hover:scale-125"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200 hover:text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-gray-700 ml-2">
                {rating > 0 ? `${rating} of 5 Stars` : 'Select stars'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Your Review & Comments
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of our handbag quality, leather finish, and delivery speed?"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-full px-8 py-3 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                existingReview ? 'Update Review' : 'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
