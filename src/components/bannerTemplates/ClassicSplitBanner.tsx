import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { BannerProps } from './LightCleanBanner';

export function ClassicSplitBanner({
  title = 'Everyday Luxury',
  discount = 'Spring Collection',
  description = 'Elevate your daily style with our new range of premium leather goods. Designed for the modern professional.',
  buttonText = 'Shop Collection',
  buttonLink = '/category/handbags',
  imageUrl = 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80',
  imageAlt = 'Style End Purse - Classic Split',
}: BannerProps) {
  return (
    <section 
      aria-label="Classic Split Banner"
      className="w-full bg-[#FAFAFA] text-gray-900 border-b border-gray-100 overflow-hidden font-sans group"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
        {/* Text Content Side */}
        <div className="flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-24 xl:px-32 relative z-10">
          <div className="max-w-xl">
            {discount && (
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#C5A880] mb-6 border-b border-[#C5A880]/30 pb-1">
                {discount}
              </span>
            )}
            
            {title && (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 leading-[1.15] mb-8 font-serif-luxury tracking-tight">
                {title}
              </h1>
            )}

            {description && (
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-10 font-normal max-w-md">
                {description}
              </p>
            )}

            {buttonText && buttonLink && (
              <Link to={buttonLink} className="inline-block group/btn">
                <button className="flex items-center gap-3 bg-transparent text-black font-semibold text-xs uppercase tracking-widest py-3 transition-all">
                  <span className="relative overflow-hidden pb-1">
                    {buttonText}
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C5A880] transform origin-left scale-x-0 transition-transform duration-300 group-hover/btn:scale-x-100" />
                  </span>
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover/btn:border-[#C5A880] transition-colors duration-300">
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-[#C5A880] group-hover/btn:translate-x-0.5 transition-all" />
                  </div>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Image Side */}
        <div className="relative h-[400px] lg:h-auto w-full bg-gray-100 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={imageAlt} 
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center transform transition-transform duration-[1500ms] group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA] via-transparent to-transparent opacity-10 lg:opacity-100 w-16" />
        </div>
      </div>
    </section>
  );
}
