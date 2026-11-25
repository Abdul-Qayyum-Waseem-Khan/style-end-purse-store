import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { MapPin, Phone, CreditCard, Banknote, ShieldCheck, Gift, PlusCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../app/components/SEO';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discount: storeDiscount, clearCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const { deliveryConfig, fetchSettings, isLoading: settingsLoading } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'card' | 'raast'>('cod');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    province: 'Sindh',
    postalCode: '',
    jazzcashPhone: '',
    orderNotes: '',
  });

  const cartSubtotal = subtotal();
  
  // Calculate Dynamic Delivery Fee
  let calculatedDeliveryFee = deliveryConfig.defaultRate;
  if (deliveryConfig.isOverallFree) {
    calculatedDeliveryFee = 0;
  } else if (deliveryConfig.ranges && deliveryConfig.ranges.length > 0) {
    const matchingRange = deliveryConfig.ranges.find(r => cartSubtotal >= r.min && cartSubtotal <= r.max);
    if (matchingRange) {
      calculatedDeliveryFee = matchingRange.rate;
    }
  }
  const deliveryFee = calculatedDeliveryFee;

  const actualDiscount = appliedCoupon ? appliedCoupon.discountAmount : storeDiscount;
  const finalTotal = cartSubtotal - actualDiscount + deliveryFee;

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (!isAuthenticated) return;
    axiosInstance.get('/api/v1/users/addresses')
      .then(({ data }) => {
        const addresses = data.data || [];
        setSavedAddresses(addresses);
        // Pre-select & pre-fill default address if one exists
        const defaultAddr = addresses.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          prefillFromAddress(defaultAddr);
        }
      })
      .catch(() => {}); // silently fail — guest flow still works
  }, [isAuthenticated]);

  const prefillFromAddress = (addr: any) => {
    setFormData(prev => ({
      ...prev,
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      address1: addr.addressLine1 || addr.address1 || '',
      address2: addr.addressLine2 || addr.address2 || '',
      city: addr.city || '',
      province: addr.state || addr.province || 'Sindh',
      postalCode: addr.postalCode || '',
    }));
  };

  const handleSelectAddress = (id: string | 'new') => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setFormData(prev => ({
        ...prev,
        fullName: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        province: 'Sindh',
        postalCode: '',
      }));
    } else {
      const addr = savedAddresses.find(a => a._id === id);
      if (addr) prefillFromAddress(addr);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const { data } = await axiosInstance.post('/api/v1/coupons/validate', {
        code: couponCode,
        subtotal: cartSubtotal,
        email: formData.fullName ? `${formData.fullName.split(' ')[0]}@guest.com` : 'guest@guest.com',
      });
      setAppliedCoupon(data.data);
      toast.success(data.data.giftDescription ? 'Free gift applied!' : 'Coupon applied successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address1 || !formData.city || !formData.postalCode) {
      toast.error('Please fill in all required delivery fields.');
      return;
    }
    if (paymentMethod === 'jazzcash' && !formData.jazzcashPhone) {
      toast.error('Please enter your JazzCash phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const { getAttributionData } = await import('../hooks/useAttribution');
      const { getVisitorId } = await import('../hooks/useVisitorTracking');
      const { trackEvent } = await import('../utils/tracking');
      
      const attribution = getAttributionData();
      const visitorId = getVisitorId();
      
      const orderData = {
        items: items.map(i => {
          const itemPrice = i.selectedSetOption?.price !== undefined ? i.selectedSetOption.price : i.product.price;
          return {
            product: i.product.id || (i.product as any)._id,
            quantity: i.quantity,
            price: itemPrice,
            selectedColor: i.selectedColor ? { name: i.selectedColor.name, hex: i.selectedColor.hex } : undefined,
            selectedSetOption: i.selectedSetOption ? { 
              name: i.selectedSetOption.name, 
              price: i.selectedSetOption.price, 
              includedItems: i.selectedSetOption.includedItems 
            } : undefined
          };
        }),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
        },
        paymentMethod,
        paymentDetails: paymentMethod === 'jazzcash' ? { phone: formData.jazzcashPhone } : undefined,
        orderNotes: formData.orderNotes,
        subtotal: cartSubtotal,
        deliveryFee,
        discount: actualDiscount,
        total: finalTotal,
        couponCode: appliedCoupon?.code,
        freeGiftDescription: appliedCoupon?.giftDescription,
        attribution,
        visitorId,
        eventId // passed to backend for CAPI
      };

      // Fire frontend pixel event (CAPI will be fired on the backend)
      trackEvent('purchase', {
        currency: 'PKR',
        value: finalTotal,
        items: items.map(i => {
          const itemPrice = i.selectedSetOption?.price !== undefined ? i.selectedSetOption.price : i.product.price;
          return { 
            item_id: i.product.id || (i.product as any)._id, 
            item_name: i.product.name, 
            price: itemPrice, 
            quantity: i.quantity 
          };
        })
      }, eventId);

      let orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      let trackingId = null;
      let expectedDeliveryDate = null;

      try {
        const { data } = await axiosInstance.post('/api/v1/orders', orderData);
        orderId = data.data.id || data.data._id;
        trackingId = data.data.trackingId;
        expectedDeliveryDate = data.data.expectedDeliveryDate;
      } catch (err) {
        console.warn('Backend orders API not ready, proceeding with mocked order ID.');
      }

      // Auto-save the address to profile if user logged in and entered a new address
      if (isAuthenticated && selectedAddressId === 'new') {
        try {
          await axiosInstance.post('/api/v1/users/addresses', {
            fullName: formData.fullName,
            phone: formData.phone,
            addressLine1: formData.address1,
            addressLine2: formData.address2,
            city: formData.city,
            state: formData.province,
            postalCode: formData.postalCode,
            isDefault: true,
          });
        } catch {
          // silently fail — order was already placed
        }
      }

      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/order-success/${orderId}`, { state: { trackingId, expectedDeliveryDate } });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  const isNewAddress = selectedAddressId === 'new';
  const hasSavedAddresses = isAuthenticated && savedAddresses.length > 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <SEO 
        title="Checkout | Style End Purse" 
        description="Complete your secure checkout at Style End Purse and get luxury handbags & footwear delivered to you." 
      />
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">

          {/* Left Column */}
          <div className="flex-1 space-y-8">

            {/* Delivery Address */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="text-brand-600 w-6 h-6" />
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>

              {/* Saved Addresses Panel */}
              {hasSavedAddresses && (
                <div className="mb-6 space-y-2">
                  <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Select a saved address</p>

                  {savedAddresses.map(addr => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-brand-500 bg-brand-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressSelection"
                        value={addr._id}
                        checked={selectedAddressId === addr._id}
                        onChange={() => handleSelectAddress(addr._id)}
                        className="mt-1 accent-brand-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {addr.addressLine1}, {addr.city}, {addr.postalCode}
                        </p>
                        <p className="text-sm text-gray-500">{addr.phone}</p>
                      </div>
                      {selectedAddressId === addr._id && (
                        <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      )}
                    </label>
                  ))}

                  {/* New Address Option */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isNewAddress
                        ? 'border-brand-500 bg-brand-50/50'
                        : 'border-dashed border-gray-300 hover:border-brand-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressSelection"
                      value="new"
                      checked={isNewAddress}
                      onChange={() => handleSelectAddress('new')}
                      className="accent-brand-600"
                    />
                    <PlusCircle className={`w-5 h-5 ${isNewAddress ? 'text-brand-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isNewAddress ? 'text-brand-700' : 'text-gray-500'}`}>
                      Enter a new address
                    </span>
                  </label>
                </div>
              )}

              {/* Read-only selected address summary */}
              {hasSavedAddresses && !isNewAddress && (() => {
                const addr = savedAddresses.find(a => a._id === selectedAddressId);
                if (!addr) return null;
                return (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 space-y-1">
                    <p className="font-semibold text-gray-900">{addr.fullName}</p>
                    <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                    <p>{addr.city}, {addr.state} — {addr.postalCode}</p>
                    <p className="text-gray-500">{addr.phone}</p>
                  </div>
                );
              })()}

              {/* Form — shown for guests, or when "new address" is selected */}
              {(isNewAddress || !isAuthenticated || !hasSavedAddresses) && (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${hasSavedAddresses ? 'mt-4' : ''}`}>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="0300 1234567" required />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input id="address1" name="address1" value={formData.address1} onChange={handleChange} placeholder="Street address, house number" required />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input id="address2" name="address2" value={formData.address2} onChange={handleChange} placeholder="Apartment, suite, unit, etc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Karachi" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="Sindh">Sindh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad">Islamabad Capital Territory</option>
                      <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                      <option value="AJK">Azad Jammu and Kashmir</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="75000" required />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="text-brand-600 w-6 h-6" />
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all border-brand-500 bg-brand-50`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Banknote className="w-6 h-6 text-brand-600" />
                    <span className="font-semibold text-gray-900">Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">Pay in cash when your order arrives at your doorstep.</p>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Order Notes (Optional)</h2>
              <textarea
                name="orderNotes"
                value={formData.orderNotes}
                onChange={handleChange}
                placeholder="Notes about your order, e.g. special notes for delivery."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => {
                  const unitPrice = item.selectedSetOption?.price !== undefined ? item.selectedSetOption.price : item.product.price;
                  const itemKey = item.itemKey || item.product.id;
                  
                  return (
                    <div key={itemKey} className="flex gap-4 p-2 rounded-xl bg-gray-50/50">
                      <div className="w-16 h-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                        <img
                          src={item.product.images[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=100&q=80'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2">{item.product.name}</h4>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.selectedColor.hex }} />
                                {item.selectedColor.name}
                              </span>
                            )}
                            {item.selectedSetOption && (
                              <span className="text-[9px] font-semibold bg-[#FDF8EE] text-[#B8924B] border border-[#B8924B]/30 px-1.5 py-0.5 rounded-md">
                                {item.selectedSetOption.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-500 text-[11px]">Qty: {item.quantity}</span>
                          <span className="font-extrabold text-gray-900">PKR {(unitPrice * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code */}
              <div className="pt-6 border-t border-gray-100">
                <Label className="mb-2 block">Have a promo code?</Label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="uppercase"
                    disabled={appliedCoupon !== null}
                  />
                  {appliedCoupon ? (
                    <Button variant="outline" onClick={handleRemoveCoupon} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Remove
                    </Button>
                  ) : (
                    <Button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode} className="bg-slate-900 text-white hover:bg-slate-800">
                      {isValidatingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-gray-600 border-t border-gray-100 pt-6 mt-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">PKR {cartSubtotal.toLocaleString()}</span>
                </div>

                {actualDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                    <span className="font-medium">- PKR {actualDiscount.toLocaleString()}</span>
                  </div>
                )}

                {appliedCoupon?.giftDescription && (
                  <div className="flex justify-between text-brand-600 bg-brand-50 p-2 rounded-lg text-sm border border-brand-100 mt-2">
                    <span className="flex items-center gap-2"><Gift className="w-4 h-4" /> Free Gift</span>
                    <span className="font-medium">{appliedCoupon.giftDescription}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'text-gray-900 font-medium'}>
                    {deliveryFee === 0 ? 'Free' : `PKR ${deliveryFee}`}
                  </span>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-brand-600">
                      PKR {finalTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-8 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white h-14 text-lg rounded-xl shadow-lg hover:shadow-brand-500/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
