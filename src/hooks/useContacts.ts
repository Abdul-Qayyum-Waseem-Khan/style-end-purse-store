import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'sonner';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const useContacts = (options?: { page?: number; limit?: number }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalDocs: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));

      const { data } = await axiosInstance.get(`/api/v1/contact?${params.toString()}`);
      setMessages(data.data || []);
      if (data.pagination) {
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          totalDocs: data.pagination.totalDocs,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsLoading(false);
    }
  }, [options?.page, options?.limit]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const submitContactForm = async (formData: { name: string; email: string; subject: string; message: string }) => {
    try {
      const { data } = await axiosInstance.post('/api/v1/contact', formData);
      toast.success(data.message || 'Message sent successfully!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send message');
      return false;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.put(`/api/v1/contact/${id}`);
      fetchMessages();
      return true;
    } catch (err: any) {
      toast.error('Failed to mark message as read');
      return false;
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/v1/contact/${id}`);
      toast.success('Message deleted');
      fetchMessages();
      return true;
    } catch (err: any) {
      toast.error('Failed to delete message');
      return false;
    }
  };

  return {
    messages,
    pagination,
    isLoading,
    fetchMessages,
    submitContactForm,
    markAsRead,
    deleteMessage,
  };
};
