import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios';
import { Product } from './useProducts';
import { sessionCache } from '../utils/sessionCache';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  ordersToday: number;
  pendingOrders: number;
  pendingPaymentsAmount: number;
  totalUsers: number;
  newUsersThisMonth: number;
  totalProducts: number;
  lowStockProducts: Product[];
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { _id: string; name: string; unitsSold: number; revenue: number }[];
  ordersByStatus: Record<string, number>;
  recentOrders: any[];
}

const CACHE_KEY = 'admin_stats_overview';

export function useAdminStats() {
  const cached = useRef(sessionCache.get<AdminStats>(CACHE_KEY));
  const [stats, setStats] = useState<AdminStats | null>(() => cached.current);
  const [isLoading, setIsLoading] = useState(() => !cached.current);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      const { data } = await axiosInstance.get('/api/v1/admin/stats');
      setStats(data.data);
      sessionCache.set(CACHE_KEY, data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err.response?.data?.error || 'Failed to fetch admin stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = sessionCache.get<AdminStats>(CACHE_KEY);
    if (cachedData) {
      setStats(cachedData);
      setIsLoading(false);
      if (!sessionCache.isFresh(CACHE_KEY, 1000 * 60 * 2)) {
        fetchStats(true);
      }
    } else {
      fetchStats(false);
    }
  }, []);

  return { stats, isLoading, error, refetch: () => fetchStats(false) };
}
