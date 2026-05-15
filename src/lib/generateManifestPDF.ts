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

export interface ManifestLeg {
  pickup: string;
  dropoff: string;
  tailNumber?: string;
  fboPhone?: string;
}

export interface ManifestData {
  reservationNumber: string;
  pickupDate: string;
  pickupTime: string;
  spotTime: string;
  billTo: string;
  address: string;
  phone: string;
  passenger: string;
  bookedOn: string;
  pax: number;
  vehicleType: string;
  affiliateName: string;
  legs: ManifestLeg[];
  driverNotes: string;
  specialRequests: string;
}

export const sampleManifestData: ManifestData = {
  reservationNumber: "11350 TRF",
  pickupDate: "02/08/2026 - Sunday",
  pickupTime: "11:40 AM",
  spotTime: "11:25 AM",
  billTo: "Westminster Chariots",
  address: "",
  phone: "(571) 426-6338",
  passenger: "Jennifer Reyes",
  bookedOn: "02/08/2026 07:45 AM",
  pax: 1,
  vehicleType: "Executive Sedan (003)",
  affiliateName: "",
  legs: [
    {
      pickup: "Atlantic Aviation 23411 AUTOPILOT DR, Dulles, VA 20166",
      dropoff: "9315 Rapley preserve dr, Potomac, MD 20854",
      tailNumber: "N282RH",
      fboPhone: "(703) 661-0151",
    }
  ],
  driverNotes: "Greeting sign is required.",
  specialRequests: "",
};

export type ManifestVariant = "dark" | "light";

type RGB = [number, number, number];

interface Palette {
  bg: RGB;
  card: RGB;
  accent: RGB;
  text: RGB;
  muted: RGB;
  border: RGB;
  section: RGB;
}

const DARK_PALETTE: Palette = {
  bg: [10, 10, 10],
  card: [26, 26, 26],
  accent: [228, 214, 182],
  text: [240, 240, 240],
  muted: [140, 140, 140],
  border: [50, 50, 50],
  section: [30, 30, 30],
};

const LIGHT_PALETTE: Palette = {
  bg: [245, 245, 245],
  card: [255, 255, 255],
  accent: [140, 120, 70],
  text: [30, 30, 30],
  muted: [110, 110, 110],
  border: [210, 210, 210],
  section: [240, 240, 240],
};

