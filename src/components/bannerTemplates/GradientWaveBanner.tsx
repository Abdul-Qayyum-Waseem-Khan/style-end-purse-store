import { Link } from 'react-router';
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { BannerProps } from './LightCleanBanner';

export function GradientWaveBanner({
  eyebrow = 'STYLE END PURSE • ATELIER CAPSULE',
  title = 'Style End Purse Silk & Suede Accessories',
  discount = 'NEW BOUTIQUE ARRIVAL',
  description = 'Experience refined craftsmanship with our latest curation of luxury leather purses, totes, and designer heels by Style End Purse.',
  buttonText = 'Discover The Capsule',
  buttonLink = '/category/all',
  secondaryButtonText = 'View Handbags',
  secondaryButtonLink = '/category/handbags',
  imageUrl = 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
  imageAlt = 'Style End Purse Suede Handcrafted Accessories',
  badge1Text = 'Doorstep Inspection Available',
  badge2Text = 'Cash on Delivery Across Pakistan',
}: BannerProps) {
  return (
    <section 
      aria-label="Style End Purse Atelier Capsule Showcase"
      className="w-full bg-gradient-to-r from-[#111111] via-[#1f1a14] to-[#2b2115] text-white relative overflow-hidden font-sans border-b border-black group/section"
    >
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(197,168,128,0.18),transparent_60%)] pointer-events-none transition-opacity duration-1000 group-hover/section:opacity-75" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/30 text-xs font-semibold uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{eyebrow}</span>
              </div>
            )}

            {title && (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] text-white font-serif-luxury tracking-tight drop-shadow-sm">
                {title}
              </h1>
            )}

            {discount && (
              <div className="inline-block bg-[#C5A880] text-black text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {discount}
              </div>
            )}

            {description && (
              <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed font-normal max-w-xl">
                {description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-6">
              {buttonText && buttonLink && (
                <Link to={buttonLink} className="inline-block group/btn">
                  <button className="flex items-center gap-3 bg-transparent text-white font-semibold text-xs uppercase tracking-widest py-2 transition-all">
                    <span className="relative overflow-hidden pb-1">
                      {buttonText}
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C5A880] transform origin-left scale-x-0 transition-transform duration-300 group-hover/btn:scale-x-100" />
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors duration-300 group-hover/btn:bg-[#C5A880] group-hover/btn:border-transparent">
                      <ArrowRight className="w-3.5 h-3.5 text-white transition-all group-hover/btn:translate-x-0.5 group-hover/btn:text-black" />
                    </div>
                  </button>
                </Link>
              )}
              {secondaryButtonText && secondaryButtonLink && (
                <Link to={secondaryButtonLink} aria-label={secondaryButtonText} className="group/sec">
                  <button className="bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all border border-white/20 backdrop-blur-md hover:border-[#C5A880] hover:text-[#C5A880]">
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

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group/image">
              <img 
                src={imageUrl} 
                alt={imageAlt || title || 'Style End Purse Suede Handcrafted Accessories'} 
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center transform transition-transform duration-[2000ms] group-hover/image:scale-105 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
