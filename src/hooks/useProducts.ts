import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../api/axios';
import { sessionCache } from '../utils/sessionCache';

export interface ColorVariant {
  _id?: string;
  name: string;
  hex: string;
  image?: string;
  stock?: number;
}

export interface SetOption {
  _id?: string;
  name: string;
  price: number;
  comparePrice?: number;
  includedItems?: string[];
  sku?: string;
  isDefault?: boolean;
}

export interface ProductDimensions {
  length?: string;
  width?: string;
  height?: string;
  strapDrop?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  productType?: 'single' | 'bundle' | 'set';
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  isOnSale: boolean;
  images: string[];
  video?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  stock: number;
  SKU?: string;
  colors?: ColorVariant[];
  setOptions?: SetOption[];
  material?: string;
  hardware?: string;
  lining?: string;
  dimensions?: ProductDimensions;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  numOfReviews: number;
  badges?: {
    authentic?: { title: string; subtitle: string; };
    delivery?: { title: string; subtitle: string; };
  };
}

export interface Pagination {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface UseProductsOptions {
  category?: string;
  categories?: string;
  search?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sort?: string;
  page?: string | number;
  limit?: string | number;
  status?: string;
  isAdmin?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const cacheKey = `products_${JSON.stringify(options)}`;
  const cached = useRef(sessionCache.get<{ products: Product[]; pagination: Pagination | null }>(cacheKey));

  const [products, setProducts] = useState<Product[]>(() => cached.current?.products || []);
  const [pagination, setPagination] = useState<Pagination | null>(() => cached.current?.pagination || null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached.current);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.category) params.append('category', options.category);
      if (options.categories) params.append('categories', options.categories);
      if (options.search) params.append('search', options.search);
      if (options.minPrice) params.append('minPrice', options.minPrice.toString());
      if (options.maxPrice) params.append('maxPrice', options.maxPrice.toString());
      if (options.sort) params.append('sort', options.sort);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);

      const endpoint = options.isAdmin ? '/api/v1/products/admin/all' : '/api/v1/products';
      const { data } = await axiosInstance.get(`${endpoint}?${params.toString()}`);
      
      const mappedProducts = (data.data || []).map((p: any) => ({ ...p, id: p.id || p._id }));
      
      setProducts(mappedProducts);
      setPagination(data.pagination || null);

      // Save into session cache
      sessionCache.set(cacheKey, {
        products: mappedProducts,
        pagination: data.pagination || null
      });
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [
    cacheKey,
    options.category,
    options.categories,
    options.search,
    options.minPrice,
    options.maxPrice,
    options.sort,
    options.page,
    options.limit,
    options.status,
    options.isAdmin
  ]);

  useEffect(() => {
    const cachedData = sessionCache.get<{ products: Product[]; pagination: Pagination | null }>(cacheKey);
    if (cachedData) {
      setProducts(cachedData.products);
      setPagination(cachedData.pagination);
      setIsLoading(false);
      if (!sessionCache.isFresh(cacheKey, 30_000)) {
        fetchProducts(true);
      }
    } else {
      fetchProducts(false);
    }
  }, [cacheKey, fetchProducts]);

  const deleteProduct = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/v1/products/${id}`);
      sessionCache.invalidate('products_');
      await fetchProducts(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to delete product' };
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axiosInstance.put(`/api/v1/products/${id}`, { isActive: !currentStatus });
      sessionCache.invalidate('products_');
      await fetchProducts(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to toggle status' };
    }
  };

  const updateProductPartial = async (id: string, data: Partial<Product>) => {
    try {
      await axiosInstance.put(`/api/v1/products/${id}`, data);
      sessionCache.invalidate('products_');
      await fetchProducts(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to update product' };
    }
  };

  const bulkUpdateProducts = async (updates: { id: string, data: Partial<Product> }[]) => {
    try {
      await axiosInstance.put(`/api/v1/products/admin/bulk-update`, { updates });
      sessionCache.invalidate('products_');
      await fetchProducts(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to bulk update products' };
    }
  };

  return { products, pagination, isLoading, error, refetch: () => fetchProducts(false), deleteProduct, toggleProductStatus, updateProductPartial, bulkUpdateProducts };
}
