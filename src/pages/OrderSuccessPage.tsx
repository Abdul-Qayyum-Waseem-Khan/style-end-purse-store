import { Link, useParams, useLocation } from 'react-router';
import { CheckCircle2, Package, Mail, Truck, Calendar, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../app/components/ui/button';
import { useState } from 'react';
import axiosInstance from '../api/axios';
import { generateOrderPDF } from '../utils/pdf/OrderPDFGenerator';
import { toast } from 'sonner';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const state = location.state as { trackingId?: string; expectedDeliveryDate?: string };
  const trackingId = state?.trackingId;
  const expectedDeliveryDate = state?.expectedDeliveryDate ? new Date(state.expectedDeliveryDate) : null;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrintSlip = async () => {
    setIsGeneratingPDF(true);
    try {
      let orderToPrint = null;
      if (trackingId) {
        // Try public tracking API first
        const { data } = await axiosInstance.get(`/api/v1/orders/track/${trackingId}`);
        orderToPrint = data.data;
      } else if (orderId) {
        // Fallback to authenticated order API
        const { data } = await axiosInstance.get(`/api/v1/orders/${orderId}`);
        orderToPrint = data.data;
      }

      if (orderToPrint) {
        generateOrderPDF(orderToPrint);
        toast.success('PDF generated successfully!');
      } else {
        toast.error('Could not load order details for PDF.');
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF invoice.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thank you for your order!
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Your order has been placed successfully and is now being processed.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left print:border-none print:bg-white print:p-0">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Order Summary</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-brand-600 print:hidden" />
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Order Reference Number</span>
                  <span className="text-lg font-mono font-bold text-gray-900">{orderId || 'ORD-UNKNOWN'}</span>
                </div>
              </div>

              {trackingId && (
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-5 h-5 text-brand-600 print:hidden" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Tracking ID</span>
                    <span className="text-lg font-mono font-bold text-gray-900">{trackingId}</span>
                  </div>
                </div>
              )}

              {expectedDeliveryDate && (
                <div className="flex items-center gap-3 mb-2 sm:col-span-2">
                  <Calendar className="w-5 h-5 text-brand-600 print:hidden" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Expected Delivery By</span>
                    <span className="text-lg font-bold text-gray-900">{format(expectedDeliveryDate, 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-10 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 print:hidden">
            <Mail className="w-5 h-5" />
            We've sent a confirmation email with your order details and tracking link.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
            <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl border-2 flex items-center gap-2" onClick={handlePrintSlip} disabled={isGeneratingPDF}>
              <Printer className="w-4 h-4" />
              {isGeneratingPDF ? 'Generating...' : 'Download E-Slip'}
            </Button>
            <Link to="/account/orders">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl border-2">
                View Orders
              </Button>
            </Link>
            <Link to="/">
              <Button className="w-full sm:w-auto h-12 px-8 rounded-xl bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30">
                Continue Shopping
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
