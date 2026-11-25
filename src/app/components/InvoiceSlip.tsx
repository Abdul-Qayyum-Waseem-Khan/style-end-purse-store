import React from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { Logo } from './Logo';

interface InvoiceSlipProps {
  order: any;
  isPreview?: boolean;
}

export function InvoiceSlip({ order, isPreview = false }: InvoiceSlipProps) {
  if (!order) return null;

  const printRoot = document.getElementById('print-root');
  if (!isPreview && !printRoot) return null;

  const invoiceContent = (
    <div className="bg-white text-black p-10 mx-auto w-full max-w-full min-h-[297mm] font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
        <div>
          <Logo className="h-12 w-auto mb-4" />
          <p className="text-gray-500 text-sm">Handcrafted Luxury Handbags, Footwear & Accessories</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>Gulberg III, Lahore, Pakistan</p>
            <p>styleendpurse@gmail.com | +923069291569</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wider mb-2">Invoice</h1>
          <p className="text-gray-600">
            <span className="font-semibold">Order ID:</span> {order._id?.substring(16).toUpperCase()}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Date:</span> {format(new Date(order.createdAt || Date.now()), 'PPP')}
          </p>
          <p className="text-gray-600 mt-2">
            <span className="font-semibold">Status:</span> 
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm uppercase tracking-wider text-gray-800">
              {order.status?.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>

      {/* Bill To & Ship To */}
      <div className="flex justify-between mb-10">
        <div className="w-1/2 pr-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
          <p className="font-bold text-gray-800 text-lg">{order.user?.name || order.shippingAddress?.fullName || 'Customer'}</p>
          <p className="text-gray-600 mt-1">{order.user?.email || 'No email provided'}</p>
        </div>
        <div className="w-1/2 pl-4 border-l border-gray-200">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Shipped To</h3>
          {order.shippingAddress ? (
            <div className="text-gray-600 space-y-1">
              <p className="font-bold text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No shipping details</p>
          )}
        </div>
      </div>

      {/* Order Items Table */}
      <table className="w-full text-left mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm">Item Description</th>
            <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm text-center">Qty</th>
            <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm text-right">Unit Price</th>
            <th className="py-3 px-2 font-bold text-gray-800 uppercase text-sm text-right">Total</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {order.items?.map((item: any, index: number) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-4 px-2">
                <p className="font-semibold text-gray-800">{item.name || item.product?.name}</p>
                {item.product?.SKU && <p className="text-xs text-gray-500">SKU: {item.product.SKU}</p>}
              </td>
              <td className="py-4 px-2 text-center">{item.quantity}</td>
              <td className="py-4 px-2 text-right">PKR {item.price?.toLocaleString()}</td>
              <td className="py-4 px-2 text-right font-medium">PKR {(item.quantity * item.price)?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Calculation */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 max-w-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-600">
            <span>Subtotal</span>
            <span>PKR {((order.totalAmount || order.total || 0) - (order.shippingFee || 0))?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-600">
            <span>Shipping</span>
            <span>PKR {order.shippingFee?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between py-4 text-xl font-bold text-gray-800 border-b-2 border-gray-800">
            <span>Total Amount</span>
            <span>PKR {(order.totalAmount || order.total || 0)?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-auto pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p className="font-semibold text-gray-600 mb-1">Thank you for your business!</p>
        <p>If you have any questions about this invoice, please contact support.</p>
        <p className="mt-4 text-xs text-gray-400">This is a system generated invoice and does not require a signature.</p>
      </div>
    </div>
  );

  if (isPreview) {
    return invoiceContent;
  }

  return createPortal(invoiceContent, printRoot!);
}
