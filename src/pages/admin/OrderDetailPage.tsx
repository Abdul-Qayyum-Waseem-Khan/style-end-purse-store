import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useOrder } from '../../hooks/useOrders';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Badge } from '../../app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../app/components/ui/table';
import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';
import { ArrowLeft, User, MapPin, CreditCard, Mail, Phone, Package, Clock, CheckCircle, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceSlip } from '../../app/components/InvoiceSlip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../app/components/ui/dialog';
import axiosInstance from '../../api/axios';

const STATUS_FLOW = ['pending', 'in_progress', 'dispatched', 'at_delivery', 'delivered'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, isLoading, error, updateStatus, refetch } = useOrder(id || '');
  
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-between">
          <p>{error || 'Order not found'}</p>
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const shortId = (order.id || order._id).substring((order.id || order._id).length - 8).toUpperCase();

  const handleUpdateStatus = async () => {
    if (!newStatus && !expectedDate) {
      toast.error('Please select a status or date to update');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateStatus(newStatus || order.status, statusNote, expectedDate || undefined);
      toast.success('Status updated successfully');
      setNewStatus('');
      setStatusNote('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!order?.shippingAddress?.phone) {
      toast.error('No phone number available for this order');
      return;
    }
    
    // Format phone number (remove leading 0 and add country code if needed)
    let phone = order.shippingAddress.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '92' + phone.substring(1);
    }

    const name = order.shippingAddress.fullName;
    const orderId = shortId;
    const total = order.total;
    
    let message = '';
    switch (order.status) {
      case 'dispatched':
      case 'at_delivery':
        message = `Hi ${name}, great news! Your order #${orderId} has been dispatched and is on its way to you via our delivery partners. Please keep your phone reachable.`;
        break;
      case 'delivered':
        message = `Hi ${name}, your order #${orderId} has been successfully delivered. We hope you love your new pieces! Thank you for shopping with Style End Purse.`;
        break;
      case 'cancelled':
        message = `Hi ${name}, your order #${orderId} has been cancelled. If you have any questions or need to place a new order, we are here to help.`;
        break;
      case 'return_requested':
      case 'returned':
        message = `Hi ${name}, we are reaching out regarding the return of your order #${orderId}. Please let us know if you need any assistance with the process.`;
        break;
      case 'in_progress':
        message = `Hi ${name}, your order #${orderId} for PKR ${total} has been confirmed. We are currently processing it and will notify you once it's shipped. Thank you for choosing Style End Purse!`;
        break;
      case 'pending':
      default:
        message = `Hi ${name}, we received your order #${orderId} for PKR ${total} at Style End Purse. Please reply "YES" to confirm this order so we can process and dispatch it quickly.`;
        break;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'at_delivery': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'return_requested': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'returned': return 'bg-gray-200 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="min-h-full bg-gray-50 pb-12">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <button 
          onClick={() => navigate('/admin/orders')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Order #{shortId}
              <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsInvoicePreviewOpen(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white border-none flex items-center gap-2"
              onClick={handleWhatsAppClick}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Timeline UI */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="max-w-4xl mx-auto overflow-x-auto pb-4 scrollbar-hide">
            <div className="relative flex justify-between min-w-[600px] px-4">
              {/* Connecting Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded-full"></div>
              
              {/* Active Line Fill */}
              {currentStatusIndex >= 0 && order.status !== 'cancelled' && (
                <div 
                  className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500"
                  style={{ width: `calc(${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}% - 4rem)` }}
                ></div>
              )}

              {/* Cancelled State Overlay */}
              {order.status === 'cancelled' && (
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-red-500 -z-10 rounded-full"></div>
              )}

              {STATUS_FLOW.map((status, index) => {
                const isCompleted = currentStatusIndex >= index;
                const isCurrent = currentStatusIndex === index;
                const isCancelled = order.status === 'cancelled';
                
                return (
                  <div key={status} className="flex flex-col items-center gap-2 bg-white px-2 relative z-10 w-24">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCancelled ? 'border-red-500 bg-red-50 text-red-500' :
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-gray-300 bg-white text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <span className="text-xs sm:text-sm font-bold">{index + 1}</span>}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider text-center ${
                      isCurrent ? 'text-gray-900' : 
                      isCompleted ? 'text-green-600' : 
                      isCancelled ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items & Customer Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <ImageWithFallback src={item.product?.images?.[0]} alt={item.product?.name || 'Product'} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                            {item.product?.SKU && <p className="text-xs text-gray-500">SKU: {item.product.SKU}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">PKR {item.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">PKR {(item.price * item.quantity).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pricing Breakdown */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>PKR {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee</span>
                    <span>PKR {order.deliveryFee.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- PKR {order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>PKR {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-5 h-5 text-gray-500" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.user?.name || order.shippingAddress.fullName}</p>
                  {order.user && (
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" /> {order.user.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" /> {order.shippingAddress.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm text-gray-600 leading-relaxed">
                  <span className="block text-gray-900 font-medium mb-1">{order.shippingAddress.fullName}</span>
                  {order.shippingAddress.address1}<br />
                  {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </address>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Status & Payment */}
        <div className="space-y-8">
          
          {/* Status Update Box */}
          <Card className="border-orange-200 shadow-orange-100/50">
            <CardHeader className="bg-orange-50/50 border-b border-orange-100">
              <CardTitle className="text-orange-900">Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="" disabled>Select status...</option>
                    {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</option>)}
                    <option value="cancelled">Cancelled</option>
                    <option value="return_requested">Return Requested</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                  <input 
                    type="date"
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                  />
                  {order.expectedDeliveryDate && !expectedDate && (
                    <p className="text-xs text-gray-500 mt-1">Currently: {new Date(order.expectedDeliveryDate).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note (optional)</label>
                  <textarea 
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[80px]"
                    placeholder="E.g., Shipped via TCS, Tracking #12345"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || (!newStatus && !expectedDate)}
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>

              {/* Status History Log */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Activity Log</h4>
                <div className="space-y-4">
                  {order.statusHistory.slice().reverse().map((log) => (
                    <div key={log._id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Marked as {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </p>
                        {log.note && <p className="text-xs text-gray-600 mt-0.5">{log.note}</p>}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-gray-500" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-900 uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={
                      order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                      order.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }>
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                    {order.paymentStatus === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                        onClick={async () => {
                          try {
                            setIsUpdating(true);
                            await axiosInstance.put(`/api/v1/orders/${order.id || order._id}/payment-status`, { paymentStatus: 'paid' });
                            toast.success('Payment marked as received');
                            refetch();
                          } catch (error) {
                            toast.error('Failed to update payment status');
                          } finally {
                            setIsUpdating(false);
                          }
                        }}
                        disabled={isUpdating}
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
                {order.paymentDetails?.transactionId && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono text-gray-900">{order.paymentDetails.transactionId}</span>
                  </div>
                )}
                {order.paymentDetails?.phone && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Account Phone</span>
                    <span className="text-gray-900">{order.paymentDetails.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      {/* Invisible print container - only shows on print */}
      <div className="hidden print:block">
        <InvoiceSlip order={order} />
      </div>

      <Dialog open={isInvoicePreviewOpen} onOpenChange={setIsInvoicePreviewOpen}>
        <DialogContent className="w-[98vw] max-w-full sm:max-w-[1200px] max-h-[90vh] overflow-y-auto px-4 sm:px-6">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-100 p-6 rounded-lg flex justify-center overflow-x-auto w-full">
            {/* We recreate the invoice slip structure here without the portal so it previews normally in the modal */}
            <div className="bg-white shadow-lg p-0 border border-gray-200 shrink-0 w-full flex justify-center">
              <InvoiceSlip order={order} isPreview={true} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
