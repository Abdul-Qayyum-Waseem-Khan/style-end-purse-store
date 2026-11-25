import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_gift';
  value?: number;
  giftDescription?: string;
  minOrderAmount?: number;
  isActive: boolean;
  expiryDate?: string;
  usageLimit?: number | null;
  usedCount: number;
  applicableToFirstOrderOnly: boolean;
  createdAt: string;
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/v1/coupons');
      setCoupons(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch coupons');
      console.error('Error fetching coupons:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const addCoupon = async (couponData: Partial<Coupon>) => {
    const { data } = await axiosInstance.post('/api/v1/coupons', couponData);
    setCoupons((prev) => [data.data, ...prev]);
    return data.data;
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    const { data } = await axiosInstance.put(`/api/v1/coupons/${id}`, couponData);
    setCoupons((prev) => prev.map((c) => (c._id === id ? data.data : c)));
    return data.data;
  };

  const deleteCoupon = async (id: string) => {
    await axiosInstance.delete(`/api/v1/coupons/${id}`);
    setCoupons((prev) => prev.filter((c) => c._id !== id));
  };

  return {
    coupons,
    isLoading,
    error,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    refetch: fetchCoupons,
  };
}
