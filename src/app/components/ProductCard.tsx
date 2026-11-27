import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, Plus } from 'lucide-react';
import { Product, ColorVariant } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import axiosInstance from '../../api/axios';

interface ProductCardProps {
  product: Product;
  badge?: string;
}

export function ProductCard({ product, badge }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.45 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addItem, setDrawerOpen } = useCartStore();
  const { user, isAuthenticated, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = user?.wishlist?.some((w: any) => 
    typeof w === 'string' ? w === (product.id || product._id) : w._id === (product.id || product._id)
  ) || false;

  const defaultOption = product.setOptions?.find(o => o.isDefault) || product.setOptions?.[0];
  const displayPrice = defaultOption?.price !== undefined ? defaultOption.price : product.price;
  const displayComparePrice = defaultOption?.comparePrice || product.comparePrice;

  const isDiscounted = displayComparePrice && displayComparePrice > displayPrice;
  const discountPercent = isDiscounted 
    ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100) 
    : 0;

  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80";
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    addItem(product, 1, selectedColor || undefined, defaultOption || undefined);
    toast.success(`${product.name} added to bag`);
    setTimeout(() => {
      setIsAddingToCart(false);
      setDrawerOpen(true);
    }, 200);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save to wishlist');
      navigate('/login');
      return;
    }

    try {
      setIsWishlisting(true);
      await axiosInstance.post(`/api/v1/users/wishlist/${product._id || product.id}`);
      await fetchCurrentUser();
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlisting(false);
    }
  };

  return (
    <div 
      ref={cardRef}
      className="group relative flex flex-col bg-white rounded-lg border border-gray-200/70 p-2 sm:p-2.5 overflow-hidden transition-shadow hover:shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Container (3:4 Ratio) */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-[#F7F7F6] block rounded-md">
        <img 
          src={primaryImage} 
          alt={product.name} 
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
            isHovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {secondaryImage !== primaryImage && (
          <img 
            src={secondaryImage} 
            alt={`${product.name} alternate view`} 
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Minimal Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded-sm">
              -{discountPercent}%
            </span>
          )}
          {product.productType === 'set' && (
            <span className="bg-[#111111] text-white text-[9.5px] font-medium px-2 py-0.5 rounded-sm">
              3-Piece Set
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          disabled={isWishlisting}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center transition-all z-20"
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-black text-black' : 'text-gray-600'}`} />
        </button>

        {/* Quick Add Button (Desktop: hover, Mobile: scroll into view) */}
        <button 
          onClick={handleQuickAdd}
          disabled={isAddingToCart || product.stock === 0}
          className={`absolute inset-x-2.5 bottom-2.5 bg-white/95 hover:bg-white text-[#111111] text-[11px] font-semibold uppercase tracking-wider py-2 rounded-md shadow-sm border border-gray-200/80 flex items-center justify-center gap-1.5 transition-all duration-300 z-20 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          } ${
            isHovered ? 'md:opacity-100 md:translate-y-0 md:pointer-events-auto' : 'md:opacity-0 md:translate-y-2 md:pointer-events-none'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingToCart ? 'Added' : 'Quick Add'}</span>
        </button>
      </Link>

      {/* 2. Details */}
      <div className="pt-3 pb-1 flex flex-col space-y-1">
        
        {/* Color Swatch Dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pb-0.5">
            {product.colors.slice(0, 4).map((col, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(col);
                }}
                className={`w-2.5 h-2.5 rounded-full border border-gray-300 transition-transform ${
                  selectedColor?.name === col.name ? 'scale-125 ring-1 ring-black' : ''
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="hover:underline">
          <h3 className="text-[13px] font-medium text-[#111111] line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-[13px] font-semibold text-[#111111]">
            PKR {displayPrice.toLocaleString()}
          </span>
          {isDiscounted && (
            <span className="text-[11px] text-gray-400 line-through">
              PKR {displayComparePrice.toLocaleString()}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
