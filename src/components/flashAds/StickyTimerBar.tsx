import { useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, X, ArrowRight, Clock } from 'lucide-react';
import { Banner } from '../../hooks/useBanners';
import { useCountdown } from '../../hooks/useCountdown';

interface Props {
  banner: Banner;
}

export function StickyTimerBar({ banner }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const { hours, minutes, seconds, isExpired } = useCountdown(banner.endDate);

  if (dismissed || (isExpired && banner.endDate)) {
    return null;
  }

  const isGold = banner.colorTheme === 'gold-noir' || !banner.colorTheme;
  const isRose = banner.colorTheme === 'rose-gold';

  return (
    <div className={`w-full relative z-40 transition-all duration-300 ${
      isGold
        ? 'bg-[#111111] border-b border-amber-500/30 text-white'
        : isRose
        ? 'bg-[#1c1215] border-b border-rose-500/30 text-white'
        : 'bg-black border-b border-gray-800 text-white'
    }`}>
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Left: Pulsing Live Indicator & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[9px] sm:text-[10px] tracking-wider uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{banner.badgeText || 'LIVE DROP'}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="font-semibold text-white tracking-wide truncate">
              {banner.title || 'Flash Sale Ongoing'}
            </span>
            {banner.discountOffer && (
              <span className="font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                {banner.discountOffer}
              </span>
            )}
          </div>
        </div>

        {/* Center: Real-Time Urgency Ticker */}
        {banner.endDate && (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span className="text-gray-300 text-[10px] sm:text-[11px] font-medium hidden lg:inline">Ends In:</span>
            <div className="flex items-center gap-0.5 sm:gap-1 font-mono font-bold text-amber-300 text-[10px] sm:text-xs">
              <span className="bg-black/60 px-1 sm:px-1.5 py-0.5 rounded border border-white/10">{hours}</span>
              <span>:</span>
              <span className="bg-black/60 px-1 sm:px-1.5 py-0.5 rounded border border-white/10">{minutes}</span>
              <span>:</span>
              <span className="bg-black/60 px-1 sm:px-1.5 py-0.5 rounded border border-amber-500/40 text-rose-400 animate-pulse">{seconds}</span>
            </div>
          </div>
        )}

        {/* Right: CTA Button & Dismiss */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            to={banner.link || '/category/all'}
            className="inline-flex items-center gap-1 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-xs"
          >
            <span>{banner.buttonText || 'Shop'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
