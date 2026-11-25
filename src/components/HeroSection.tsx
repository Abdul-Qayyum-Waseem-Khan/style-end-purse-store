import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { sessionCache } from '../utils/sessionCache';
import { LightCleanBanner } from './bannerTemplates/LightCleanBanner';
import { DarkTechBanner } from './bannerTemplates/DarkTechBanner';
import { GradientWaveBanner } from './bannerTemplates/GradientWaveBanner';
import { SplitShowcaseBanner } from './bannerTemplates/SplitShowcaseBanner';
import { CountdownTimerBanner } from './bannerTemplates/CountdownTimerBanner';
import { BoldMinimalBanner } from './bannerTemplates/BoldMinimalBanner';
import { SimpleEleganceBanner } from './bannerTemplates/SimpleEleganceBanner';
import { ClassicSplitBanner } from './bannerTemplates/ClassicSplitBanner';

export interface HeroBannerData {
  _id?: string;
  templateId?: 'responsive-carousel' | 'light-clean' | 'dark-tech' | 'gradient-wave' | 'split-showcase' | 'countdown-timer' | 'bold-minimal' | 'simple-elegance' | 'classic-split';
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  sortOrder?: number;
  showTextOverlay?: boolean;
  eyebrow?: string;
  title?: string;
  discount?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonPosition?: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  floatingTagSubtitle?: string;
  floatingTagTitle?: string;
  floatingTagPrice?: string;
  badge1Text?: string;
  badge2Text?: string;
  isActive?: boolean;
  expiresAt?: string;
  stockPercent?: number;
  originalPrice?: string;
  salePrice?: string;
  freeDeliveryNote?: string;
  additionalImages?: string[];
  featuredProducts?: { name: string; price: string; icon?: string; image?: string }[];
}

const HERO_CACHE_KEY = 'hero_active_slides';

export function HeroSection() {
  const [slides, setSlides] = useState<HeroBannerData[]>(() => {
    return sessionCache.get<HeroBannerData[]>(HERO_CACHE_KEY) || [];
  });
  const [loading, setLoading] = useState(() => !sessionCache.get<HeroBannerData[]>(HERO_CACHE_KEY));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchActiveSlides = async () => {
      try {
        const { data } = await api.get('/api/hero-banner/active');
        const loadedSlides: HeroBannerData[] = Array.isArray(data?.slides)
          ? data.slides
          : data?._id
          ? [data]
          : [];
        if (isMounted) {
          setSlides(loadedSlides);
          sessionCache.set(HERO_CACHE_KEY, loadedSlides);
        }
      } catch {
        // Graceful fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const cached = sessionCache.get<HeroBannerData[]>(HERO_CACHE_KEY);
    if (cached) {
      setSlides(cached);
      setLoading(false);
      if (!sessionCache.isFresh(HERO_CACHE_KEY, 1000 * 60 * 5)) {
        fetchActiveSlides();
      }
    } else {
      fetchActiveSlides();
    }
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  if (loading && slides.length === 0) {
    return <div className="w-full aspect-[4/5] md:aspect-[1920/700] max-h-[700px] bg-[#FAF8F5] animate-pulse" />;
  }

  if (slides.length === 0) {
    return <LightCleanBanner />;
  }

  // Legacy single-template fallback when no responsive-carousel image is used
  const firstSlide = slides[0];
  if (
    slides.length === 1 &&
    firstSlide.templateId &&
    firstSlide.templateId !== 'responsive-carousel' &&
    !firstSlide.desktopImageUrl &&
    !firstSlide.mobileImageUrl
  ) {
    switch (firstSlide.templateId) {
      case 'dark-tech':
        return <DarkTechBanner {...firstSlide} />;
      case 'gradient-wave':
        return <GradientWaveBanner {...firstSlide} />;
      case 'split-showcase':
        return <SplitShowcaseBanner {...firstSlide} />;
      case 'countdown-timer':
        return <CountdownTimerBanner {...firstSlide} />;
      case 'bold-minimal':
        return <BoldMinimalBanner {...firstSlide} />;
      case 'simple-elegance':
        return <SimpleEleganceBanner {...firstSlide} />;
      case 'classic-split':
        return <ClassicSplitBanner {...firstSlide} />;
      default:
        return <LightCleanBanner {...firstSlide} />;
    }
  }

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || slides.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  const getOverlayPositionClasses = (pos?: string) => {
    switch (pos) {
      case 'bottom-center':
        return 'items-end justify-center text-center pb-10 sm:pb-14 px-6';
      case 'bottom-right':
        return 'items-end justify-end text-right pb-10 sm:pb-14 px-6 sm:px-12 lg:px-16';
      case 'center':
        return 'items-center justify-center text-center px-6';
      case 'bottom-left':
      default:
        return 'items-end justify-start text-left pb-10 sm:pb-14 px-6 sm:px-12 lg:px-16';
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#111111] group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Collections"
    >
      {/* Aspect-ratio container matching Mobile 4:5 & Desktop 1920:700 */}
      <div className="relative w-full aspect-[4/5] md:aspect-[1920/700] max-h-[82vh] md:max-h-[700px]">
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          const desktopSrc = slide.desktopImageUrl || slide.imageUrl || '';
          const mobileSrc = slide.mobileImageUrl || desktopSrc;
          const hasButton = Boolean(slide.buttonText?.trim() && slide.buttonLink?.trim());
          const hasText = Boolean(slide.showTextOverlay && (slide.title?.trim() || slide.eyebrow?.trim()));

          return (
            <div
              key={slide._id || idx}
              className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.02] z-0 pointer-events-none'
              }`}
              aria-hidden={!isCurrent}
            >
              {/* Desktop Image (1920x700 recommended) */}
              {desktopSrc && (
                <img
                  src={desktopSrc}
                  alt={slide.imageAlt || slide.title || 'Style End Purse'}
                  className="hidden md:block w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              )}

              {/* Mobile Image (800x1000 / 4:5 recommended) */}
              {mobileSrc && (
                <img
                  src={mobileSrc}
                  alt={slide.imageAlt || slide.title || 'Style End Purse'}
                  className="block md:hidden w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              )}

              {/* Optional Text & Navigation Button Overlay */}
              {(hasText || hasButton) && (
                <div
                  className={`absolute inset-0 flex ${getOverlayPositionClasses(slide.buttonPosition)} ${
                    hasText ? 'bg-gradient-to-t from-black/65 via-black/20 to-transparent' : ''
                  }`}
                >
                  <div className="max-w-xl space-y-3 sm:space-y-4">
                    {hasText && slide.eyebrow && (
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#C5A880]">
                        {slide.eyebrow}
                      </p>
                    )}
                    {hasText && slide.title && (
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white font-serif-luxury leading-tight drop-shadow-sm">
                        {slide.title}
                      </h2>
                    )}
                    {hasButton && (
                      <div>
                        <Link
                          to={slide.buttonLink!}
                          className="inline-flex items-center gap-2 bg-[#111111]/90 hover:bg-black text-white border border-[#C5A880]/50 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] active:scale-95"
                        >
                          <span>{slide.buttonText}</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A880]" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Carousel Controls (only when multiple slides are active) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-white border border-white/15 backdrop-blur-sm flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-white border border-white/15 backdrop-blur-sm flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-3.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/35 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-[#C5A880]' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
