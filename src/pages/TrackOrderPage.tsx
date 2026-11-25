import { useState } from 'react';
import { Package, Truck, Calendar, Search, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';
import { SEO } from '../app/components/SEO';

const STATUS_STEPS = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'in_progress', label: 'Processing', icon: Package },
  { id: 'dispatched', label: 'Dispatched', icon: Truck },
  { id: 'at_delivery', label: 'Out for Delivery', icon: MapPin },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

export function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data } = await axiosInstance.get(`/api/v1/orders/track/${trackingId.trim()}`);
      setOrder(data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order not found. Please check your Tracking ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (currentStatus: string) => {
    if (currentStatus === 'cancelled' || currentStatus === 'return_requested' || currentStatus === 'returned') return -1;
    return STATUS_STEPS.findIndex(s => s.id === currentStatus);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <SEO 
        title="Track Your Order | Style End Purse" 
        description="Track the delivery status of your Style End Purse order." 
      />
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-600">Enter your Tracking ID to see the latest updates on your delivery.</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <form onSubmit={handleTrack} className="flex gap-4 max-w-xl mx-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="e.g. TRK-A1B2C3D4"
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-gray-200 rounded-lg md:rounded-xl focus:ring-brand-500 focus:border-brand-500 transition-colors uppercase"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-[56px] px-8 rounded-lg md:rounded-xl bg-brand-600 hover:bg-brand-700" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Track'}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-center max-w-xl mx-auto border border-red-100">
              {error}
            </div>
          )}
        </div>

        {order && (
          <div className="bg-white rounded-xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-brand-50 p-6 sm:p-8 border-b border-brand-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Order {order.trackingId}</h2>
                  <p className="text-sm text-gray-500">Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
                </div>
                {order.expectedDeliveryDate && (
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-600" />
                    <div className="text-sm">
                      <span className="text-gray-500 block text-xs">Expected Delivery</span>
                      <span className="font-bold text-gray-900">{format(new Date(order.expectedDeliveryDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {['cancelled', 'return_requested', 'returned'].includes(order.status) ? (
                <div className="text-center py-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {order.status === 'cancelled' ? <Package className="w-8 h-8" /> : <Truck className="w-8 h-8" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase">{order.status.replace('_', ' ')}</h3>
                  <p className="text-gray-600">This order is currently marked as {order.status.replace('_', ' ')}.</p>
                </div>
              ) : (
                <div className="relative py-8 max-w-2xl mx-auto">
                  <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gray-200 sm:left-1/2 sm:-ml-px hidden sm:block" />
                  
                  <div className="space-y-8 relative">
                    {STATUS_STEPS.map((step, index) => {
                      const currentIndex = getStatusIndex(order.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.id} className="relative flex items-center sm:justify-center">
                          <div className={`hidden sm:flex w-1/2 justify-end pr-8 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            <span className="font-medium text-sm">{step.label}</span>
                          </div>

                          <div className={`absolute left-0 sm:relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center bg-white transition-colors duration-300
                            ${isCurrent ? 'border-brand-500 text-brand-600 shadow-lg shadow-brand-500/20' : 
                              isCompleted ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-300'}
                          `}>
                            <StepIcon className="w-6 h-6" />
                          </div>

                          <div className={`sm:hidden ml-20 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            <span className="font-medium">{step.label}</span>
                            {isCurrent && <p className="text-xs text-brand-600 mt-1">Current Status</p>}
                          </div>

                          <div className="hidden sm:block w-1/2 pl-8">
                            {/* We could show timestamp here if available from statusHistory */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 sm:p-8 border-t border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">Items in this shipment</h3>
               <div className="space-y-4">
                 {order.items.map((item: any) => (
                   <div key={item._id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                     <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                       {item.product.images?.[0] ? (
                         <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                       ) : (
                         <Package className="w-8 h-8 m-4 text-gray-400" />
                       )}
                     </div>
                     <div>
                       <p className="font-medium text-gray-900">{item.product.name}</p>
                       <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
