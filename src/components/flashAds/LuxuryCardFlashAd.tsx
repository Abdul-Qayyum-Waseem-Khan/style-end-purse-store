import { Link } from 'react-router';
import { Sparkles, Zap, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { Banner } from '../../hooks/useBanners';
import { useCountdown } from '../../hooks/useCountdown';

interface Props {
  banner: Banner;
}

export function LuxuryCardFlashAd({ banner }: Props) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(banner.endDate);

  if (isExpired && banner.endDate) {
    return null;
  }

  const stock = banner.stockPercent || 82;
  const isGold = banner.colorTheme === 'gold-noir' || !banner.colorTheme;
  const isRose = banner.colorTheme === 'rose-gold';
  const isEmerald = banner.colorTheme === 'emerald-chic';

  return (
    <div className="w-full my-12 container mx-auto px-4 md:px-8">
      <div className={`relative overflow-hidden rounded-3xl border ${
        isGold 
          ? 'bg-gradient-to-br from-[#141414] via-[#1c1c1c] to-[#0d0d0d] border-amber-500/30 shadow-2xl shadow-black/40' 
          : isRose
          ? 'bg-gradient-to-br from-[#201518] via-[#2d1b22] to-[#140b0f] border-rose-400/30 shadow-2xl shadow-rose-950/40'
          : isEmerald
          ? 'bg-gradient-to-br from-[#0b1a15] via-[#10271f] to-[#07120e] border-emerald-500/30 shadow-2xl shadow-emerald-950/40'
          : 'bg-[#111111] border-gray-800 shadow-2xl'
      } text-white p-6 sm:p-8 lg:p-12`}>

        {/* Ambient Decorative Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Offer Info & Live Timer */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Eyebrow & Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                {banner.badgeText || 'FLASH DROP • LIMITED QUANTITY'}
              </span>

              {banner.discountOffer && (
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-white text-black shadow-md">
                  {banner.discountOffer}
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2.5">
              <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-tight">
                {banner.title || 'Midnight Atelier Flash Sale'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl font-light">
                {banner.subtitle || 'Exclusive handcrafted designer bags with complimentary doorstep inspection and express shipping.'}
              </p>
            </div>

            {/* Pricing Details */}
            {(banner.salePrice || banner.originalPrice) && (
              <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Flash Price:</span>
                {banner.salePrice && (
                  <span className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                    {banner.salePrice}
                  </span>
                )}
                {banner.originalPrice && (
                  <span className="text-sm text-gray-400 line-through font-mono">
                    {banner.originalPrice}
                  </span>
                )}
              </div>
            )}

            {/* Live Synchronized Countdown Timer */}
            {banner.endDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                  <span>Offer Ends In:</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {Number(days) > 0 && (
                    <div className="flex flex-col items-center justify-center bg-black/60 border border-white/15 rounded-2xl w-14 sm:w-16 h-16 sm:h-18 backdrop-blur-md shadow-inner">
                      <span className="text-xl sm:text-2xl font-mono font-bold text-white">{days}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Days</span>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center bg-black/60 border border-white/15 rounded-2xl w-14 sm:w-16 h-16 sm:h-18 backdrop-blur-md shadow-inner">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-amber-300">{hours}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Hours</span>
                  </div>

                  <span className="text-xl font-bold text-amber-400/60 -mt-3">:</span>

                  <div className="flex flex-col items-center justify-center bg-black/60 border border-white/15 rounded-2xl w-14 sm:w-16 h-16 sm:h-18 backdrop-blur-md shadow-inner">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-white">{minutes}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Mins</span>
                  </div>

                  <span className="text-xl font-bold text-amber-400/60 -mt-3">:</span>

                  <div className="flex flex-col items-center justify-center bg-black/60 border border-amber-500/40 rounded-2xl w-14 sm:w-16 h-16 sm:h-18 backdrop-blur-md shadow-inner">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-rose-400 animate-pulse">{seconds}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Secs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Progress Claim Meter */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Limited Batch Allocation
                </span>
                <span className="text-amber-400 font-mono">{stock}% Claimed</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(stock, 98)}%` }}
                />
              </div>
            </div>

            {/* Call to Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to={banner.link || '/category/all'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{banner.buttonText || 'Claim Flash Deal'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Doorstep Inspection • Cash on Delivery</span>
              </div>
            </div>

          </div>

          {/* Right Column: High Fashion Visual Presentation */}
          <div className="lg:col-span-5">
            <div className="relative group">
              
              {/* Product Card Container */}
              <div className="relative aspect-[4/3] sm:aspect-[1/1] rounded-2xl overflow-hidden border border-white/20 bg-neutral-900 shadow-2xl">
                <img 
                  src={banner.image || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"} 
                  alt={banner.title || "Flash Sale Item"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Micro Badge on Image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-medium">Signature Collection</span>
                    <span className="text-xs font-bold text-white tracking-wide">100% Guaranteed Genuine Leather</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30">
                    Flash Exclusive
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
