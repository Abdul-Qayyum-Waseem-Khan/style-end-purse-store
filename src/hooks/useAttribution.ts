import { useEffect } from 'react';
import { useLocation } from 'react-router';

export interface AttributionData {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  firstVisitTimestamp?: string | null;
}

const COOKIE_NAME = 'marketing_attribution';
const COOKIE_EXPIRY_DAYS = 90;

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

// Automatic traffic source detection based on referrer
const detectSourceFromReferrer = (referrer: string): { source: string; medium?: string } | null => {
  if (!referrer) return null;

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('facebook.com')) {
      return { source: 'Facebook', medium: 'social' };
    }
    if (hostname.includes('instagram.com')) {
      return { source: 'Instagram', medium: 'social' };
    }
    if (hostname.includes('tiktok.com')) {
      return { source: 'TikTok', medium: 'social' };
    }
    if (hostname.includes('wa.me') || hostname.includes('whatsapp.com')) {
      return { source: 'WhatsApp', medium: 'social' };
    }
    if (hostname.includes('google.com')) {
      return { source: 'Google Organic', medium: 'organic' };
    }
    // You can add more like bing, yahoo, twitter, etc.
  } catch (e) {
    // Invalid URL format
  }
  return null;
};

export const captureAttribution = (searchParamsStr: string, currentPath: string) => {
  const existingCookie = getCookie(COOKIE_NAME);
  const searchParams = new URLSearchParams(searchParamsStr);

  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmTerm = searchParams.get('utm_term');
  const utmContent = searchParams.get('utm_content');

  const hasNewUtms = Boolean(utmSource || utmMedium || utmCampaign);
  
  // Only capture referrer if it's an external referrer
  const currentReferrer = document.referrer;
  const isExternalReferrer = currentReferrer && !currentReferrer.includes(window.location.host);

  // If a cookie already exists and we are not landing with new UTMs, we preserve existing attribution
  if (existingCookie && !hasNewUtms) {
    return;
  }

  // If no UTMs but we have an external referrer, try to detect source
  let finalSource = utmSource;
  let finalMedium = utmMedium;

  if (!hasNewUtms && isExternalReferrer) {
    const detected = detectSourceFromReferrer(currentReferrer);
    if (detected) {
      finalSource = detected.source;
      finalMedium = detected.medium || null;
    } else {
      // If we couldn't match a known network, use the domain
      try {
        finalSource = new URL(currentReferrer).hostname;
        finalMedium = 'referral';
      } catch (e) {
        finalSource = currentReferrer;
        finalMedium = 'referral';
      }
    }
  }

  // If direct traffic (no UTM, no external referrer) and no existing cookie, label as direct
  if (!existingCookie && !hasNewUtms && !isExternalReferrer) {
    finalSource = 'direct';
    finalMedium = 'none';
  }

  const attributionData: AttributionData = {
    utmSource: finalSource || null,
    utmMedium: finalMedium || null,
    utmCampaign: utmCampaign || null,
    utmTerm: utmTerm || null,
    utmContent: utmContent || null,
    referrer: isExternalReferrer ? currentReferrer : null,
    landingPage: currentPath,
    firstVisitTimestamp: new Date().toISOString()
  };

  // If we already had a cookie but are overwriting it (due to new UTMs), preserve the firstVisitTimestamp
  if (existingCookie) {
    try {
      const parsed = JSON.parse(existingCookie);
      if (parsed.firstVisitTimestamp) {
        attributionData.firstVisitTimestamp = parsed.firstVisitTimestamp;
      }
      // Keep landing page the same to track the very first entry point
      if (parsed.landingPage) {
        attributionData.landingPage = parsed.landingPage;
      }
    } catch (e) {}
  }

  setCookie(COOKIE_NAME, JSON.stringify(attributionData), COOKIE_EXPIRY_DAYS);
};

export const getAttributionData = (): AttributionData => {
  const data = getCookie(COOKIE_NAME);
  return data ? JSON.parse(data) : {};
};

export const useAttribution = () => {
  const location = useLocation();

  useEffect(() => {
    captureAttribution(location.search, location.pathname);
  }, [location.search, location.pathname]);
};
