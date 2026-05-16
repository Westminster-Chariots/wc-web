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

export interface TripItem {
  pickupDate: string;
  pickupTime: string;
  passengerName: string;
  pickup: string;
  dropoff: string;
  price: number;
}

export interface ConfirmationData {
  confirmationNumber: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  items: TripItem[];
}

export type ConfirmationVariant = "dark" | "light";

type RGB = [number, number, number];

interface Palette {
  bg: RGB;
  card: RGB;
  accent: RGB;
  text: RGB;
  muted: RGB;
  border: RGB;
  tableHeader: RGB;
  tableRow: RGB;
}

const DARK_PALETTE: Palette = {
  bg: [10, 10, 10],
  card: [26, 26, 26],
  accent: [228, 214, 182],
  text: [240, 240, 240],
  muted: [140, 140, 140],
  border: [50, 50, 50],
  tableHeader: [10, 10, 10],
  tableRow: [26, 26, 26],
};

const LIGHT_PALETTE: Palette = {
  bg: [245, 245, 245],
  card: [255, 255, 255],
  accent: [140, 120, 70],
  text: [30, 30, 30],
  muted: [110, 110, 110],
  border: [210, 210, 210],
  tableHeader: [40, 40, 40],
  tableRow: [255, 255, 255],
};

export async function generateConfirmationPDF(
  confirmation: ConfirmationData,
  logoSrc: string,
  variant: ConfirmationVariant = "dark"
): Promise<jsPDF> {
  const P = variant === "light" ? LIGHT_PALETTE : DARK_PALETTE;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  let y = 0;

  doc.setFillColor(...P.bg);
  doc.rect(0, 0, pw, ph, "F");

  const cardMargin = 30;
  const cardW = pw - cardMargin * 2;
  const cardH = ph - cardMargin * 2;
  doc.setFillColor(...P.card);
  doc.roundedRect(cardMargin, cardMargin, cardW, cardH, 6, 6, "F");
  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(cardMargin, cardMargin, cardW, cardH, 6, 6, "S");

  y = cardMargin + 40;
  const innerMargin = cardMargin + 30;
  const innerW = cardW - 60;
  const rightX = innerMargin + innerW;

  let logoBase64: string | null = null;
  try { logoBase64 = await loadImageAsBase64(logoSrc); } catch { /* skip */ }
  if (logoBase64) {
    const logoH = 60;
    const logoW = logoH * 1.2;
    doc.addImage(logoBase64, "PNG", innerMargin, y - 10, logoW, logoH);
  }

  // Company contact info below logo
  const contactX = innerMargin;
  const contactY = y + 55;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...P.muted);
  doc.text("", contactX, contactY);
  doc.text("Phone: +1 (571) 426-6338", contactX, contactY + 9);
  doc.text("Email: book@westminsterchariots.com", contactX, contactY + 18);
  doc.setTextColor(...P.accent);
  doc.text("www.westminsterchariots.com", contactX, contactY + 27);

  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...P.text);
  doc.text("TRIP CONFIRMATION", rightX, y + 10, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...P.muted);
  doc.text(`#${confirmation.confirmationNumber}`, rightX, y + 25, { align: "right" });
  y += 90;

  doc.setDrawColor(...P.accent);
  doc.setLineWidth(0.8);
  doc.line(innerMargin, y, rightX, y);
  y += 20;

  // Client Information Section
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...P.accent);
  doc.text("CLIENT INFORMATION", innerMargin, y);
  y += 18;

  const labelValue = (label: string, value: string, lx: number, bold = false) => {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...P.muted);
    doc.text(label, lx, y);
    doc.setTextColor(...P.text);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(value || "—", lx, y + 11);
    y += 20;
  };

  labelValue("Client Name", confirmation.clientName, innerMargin, true);
  labelValue("Address", confirmation.clientAddress, innerMargin);
  labelValue("Phone", confirmation.clientPhone || "N/A", innerMargin);
  labelValue("Email", confirmation.clientEmail || "N/A", innerMargin);
  y += 12;

  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.3);
  doc.line(innerMargin, y, rightX, y);
  y += 20;

  // Trip Details Table
  const tableY = y;
  const tableW = innerW;
  const col1W = 80;
  const col2W = 100;
  const col4W = 70;
  const col3W = tableW - col1W - col2W - col4W;

  doc.setFillColor(...P.tableHeader);
  doc.rect(innerMargin, tableY, tableW, 24, "F");
  doc.setTextColor(variant === "light" ? 255 : 228, variant === "light" ? 255 : 214, variant === "light" ? 255 : 182);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("TIME & DATE", innerMargin + 8, tableY + 15);
  doc.text("PASSENGER", innerMargin + col1W + 8, tableY + 15);
  doc.text("ROUTING INFORMATION", innerMargin + col1W + col2W + 8, tableY + 15);
  doc.text("PRICE", rightX - 8, tableY + 15, { align: "right" });
  y = tableY + 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...P.text);

  confirmation.items.forEach((item, index) => {
    if (y > ph - 150) {
      doc.addPage();
      doc.setFillColor(...P.bg);
      doc.rect(0, 0, pw, ph, "F");
      doc.setFillColor(...P.card);
      doc.roundedRect(cardMargin, cardMargin, cardW, cardH, 6, 6, "F");
      y = cardMargin + 40;
    }

    const rowStartY = y;
    const timeDate = `${item.pickupDate}\n${item.pickupTime}`;
    const timeDateLines = doc.splitTextToSize(timeDate, col1W - 16);
    const passengerLines = doc.splitTextToSize(item.passengerName, col2W - 16);
    
    // Format routing with pickup and dropoff
    const pickupLines = doc.splitTextToSize(item.pickup, col3W - 16);
    const dropoffLines = doc.splitTextToSize(item.dropoff, col3W - 16);
    const routingTotalLines = pickupLines.length + dropoffLines.length + 2; // +2 for labels and arrow
    
    const maxLines = Math.max(timeDateLines.length, passengerLines.length, routingTotalLines);
    const rowHeight = Math.max(55, maxLines * 11 + 20);

    if (index % 2 === 0) {
      doc.setFillColor(...P.tableRow);
      doc.rect(innerMargin, y, tableW, rowHeight, "F");
    }

    doc.setTextColor(...P.text);
    doc.text(timeDateLines, innerMargin + 8, y + 16);
    doc.text(passengerLines, innerMargin + col1W + 8, y + 16);
    
    // Render routing with pickup and dropoff
    let routingY = y + 16;
    doc.setTextColor(...P.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("PICKUP:", innerMargin + col1W + col2W + 8, routingY);
    routingY += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...P.muted);
    doc.text(pickupLines, innerMargin + col1W + col2W + 8, routingY, { maxWidth: col3W - 16 });
    routingY += pickupLines.length * 10 + 6;
    
    doc.setTextColor(...P.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("DROPOFF:", innerMargin + col1W + col2W + 8, routingY);
    routingY += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...P.muted);
    doc.text(dropoffLines, innerMargin + col1W + col2W + 8, routingY, { maxWidth: col3W - 16 });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...P.text);
    doc.text(`$${item.price.toFixed(2)}`, rightX - 8, y + 16, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += rowHeight;
    doc.setDrawColor(...P.border);
    doc.setLineWidth(0.3);
    doc.line(innerMargin, y, rightX, y);
  });

  y += 20;

  doc.setDrawColor(...P.accent);
  doc.setLineWidth(0.8);
  doc.line(innerMargin, y, rightX, y);
  y += 15;

  // Confirmation Message
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...P.muted);
  const message = "Your trip has been confirmed. Our professional driver will ensure a smooth, comfortable journey. Thank you for choosing Westminster Chariots.";
  const messageLines = doc.splitTextToSize(message, innerW);
  doc.text(messageLines, innerMargin, y);
  y += messageLines.length * 10 + 15;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...P.text);
  doc.text("Safe travels,", innerMargin, y);
  y += 12;
  doc.text("Westminster Chariots Team", innerMargin, y);

  const footerY = cardMargin + cardH - 25;
  doc.setDrawColor(...P.accent);
  doc.setLineWidth(0.5);
  doc.line(innerMargin, footerY - 8, rightX, footerY - 8);
  doc.setFontSize(6.5);
  doc.setTextColor(...P.muted);
  doc.text("Westminster Chariots — Travel in Luxury, Arrive in Style", pw / 2, footerY, { align: "center" });
  doc.text("Trip Confirmation Document", pw / 2, footerY + 10, { align: "center" });

  return doc;
}
