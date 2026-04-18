import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  Packer,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { ManifestData, ManifestVariant } from "./generateManifestPDF";

interface DocxPalette {
  accent: string;
  text: string;
  muted: string;
  card: string;
  section: string;
  bg: string;
  border: string;
}

const DARK_DOCX: DocxPalette = {
  accent: "E4D6B6",
  text: "F0F0F0",
  muted: "8C8C8C",
  card: "1A1A1A",
  section: "1E1E1E",
  bg: "0A0A0A",
  border: "323232",
};

const LIGHT_DOCX: DocxPalette = {
  accent: "8C7846",
  text: "1E1E1E",
  muted: "6E6E6E",
  card: "FFFFFF",
  section: "F0F0F0",
  bg: "F5F5F5",
  border: "D2D2D2",
};

const loadImageAsArrayBuffer = async (src: string): Promise<ArrayBuffer> => {
  const response = await fetch(src);
  return response.arrayBuffer();
};

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
} as const;

function labelValueParagraph(label: string, value: string, P: DocxPalette): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
    children: [
      new TextRun({ text: label + " ", font: "Calibri", size: 17, color: P.muted }),
      new TextRun({ text: value || "—", font: "Calibri", size: 17, color: P.text, bold: true }),
    ],
  });
}

function sectionHeading(title: string, P: DocxPalette): Paragraph {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: "Calibri",
        size: 17,
        bold: true,
        color: P.accent,
      }),
    ],
  });
}

function separator(P: DocxPalette): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: P.border },
    },
    children: [],
  });
}

function twoColumnRow(l1: string, v1: string, l2: string, v2: string, P: DocxPalette): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0 },
      bottom: { style: BorderStyle.NONE, size: 0 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 },
      insideHorizontal: { style: BorderStyle.NONE, size: 0 },
      insideVertical: { style: BorderStyle.NONE, size: 0 },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
            children: [labelValueParagraph(l1, v1, P)],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
            children: [labelValueParagraph(l2, v2, P)],
          }),
        ],
      }),
    ],
  });
}

function darkParagraph(children: TextRun[], P: DocxPalette, opts?: { spacing?: { before?: number; after?: number }; alignment?: typeof AlignmentType[keyof typeof AlignmentType] }): Paragraph {
  return new Paragraph({
    spacing: opts?.spacing || { after: 40 },
    alignment: opts?.alignment,
    shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
    children,
  });
}

