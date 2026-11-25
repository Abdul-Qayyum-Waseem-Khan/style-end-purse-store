import { useState, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'sonner';

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string;
  createdAt: string;
}

export const useReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(`/api/v1/reviews/product/${productId}?page=${page}&limit=${limit}`);
      setReviews(data.reviews.docs);
      setTotalReviews(data.reviews.totalDocs);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const submitReview = async (rating: number, comment: string) => {
    try {
      await axiosInstance.post('/api/v1/reviews', { product: productId, rating, comment });
      toast.success('Review submitted successfully!');
      fetchReviews(); // Refresh the list
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await axiosInstance.delete(`/api/v1/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete review');
      return false;
    }
  };

  return {
    reviews,
    totalReviews,
    isLoading,
    fetchReviews,
    submitReview,
    deleteReview,
  };
};
