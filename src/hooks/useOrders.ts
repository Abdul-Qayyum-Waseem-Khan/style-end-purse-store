import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

export interface OrderItem {
  product: {
    _id: string;
    id?: string;
    name: string;
    price: number;
    images: string[];
    SKU?: string;
    stock?: number;
  };
  quantity: number;
  price: number;
  _id: string;
}

export interface Order {
  _id: string;
  id?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  paymentDetails?: {
    phone?: string;
    transactionId?: string;
  };
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  trackingId?: string;
  expectedDeliveryDate?: string;
  paymentStatus: string;
  statusHistory: {
    status: string;
    note?: string;
    timestamp: string;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseOrdersOptions {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.paymentMethod) params.append('paymentMethod', options.paymentMethod);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.search) params.append('search', options.search);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const { data } = await axiosInstance.get(`/api/v1/orders?${params.toString()}`);
      
      const mappedOrders = data.data.map((o: any) => ({ ...o, id: o._id }));
      setOrders(mappedOrders);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [
    options.status,
    options.paymentMethod,
    options.startDate,
    options.endDate,
    options.search,
    options.page,
    options.limit
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const bulkConfirm = async (orderIds: string[]) => {
    try {
      await axiosInstance.put('/api/v1/orders/bulk-confirm', { orderIds });
      await fetchOrders();
      return { success: true };
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to confirm orders');
    }
  };

  return { orders, pagination, isLoading, error, refetch: fetchOrders, bulkConfirm };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get(`/api/v1/orders/${id}`);
      setOrder({ ...data.data, id: data.data._id });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.error || 'Failed to fetch order');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (status: string, note?: string, expectedDeliveryDate?: string) => {
    try {
      const { data } = await axiosInstance.put(`/api/v1/orders/${id}/status`, { status, note, expectedDeliveryDate });
      setOrder({ ...data.data, id: data.data._id });
      return { success: true };
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update status');
    }
  };

  return { order, isLoading, error, refetch: fetchOrder, updateStatus };
}
