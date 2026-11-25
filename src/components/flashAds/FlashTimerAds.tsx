import { useBanners } from '../../hooks/useBanners';
import { LuxuryCardFlashAd } from './LuxuryCardFlashAd';
import { StickyTimerBar } from './StickyTimerBar';
import { GlassFloatingFlashBadge } from './GlassFloatingFlashBadge';
import { TickerBarAd } from './TickerBarAd';

export { LuxuryCardFlashAd, StickyTimerBar, GlassFloatingFlashBadge, TickerBarAd };

/**
 * Helper to check if a banner is enabled for a specific placement
 */
function hasPlacement(banner: any, placement: 'top_header' | 'mid_page' | 'gift_box'): boolean {
  if (!banner.isActive) return false;
  if (Array.isArray(banner.placements) && banner.placements.length > 0) {
    return banner.placements.includes(placement);
  }
  // Fallback defaults based on template design
  if (placement === 'top_header') {
    return banner.templateDesign === 'sticky_bar' || banner.templateDesign === 'ticker_bar' || banner.type === 'top_bar';
  }
  if (placement === 'mid_page') {
    return banner.templateDesign === 'luxury_card' || !banner.templateDesign;
  }
  if (placement === 'gift_box') {
    return banner.templateDesign === 'glass_floating';
  }
  return true;
}

/**
 * Renders Top Bar / Sticky Countdown Ads at the top of the viewport
 */
export function TopStickyFlashAds() {
  const { banners } = useBanners();

  // Find active banner enabled for top_header
  const topAd = banners.find(b => hasPlacement(b, 'top_header'));

  if (!topAd) return null;

  if (topAd.templateDesign === 'ticker_bar' || topAd.type === 'top_bar') {
    return <TickerBarAd banner={topAd} />;
  }

  return <StickyTimerBar banner={topAd} />;
}

/**
 * Renders Mid-Page Luxury Split Flash Deal Card (e.g., in HomePage)
 */
export function MidPageFlashAd() {
  const { banners, isLoading } = useBanners();

  if (isLoading) return null;

  // Find active banner enabled for mid_page
  const midAd = banners.find(b => hasPlacement(b, 'mid_page'));

  if (!midAd) return null;

  return <LuxuryCardFlashAd banner={midAd} />;
}

/**
 * Renders Floating Urgency Widget / Animated Gift Box in bottom corner
 */
export function FloatingFlashAd() {
  const { banners, isLoading } = useBanners();

  if (isLoading) return null;

  // Find active banner enabled for gift_box
  const giftAd = banners.find(b => hasPlacement(b, 'gift_box'));

  if (!giftAd) return null;

  return <GlassFloatingFlashBadge banner={giftAd} />;
}
