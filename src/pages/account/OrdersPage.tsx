import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Package, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  Calendar, 
  Eye, 
  Printer,
  RotateCcw,
  Sparkles,
  MapPin,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../../app/components/ui/badge';
import { Button } from '../../app/components/ui/button';
import { InvoiceSlip } from '../../app/components/InvoiceSlip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../app/components/ui/dialog';
import axiosInstance from '../../api/axios';

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'in_progress', label: 'Processing', icon: Package },
  { id: 'dispatched', label: 'Dispatched', icon: Truck },
  { id: 'at_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/orders/my-orders');
      setOrders(data.data || []);
      if (data.data?.length > 0) {
        setExpandedOrder(data.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'dispatched': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'at_delivery': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      case 'return_requested': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'returned': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderModernTimeline = (currentStatus: string) => {
    if (['cancelled', 'return_requested', 'returned'].includes(currentStatus)) {
      return (
        <div className={`p-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider ${
          currentStatus === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
        }`}>
          <AlertCircle className="w-4 h-4" />
          This order is currently marked as {currentStatus.replace(/_/g, ' ')}.
        </div>
      );
    }

    const currentIndex = STATUS_STEPS.findIndex(s => s.id === currentStatus);
    
    return (
      <div className="py-6 px-2 sm:px-6">
        <div className="relative flex justify-between items-center">
          {/* Connecting Track */}
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full" />
          <div 
            className="absolute top-5 left-0 h-1 bg-black -z-10 rounded-full transition-all duration-700 ease-in-out" 
            style={{ width: `${(Math.max(0, currentIndex) / (STATUS_STEPS.length - 1)) * 100}%` }} 
          />
          
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const StepIcon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative">
                <div 
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs
                    ${isCompleted 
                      ? 'bg-[#111111] text-[#C5A880]' 
                      : 'bg-white text-gray-300 border-2 border-gray-200'
                    }
                    ${isCurrent ? 'ring-4 ring-black/10 scale-110' : ''}
                  `}
                >
                  <StepIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCompleted ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                <span 
                  className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center max-w-[70px] sm:max-w-[90px] leading-tight ${
                    isCompleted ? 'text-gray-900' : 'text-gray-400 font-normal'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Retrieving Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif-luxury">My Orders & Tracking</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time status updates for your luxury leather collection</p>
        </div>
        <div className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200/80 shrink-0 self-start sm:self-auto">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-gray-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">You haven't placed any orders yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Browse our collection of luxury purses, evening clutches, tote bags, and footwear.
            </p>
          </div>
          <Button asChild className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-full px-8 py-3 shadow-xs">
            <Link to="/">Explore Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const orderId = (order._id || order.id || '').toString().substring(16).toUpperCase();
            const orderDate = order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy, h:mm a') : 'Recent';
            const totalAmount = (order.totalAmount || order.total || 0).toLocaleString();

            return (
              <div 
                key={order._id}
                className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:border-black/30 transition-all"
              >
                {/* Order Top Bar */}
                <div 
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="p-5 cursor-pointer bg-[#FAFAFA] hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-black text-[#C5A880] flex items-center justify-center shrink-0 shadow-xs">
                      <Package className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-gray-900">#{orderId}</span>
                        <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider py-0.5 ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{orderDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Amount</div>
                      <div className="text-base font-bold text-gray-900 font-serif">PKR {totalAmount}</div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-7 border-t border-gray-100 space-y-6">
                    
                    {/* Modern Timeline */}
                    <div className="bg-gray-50/60 rounded-2xl border border-gray-100 p-2 sm:p-4">
                      {renderModernTimeline(order.orderStatus)}
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Purchased Items</h4>
                      <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                        {(order.items || []).map((item: any, idx: number) => {
                          const itemTotal = ((item.price || 0) * (item.quantity || 1)).toLocaleString();
                          const imgUrl = item.product?.images?.[0]?.url || item.image || null;

                          return (
                            <div key={idx} className="p-4 bg-white flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200/60 overflow-hidden shrink-0 flex items-center justify-center">
                                  {imgUrl ? (
                                    <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-6 h-6 text-gray-300" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                    {item.product?.name || item.name || 'Luxury Leather Handbag'}
                                  </h5>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Qty: {item.quantity || 1} • Unit Price: PKR {(item.price || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-gray-900 font-serif shrink-0">
                                PKR {itemTotal}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery & Payment Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-gray-200/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-800">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" /> Shipping Destination
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{order.shippingAddress?.fullName || 'Customer'}</p>
                        <p className="text-xs text-gray-600">
                          {order.shippingAddress?.addressLine1 || order.shippingAddress?.address1 || ''}
                          {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                        </p>
                        <p className="text-xs text-gray-500">Contact: {order.shippingAddress?.phone || 'N/A'}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-gray-200/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-800">
                          <CreditCard className="w-3.5 h-3.5 text-amber-700" /> Payment & Billing
                        </div>
                        <p className="text-xs font-semibold text-gray-900">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                        </p>
                        <p className="text-xs text-gray-600">
                          Status: <span className="font-semibold text-emerald-700">{order.paymentStatus || 'Pending on Delivery'}</span>
                        </p>
                        <p className="text-xs text-gray-500">Includes Doorstep Inspection</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      {order.orderStatus === 'delivered' && (
                        <Button 
                          asChild 
                          variant="outline" 
                          className="text-xs font-semibold rounded-full border-gray-300 hover:bg-gray-50"
                        >
                          <Link to={`/account/return/${order._id}`}>
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                            Request Return / Exchange
                          </Link>
                        </Button>
                      )}

                      <Button 
                        onClick={() => setPreviewOrder(order)}
                        variant="outline" 
                        className="text-xs font-semibold rounded-full border-gray-300 hover:bg-gray-50"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
                        Print Official Invoice
                      </Button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal Dialog */}
      <Dialog open={!!previewOrder} onOpenChange={(open) => !open && setPreviewOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif font-bold text-gray-900">Style End Purse — Official Invoice</DialogTitle>
          </DialogHeader>
          {previewOrder && <InvoiceSlip order={previewOrder} />}
        </DialogContent>
      </Dialog>

    </div>
  );
}
