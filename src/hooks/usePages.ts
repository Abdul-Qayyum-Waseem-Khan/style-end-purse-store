import { useState, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'sonner';

export interface PageData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  images: string[];
  isActive: boolean;
}

export const usePages = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get(`/api/v1/pages`);
      setPages(data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch pages', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPageBySlug = async (slug: string) => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/pages/${slug}`);
      return data.data as PageData;
    } catch (err: any) {
      console.error(`Failed to load page ${slug}`, err);
      return null;
    }
  };

  const savePage = async (pageData: Partial<PageData>) => {
    try {
      await axiosInstance.post('/api/v1/pages', pageData);
      toast.success('Page saved successfully');
      fetchPages();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save page');
      return false;
    }
  };

  return {
    pages,
    isLoading,
    fetchPages,
    getPageBySlug,
    savePage,
  };
};
