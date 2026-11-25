import { Link } from 'react-router';
import { ShoppingBag, Plus, Minus, Trash2, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../app/components/ui/sheet';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import axiosInstance from '../api/axios';

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartDrawer() {
  const { 
    items, 
    isDrawerOpen, 
    setDrawerOpen, 
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

  const currentSubtotal = subtotal();
  const progressPercent = Math.min(100, Math.round((currentSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - currentSubtotal);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    try {
      const { data } = await axiosInstance.post(`/api/v1/coupons/validate`, { code: couponInput, subtotal: currentSubtotal });
      applyCoupon(data.data.code, data.data.discountAmount);
      toast.success('Promo code applied successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid promo code');
      applyCoupon('', 0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 font-sans bg-white border-l border-gray-200">
        
        {/* Drawer Header */}
        <SheetHeader className="px-6 py-4 border-b border-gray-100 bg-white">
          <SheetTitle className="flex items-center justify-between text-base font-semibold text-[#111111]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Shopping Bag</span>
              <span className="text-xs text-gray-500 font-normal">
                ({totalQuantity})
              </span>
            </div>
          </SheetTitle>

          {/* Delivery Progress */}
          <div className="mt-2.5 pt-1">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>
                {amountToFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-medium">Free delivery unlocked</span>
                ) : (
                  <span>Add <strong>PKR {amountToFreeShipping.toLocaleString()}</strong> for free shipping</span>
                )}
              </span>
              <span className="text-[11px] text-gray-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#111111] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAFAFA]">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-xs border border-gray-100">
              <ShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-[#111111] mb-1">Your bag is empty</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-xs">
              Explore our collection of handcrafted handbags, footwear, and accessories.
            </p>
            <Button 
              className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-6 rounded-full"
              onClick={() => setDrawerOpen(false)}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Bag Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-gray-100">
              {items.map((item) => {
                const product = item.product;
                const image = product.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=150&q=80";
                const unitPrice = item.selectedSetOption?.price !== undefined ? item.selectedSetOption.price : product.price;
                const itemKey = item.itemKey || (product.id || (product as any)._id);
                
                return (
                  <div key={itemKey} className="pt-4 first:pt-0 flex gap-3.5 bg-white">
                    {/* Thumbnail */}
                    <div className="w-18 h-22 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img 
                        src={image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-semibold text-[#111111] line-clamp-1 leading-snug">
                            {product.name}
                          </h4>
                          <button 
                            onClick={() => removeItem(itemKey)}
                            className="text-gray-400 hover:text-black p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Selected Variants */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {item.selectedColor && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-sm">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedColor.hex }} />
                              {item.selectedColor.name}
                            </span>
                          )}
                          {item.selectedSetOption && (
                            <span className="text-[10px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-sm">
                              {item.selectedSetOption.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                          <button 
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-[#111111] px-2 min-w-[1.25rem] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            disabled={item.quantity >= (product.stock || 99)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#111111]">
                            PKR {(unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-gray-100 bg-[#FAFAFA] p-6 space-y-4">
              
              {/* Promo input */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Promo code" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="bg-white border-gray-200 rounded-md text-xs uppercase h-9"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="bg-[#111111] hover:bg-black text-white rounded-md text-xs font-semibold px-4 h-9"
                >
                  Apply
                </Button>
              </div>

              {/* Subtotal */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-black">PKR {currentSubtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({couponCode})</span>
                    <span>- PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm font-bold text-black">
                  <span>Total</span>
                  <span>PKR {total().toLocaleString()}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <Link to="/checkout" onClick={() => setDrawerOpen(false)} className="block">
                  <Button className="w-full bg-[#111111] hover:bg-black text-white font-semibold text-xs uppercase tracking-wider py-3 rounded-full flex items-center justify-center gap-2">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link to="/cart" onClick={() => setDrawerOpen(false)} className="block">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-800 text-xs font-semibold py-2.5 rounded-full bg-transparent">
                    View Shopping Bag
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-2 text-center">
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Cash on Delivery</span>
                <span>•</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Doorstep Inspection</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
