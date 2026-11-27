import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { ProductCard } from '../../app/components/ProductCard';
import { Button } from '../../app/components/ui/button';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function WishlistPage() {
  const { fetchCurrentUser } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/users/wishlist');
      setWishlist(data.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await axiosInstance.post(`/api/v1/users/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      await fetchCurrentUser();
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Loading Wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111111] font-serif-luxury">My Wishlist</h1>
        <div className="text-xs font-semibold text-gray-600 bg-[#FAF8F5] px-3 py-1.5 rounded-md border border-gray-200/80 shrink-0 self-start sm:self-auto">
          {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-[#FAFAFA] rounded-lg border border-dashed border-gray-200 space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-gray-400">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">Your wishlist is currently empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Save your favorite luxury purses, satchels, and heels by clicking the heart icon on any product.
            </p>
          </div>
          <Button asChild className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-full px-8 py-3 shadow-xs">
            <Link to="/">Explore Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {wishlist.map((product) => (
            <div key={product._id} className="relative group">
              <ProductCard product={product} />
              
              {/* Quick Remove Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(product._id);
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur-xs rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 shadow-md hover:bg-red-50 transition-all duration-200 z-20 border border-gray-100"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