export async function generateManifestPDF(
  data: ManifestData,
  logoSrc: string,
  variant: ManifestVariant = "dark"
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

  y = cardMargin + 30;
  const innerMargin = cardMargin + 25;
  const innerW = cardW - 50;
  const rightX = innerMargin + innerW;

  let logoBase64: string | null = null;
  try { logoBase64 = await loadImageAsBase64(logoSrc); } catch { /* skip */ }
  if (logoBase64) {
    const logoH = 48;
    const logoW = logoH * 0.95;
    doc.addImage(logoBase64, "PNG", innerMargin, y, logoW, logoH);
  }

  doc.setFontSize(7.5);
  doc.setTextColor(...P.muted);
  doc.text("", rightX, y + 12, { align: "right" });
  doc.text("(571) 426-6338", rightX, y + 22, { align: "right" });
  doc.setTextColor(...P.accent);
  doc.setFont("helvetica", "italic");
  doc.text("Travel in Luxury, Arrive in Style", rightX, y + 32, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 55;

  doc.setDrawColor(...P.accent);
  doc.setLineWidth(0.8);
  doc.line(innerMargin, y, rightX, y);
  y += 18;

  const sectionTitle = (title: string) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...P.accent);
    doc.text(title.toUpperCase(), innerMargin, y + 9);
    y += 18;
  };

  const labelValue = (label: string, value: string, lx: number, vx: number, maxW?: number) => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...P.muted);
    doc.text(label, lx, y + 10);
    doc.setTextColor(...P.text);
    doc.setFont("helvetica", "bold");
    const displayVal = value || "—";
    if (maxW) {
      doc.text(displayVal, vx, y + 10, { maxWidth: maxW });
    } else {
      doc.text(displayVal, vx, y + 10);
    }
    doc.setFont("helvetica", "normal");
  };

  const thinLine = () => {
    doc.setDrawColor(...P.border);
    doc.setLineWidth(0.3);
    doc.line(innerMargin, y, rightX, y);
    y += 12;
  };

  const half = innerW / 2;
  const labelW = 80;
  const valX = innerMargin + labelW;
  const col2X = innerMargin + half + 10;
  const col2ValX = col2X + labelW;

  sectionTitle("Reservation Details");
  labelValue("Pick-up Date:", data.pickupDate, innerMargin, valX);
  labelValue("Reservation#:", data.reservationNumber, col2X, col2ValX);
  y += 16;
  labelValue("Pick-up Time:", data.pickupTime, innerMargin, valX);
  labelValue("Spot Time:", data.spotTime, col2X, col2ValX);
  y += 20;
  thinLine();

  sectionTitle("Billing Information");
  labelValue("Bill To:", data.billTo, innerMargin, valX, innerW - labelW);
  y += 16;
  labelValue("Address:", data.address, innerMargin, valX, innerW - labelW);
  y += 16;
  labelValue("Phone:", data.phone, innerMargin, valX, innerW - labelW);
  y += 20;
  thinLine();

  const savedY = y;
  sectionTitle("Passenger Information");
  labelValue("Passenger:", data.passenger, innerMargin, valX, half - labelW - 20);
  y += 16;
  labelValue("Booked On:", data.bookedOn, innerMargin, valX, half - labelW - 20);
  y += 16;
  labelValue("# of Pax:", String(data.pax), innerMargin, valX);
  const leftEndY = y + 16;

  y = savedY;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...P.accent);
  doc.text("VEHICLE", col2X, y + 9);
  y += 18;
  labelValue("Type:", data.vehicleType, col2X, col2ValX, half - labelW - 20);
  y += 16;
  labelValue("Affiliate:", data.affiliateName || "—", col2X, col2ValX, half - labelW - 20);
  y = Math.max(leftEndY, y + 16) + 4;
  thinLine();

  sectionTitle("Routing Information");

  // Render all legs
  data.legs.forEach((leg, index) => {
    // Pickup box
    doc.setFillColor(...P.section);
    doc.roundedRect(innerMargin, y, innerW, 48, 3, 3, "F");
    doc.setDrawColor(...P.border);
    doc.roundedRect(innerMargin, y, innerW, 48, 3, 3, "S");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...P.accent);
    const legLabel = data.legs.length > 1 ? `LEG ${index + 1} PICK-UP` : "PICK-UP";
    doc.text(legLabel, innerMargin + 10, y + 12);
    doc.setFontSize(8.5);
    doc.setTextColor(...P.text);
    doc.setFont("helvetica", "bold");
    doc.text(leg.pickup, innerMargin + 10, y + 26, { maxWidth: innerW - 20 });
    if (leg.tailNumber || leg.fboPhone) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...P.muted);
      doc.text(`Tail#: ${leg.tailNumber || 'N/A'}          FBO: ${leg.fboPhone || 'N/A'}`, innerMargin + 10, y + 40);
    }
    y += 56;

    // Dropoff box
    doc.setFillColor(...P.section);
    doc.roundedRect(innerMargin, y, innerW, 36, 3, 3, "F");
    doc.setDrawColor(...P.border);
    doc.roundedRect(innerMargin, y, innerW, 36, 3, 3, "S");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...P.accent);
    const dropLabel = data.legs.length > 1 ? `LEG ${index + 1} DROP-OFF` : "DROP-OFF";
    doc.text(dropLabel, innerMargin + 10, y + 12);
    doc.setFontSize(8.5);
    doc.setTextColor(...P.text);
    doc.setFont("helvetica", "bold");
    doc.text(leg.dropoff, innerMargin + 10, y + 26, { maxWidth: innerW - 20 });
    y += 44;

    // Add spacing between legs
    if (index < data.legs.length - 1) {
      y += 8;
    }
  });

  thinLine();

  sectionTitle("Notes / Comments");
  labelValue("Driver Notes:", data.driverNotes, innerMargin, innerMargin + 100, innerW - 100);
  y += 16;
  labelValue("Special Requests:", data.specialRequests || "—", innerMargin, innerMargin + 100, innerW - 100);
  y += 24;

  doc.setFontSize(8);
  doc.setTextColor(...P.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Signature:", innerMargin, y + 10);
  doc.setDrawColor(...P.border);
  doc.setLineWidth(0.5);
  doc.line(innerMargin + 60, y + 12, innerMargin + half - 20, y + 12);
  doc.text("Date:", col2X, y + 10);
  doc.line(col2X + 35, y + 12, rightX, y + 12);

  const footerY = cardMargin + cardH - 25;
  doc.setDrawColor(...P.accent);
  doc.setLineWidth(0.5);
  doc.line(innerMargin, footerY - 8, rightX, footerY - 8);
  doc.setFontSize(6.5);
  doc.setTextColor(...P.muted);
  doc.text("Westminster Chariots — Travel in Luxury, Arrive in Style", pw / 2, footerY, { align: "center" });
  doc.text("Confidential — For authorized use only", pw / 2, footerY + 10, { align: "center" });

  return doc;
}
