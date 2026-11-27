import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Printer, ChevronLeft, Scissors } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import axiosInstance from '../../api/axios';
import { format } from 'date-fns';

export function ReturnSlipPage() {
  const { returnId } = useParams<{ returnId: string }>();
  const [returnReq, setReturnReq] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/api/v1/returns/${returnId}`)
      .then(res => {
        setReturnReq(res.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [returnId]);

  if (isLoading) return <div className="p-8 text-center">Loading return slip...</div>;
  if (!returnReq) return <div className="p-8 text-center text-red-500">Return request not found.</div>;

  const order = returnReq.order;
  const user = returnReq.user;

  const SlipSection = ({ title, copyFor }: { title: string, copyFor: string }) => (
    <div className="border-2 border-gray-900 p-6 mb-4 bg-white break-inside-avoid">
      <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider">STYLE END PURSE RETURNS</h2>
          <p className="text-sm font-bold mt-1 uppercase text-gray-600">{copyFor} COPY</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-bold">{order.trackingId || order._id.substring(16).toUpperCase()}</p>
          <p className="text-sm text-gray-500">Return ID: {returnReq._id.substring(16).toUpperCase()}</p>
          <p className="text-sm text-gray-500">Date: {format(new Date(), 'MMM d, yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold uppercase text-xs text-gray-500 mb-1">Customer Details</h3>
          <p className="font-bold text-gray-900">{order.shippingAddress?.fullName || user?.name || 'Customer'}</p>
          <p className="text-sm text-gray-700">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-gray-700">{user?.email}</p>
        </div>
        <div>
          <h3 className="font-bold uppercase text-xs text-gray-500 mb-1">Return Reason</h3>
          <p className="font-bold text-gray-900">{returnReq.reason}</p>
          <p className="text-sm text-gray-700 truncate">{returnReq.details || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="font-bold uppercase text-xs text-gray-500 mb-2">Items to Return</h3>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 font-bold">Product</th>
              <th className="p-2 font-bold w-20 text-center">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any) => (
              <tr key={item._id} className="border-b border-gray-100">
                <td className="p-2">{item.product?.name || 'Product'}</td>
                <td className="p-2 text-center">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 text-center text-sm text-gray-500">
        <div>
          <div className="border-b border-gray-400 h-10 mb-2"></div>
          Customer Signature
        </div>
        <div>
          <div className="border-b border-gray-400 h-10 mb-2"></div>
          Courier Signature / Stamp
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 p-4 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <Link to="/account/orders" className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
          </Link>
          <Button onClick={() => window.print()} className="flex items-center gap-2 bg-[#111111] hover:bg-black">
            <Printer className="w-4 h-4" /> Print A4 Slip
          </Button>
        </div>
      </div>

      {/* A4 Printable Area */}
      <div className="container mx-auto max-w-[210mm] mt-8 bg-white shadow-xl print:shadow-none print:mt-0 print:p-0 p-8 min-h-[297mm]">
        
        <div className="print:hidden mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm">
          <strong>Instructions:</strong> Please print this page on an A4 sheet. Cut along the dotted lines. Keep the Customer Copy for your records, give the Courier Copy to the rider, and attach the Product Dispatch Copy securely to the outside of your return package.
        </div>

        {/* 1. Customer Copy */}
        <SlipSection title="Return Authorization Form" copyFor="Customer" />
        
        <div className="flex items-center gap-4 my-6 text-gray-400">
          <Scissors className="w-5 h-5" />
          <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
          <span className="text-xs font-mono uppercase tracking-widest">Cut Here</span>
        </div>

        {/* 2. Courier Copy */}
        <SlipSection title="Return Authorization Form" copyFor="Courier" />

        <div className="flex items-center gap-4 my-6 text-gray-400">
          <Scissors className="w-5 h-5" />
          <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
          <span className="text-xs font-mono uppercase tracking-widest">Cut Here</span>
        </div>

        {/* 3. Product Dispatch Copy */}
        <SlipSection title="Return Authorization Form" copyFor="Product Dispatch" />

      </div>
    </div>
  );
}
