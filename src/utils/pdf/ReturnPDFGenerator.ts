import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateReturnPDF = (returnRequest: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Colors
  const brandColor: [number, number, number] = [234, 88, 12]; // Orange 600
  const darkColor: [number, number, number] = [17, 24, 39]; // Gray 900
  const lightGray: [number, number, number] = [243, 244, 246]; // Gray 100
  const textColor: [number, number, number] = [75, 85, 99]; // Gray 500

  // Helper to draw header
  const drawHeader = (title: string, subtitle: string) => {
    doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('STYLE END PURSE', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('styleendpurse@gmail.com | +923069291569', 20, 30);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth - 20, 20, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth - 20, 30, { align: 'right' });
  };

  // Extract Data
  const orderId = returnRequest.order?._id?.substring(16).toUpperCase() || 'N/A';
  const returnId = returnRequest._id?.substring(16).toUpperCase() || 'N/A';
  const customerName = returnRequest.user?.name || returnRequest.order?.shippingAddress?.fullName || 'Customer';
  const customerEmail = returnRequest.user?.email || 'N/A';
  const customerPhone = returnRequest.order?.shippingAddress?.phone || 'N/A';
  
  const customerAddress = returnRequest.order?.shippingAddress ? 
    `${returnRequest.order.shippingAddress.address1}\n${returnRequest.order.shippingAddress.city}, ${returnRequest.order.shippingAddress.province}\n${returnRequest.order.shippingAddress.postalCode}` 
    : 'Address not available';

  const items = returnRequest.order?.items || [];
  const tableData = items.map((item: any) => [
    item.product?.name || 'Product',
    item.product?.SKU || 'N/A',
    item.quantity.toString(),
    `PKR ${item.price.toLocaleString()}`
  ]);

  // ==========================================
  // PAGE 1: PACKING SLIP (INSIDE PACKAGE)
  // ==========================================
  drawHeader('RETURN PACKING SLIP', 'Copy 1: Attach with package contents');

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Return Details', 20, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  doc.text(`Return ID: #${returnId}`, 20, 65);
  doc.text(`Original Order ID: #${orderId}`, 20, 72);
  doc.text(`Return Date: ${format(new Date(returnRequest.createdAt), 'PPP')}`, 20, 79);
  doc.text(`Reason: ${returnRequest.reason}`, 20, 86);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', pageWidth / 2, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(customerName, pageWidth / 2, 65);
  doc.text(customerEmail, pageWidth / 2, 72);
  doc.text(customerPhone, pageWidth / 2, 79);

  // Items Table
  autoTable(doc, {
    startY: 100,
    head: [['Product Name', 'SKU', 'Qty', 'Unit Price']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6 },
    alternateRowStyles: { fillColor: lightGray },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Instructions
  doc.setFillColor(254, 243, 199); // yellow-100
  doc.rect(20, finalY, pageWidth - 40, 30, 'F');
  
  doc.setTextColor(146, 64, 14); // yellow-800
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT INSTRUCTION:', 25, finalY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text('This Packing Slip must be placed inside the physical package along with the returned items.', 25, finalY + 20);

  // ==========================================
  // PAGE 2: COURIER WAYBILL (OUTSIDE PACKAGE)
  // ==========================================
  doc.addPage();
  drawHeader('COURIER WAYBILL', 'Copy 2: For Courier Service');

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(20, 50, pageWidth - 40, 80);

  // From Section
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM (SENDER):', 25, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 25, 70);
  doc.text(customerPhone, 25, 75);
  const splitAddress = doc.splitTextToSize(customerAddress, (pageWidth / 2) - 30);
  doc.text(splitAddress, 25, 80);

  // Line Separator
  doc.line(pageWidth / 2, 50, pageWidth / 2, 130);

  // To Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TO (RECEIVER):', (pageWidth / 2) + 10, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Style End Purse Returns Dept.', (pageWidth / 2) + 10, 70);
  doc.text('+923069291569', (pageWidth / 2) + 10, 75);
  doc.text('Gulberg III', (pageWidth / 2) + 10, 80);
  doc.text('Lahore, Punjab', (pageWidth / 2) + 10, 85);
  doc.text('Pakistan', (pageWidth / 2) + 10, 90);

  // Barcode Placeholder
  doc.setDrawColor(0, 0, 0);
  doc.rect(25, 140, pageWidth - 50, 40);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`RTRN-${returnId}`, pageWidth / 2, 165, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('COURIER BARCODE PLACEHOLDER', pageWidth / 2, 175, { align: 'center' });

  // Delivery Notes
  doc.setFontSize(10);
  doc.text(`Order Reference: #${orderId}`, 25, 190);
  doc.text(`Package Weight: ________ kg`, 25, 200);
  doc.text(`Date of Dispatch: ____/____/20__`, pageWidth / 2, 200);

  // ==========================================
  // PAGE 3: CUSTOMER PROOF
  // ==========================================
  doc.addPage();
  drawHeader('CUSTOMER PROOF', 'Copy 3: For Customer Own Proof');

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Return Request Approved', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const approvalMessage = `Dear ${customerName},\n\nYour return request for Order #${orderId} has been successfully approved.\n\nPlease follow these final steps to ensure a smooth refund process:\n\n1. Securely pack the items in their original packaging.\n2. Print Copy 1 (Page 1) and place it INSIDE the package with the docs.\n3. Print Copy 2 (Page 2) and give it to the courier service / attach to the outside.\n4. Keep Copy 3 (Page 3) as your personal proof of this approved return.\n5. Drop the package off at your nearest designated courier center within 3 days.\n\nNote: As per our policy, returns are valid for exactly 3 days after the order process is complete.\n\nOnce we receive and inspect the items, your refund will be processed within 5-7 business days.\n\nThank you for choosing Style End Purse!`;
  
  const splitMessage = doc.splitTextToSize(approvalMessage, pageWidth - 40);
  doc.text(splitMessage, 20, 80);

  // Footer / Sign off
  doc.setFont('helvetica', 'italic');
  doc.text('Authorized by Style End Purse Returns Management', 20, 180);
  
  // Date of Generation
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Document generated on: ${format(new Date(), 'PPpp')}`, 20, pageHeight - 20);

  // Save the PDF
  doc.save(`StyleEndPurse_Return_${returnId}.pdf`);
};
