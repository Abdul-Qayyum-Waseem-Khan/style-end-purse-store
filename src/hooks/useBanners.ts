import { useState, useCallback, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios';
import { sessionCache } from '../utils/sessionCache';
import { toast } from 'sonner';

export interface Banner {
  _id: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  image?: string;
  colorGradient?: string;
  colorTheme?: string;
  type: 'hero' | 'flash_sale' | 'top_bar' | 'popup';
  badgeText?: string;
  endDate?: string;
  templateDesign?: string;
  discountOffer?: string;
  originalPrice?: string;
  salePrice?: string;
  stockPercent?: number;
  productId?: string;
  placements?: string[];
  isActive: boolean;
  order: number;
}

export const useBanners = (options?: { admin?: boolean; type?: string }) => {
  const cacheKey = `banners_${options?.type || 'all'}_${options?.admin ? 'admin' : 'pub'}`;
  const cached = useRef(sessionCache.get<Banner[]>(cacheKey));

  const [banners, setBanners] = useState<Banner[]>(() => cached.current || []);
  const [isLoading, setIsLoading] = useState(() => !cached.current);

  const fetchBanners = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.admin) params.append('admin', 'true');
      if (options?.type) params.append('type', options.type);

      const { data } = await axiosInstance.get(`/api/v1/banners?${params.toString()}`);
      const list = data.data || [];
      setBanners(list);
      sessionCache.set(cacheKey, list);
    } catch (err: any) {
      console.error('Failed to fetch banners', err);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, options?.admin, options?.type]);

  useEffect(() => {
    const cachedData = sessionCache.get<Banner[]>(cacheKey);
    if (cachedData && cachedData.length > 0) {
      setBanners(cachedData);
      setIsLoading(false);
      if (!sessionCache.isFresh(cacheKey)) {
        fetchBanners(true);
      }
    } else {
      fetchBanners(false);
    }
  }, [cacheKey, fetchBanners]);

  const createBanner = async (bannerData: FormData | Partial<Banner>) => {
    try {
      await axiosInstance.post('/api/v1/banners', bannerData);
      sessionCache.invalidate('banners_');
      toast.success('Banner created successfully');
      fetchBanners(false);
      return true;
    } catch (err: any) {
      let errMsg = 'Failed to create banner';
      if (err.response?.data?.error) {
        const errorData = err.response.data.error;
        errMsg = typeof errorData === 'string' ? errorData : errorData.message || JSON.stringify(errorData);
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
      return false;
    }
  };

  const updateBanner = async (id: string, bannerData: FormData | Partial<Banner>) => {
    try {
      await axiosInstance.put(`/api/v1/banners/${id}`, bannerData);
      sessionCache.invalidate('banners_');
      toast.success('Banner updated');
      fetchBanners(false);
      return true;
    } catch (err: any) {
      let errMsg = 'Failed to update banner';
      if (err.response?.data?.error) {
        const errorData = err.response.data.error;
        errMsg = typeof errorData === 'string' ? errorData : errorData.message || JSON.stringify(errorData);
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
      return false;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/v1/banners/${id}`);
      sessionCache.invalidate('banners_');
      toast.success('Banner deleted');
      fetchBanners(false);
      return true;
    } catch (err: any) {
      let errMsg = 'Failed to delete banner';
      if (err.response?.data?.error) {
        const errorData = err.response.data.error;
        errMsg = typeof errorData === 'string' ? errorData : errorData.message || JSON.stringify(errorData);
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
      return false;
    }
  };

  return {
    banners,
    isLoading,
    fetchBanners: () => fetchBanners(false),
    createBanner,
    updateBanner,
    deleteBanner,
  };
};
