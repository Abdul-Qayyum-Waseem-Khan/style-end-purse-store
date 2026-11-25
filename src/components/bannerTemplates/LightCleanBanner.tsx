import { Link } from 'react-router';
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';

export interface BannerProps {
  eyebrow?: string;
  title?: string;
  discount?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  floatingTagSubtitle?: string;
  floatingTagTitle?: string;
  floatingTagPrice?: string;
  badge1Text?: string;
  badge2Text?: string;
}

export function LightCleanBanner({
  eyebrow = 'STYLE END PURSE • ATELIER COLLECTION',
  title = 'The Style End Purse Leather Collection',
  discount = 'NEW ARRIVAL • COMPLIMENTARY SHIPPING',
  description = 'Hand-finished Italian nappa leather, champagne gold hardware, and architectural silhouettes designed for effortless elegance by Style End Purse.',
  buttonText = 'Explore The Collection',
  buttonLink = '/category/handbags',
  secondaryButtonText = 'View 3-Piece Sets',
  secondaryButtonLink = '/category/sets',
  imageUrl = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
  imageAlt = 'Style End Purse Luxury Italian Leather Tote Bag',
  floatingTagSubtitle = 'Featured Atelier',
  floatingTagTitle = 'Quilted Top-Handle Luxury Purse',
  floatingTagPrice = 'PKR 6,450',
  badge1Text = 'Doorstep Inspection Available',
  badge2Text = 'Cash on Delivery Across Pakistan',
}: BannerProps) {
  return (
    <section 
      aria-label="Style End Purse Featured Boutique Collection" 
      className="w-full bg-[#FAF9F6] text-[#111111] relative overflow-hidden border-b border-gray-200/80 font-sans group/section"
    >
      {/* Ambient luxury glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 group-hover/section:opacity-75" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text & Actions (SEO Semantic) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C5A880]/40 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-900">
                  {eyebrow}
                </span>
              </div>
            )}

            {title && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.15] font-serif-luxury">
                {title}
              </h1>
            )}

            {discount && (
              <div className="inline-block bg-[#111111] text-[#C5A880] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs border border-[#C5A880]/30">
                {discount}
              </div>
            )}

            {description && (
              <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed font-normal max-w-xl">
                {description}
              </p>
            )}

            {/* CTAs and Trust Badges */}
            <div className="pt-2 space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                {buttonText && buttonLink && (
                  <Link to={buttonLink} className="inline-block group/btn">
                    <button className="flex items-center gap-3 bg-transparent text-black font-semibold text-xs uppercase tracking-widest py-2 transition-all">
                      <span className="relative overflow-hidden pb-1">
                        {buttonText}
                        <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C5A880] transform origin-left scale-x-0 transition-transform duration-300 group-hover/btn:scale-x-100" />
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center transition-colors duration-300 group-hover/btn:bg-[#C5A880]">
                        <ArrowRight className="w-3.5 h-3.5 text-white transition-all group-hover/btn:translate-x-0.5" />
                      </div>
                    </button>
                  </Link>
                )}

                {secondaryButtonText && secondaryButtonLink && (
                  <Link to={secondaryButtonLink} aria-label={secondaryButtonText} className="group/sec">
                    <button className="bg-white hover:bg-gray-50 text-gray-900 font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all border border-gray-200 shadow-2xs group-hover/sec:border-[#C5A880]/50 group-hover/sec:text-[#C5A880]">
                      {secondaryButtonText}
                    </button>
                  </Link>
                )}
              </div>

              {(badge1Text || badge2Text) && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2">
                  {badge1Text && (
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{badge1Text}</span>
                    </div>
                  )}
                  {badge2Text && (
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>{badge2Text}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Product Visual */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-4 border-white group/image">
              <img 
                src={imageUrl} 
                alt={imageAlt || title || 'Style End Purse Luxury Collection'} 
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center transform transition-transform duration-[2000ms] group-hover/image:scale-105 ease-out" 
              />
              
              {/* Floating Luxury Tag (100% Dynamic) */}
              {(floatingTagTitle || floatingTagPrice) && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-lg flex items-center justify-between transform transition-transform duration-500 hover:-translate-y-1">
                  <div>
                    {floatingTagSubtitle && (
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#9E7D48]">{floatingTagSubtitle}</p>
                    )}
                    {floatingTagTitle && (
                      <p className="text-xs font-bold text-gray-900">{floatingTagTitle}</p>
                    )}
                  </div>
                  {floatingTagPrice && (
                    <span className="text-xs font-bold text-black bg-gray-100 px-3 py-1.5 rounded-full font-mono">
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
