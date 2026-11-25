import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Clock, Truck, Sparkles, ShieldCheck } from 'lucide-react';
import { BannerProps } from './LightCleanBanner';

export interface CountdownTimerBannerProps extends BannerProps {
  expiresAt?: string;
  stockPercent?: number;
  originalPrice?: string;
  salePrice?: string;
  freeDeliveryNote?: string;
  isActive?: boolean;
}

export function CountdownTimerBanner({
  eyebrow = 'STYLE END PURSE • FLASH DEAL',
  title = '24-Hour Boutique Privilege',
  description = 'Exclusive flash savings on Style End Purse signature leather handbags and matching heel pairs.',
  buttonText = 'Claim Special Offer',
  buttonLink = '/category/handbags',
  expiresAt,
  stockPercent = 78,
  originalPrice = 'PKR 9,500',
  salePrice = 'PKR 5,450',
  freeDeliveryNote = 'Complimentary Delivery by Style End Purse',
  floatingTagSubtitle = 'Flash Privilege',
  badge1Text = 'Doorstep Inspection Available',
  badge2Text = 'Includes Cash on Delivery',
}: CountdownTimerBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const targetDate = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 14 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <section 
      aria-label="Style End Purse Limited Time Flash Offer"
      className="w-full bg-[#111111] text-white relative overflow-hidden font-sans border-b border-black group"
    >
      {/* Background Ambience */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 group-hover:opacity-75" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Flash Offer Info */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#C5A880] border border-[#C5A880]/40 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{eyebrow}</span>
              </div>
            )}

            {title && (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] text-white font-serif-luxury tracking-tight">
                {title}
              </h1>
            )}
            
            {description && (
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl font-normal">
                {description}
              </p>
            )}
            
            {/* Digital Gold Countdown Blocks */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#C5A880] font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Offer Expires In:</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-[#1c1c1c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[72px] sm:min-w-[80px] text-center shadow-lg transform transition-transform hover:-translate-y-1">
                  <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#C5A880] drop-shadow-[0_0_8px_rgba(197,168,128,0.3)]">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Hours</span>
                </div>
                <span className="text-2xl font-bold text-[#C5A880] pb-2 animate-pulse">:</span>
                
                <div className="bg-[#1c1c1c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[72px] sm:min-w-[80px] text-center shadow-lg transform transition-transform hover:-translate-y-1">
                  <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#C5A880] drop-shadow-[0_0_8px_rgba(197,168,128,0.3)]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Mins</span>
                </div>
                <span className="text-2xl font-bold text-[#C5A880] pb-2 animate-pulse">:</span>
                
                <div className="bg-[#1c1c1c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[72px] sm:min-w-[80px] text-center shadow-lg transform transition-transform hover:-translate-y-1">
                  <span className="block font-mono text-2xl sm:text-3xl font-bold text-[#C5A880] drop-shadow-[0_0_8px_rgba(197,168,128,0.3)]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Secs</span>
                </div>
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className="w-full max-w-md space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>Reserved by clients</span>
                <span className="text-[#C5A880] font-semibold">{stockPercent}% Sold</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/10 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#9E7D48] to-[#C5A880] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Pricing & Action Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center w-full max-w-sm text-center relative transform transition-transform duration-500 hover:-translate-y-2">
              {floatingTagSubtitle && (
                <div className="bg-[#C5A880] text-black text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full absolute -top-3 shadow-md">
                  {floatingTagSubtitle}
                </div>
              )}
              
              {originalPrice && (
                <p className="text-gray-400 line-through text-sm font-medium mt-3">{originalPrice}</p>
              )}
              {salePrice && (
                <p className="text-4xl font-bold text-white font-serif-luxury my-2 drop-shadow-md">{salePrice}</p>
              )}
              {badge1Text && (
                <p className="text-[11px] text-[#C5A880] font-semibold uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {badge1Text}
                </p>
              )}
              
              {buttonText && buttonLink && (
                <Link to={buttonLink} aria-label={buttonText} className="w-full inline-block group/btn">
                  <button className="w-full flex items-center justify-center gap-3 bg-white/10 text-white font-semibold text-xs uppercase tracking-widest py-3.5 rounded-full transition-all border border-white/20 hover:bg-white hover:text-black shadow-lg backdrop-blur-md">
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </Link>
              )}
              
              {freeDeliveryNote && (
                <div className="mt-5 flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <Truck className="w-4 h-4 text-[#C5A880]" />
                  <span>{freeDeliveryNote}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
