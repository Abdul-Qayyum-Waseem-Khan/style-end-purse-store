import { useState, useCallback, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios';
import { sessionCache } from '../utils/sessionCache';
import { toast } from 'sonner';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: { _id: string; name: string; avatar: string };
  coverImage: string;
  gallery: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export const useBlogs = (options?: { admin?: boolean; page?: number; limit?: number }) => {
  const cacheKey = `blogs_${options?.page || 1}_${options?.limit || 10}_${options?.admin ? 'adm' : 'pub'}`;
  const cached = useRef(sessionCache.get<{ blogs: Blog[]; pagination: any }>(cacheKey));

  const [blogs, setBlogs] = useState<Blog[]>(() => cached.current?.blogs || []);
  const [pagination, setPagination] = useState(() => cached.current?.pagination || { page: 1, totalPages: 1, totalDocs: 0 });
  const [isLoading, setIsLoading] = useState(() => !cached.current);

  const fetchBlogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.admin) params.append('admin', 'true');
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));

      const { data } = await axiosInstance.get(`/api/v1/blogs?${params.toString()}`);
      const list = data.data || [];
      const pag = data.pagination ? {
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        totalDocs: data.pagination.totalDocs,
      } : { page: 1, totalPages: 1, totalDocs: list.length };

      setBlogs(list);
      setPagination(pag);
      sessionCache.set(cacheKey, { blogs: list, pagination: pag });
    } catch (err: any) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, options?.admin, options?.page, options?.limit]);

  useEffect(() => {
    const cachedData = sessionCache.get<{ blogs: Blog[]; pagination: any }>(cacheKey);
    if (cachedData) {
      setBlogs(cachedData.blogs);
      setPagination(cachedData.pagination);
      setIsLoading(false);
      if (!sessionCache.isFresh(cacheKey)) {
        fetchBlogs(true);
      }
    } else {
      fetchBlogs(false);
    }
  }, [cacheKey, fetchBlogs]);

  const getBlogBySlug = async (slug: string) => {
    const itemKey = `blog_slug_${slug}`;
    const cachedItem = sessionCache.get<Blog>(itemKey);
    if (cachedItem) return cachedItem;

    try {
      const { data } = await axiosInstance.get(`/api/v1/blogs/${slug}`);
      if (data.data) {
        sessionCache.set(itemKey, data.data);
      }
      return data.data as Blog;
    } catch (err: any) {
      toast.error('Failed to load blog post');
      return null;
    }
  };

  const createBlog = async (blogData: Partial<Blog> | FormData) => {
    try {
      await axiosInstance.post('/api/v1/blogs', blogData, {
        headers: blogData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      sessionCache.invalidate('blogs_');
      toast.success('Blog created successfully');
      fetchBlogs(false);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create blog');
      return false;
    }
  };

  const updateBlog = async (slug: string, blogData: Partial<Blog> | FormData) => {
    try {
      await axiosInstance.put(`/api/v1/blogs/${slug}`, blogData, {
        headers: blogData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      sessionCache.invalidate('blogs_');
      sessionCache.invalidate(`blog_slug_${slug}`);
      toast.success('Blog updated');
      fetchBlogs(false);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update blog');
      return false;
    }
  };

  const deleteBlog = async (slug: string) => {
    try {
      await axiosInstance.delete(`/api/v1/blogs/${slug}`);
      sessionCache.invalidate('blogs_');
      sessionCache.invalidate(`blog_slug_${slug}`);
      toast.success('Blog deleted');
      fetchBlogs(false);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete blog');
      return false;
    }
  };

  return {
    blogs,
    pagination,
    isLoading,
    fetchBlogs: () => fetchBlogs(false),
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
  };
};
