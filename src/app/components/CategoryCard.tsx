import { LucideIcon, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CategoryCardProps {
  name: string;
  icon?: LucideIcon;
  image: string;
  productCount?: number;
}

export function CategoryCard({ name, icon: Icon, image, productCount }: CategoryCardProps) {
  return (
    <div className="group cursor-pointer font-poppins">
      <div className="relative bg-white rounded-2xl border border-gray-200/80 luxury-card-hover overflow-hidden">
        <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-gray-100">
          {/* Category Image */}
          <ImageWithFallback
            src={image || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80"}
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
          
          {/* Optional Icon Badge */}
          {Icon && (
            <div className="absolute top-3.5 right-3.5 w-10 h-10 bg-white/90 backdrop-blur-xs rounded-full shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-5 h-5 text-[#B8924B]" />
            </div>
          )}

          {/* Bottom Content Card */}
          <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between text-white">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37] mb-0.5">
                Collection
              </p>
              <h3 className="text-base font-bold text-white leading-tight">
                {name}
              </h3>
              {productCount !== undefined && (
                <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                  {productCount} Exclusive {productCount === 1 ? 'Design' : 'Designs'}
                </p>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:bg-[#B8924B] group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
