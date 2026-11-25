import { Link } from 'react-router';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { BannerProps } from './LightCleanBanner';

export function SplitShowcaseBanner({
  eyebrow = 'STYLE END PURSE • SPOTLIGHT',
  title = 'ICONIC 3-PIECE MATCHING SETS',
  discount = 'BUNDLE & SAVE 35%',
  description = 'Complete coordinated perfection: matching handbag, matching cross-body pouch, and luxury wallet by Style End Purse.',
  buttonText = 'Shop 3-Piece Sets',
  buttonLink = '/category/sets',
  secondaryButtonText = 'Browse Single Bags',
  secondaryButtonLink = '/category/handbags',
  imageUrl = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
  imageAlt = 'Style End Purse 3-Piece Handbag Matching Bundle Set',
  floatingTagSubtitle = 'Trio Set Bundle',
  floatingTagTitle = 'Classic Monogram 3-in-1 Set',
  floatingTagPrice = 'PKR 8,999',
  badge1Text = 'Includes Large Tote Bag + Crossbody Pouch + Cardholder Wallet',
  badge2Text = 'Doorstep inspection prior to payment via Cash on Delivery',
}: BannerProps) {
  
  const words = (title || 'ICONIC 3-PIECE SETS').trim().split(' ');
  const firstWord = words[0] || '';
  const restWords = words.slice(1).join(' ');

  return (
    <section 
      aria-label="Style End Purse 3-Piece Matching Sets Collection"
      className="w-full bg-[#111111] text-white relative overflow-hidden font-sans border-b border-black group/section"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        
        {/* Left Editorial Section */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-16 flex flex-col justify-center relative z-10 space-y-6 text-left">
          <div className="space-y-3">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C5A880] border border-[#C5A880]/30 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm transition-all hover:bg-white/15">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{eyebrow}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] text-white font-serif-luxury tracking-tight drop-shadow-sm">
              {firstWord} <span className="text-[#C5A880]">{restWords}</span>
            </h1>

            {discount && (
              <div className="inline-block bg-[#C5A880] text-black text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {discount}
              </div>
            )}
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg font-normal">
              {description}
            </p>
          )}

          {(badge1Text || badge2Text) && (
            <div className="space-y-2 pt-1 text-xs text-gray-300">
              {badge1Text && (
                <div className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                  <div className="w-4 h-4 rounded-full bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{badge1Text}</span>
                </div>
              )}
              {badge2Text && (
                <div className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                  <div className="w-4 h-4 rounded-full bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{badge2Text}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {buttonText && buttonLink && (
              <Link to={buttonLink} className="inline-block group/btn">
                <button className="flex items-center gap-3 bg-transparent text-white font-semibold text-xs uppercase tracking-widest py-2 transition-all">
                  <span className="relative overflow-hidden pb-1">
                    {buttonText}
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C5A880] transform origin-left scale-x-0 transition-transform duration-300 group-hover/btn:scale-x-100" />
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-colors duration-300 group-hover/btn:bg-[#C5A880] group-hover/btn:border-transparent">
                    <ArrowRight className="w-3.5 h-3.5 text-white transition-all group-hover/btn:translate-x-0.5 group-hover/btn:text-black" />
                  </div>
                </button>
              </Link>
            )}
            {secondaryButtonText && secondaryButtonLink && (
              <Link to={secondaryButtonLink} aria-label={secondaryButtonText} className="group/sec">
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all border border-white/20 backdrop-blur-md hover:border-[#C5A880] hover:text-[#C5A880]">
                  {secondaryButtonText}
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Right Showcase Image */}
        <div className="lg:col-span-6 relative min-h-[350px] lg:min-h-full bg-[#1c1c1c] overflow-hidden group/image">
          <img 
            src={imageUrl} 
            alt={imageAlt || title || 'Style End Purse 3-Piece Matching Sets'} 
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center transform transition-transform duration-[2000ms] group-hover/image:scale-105 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#111111] via-[#111111]/40 to-transparent opacity-90 transition-opacity duration-700 group-hover/image:opacity-70" />
          
          {(floatingTagTitle || floatingTagPrice) && (
            <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 text-right transform transition-all duration-500 hover:-translate-y-1 hover:bg-black/90 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              {floatingTagSubtitle && (
                <p className="text-[10px] uppercase font-bold text-[#C5A880] tracking-widest">{floatingTagSubtitle}</p>
              )}
              {floatingTagTitle && (
                <p className="text-sm font-bold text-white mt-1">{floatingTagTitle}</p>
              )}
              {floatingTagPrice && (
                <p className="text-xs text-gray-300 font-mono mt-1">{floatingTagPrice}</p>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
