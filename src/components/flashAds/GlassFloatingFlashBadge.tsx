import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Gift, Sparkles, X, ArrowRight, Clock, ChevronDown, Flame, ShieldCheck } from 'lucide-react';
import { Banner } from '../../hooks/useBanners';
import { useCountdown } from '../../hooks/useCountdown';

interface Props {
  banner: Banner;
}

export function GlassFloatingFlashBadge({ banner }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { hours, minutes, seconds, isExpired } = useCountdown(banner.endDate);

  if (isDismissed || (isExpired && banner.endDate)) {
    return null;
  }

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleDismissForever = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  return (
    <aside 
      aria-label="Exclusive Mystery Deal" 
      className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 max-w-[340px] w-[calc(100vw-24px)] sm:w-auto transition-all duration-300"
    >
      {!isOpen ? (
        /* ================= 1. ANIMATED GIFT BOX (CALL TO ACTION) ================= */
        <div className="relative group select-none">
          
          {/* Enticing Floating Tooltip / Speech Bubble */}
          <div 
            onClick={handleOpen}
            className="cursor-pointer mb-2.5 bg-neutral-950/90 hover:bg-black text-white px-3.5 py-2 rounded-2xl border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2"
          >
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1 font-sans">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  VIP Mystery Gift
                </span>
                {banner.discountOffer && (
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                    {banner.discountOffer}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-300 truncate font-medium">
                Tap to unbox your secret deal
              </p>
            </div>

            {banner.endDate && (
              <div className="font-mono text-[9.5px] text-amber-300 font-bold bg-white/10 px-1.5 py-0.5 rounded shrink-0">
                {hours}:{minutes}:{seconds}
              </div>
            )}
          </div>

          {/* 3D Animated Shaking Luxury Gift Box */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleOpen}
              className="relative p-3.5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-amber-300 border-2 border-amber-500/60 shadow-[0_8px_30px_rgba(245,158,11,0.35)] animate-gift-wobble hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group flex items-center justify-center"
              aria-label="Open Mystery Flash Deal"
            >
              {/* Golden Ambient Glow Rings */}
              <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-md pointer-events-none group-hover:bg-amber-500/30 transition-colors" />

              {/* Gift Icon & Badges */}
              <div className="relative z-10 flex items-center justify-center">
                <Gift className="w-7 h-7 text-amber-400 fill-amber-400/20 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white"></span>
                </span>
              </div>
            </button>
          </div>

        </div>
      ) : (
        /* ================= 2. UNBOXED LUXURY DEAL CARD ================= */
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950/95 backdrop-blur-xl border border-amber-500/50 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-4 sm:p-5 animate-in zoom-in-95 duration-200 ease-out">
          
          {/* Ambient Background Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                {banner.badgeText || 'UNBOXED PRIVILEGE'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Minimize back to gift box"
                aria-label="Minimize gift box"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismissForever}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Close"
                aria-label="Close deal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-3 relative z-10">
            
            {/* Product & Title Row */}
            <div className="flex gap-3 items-center">
              {banner.image && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-900 shrink-0 shadow-md">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 font-serif-luxury">
                  {banner.title || 'Limited Boutique Flash Offer'}
                </h4>
                {banner.subtitle && (
                  <p className="text-[10.5px] text-gray-400 line-clamp-1 mt-0.5 font-light">
                    {banner.subtitle}
                  </p>
                )}
                
                {/* Discount & Price */}
                <div className="flex items-baseline gap-2 mt-1">
                  {banner.salePrice && (
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {banner.salePrice}
                    </span>
                  )}
                  {banner.originalPrice && (
                    <span className="text-[10px] text-gray-400 line-through font-mono">
                      {banner.originalPrice}
                    </span>
                  )}
                  {banner.discountOffer && (
                    <span className="text-[9px] font-bold text-black bg-amber-400 px-1.5 py-0.2 rounded font-sans">
                      {banner.discountOffer}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            {banner.endDate && (
              <div className="flex items-center justify-between bg-black/60 px-3 py-2 rounded-xl border border-white/10 text-[11px] font-mono">
                <span className="text-gray-400 text-[10px] uppercase font-sans flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Privilege Ends:
                </span>
                <span className="font-bold text-amber-300 tracking-wider">
                  {hours}h : {minutes}m : <span className="text-rose-400 animate-pulse">{seconds}s</span>
                </span>
              </div>
            )}

            {/* Action CTA */}
            <Link
              to={banner.link || '/category/all'}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25"
            >
              <span>{banner.buttonText || 'Claim Exclusive Deal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Doorstep Inspection • Cash on Delivery</span>
            </div>

          </div>

        </div>
      )}
    </aside>
  );
}
