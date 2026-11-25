import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingBag, Star, Heart, ChevronRight, ChevronLeft, ShieldCheck, Truck, RefreshCw, Share2, Check, CheckCircle2, Layers, PackageCheck } from 'lucide-react';
import axiosInstance from '../api/axios';
import { Product, ColorVariant, SetOption } from '../hooks/useProducts';
import { Button } from '../app/components/ui/button';
import { ProductReviews } from '../app/components/ProductReviews';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { SEO } from '../app/components/SEO';
import { Play, X } from 'lucide-react';
import { ProductCard } from '../app/components/ProductCard';
import { useProducts } from '../hooks/useProducts';

const RelevantProducts = ({ categoryId, currentProductId }: { categoryId: string, currentProductId: string }) => {
  const { products, isLoading } = useProducts({ category: categoryId, limit: 5 });
  const relevant = products.filter(p => p._id !== currentProductId && p.id !== currentProductId).slice(0, 4);

  if (isLoading) {
    return (
      <div className="mt-16">
        <h3 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relevant.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Matching Recommendations</span>
          <h3 className="text-xl font-bold text-gray-900 mt-1">You May Also Like</h3>
        </div>
        <Link to="/category/all" className="text-xs font-semibold text-gray-600 hover:text-black underline">
          View All &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {relevant.map((prod) => (
          <ProductCard 
            key={prod.id || prod._id}
            product={prod}
            badge={prod.isOnSale ? "Sale" : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState(0);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Variant selection states
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedSetOption, setSelectedSetOption] = useState<SetOption | null>(null);

  const mediaItems = product ? [
    ...(product.images || []).map(url => ({ type: 'image', url })),
    ...(product.video ? [{ type: 'video', url: product.video }] : [])
  ] : [];

  // Auto-swipe gallery logic
  useEffect(() => {
    if (!product || isModalOpen || mediaItems.length <= 1) return;
    if (mediaItems[activeMedia]?.type === 'video' && isVideoPlaying) return;

    const timer = setInterval(() => {
      setActiveMedia((prev) => (prev + 1) % mediaItems.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [product, isModalOpen, isVideoPlaying, activeMedia, mediaItems.length]);

  const { addItem, setDrawerOpen } = useCartStore();
  const { user, isAuthenticated, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = product ? user?.wishlist?.some((w: any) => 
    typeof w === 'string' ? w === product._id : w._id === product._id
  ) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get(`/api/v1/products/${slug}`);
        const prod = data.data;
        setProduct(prod);

        // Set default color
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
        }

        // Set default set option
        if (prod.setOptions && prod.setOptions.length > 0) {
          const defaultOpt = prod.setOptions.find((o: SetOption) => o.isDefault) || prod.setOptions[0];
          setSelectedSetOption(defaultOpt);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const currentPrice = selectedSetOption?.price !== undefined ? selectedSetOption.price : (product?.price || 0);
  const currentComparePrice = selectedSetOption?.comparePrice || product?.comparePrice;
  const currentDiscount = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, 1, selectedColor || undefined, selectedSetOption || undefined);
      setJustAdded(true);
      toast.success(`${product.name} added to your bag`);
      setTimeout(() => {
        setJustAdded(false);
        setDrawerOpen(true);
      }, 450);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to save items to your wishlist');
      navigate('/login');
      return;
    }
    try {
      setIsWishlisting(true);
      await axiosInstance.post(`/api/v1/users/wishlist/${product._id}`);
      await fetchCurrentUser();
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlisting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.shortDescription || `View ${product?.name} at Style End Purse`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500">Loading product...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-500 mb-8">{error || 'This item is currently unavailable.'}</p>
        <Link to="/">
          <Button className="bg-black text-white rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-wider">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-[#111111]">
      <SEO 
        title={`${product.name} | Style End Purse`} 
        description={`${product.shortDescription || product.description?.substring(0, 140)}... Designer leather handbag.`}
        image={product.images?.[0]}
        url={`https://styleendpurse.com/product/${product.slug}`}
        type="product"
      />

      {/* Breadcrumbs */}
      <div className="bg-[#FAFAFA] border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3.5 flex items-center text-xs text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 shrink-0 text-gray-400" />
          <Link to={`/category/${product.category?.slug || 'all'}`} className="hover:text-gray-900 capitalize">
            {typeof product.category === 'object' ? product.category?.name : 'Handbags & Sets'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 shrink-0 text-gray-400" />
          <span className="text-gray-900 font-semibold truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
        
        {/* Main Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Media Showcase */}
          <div className="space-y-4">
            <div 
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer group"
              onClick={() => setIsModalOpen(true)}
            >
              {mediaItems[activeMedia]?.type === 'video' ? (
                <video 
                  src={mediaItems[activeMedia].url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  onPlay={() => setIsVideoPlaying(true)}
                  onEnded={() => {
                    setIsVideoPlaying(false);
                    setActiveMedia((prev) => (prev + 1) % mediaItems.length);
                  }}
                  onPause={() => setIsVideoPlaying(false)}
                />
              ) : (
                <img 
                  src={mediaItems[activeMedia]?.url || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              )}

              {/* Badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-col gap-1 z-10 pointer-events-none">
                {currentDiscount > 0 && (
                  <span className="bg-black text-white text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-sm">
                    -{currentDiscount}% OFF
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-gray-800 text-white text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-sm">
                    Popular
                  </span>
                )}
              </div>

              {/* Carousel Controls */}
              {mediaItems.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMedia((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-sm transition-all z-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMedia((prev) => (prev + 1) % mediaItems.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-sm transition-all z-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {mediaItems.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveMedia(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeMedia === idx 
                        ? 'border-black' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                        <video src={item.url} className="w-full h-full object-cover opacity-50" />
                        <Play className="w-4 h-4 text-white absolute" />
                      </div>
                    ) : (
                      <img src={item.url} alt={`View ${idx}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details, Variants & Buy */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {typeof product.category === 'object' ? product.category?.name : 'Handbags'}
                </span>
                <button 
                  onClick={handleShare}
                  className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] leading-snug mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.averageRating || 5)
                          ? 'fill-[#FBBF24] text-[#FBBF24]'
                          : 'fill-gray-200 text-gray-200'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  {product.averageRating?.toFixed(1) || '4.9'} ({product.numOfReviews || 12} reviews)
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-emerald-700 font-medium">In Stock</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-2xl font-bold text-[#111111]">
                  PKR {currentPrice.toLocaleString()}
                </span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    PKR {currentComparePrice.toLocaleString()}
                  </span>
                )}
                {currentDiscount > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Save PKR {(currentComparePrice - currentPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* 1. Color Swatch Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">
                      Color: <span className="font-normal text-gray-600 ml-1">{selectedColor?.name || product.colors[0].name}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, idx) => {
                      const isSelected = selectedColor?.name === color.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" 
                            style={{ backgroundColor: color.hex }} 
                          />
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Set / Option Selection */}
              {product.setOptions && product.setOptions.length > 0 && (
                <div className="mb-6 space-y-2">
                  <span className="text-xs font-semibold text-gray-800 block">
                    Choose Option / Set:
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {product.setOptions.map((opt, idx) => {
                      const isSelected = (selectedSetOption?.name === opt.name) || (!selectedSetOption && opt.isDefault);
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedSetOption(opt)}
                          className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-black bg-gray-50 ring-1 ring-black'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-black bg-black text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{opt.name}</p>
                              {opt.includedItems && opt.includedItems.length > 0 && (
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Includes: {opt.includedItems.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-gray-900">
                              PKR {opt.price.toLocaleString()}
                            </span>
                            {opt.comparePrice && opt.comparePrice > opt.price && (
                              <p className="text-[10px] text-gray-400 line-through">
                                PKR {opt.comparePrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Included Items Checklist */}
              {selectedSetOption && selectedSetOption.includedItems && selectedSetOption.includedItems.length > 0 && (
                <div className="mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-gray-600" />
                    Items Included in this Selection:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                    {selectedSetOption.includedItems.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 ${
                    justAdded 
                      ? 'bg-emerald-700 text-white' 
                      : 'bg-[#111111] hover:bg-black text-white'
                  } font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add {selectedSetOption ? selectedSetOption.name : 'to Bag'}</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={handleToggleWishlist}
                  disabled={isWishlisting}
                  className="w-11 h-11 rounded-full border border-gray-200 hover:border-black bg-white flex items-center justify-center transition-all shrink-0"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                <ShieldCheck className="w-4 h-4 text-gray-700" />
                <span className="text-[10px] font-semibold text-gray-900 uppercase">100% Genuine</span>
                <span className="text-[10px] text-gray-500">Quality leather</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                <Truck className="w-4 h-4 text-gray-700" />
                <span className="text-[10px] font-semibold text-gray-900 uppercase">Fast Delivery</span>
                <span className="text-[10px] text-gray-500">Cash on Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                <RefreshCw className="w-4 h-4 text-gray-700" />
                <span className="text-[10px] font-semibold text-gray-900 uppercase">Easy Returns</span>
                <span className="text-[10px] text-gray-500">7-day exchange</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Specifications */}
        <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
            <div className="prose max-w-none text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description?.split('\n').map((para, idx) => (
                <p key={idx} className="mb-2.5">{para}</p>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Materials & Hardware</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Material:</span>
                  <span className="font-medium text-gray-900">{product.material || 'Premium Leather'}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Hardware:</span>
                  <span className="font-medium text-gray-900">{product.hardware || 'Gold Plated Clasps & Zippers'}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Lining:</span>
                  <span className="font-medium text-gray-900">{product.lining || 'Fabric Lining'}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">Size & Dimensions</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Length × Width × Height:</span>
                  <span className="font-medium text-gray-900">
                    {product.dimensions?.length || '28 cm'} × {product.dimensions?.width || '12 cm'} × {product.dimensions?.height || '20 cm'}
                  </span>
                </li>
                <li className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Strap:</span>
                  <span className="font-medium text-gray-900">{product.dimensions?.strapDrop || 'Adjustable Strap'}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Closure:</span>
                  <span className="font-medium text-gray-900">Lock / Zipper Closure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <ProductReviews productId={product.id || product._id || ''} />

        {/* You May Also Like */}
        <RelevantProducts 
          categoryId={typeof product.category === 'object' ? product.category._id : product.category} 
          currentProductId={product.id || product._id || ''} 
        />
      </div>

      {/* Sticky Mobile Add To Bag Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-3 z-40 flex items-center justify-between gap-3 shadow-md">
        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-medium">
            {selectedSetOption?.name || 'Selected'}
          </span>
          <span className="text-sm font-bold text-gray-900">PKR {currentPrice.toLocaleString()}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 bg-black text-white font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-full flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{product.stock > 0 ? 'Add to Bag' : 'Sold Out'}</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2"
          >
            <X className="w-7 h-7" />
          </button>
          <img 
            src={mediaItems[activeMedia]?.url} 
            alt={product.name} 
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl" 
          />
        </div>
      )}
    </div>
  );
}
