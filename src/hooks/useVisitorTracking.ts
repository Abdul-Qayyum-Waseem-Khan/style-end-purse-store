import { useEffect } from 'react';
import axiosInstance from '../api/axios';
import { getAttributionData } from './useAttribution';

const VISITOR_COOKIE_NAME = 'visitor_id';
const COOKIE_EXPIRY_DAYS = 365; // 1 year expiry for visitor id

// Simple cookie utilities
const setCookie = (name: string, value: string, days: number) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

// Helper to extract basic OS/Browser
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Basic Browser Detection
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  // Basic OS Detection
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('like Mac')) os = 'iOS';

  // Basic Device Detection
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    device = 'Mobile';
  } else if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'Tablet';
  }

  return { browser, os, device };
};

export const getVisitorId = () => getCookie(VISITOR_COOKIE_NAME);

export const useVisitorTracking = () => {
  useEffect(() => {
    // Only fire this once per session/page load.
    // In a strict mode development environment, this might fire twice, but the backend handles upserts safely.
    const trackVisitor = async () => {
      try {
        const { browser, os, device } = getBrowserInfo();
        const language = navigator.language || 'en-US';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        
        // Combine with attribution data if we have it
        const attribution = getAttributionData();
        const existingVisitorId = getCookie(VISITOR_COOKIE_NAME);

        const payload = {
          visitorId: existingVisitorId,
          browser,
          os,
          device,
          language,
          timezone,
          landingPage: attribution.landingPage || window.location.pathname,
          referrer: attribution.referrer || document.referrer,
          utmParameters: {
            source: attribution.utmSource || null,
            medium: attribution.utmMedium || null,
            campaign: attribution.utmCampaign || null,
            content: attribution.utmContent || null,
            term: attribution.utmTerm || null
          }
        };

        const response = await axiosInstance.post('/api/v1/visitors/track', payload);
        
        if (response.data?.data?.visitorId) {
          // Update cookie with potentially new visitorId from server
          setCookie(VISITOR_COOKIE_NAME, response.data.data.visitorId, COOKIE_EXPIRY_DAYS);
        }

      } catch (err) {
        console.error('Visitor tracking failed', err);
      }
    };

    // Small delay to ensure useAttribution has had a chance to save to cookie if running concurrently
    const timer = setTimeout(() => {
      trackVisitor();
    }, 500);

    return () => clearTimeout(timer);
  }, []);
};
