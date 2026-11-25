/**
 * Global In-Memory & Session Cache for Style End Purse
 * Ensures pages and data loaded once in a session never show loading spinners
 * or reload on subsequent visits during the session.
 */

const memoryCache = new Map<string, { data: any; timestamp: number }>();

const SESSION_PREFIX = 'sep_cache_';
const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes in current session

export const sessionCache = {
  get<T = any>(key: string): T | null {
    // 1. Check memory cache first (fastest)
    const memItem = memoryCache.get(key);
    if (memItem && Date.now() - memItem.timestamp < DEFAULT_TTL) {
      return memItem.data as T;
    }

    // 2. Check sessionStorage
    try {
      const stored = sessionStorage.getItem(SESSION_PREFIX + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < DEFAULT_TTL) {
          memoryCache.set(key, parsed);
          return parsed.data as T;
        } else {
          sessionStorage.removeItem(SESSION_PREFIX + key);
        }
      }
    } catch (e) {
      // sessionStorage unavailable/disabled
    }

    return null;
  },

  isFresh(key: string, staleTimeMs = 1000 * 60 * 5): boolean {
    const memItem = memoryCache.get(key);
    if (memItem) {
      return Date.now() - memItem.timestamp < staleTimeMs;
    }
    try {
      const stored = sessionStorage.getItem(SESSION_PREFIX + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Date.now() - parsed.timestamp < staleTimeMs;
      }
    } catch {
      // ignore
    }
    return false;
  },

  set(key: string, data: any): void {
    const entry = { data, timestamp: Date.now() };
    memoryCache.set(key, entry);
    try {
      sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      // Quota exceeded or private browsing
    }
  },

  invalidate(keyPrefix?: string): void {
    if (!keyPrefix) {
      memoryCache.clear();
      try {
        Object.keys(sessionStorage).forEach((k) => {
          if (k.startsWith(SESSION_PREFIX)) {
            sessionStorage.removeItem(k);
          }
        });
      } catch (e) {}
      return;
    }

    // Clear specific keys matching prefix
    for (const k of memoryCache.keys()) {
      if (k.startsWith(keyPrefix)) {
        memoryCache.delete(k);
      }
    }
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(SESSION_PREFIX + keyPrefix)) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (e) {}
  }
};
