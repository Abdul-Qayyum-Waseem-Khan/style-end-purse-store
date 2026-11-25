import { Link } from 'react-router';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import axiosInstance from '../api/axios';
import { SEO } from '../app/components/SEO';

export function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    subtotal, 
    total, 
    discount, 
    couponCode, 
    applyCoupon 
  } = useCartStore();

  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    try {
      const { data } = await axiosInstance.post(`/api/v1/coupons/validate`, { code: couponInput, subtotal: subtotal() });
      applyCoupon(data.data.code, data.data.discountAmount);
      toast.success('VIP Luxury Privilege applied successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid promo code');
      applyCoupon('', 0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center font-poppins">
        <div className="w-20 h-20 bg-white border border-gray-200/80 shadow-xs rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-[#B8924B]" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your Luxury Bag is Empty</h2>
        <p className="text-xs text-gray-500 mb-8 max-w-sm leading-relaxed">
          Discover our curated collection of designer purses, artisan leather pouches, and couture accessories.
        </p>
        <Link to="/">
          <Button className="bg-[#111827] hover:bg-gray-800 text-white h-11 px-8 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 pt-8 font-poppins text-gray-900">
      <SEO 
        title="Your Luxury Bag | Style End Purse" 
        description="Review your selected designer purses, pouches, and luxury sets before checkout." 
      />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8924B]">Boutique Selection</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-[#B8924B]" />
              Your Shopping Bag
            </h1>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-xs">
            {items.reduce((acc, item) => acc + item.quantity, 0)} Items Selected
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Column */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-3xl shadow-xs border border-gray-200/80 overflow-hidden divide-y divide-gray-100">
              {items.map((item) => {
                const product = item.product;
                const unitPrice = item.selectedSetOption?.price !== undefined ? item.selectedSetOption.price : product.price;
                const itemKey = item.itemKey || (product.id || (product as any)._id);

                return (
                  <div 
                    key={itemKey} 
                    className="p-6 flex flex-col sm:flex-row gap-6 bg-white hover:bg-gray-50/40 transition-colors"
                  >
                    <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0">
                      <img 
                        src={product.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80"} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-1.5">
                          <Link to={`/product/${product.slug}`} className="hover:text-[#B8924B] transition-colors">
                            <h3 className="text-base font-extrabold text-gray-900 line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          <button 
                            onClick={() => removeItem(itemKey)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Selected Variants Pill */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {item.selectedColor && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                              <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: item.selectedColor.hex }} />
                              {item.selectedColor.name}
                            </span>
                          )}
                          {item.selectedSetOption && (
                            <span className="text-xs font-semibold bg-[#FDF8EE] text-[#B8924B] border border-[#B8924B]/30 px-3 py-1 rounded-full">
                              {item.selectedSetOption.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50">
                          <button 
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-full hover:bg-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            disabled={item.quantity >= (product.stock || 99)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-full hover:bg-white transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-gray-900">
                            PKR {(unitPrice * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            PKR {unitPrice.toLocaleString()} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-3xl shadow-xs border border-gray-200/80 p-6 md:p-8 sticky top-24 space-y-6">
              <h2 className="text-lg font-extrabold text-gray-900">Order Summary</h2>

              <div className="flex gap-2">
                <Input 
                  placeholder="VIP Promo Code" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="bg-gray-50 border-gray-200 rounded-xl text-xs uppercase h-10"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="bg-[#111827] hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider h-10 px-4"
                >
                  Apply
                </Button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-gray-900">PKR {subtotal().toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#047857] bg-[#ECFDF5] p-3 rounded-xl border border-[#A7F3D0] font-semibold">
                    <span>VIP Privilege ({couponCode})</span>
                    <span>- PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery</span>
                  <span className="text-[#047857] font-semibold">Free (Above PKR 5,000)</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    PKR {total().toLocaleString()}
                  </span>
                </div>
              </div>

              <Link to="/checkout" className="block w-full">
                <Button className="w-full bg-[#111827] hover:bg-gray-800 text-white h-13 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </Button>
              </Link>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-[10px] text-gray-500 text-center font-medium">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B8924B]" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#B8924B]" />
                  <span>Doorstep Inspection</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
