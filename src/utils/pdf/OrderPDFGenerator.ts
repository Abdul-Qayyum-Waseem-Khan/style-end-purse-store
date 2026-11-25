import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateOrderPDF = (order: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Colors
  const brandColor: [number, number, number] = [20, 184, 166]; // Teal 500
  const darkColor: [number, number, number] = [31, 41, 55]; // Gray 800
  const lightGray: [number, number, number] = [249, 250, 251]; // Gray 50
  
  // Header Background
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('STYLE END PURSE', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Handcrafted Luxury Handbags, Footwear & Accessories', 20, 30);

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDER E-SLIP', pageWidth - 20, 20, { align: 'right' });
  
  const orderId = (order._id || order.id || '').substring(16).toUpperCase() || 'UNKNOWN';
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #${orderId}`, pageWidth - 20, 30, { align: 'right' });

  // Bill To & Ship To
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  
  // Bill To
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To', 20, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(order.user?.name || order.shippingAddress?.fullName || 'Customer', 20, 70);
  doc.text(order.user?.email || order.shippingAddress?.email || 'N/A', 20, 75);
  doc.text(order.shippingAddress?.phone || 'N/A', 20, 80);

  // Ship To
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Shipped To', pageWidth / 2, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(
    `${order.shippingAddress?.address1 || ''} ${order.shippingAddress?.address2 || ''}\n${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''} ${order.shippingAddress?.postalCode || ''}`,
    (pageWidth / 2) - 20
  );
  doc.text(order.shippingAddress?.fullName || 'Customer', pageWidth / 2, 70);
  doc.text(addressLines, pageWidth / 2, 75);

  // Order Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const orderDate = order.createdAt ? format(new Date(order.createdAt), 'PPP') : 'N/A';
  doc.text(`Date: ${orderDate}`, 20, 100);
  doc.text(`Payment Method: ${(order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod)?.toUpperCase()}`, 20, 106);
  doc.text(`Status: ${(order.status || 'Pending').replace('_', ' ').toUpperCase()}`, 20, 112);

  // Items Table
  const tableData = (order.items || []).map((item: any) => [
    item.product?.name || item.name || 'Product',
    item.quantity?.toString() || '1',
    `PKR ${(item.price || 0).toLocaleString()}`,
    `PKR ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 125,
    head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6 },
    alternateRowStyles: { fillColor: lightGray },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Totals Calculation
  const subtotal = order.subtotal || order.total - (order.deliveryFee || order.shippingFee || 0);
  const deliveryFee = order.deliveryFee || order.shippingFee || 0;
  const discount = order.discount || 0;
  const total = order.total || order.totalAmount || 0;

  const rightAlign = pageWidth - 20;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - 80, finalY);
  doc.text(`PKR ${subtotal.toLocaleString()}`, rightAlign, finalY, { align: 'right' });

  doc.text('Delivery Fee:', pageWidth - 80, finalY + 8);
  doc.text(`PKR ${deliveryFee.toLocaleString()}`, rightAlign, finalY + 8, { align: 'right' });

  if (discount > 0) {
    doc.text('Discount:', pageWidth - 80, finalY + 16);
    doc.text(`- PKR ${discount.toLocaleString()}`, rightAlign, finalY + 16, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageWidth - 80, finalY + 26);
    doc.text(`PKR ${total.toLocaleString()}`, rightAlign, finalY + 26, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageWidth - 80, finalY + 18);
    doc.text(`PKR ${total.toLocaleString()}`, rightAlign, finalY + 18, { align: 'right' });
  }

  // Footer
  const footerY = doc.internal.pageSize.height - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a system-generated invoice and does not require a signature.', pageWidth / 2, footerY + 8, { align: 'center' });

  // Save the PDF
  doc.save(`StyleEndPurse_Order_${orderId}.pdf`);
};
