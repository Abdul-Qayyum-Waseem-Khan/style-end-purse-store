import { create } from 'zustand';
import axiosInstance from '../api/axios';

export interface DeliveryRange {
  min: number;
  max: number;
  rate: number;
}

export interface DeliveryConfig {
  isOverallFree: boolean;
  defaultRate: number;
  ranges: DeliveryRange[];
}

interface SettingsState {
  deliveryConfig: DeliveryConfig;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
}

const defaultDeliveryConfig: DeliveryConfig = {
  isOverallFree: false,
  defaultRate: 200,
  ranges: [
    { min: 0, max: 2000, rate: 200 },
    { min: 2001, max: 99999999, rate: 0 }
  ]
};

export const useSettingsStore = create<SettingsState>((set) => ({
  deliveryConfig: defaultDeliveryConfig,
  isLoading: false,

  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axiosInstance.get('/api/v1/settings');
      if (data?.data?.deliveryConfig) {
        set({ deliveryConfig: data.data.deliveryConfig });
      } else if (data?.data?.shippingRate !== undefined) {
        // Fallback to legacy shipping settings if the new config isn't saved yet
        const rate = data.data.shippingRate || 0;
        const threshold = data.data.freeShippingThreshold || 99999999;
        
        set({
          deliveryConfig: {
            isOverallFree: false,
            defaultRate: rate,
            ranges: [
              { min: 0, max: threshold, rate: rate },
              { min: threshold + 1, max: 99999999, rate: 0 }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
