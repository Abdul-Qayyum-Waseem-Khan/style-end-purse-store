import { Link } from 'react-router';
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { BannerProps } from './LightCleanBanner';

export function DarkTechBanner({
  eyebrow = 'STYLE END PURSE • NOIR EDITION',
  title = 'Style End Purse Nocturne Clutches',
  discount = 'LIMITED ATELIER DROP',
  description = 'Hand-finished metallic gold hardware, quilted obsidian calfskin, and architectural clasps. Designed for extraordinary evenings by Style End Purse.',
  buttonText = 'Discover The Vault',
  buttonLink = '/category/handbags',
  secondaryButtonText = 'Browse All Products',
  secondaryButtonLink = '/category/all',
  imageUrl = 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85',
  imageAlt = 'Style End Purse Quilted Leather Minaudiere Clutch Noir Edition',
  floatingTagSubtitle = 'Limited Edition',
  floatingTagTitle = 'Quilted Leather Minaudière Clutch',
  floatingTagPrice = 'PKR 7,800',
  badge1Text = 'Doorstep Inspection Available',
  badge2Text = 'Complimentary Shipping on Orders > PKR 5,000',
}: BannerProps) {
  return (
    <section 
      aria-label="Style End Purse Noir Luxury Edition Showcase"
      className="w-full bg-[#111111] text-white relative overflow-hidden font-sans border-b border-black group/section"
    >
      {/* Gold Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A880]/15 rounded-full blur-[130px] pointer-events-none transition-opacity duration-[2000ms] group-hover/section:opacity-75" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-600/10 rounded-full blur-[110px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C5A880]/40 backdrop-blur-xs transition-shadow duration-500 hover:shadow-[0_0_15px_rgba(197,168,128,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#C5A880]">
                  {eyebrow}
                </span>
              </div>
            )}

            {title && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15] font-serif-luxury drop-shadow-md">
                {title}
              </h1>
            )}

            {discount && (
              <div className="inline-block bg-[#C5A880] text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(197,168,128,0.3)]">
                {discount}
              </div>
            )}

            {description && (
              <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed font-normal max-w-xl">
                {description}
              </p>
            )}

            <div className="pt-2 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {buttonText && buttonLink && (
                  <Link to={buttonLink} aria-label={buttonText} className="inline-block group/btn">
                    <button className="bg-[#C5A880] hover:bg-[#b0936d] text-black font-bold text-xs uppercase tracking-wider py-3.5 px-8 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_0_rgba(197,168,128,0)] hover:shadow-[0_0_20px_rgba(197,168,128,0.4)]">
                      <span>{buttonText}</span>
                      <ArrowRight className="w-4 h-4 text-black group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                )}

                {secondaryButtonText && secondaryButtonLink && (
                  <Link to={secondaryButtonLink} aria-label={secondaryButtonText} className="group/sec">
                    <button className="bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all border border-white/20 hover:border-[#C5A880] hover:text-[#C5A880] backdrop-blur-sm">
                      {secondaryButtonText}
                    </button>
                  </Link>
                )}
              </div>

              {(badge1Text || badge2Text) && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-3">
                  {badge1Text && (
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                      <span>{badge1Text}</span>
                    </div>
                  )}
                  {badge2Text && (
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#C5A880]" />
                      <span>{badge2Text}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#C5A880]/20 group/image">
              <img 
                src={imageUrl} 
                alt={imageAlt || title || 'Style End Purse Noir Luxury Collection'} 
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center transform transition-transform duration-[2500ms] group-hover/image:scale-110 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {(floatingTagTitle || floatingTagPrice) && (
                <div className="absolute bottom-4 left-4 right-4 bg-[#111111]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between transform transition-all duration-500 hover:-translate-y-1 hover:border-[#C5A880]/30 hover:bg-[#111111]/90">
                  <div>
                    {floatingTagSubtitle && (
                      <p className="text-[10px] uppercase font-bold text-[#C5A880] tracking-widest">{floatingTagSubtitle}</p>
                    )}
                    {floatingTagTitle && (
                      <p className="text-xs font-bold text-white tracking-wide mt-0.5">{floatingTagTitle}</p>
                    )}
                  </div>
                  {floatingTagPrice && (
                    <span className="text-xs font-bold text-black bg-[#C5A880] px-3 py-1.5 rounded-full font-mono drop-shadow-md">
                      {floatingTagPrice}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
