import jsPDF from "jspdf";

const loadImageAsBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
};

export interface InvoiceItem {
  pickupDate: string;
  pickupTime: string;
  passengerName: string;
  routingInfo: string;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  accountNumber: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export async function generateInvoicePDF(invoice: InvoiceData, logoSrc: string): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  let logoBase64: string | null = null;
  try { logoBase64 = await loadImageAsBase64(logoSrc); } catch { /* skip */ }
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, y - 5, 35, 35);
  }

  const textX = margin + 40;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("18519 Kerill Rd, Triangle, VA 22172", textX, y + 5);
  doc.text("Phone: +1 (571) 426-6338", textX, y + 10);
  doc.text("Email: book@westminsterchariots.com", textX, y + 15);
  doc.setTextColor(200, 164, 94);
  doc.text("www.westminsterchariots.com", textX, y + 20);

  const rightX = w - margin - 50;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", rightX, y + 10, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`#${invoice.invoiceNumber}`, rightX, y + 18, { align: "right" });

  y += 35;

  doc.setDrawColor(200, 164, 94);
  doc.setLineWidth(0.5);
  doc.line(margin, y, w - margin, y);
  y += 10;

  const col2X = w / 2 + 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 164, 94);
  doc.text("BILL TO", margin, y);
  doc.text("INVOICE DETAILS", col2X, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Client Name", margin, y);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.clientName, margin + 30, y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("Invoice Number:", col2X, y);
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.invoiceNumber, col2X + 35, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Account Number", margin, y);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.accountNumber, margin + 30, y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("Invoice Date:", col2X, y);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceDate, col2X + 35, y);
  y += 5;

  doc.setTextColor(120, 120, 120);
  doc.text("Address", margin, y);
  doc.setTextColor(40, 40, 40);
  const addressLines = doc.splitTextToSize(invoice.clientAddress, 60);
  doc.text(addressLines, margin + 30, y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("Due Date:", col2X, y);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.dueDate, col2X + 35, y);
  y += Math.max(5, addressLines.length * 5);

  doc.setTextColor(120, 120, 120);
  doc.text("Phone", margin, y);
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.clientPhone || "N/A", margin + 30, y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("Payment Terms:", col2X, y);
  doc.setTextColor(200, 164, 94);
  doc.text(invoice.paymentTerms, col2X + 35, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Email", margin, y);
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.clientEmail || "N/A", margin + 30, y);
  y += 12;

  const tableY = y;
  const tableWidth = w - 2 * margin;
  const col1W = 30;
  const col2W = 35;
  const col3W = tableWidth - col1W - col2W - 25;
  const col4W = 25;

  doc.setFillColor(40, 40, 40);
  doc.rect(margin, tableY, tableWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("TIME & DATE", margin + 2, tableY + 5.5);
  doc.text("PASSENGER", margin + col1W + 2, tableY + 5.5);
  doc.text("ROUTING INFORMATION", margin + col1W + col2W + 2, tableY + 5.5);
  doc.text("PRICE", w - margin - 2, tableY + 5.5, { align: "right" });
  y = tableY + 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  invoice.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const startY = y;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);

    const timeDate = `${item.pickupDate}\n${item.pickupTime}`;
    const timeDateLines = doc.splitTextToSize(timeDate, col1W - 4);
    doc.text(timeDateLines, margin + 2, y + 4);

    const passengerLines = doc.splitTextToSize(item.passengerName, col2W - 4);
    doc.text(passengerLines, margin + col1W + 2, y + 4);

    const routingLines = doc.splitTextToSize(item.routingInfo, col3W - 4);
    doc.text(routingLines, margin + col1W + col2W + 2, y + 4);

    doc.setFont("helvetica", "bold");
    doc.text(`$${item.price.toFixed(2)}`, w - margin - 2, y + 4, { align: "right" });
    doc.setFont("helvetica", "normal");

    const rowHeight = Math.max(10, Math.max(timeDateLines.length, passengerLines.length, routingLines.length) * 4 + 4);
    y += rowHeight;
    doc.line(margin, y, w - margin, y);
  });

  y += 10;

  const totalsX = w - margin - 70;
  const totalsValueX = w - margin - 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text(`$${invoice.subtotal.toFixed(2)}`, totalsValueX, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Tax (if applicable):", totalsX, y);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text(`$${invoice.tax.toFixed(2)}`, totalsValueX, y, { align: "right" });
  y += 8;

  doc.setDrawColor(200, 164, 94);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y - 2, w - margin, y - 2);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Total Amount Due:", totalsX, y + 4);
  doc.setTextColor(200, 164, 94);
  doc.setFontSize(14);
  doc.text(`$${invoice.total.toFixed(2)}`, totalsValueX, y + 4, { align: "right" });
  y += 15;

  doc.setDrawColor(200, 164, 94);
  doc.setLineWidth(0.5);
  doc.line(margin, y, w - margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const footer = "Thank you for choosing Westminster Chariots. We truly value your trust and the opportunity to serve you. It is our privilege to provide refined, seamless transportation delivered with punctuality, discretion, and professionalism. We look forward to serving you again.";
  const footerLines = doc.splitTextToSize(footer, w - 2 * margin);
  doc.text(footerLines, margin, y);
  y += footerLines.length * 5 + 6;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Sincerely,", margin, y);
  y += 5;
  doc.text("The Westminster Chariots Team", margin, y);

  return doc;
}
