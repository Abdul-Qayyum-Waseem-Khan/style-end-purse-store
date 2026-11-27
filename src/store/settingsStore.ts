import { create } from 'zustand';
import axiosInstance from '../api/axios';
import { sessionCache } from '../utils/sessionCache';

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

export interface TopBarConfig {
  enabled: boolean;
  leftText: string;
  centerText: string;
  rightText: string;
}

export interface BrandPillar {
  title: string;
  description: string;
}

interface SettingsState {
  deliveryConfig: DeliveryConfig;
  topBar: TopBarConfig | null;
  brandPillars: BrandPillar[];
  hasLoaded: boolean;
  isLoading: boolean;
  fetchSettings: (force?: boolean) => Promise<void>;
}

const SETTINGS_CACHE_KEY = 'public_store_settings';

const defaultDeliveryConfig: DeliveryConfig = {
  isOverallFree: false,
  defaultRate: 200,
  ranges: [
    { min: 0, max: 2000, rate: 200 },
    { min: 2001, max: 99999999, rate: 0 }
  ]
};

const cachedInitial = sessionCache.get<any>(SETTINGS_CACHE_KEY);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  deliveryConfig: cachedInitial?.deliveryConfig || defaultDeliveryConfig,
  topBar: cachedInitial?.topBar || null,
  brandPillars: cachedInitial?.brandPillars || [],
  hasLoaded: Boolean(cachedInitial),
  isLoading: false,

  fetchSettings: async (force = false) => {
    if (!force && get().hasLoaded && sessionCache.isFresh(SETTINGS_CACHE_KEY, 1000 * 60 * 5)) {
      return;
    }
    try {
      set({ isLoading: true });
      const { data } = await axiosInstance.get('/api/v1/settings');
      const raw = data?.data || {};

      let deliveryConfig = defaultDeliveryConfig;
      if (raw.deliveryConfig) {
        deliveryConfig = raw.deliveryConfig;
      } else if (raw.shippingRate !== undefined) {
        const rate = raw.shippingRate || 0;
        const threshold = raw.freeShippingThreshold || 99999999;
        deliveryConfig = {
          isOverallFree: false,
          defaultRate: rate,
          ranges: [
            { min: 0, max: threshold, rate },
            { min: threshold + 1, max: 99999999, rate: 0 }
          ]
        };
      }

      const topBar: TopBarConfig | null = raw.topBar || null;
      const brandPillars: BrandPillar[] = Array.isArray(raw.brandPillars) ? raw.brandPillars : [];

      sessionCache.set(SETTINGS_CACHE_KEY, { deliveryConfig, topBar, brandPillars });
      set({ deliveryConfig, topBar, brandPillars, hasLoaded: true });
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
