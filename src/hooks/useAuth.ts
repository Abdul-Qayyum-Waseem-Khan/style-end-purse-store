import { useCallback } from 'react';
import axiosInstance from '../api/axios';
import { useAuthStore, User } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      // We'll create this endpoint in the backend to return { user: { name, role, userId } }
      const { data } = await axiosInstance.get('/api/v1/auth/me');
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const login = async (credentials: any) => {
    const { data } = await axiosInstance.post('/api/v1/auth/login', credentials);
    if (data.requires2FA) {
      return data;
    }
    setUser(data.user);
    return data;
  };

  const register = async (userData: any) => {
    const { data } = await axiosInstance.post('/api/v1/auth/register', userData);
    return data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchCurrentUser,
    setUser,
  };
};
