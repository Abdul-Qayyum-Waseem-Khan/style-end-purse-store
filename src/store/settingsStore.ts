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

export interface TrustBadge {
  icon?: string;
  title: string;
  subtitle?: string;
}

interface SettingsState {
  deliveryConfig: DeliveryConfig;
  topBar: TopBarConfig | null;
  brandPillars: BrandPillar[];
  trustBadges: TrustBadge[];
  showCustomerCount: boolean;
  customerCount: number | null;
  hasFetchedThisLoad: boolean;
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
  trustBadges: cachedInitial?.trustBadges || [],
  showCustomerCount: cachedInitial?.showCustomerCount || false,
  customerCount: cachedInitial?.customerCount ?? null,
  hasFetchedThisLoad: false,
  isLoading: false,

  fetchSettings: async (force = false) => {
    // Only skip if already fetched in this JS page load (so F5 refresh always gets latest from DB)
    if (!force && get().hasFetchedThisLoad) {
      return;
    }
    try {
      set({ isLoading: true });
      const [{ data }, statsRes] = await Promise.all([
        axiosInstance.get('/api/v1/settings'),
        axiosInstance.get('/api/v1/store/stats').catch(() => ({ data: null })),
      ]);
      const raw = data?.data || {};
      const statsData = statsRes?.data?.data || {};

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
      const trustBadges: TrustBadge[] = Array.isArray(raw.trustBadges) ? raw.trustBadges : [];
      const showCustomerCount = Boolean(statsData.showCustomerCount ?? raw.showCustomerCount);
      const customerCount = typeof statsData.customerCount === 'number' ? statsData.customerCount : null;

      sessionCache.set(SETTINGS_CACHE_KEY, { deliveryConfig, topBar, brandPillars, trustBadges, showCustomerCount, customerCount });
      set({ deliveryConfig, topBar, brandPillars, trustBadges, showCustomerCount, customerCount, hasFetchedThisLoad: true });
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