export async function generateManifestDocx(
  data: ManifestData,
  logoSrc: string,
  variant: ManifestVariant = "dark"
): Promise<void> {
  const P = variant === "light" ? LIGHT_DOCX : DARK_DOCX;

  let logoBuffer: ArrayBuffer | null = null;
  try { logoBuffer = await loadImageAsArrayBuffer(logoSrc); } catch { /* skip */ }

  const docChildren: (Paragraph | Table)[] = [];

  if (logoBuffer) {
    docChildren.push(
      new Paragraph({
        shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
        children: [
          new ImageRun({ data: logoBuffer, transformation: { width: 64, height: 67 }, type: "png" }),
        ],
      })
    );
  }

  docChildren.push(
    darkParagraph([new TextRun({ text: "18519 Kerill Rd, Triangle, VA 22172", font: "Calibri", size: 15, color: P.muted })], P, { alignment: AlignmentType.RIGHT }),
    darkParagraph([new TextRun({ text: "(571) 435-1832", font: "Calibri", size: 15, color: P.muted })], P, { alignment: AlignmentType.RIGHT }),
    darkParagraph([new TextRun({ text: "Travel in Luxury, Arrive in Style", font: "Calibri", size: 15, color: P.accent, italics: true })], P, { alignment: AlignmentType.RIGHT, spacing: { after: 100 } }),
  );

  docChildren.push(new Paragraph({
    spacing: { after: 100 },
    shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: P.accent } },
    children: [],
  }));

  docChildren.push(
    sectionHeading("Reservation Details", P),
    twoColumnRow("Pick-up Date:", data.pickupDate, "Reservation#:", data.reservationNumber, P),
    twoColumnRow("Pick-up Time:", data.pickupTime, "Spot Time:", data.spotTime, P),
    separator(P),
  );

  docChildren.push(
    sectionHeading("Billing Information", P),
    labelValueParagraph("Bill To:", data.billTo, P),
    labelValueParagraph("Address:", data.address, P),
    labelValueParagraph("Phone:", data.phone, P),
    separator(P),
  );

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 }, right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: { style: BorderStyle.NONE, size: 0 }, insideVertical: { style: BorderStyle.NONE, size: 0 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noBorder,
              shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
              children: [
                sectionHeading("Passenger Information", P),
                labelValueParagraph("Passenger:", data.passenger, P),
                labelValueParagraph("Booked On:", data.bookedOn, P),
                labelValueParagraph("# of Pax:", String(data.pax), P),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noBorder,
              shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
              children: [
                sectionHeading("Vehicle", P),
                labelValueParagraph("Type:", data.vehicleType, P),
                labelValueParagraph("Affiliate:", data.affiliateName || "—", P),
              ],
            }),
          ],
        }),
      ],
    }),
    separator(P),
  );

  // Routing
  const bStyle = BorderStyle.SINGLE;
  const boxBorder = {
    top: { style: bStyle, size: 1, color: P.border },
    bottom: { style: bStyle, size: 1, color: P.border },
    left: { style: bStyle, size: 1, color: P.border },
    right: { style: bStyle, size: 1, color: P.border },
  };

  docChildren.push(sectionHeading("Routing Information", P));

  // Render all legs
  data.legs.forEach((leg, index) => {
    const legLabel = data.legs.length > 1 ? `LEG ${index + 1} ` : "";
    
    docChildren.push(
      new Paragraph({
        spacing: { after: 20 },
        shading: { type: ShadingType.SOLID, color: P.section, fill: P.section },
        border: boxBorder,
        children: [new TextRun({ text: `${legLabel}PICK-UP`, bold: true, font: "Calibri", size: 14, color: P.accent })],
      }),
      new Paragraph({
        shading: { type: ShadingType.SOLID, color: P.section, fill: P.section },
        border: { left: boxBorder.left, right: boxBorder.right },
        children: [new TextRun({ text: leg.pickup, bold: true, font: "Calibri", size: 17, color: P.text })],
      })
    );

    if (leg.tailNumber || leg.fboPhone) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 80 },
          shading: { type: ShadingType.SOLID, color: P.section, fill: P.section },
          border: { bottom: boxBorder.bottom, left: boxBorder.left, right: boxBorder.right },
          children: [new TextRun({ text: `Tail#: ${leg.tailNumber || 'N/A'}          FBO: ${leg.fboPhone || 'N/A'}`, font: "Calibri", size: 15, color: P.muted })],
        })
      );
    } else {
      docChildren.push(
        new Paragraph({
          spacing: { after: 80 },
          shading: { type: ShadingType.SOLID, color: P.section, fill: P.section },
          border: { bottom: boxBorder.bottom, left: boxBorder.left, right: boxBorder.right },
          children: [],
        })
      );
    }

    docChildren.push(
      new Paragraph({
        spacing: { after: 20 },
        shading: { type: ShadingType.SOLID, color: P.section, fill: P.section },
        border: { top: boxBorder.top, left: boxBorder.left, right: boxBorder.right },
        children: [new TextRun({ text: `${legLabel}DROP-OFF`, bold: true, font: "Calibri", size: 14, color: P.accent })],
      }),
      new Paragraph({
        spacing: { after: index < data.legs.length - 1 ? 120 : 80 },
        shading: { type: ShadingType.SOLID, color: P.section, fill: P.section },
        border: { bottom: boxBorder.bottom, left: boxBorder.left, right: boxBorder.right },
        children: [new TextRun({ text: leg.dropoff, bold: true, font: "Calibri", size: 17, color: P.text })],
      })
    );
  });

  docChildren.push(separator(P));

  docChildren.push(
    sectionHeading("Notes / Comments", P),
    labelValueParagraph("Driver Notes:", data.driverNotes, P),
    labelValueParagraph("Special Requests:", data.specialRequests || "—", P),
  );

  docChildren.push(
    new Paragraph({ spacing: { before: 200 }, shading: { type: ShadingType.SOLID, color: P.card, fill: P.card }, children: [] }),
    twoColumnRow("Signature: ___________________", "", "Date: ___________________", "", P),
  );

  docChildren.push(
    new Paragraph({
      spacing: { before: 200 },
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: P.card, fill: P.card },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: P.accent } },
      children: [new TextRun({ text: "Westminster Chariots — Travel in Luxury, Arrive in Style", font: "Calibri", size: 13, color: P.muted })],
    }),
    darkParagraph(
      [new TextRun({ text: "Confidential — For authorized use only", font: "Calibri", size: 13, color: P.muted })],
      P,
      { alignment: AlignmentType.CENTER }
    ),
  );

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 500, bottom: 500, left: 500, right: 500 } } },
      children: docChildren,
    }],
    background: { color: P.bg },
  });

  const suffix = variant === "light" ? "White" : "Black";
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `WC-Manifest-${suffix}.docx`);
}
