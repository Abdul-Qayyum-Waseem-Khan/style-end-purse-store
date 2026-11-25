import { Link } from 'react-router';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Banner } from '../../hooks/useBanners';
import { useCountdown } from '../../hooks/useCountdown';

interface Props {
  banner: Banner;
}

export function TickerBarAd({ banner }: Props) {
  const { hours, minutes, seconds, isExpired } = useCountdown(banner.endDate);

  if (isExpired && banner.endDate) {
    return null;
  }

  return (
    <div className="w-full bg-black text-white border-b border-amber-500/20 py-2 px-4 overflow-hidden relative">
      <div className="container mx-auto flex items-center justify-between gap-4 text-xs">
        
        {/* Ticker marquee / highlight */}
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] tracking-widest uppercase shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {banner.badgeText || 'SPECIAL OFFER'}
          </span>
          <span className="font-medium text-gray-200 truncate">
            {banner.title}
          </span>
        </div>

        {/* Real-time timer & CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {banner.endDate && (
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-amber-400 font-bold bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              <span className="text-gray-400 text-[10px] font-sans font-normal">ENDS:</span>
              <span>{hours}h {minutes}m {seconds}s</span>
            </div>
          )}

          <Link
            to={banner.link || '/category/all'}
            className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 underline underline-offset-4 decoration-amber-400/50"
          >
            <span>{banner.buttonText || 'Shop Now'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  );
}
