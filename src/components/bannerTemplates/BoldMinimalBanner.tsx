import { Link } from 'react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import { BannerProps } from './LightCleanBanner';

export function BoldMinimalBanner({
  eyebrow = 'STYLE END PURSE • ATELIER CAPSULE',
  title = 'Pure Minimalist Leathercraft by Style End Purse',
  discount = '30% OFF',
  description = 'Sleek geometric lines, whisper-soft nappa leather, and architectural champagne gold locks. Crafted for the modern connoisseur by Style End Purse.',
  buttonText = 'Shop The Capsule',
  buttonLink = '/category/handbags',
  imageUrl = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
  imageAlt = 'Style End Purse Minimalist Leathercraft',
  floatingTagSubtitle = 'VIP Privileges',
}: BannerProps) {
  return (
    <section 
      aria-label="Style End Purse Minimalist Leathercraft Capsule"
      className="w-full bg-[#FAF9F6] text-[#111111] border-l-8 border-[#C5A880] relative overflow-hidden flex items-center border-b border-gray-200 font-sans group"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Large Discount Tag */}
          <div className="lg:col-span-3 flex flex-col justify-center items-start lg:border-r border-gray-200 py-2 lg:pr-8">
            <span className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif-luxury text-[#111111] leading-none">
              {(discount || '30%').replace(/[^0-9%]/g, '') || '30%'}
            </span>
            <span className="text-xs font-bold text-[#9E7D48] uppercase tracking-[0.2em] mt-2">
              {floatingTagSubtitle || 'VIP Privileges'}
            </span>
          </div>

          {/* Middle Copy */}
          <div className="lg:col-span-5 flex flex-col justify-center items-start space-y-4">
            {eyebrow && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#C5A880]/30 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                  {eyebrow}
                </span>
              </div>
            )}

            {title && (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-900 leading-snug font-serif-luxury tracking-tight">
                {title}
              </h1>
            )}

            {description && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {description}
              </p>
            )}

            {buttonText && buttonLink && (
              <Link to={buttonLink} className="inline-block group/btn mt-4">
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
          </div>

          {/* Right Image */}
          {imageUrl && (
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="w-48 h-64 sm:w-60 sm:h-80 rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.1)] border-4 border-white transform transition-transform duration-700 hover:-translate-y-2">
                <img 
                  src={imageUrl} 
                  alt={imageAlt || title || 'Style End Purse Minimalist Collection'} 
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transform transition-transform duration-[2000ms] group-hover:scale-110" 
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
