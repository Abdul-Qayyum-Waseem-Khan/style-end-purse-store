import { Link } from 'react-router';
import { BannerProps } from './LightCleanBanner';

export function SimpleEleganceBanner({
  title = 'The Summer Collection',
  discount = 'New Arrivals',
  buttonText = 'Shop Now',
  buttonLink = '/category/all',
  imageUrl = 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1600&q=80',
  imageAlt = 'Style End Purse - Simple Elegance',
}: BannerProps) {
  return (
    <section 
      aria-label="Simple Elegance Banner"
      className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#111] group"
    >
      {/* Background Image with slow zoom effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={imageAlt} 
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center transform transition-transform duration-[2000ms] group-hover:scale-110" 
        />
        {/* Elegant gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content with elegant fade-in positioning */}
      <div className="relative z-10 text-center px-4 sm:px-6 flex flex-col items-center max-w-4xl mx-auto space-y-6">
        {discount && (
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] text-[#C5A880] uppercase drop-shadow-md">
            {discount}
          </span>
        )}
        
        {title && (
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-normal text-white tracking-tight drop-shadow-lg font-serif-luxury leading-[1.1]">
            {title}
          </h1>
        )}

        {buttonText && buttonLink && (
          <Link to={buttonLink} className="mt-8 inline-block overflow-hidden rounded-full p-[1px] focus:outline-hidden focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50">
            <button className="relative inline-flex h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-10 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white transition-all duration-500 hover:bg-white hover:text-black">
              {buttonText}
            </button>
          </Link>
        )}
      </div>
    </section>
  );
}
