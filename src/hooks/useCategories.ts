import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios';
import { sessionCache } from '../utils/sessionCache';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export function useCategories() {
  const cacheKey = 'categories_all';
  const cached = useRef(sessionCache.get<Category[]>(cacheKey));

  const [categories, setCategories] = useState<Category[]>(() => cached.current || []);
  const [isLoading, setIsLoading] = useState(() => !cached.current);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get('/api/v1/categories');
        const list = data.data || [];
        setCategories(list);
        sessionCache.set(cacheKey, list);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.error || 'Failed to fetch categories');
      } finally {
        setIsLoading(false);
      }
    };

    const cachedData = sessionCache.get<Category[]>(cacheKey);
    if (cachedData && cachedData.length > 0) {
      setCategories(cachedData);
      setIsLoading(false);
      if (!sessionCache.isFresh(cacheKey)) {
        fetchCategories(true);
      }
    } else {
      fetchCategories(false);
    }
  }, []);

  return { categories, isLoading, error };
}
