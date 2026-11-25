// Environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: { track: (event: string, payload?: any) => void };
  }
}

type EventName = 
  | 'page_view'
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'login'
  | 'sign_up'
  | 'search';

export const trackEvent = (eventName: EventName, payload: any = {}, eventId?: string) => {
  try {
    // 1. Google Analytics 4
    if (GA_MEASUREMENT_ID && window.gtag) {
      window.gtag('event', eventName, payload);
    }

    // 2. Meta Pixel
    if (META_PIXEL_ID && window.fbq) {
      let metaEvent = eventName;
      let metaPayload = { ...payload };

      // Map to Meta standard events
      switch (eventName) {
        case 'page_view': metaEvent = 'PageView'; break;
        case 'view_item': metaEvent = 'ViewContent'; break;
        case 'add_to_cart': metaEvent = 'AddToCart'; break;
        case 'begin_checkout': metaEvent = 'InitiateCheckout'; break;
        case 'purchase': metaEvent = 'Purchase'; break;
        case 'login': metaEvent = 'Login'; break;
        case 'sign_up': metaEvent = 'CompleteRegistration'; break;
        case 'search': metaEvent = 'Search'; break;
      }

      const options = eventId ? { eventID: eventId } : undefined;
      
      if (metaEvent === 'PageView') {
        window.fbq('track', 'PageView');
      } else {
        window.fbq('track', metaEvent, metaPayload, options);
      }
    }

    // 3. TikTok Pixel
    if (TIKTOK_PIXEL_ID && window.ttq) {
      let ttEvent = eventName;
      let ttPayload = { ...payload };

      // Map to TikTok standard events
      switch (eventName) {
        case 'page_view': ttEvent = 'ViewContent'; break; // TikTok often uses ViewContent for page views
        case 'view_item': ttEvent = 'ViewContent'; break;
        case 'add_to_cart': ttEvent = 'AddToCart'; break;
        case 'begin_checkout': ttEvent = 'InitiateCheckout'; break;
        case 'purchase': ttEvent = 'CompletePayment'; break;
        case 'login': ttEvent = 'Login'; break;
        case 'sign_up': ttEvent = 'CompleteRegistration'; break;
        case 'search': ttEvent = 'Search'; break;
      }

      window.ttq.track(ttEvent, ttPayload);
    }
  } catch (error) {
    console.error('Tracking Error:', error);
  }
};
