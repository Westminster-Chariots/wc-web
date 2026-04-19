"use client";
import { useState, useEffect } from "react";
import { FileText, Download, Eye, FileType, Edit2, Save, Send, Search, Loader2, Plus, X, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateManifestPDF, type ManifestData, type ManifestVariant, type ManifestLeg } from "@/lib/generateManifestPDF";
import { generateManifestDocx } from "@/lib/generateManifestDocx";
import { generateInvoicePDF, type InvoiceData, type InvoiceItem } from "@/lib/generateInvoicePDF";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useDrivers } from "@/hooks/useDrivers";
import { toast } from "sonner";
import { bookingService } from "@/lib/services";

export default function ManifestsPage() {
  const [variant, setVariant] = useState<ManifestVariant>("dark");
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manifest" | "invoice">("manifest");
  const [documentId, setDocumentId] = useState("");
  const { bookings, loading } = useAdminBookings();
  const { drivers } = useDrivers();
  
  const [manifestData, setManifestData] = useState<ManifestData>({
    reservationNumber: "",
    pickupDate: "",
    pickupTime: "",
    spotTime: "",
    billTo: "Westminster Chariots",
    address: "18519 Kerill Rd, Triangle, VA 22172",
    phone: "(571) 435-1832",
    passenger: "",
    bookedOn: "",
    pax: 1,
    vehicleType: "",
    affiliateName: "",
    legs: [],
    driverNotes: "",
    specialRequests: "",
  });

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    clientName: "",
    accountNumber: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    invoiceDate: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    paymentTerms: "NET30",
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const filteredBookings = bookings.filter(b => 
    b.reservationNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const loadBookingData = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const pickupDateTime = new Date(`${booking.pickupDate}T${booking.pickupTime}`);
    const spotTime = new Date(pickupDateTime.getTime() - 15 * 60000);
    const bookedOnDate = new Date(booking.createdAt);

    const groupBookings = booking.groupId 
      ? bookings.filter(b => b.groupId === booking.groupId).sort((a, b) => (a.legOrder || 0) - (b.legOrder || 0))
      : [booking];

    const legs = groupBookings.map(b => ({
      pickup: b.pickupLocation,
      dropoff: b.dropoffLocation,
      tailNumber: b.flightTail || undefined,
      fboPhone: undefined,
    }));

    setManifestData({
      reservationNumber: booking.reservationNumber,
      pickupDate: pickupDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }),
      pickupTime: pickupDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      spotTime: spotTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      billTo: booking.clientName,
      address: "18519 Kerill Rd, Triangle, VA 22172",
      phone: "(571) 435-1832",
      passenger: booking.clientName,
      bookedOn: bookedOnDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + bookedOnDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pax: booking.paxCount,
      vehicleType: `${booking.vehicleType.toUpperCase()}${booking.vehicleNumber ? ` (${booking.vehicleNumber})` : ''}`,
      affiliateName: "",
      legs,
      driverNotes: "",
      specialRequests: booking.specialRequests || "",
    });
    setSelectedBookingId(bookingId);
  };

  const updateField = (field: keyof ManifestData, value: string | number) => {
    setManifestData(prev => ({ ...prev, [field]: value }));
  };

  const updateLeg = (index: number, field: keyof ManifestLeg, value: string) => {
    setManifestData(prev => ({
      ...prev,
      legs: prev.legs.map((leg, i) => i === index ? { ...leg, [field]: value } : leg)
    }));
  };

  const addLeg = () => {
    setManifestData(prev => ({
      ...prev,
      legs: [...prev.legs, { pickup: "", dropoff: "", tailNumber: "", fboPhone: "" }]
    }));
  };

  const removeLeg = (index: number) => {
    if (manifestData.legs.length <= 1) {
      toast.error("Must have at least one leg");
      return;
    }
    setManifestData(prev => ({
      ...prev,
      legs: prev.legs.filter((_, i) => i !== index)
    }));
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = await generateManifestPDF(manifestData, "/assets/wc-logo-no-motto.png", variant);
      const suffix = variant === "light" ? "White" : "Black";
      doc.save(`WC-Manifest-${manifestData.reservationNumber || 'Draft'}-${suffix}.pdf`);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadDocx = async () => {
    try {
      await generateManifestDocx(manifestData, "/assets/wc-logo-no-motto.png", variant);
      toast.success("Word document downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate Word document");
    }
  };

  const handlePreview = async () => {
    try {
      const doc = await generateManifestPDF(manifestData, "/assets/wc-logo-no-motto.png", variant);
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Failed to preview PDF");
    }
  };

  const handleSendToDriver = async () => {
    if (!selectedBookingId) {
      toast.error("Please select a booking first");
      return;
    }

    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking?.driverId) {
      toast.error("No driver assigned to this booking");
      return;
    }

    const driver = drivers.find(d => d.id === booking.driverId);
    if (!driver?.email) {
      toast.error("Driver has no email address");
      return;
    }

    setSending(true);
    try {
      await bookingService.sendManifest(selectedBookingId);
      toast.success(`Manifest sent to ${driver.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to send manifest");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">Manifests</h2>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Create and send trip manifests to drivers
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                value="dark"
                checked={variant === "dark"}
                onChange={(e) => setVariant(e.target.value as ManifestVariant)}
                className="h-4 w-4 text-primary"
              />
              <span className="text-xs">Black</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                value="light"
                checked={variant === "light"}
                onChange={(e) => setVariant(e.target.value as ManifestVariant)}
                className="h-4 w-4 text-primary"
              />
              <span className="text-xs">White</span>
            </label>
          </div>
          <Button variant="outline" onClick={handleDownloadDocx} className="gap-2" size="sm">
            <FileType className="h-4 w-4" />
            Word
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2" size="sm">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Booking Selector */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold font-display">Load from Booking</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="gap-1.5"
          >
            {editing ? <Save className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
            {editing ? "View Mode" : "Edit Mode"}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings by reservation # or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {search && (
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-md p-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No bookings found</p>
            ) : (
              filteredBookings.slice(0, 10).map(booking => (
                <button
                  key={booking.id}
                  onClick={() => {
                    loadBookingData(booking.id);
                    setSearch("");
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-primary">#{booking.reservationNumber}</span>
                    <span className="text-muted-foreground">{booking.clientName}</span>
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    {booking.pickupDate} · {booking.pickupLocation}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
        {selectedBookingId && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Loaded: <span className="font-mono text-primary font-semibold">#{manifestData.reservationNumber}</span>
            </p>
            <Button
              onClick={handleSendToDriver}
              disabled={sending}
              size="sm"
              className="gap-1.5"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send to Driver
            </Button>
          </div>
        )}
      </div>

      {/* Manifest Preview/Editor */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-semibold">Manifest {editing ? "Editor" : "Preview"}</h3>
                <p className="text-xs text-muted-foreground font-body">
                  {editing ? "Edit fields below and download or send" : "View-only mode"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePreview}>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadDocx}>
                <FileType className="h-3.5 w-3.5" />
                Word
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadPDF}>
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="bg-background border border-border rounded-lg p-8 max-w-3xl mx-auto space-y-6 font-body text-sm">
            <div className="flex items-center justify-between pb-4 border-b border-primary/30">
              <img src="/assets/wc-logo-no-motto.png" alt="Westminster Chariots" className="h-12 object-contain" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">18519 Kerill Rd, Triangle, VA 22172</p>
                <p className="text-xs text-muted-foreground">(571) 435-1832</p>
                <p className="text-xs text-primary italic">Travel in Luxury, Arrive in Style</p>
              </div>
            </div>

            {/* Reservation Details */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">Reservation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Pick-up Date:</span>
                  {editing ? (
                    <Input value={manifestData.pickupDate} onChange={(e) => updateField('pickupDate', e.target.value)} className="h-7 text-xs max-w-[180px]" />
                  ) : (
                    <span className="text-foreground font-medium text-xs">{manifestData.pickupDate || "—"}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Reservation#:</span>
                  {editing ? (
                    <Input value={manifestData.reservationNumber} onChange={(e) => updateField('reservationNumber', e.target.value)} className="h-7 text-xs max-w-[120px] font-mono" />
                  ) : (
                    <span className="text-foreground font-medium text-xs font-mono">{manifestData.reservationNumber || "—"}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Pick-up Time:</span>
                  {editing ? (
                    <Input value={manifestData.pickupTime} onChange={(e) => updateField('pickupTime', e.target.value)} className="h-7 text-xs max-w-[100px]" />
                  ) : (
                    <span className="text-foreground font-medium text-xs">{manifestData.pickupTime || "—"}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Spot Time:</span>
                  {editing ? (
                    <Input value={manifestData.spotTime} onChange={(e) => updateField('spotTime', e.target.value)} className="h-7 text-xs max-w-[100px]" />
                  ) : (
                    <span className="text-foreground font-medium text-xs">{manifestData.spotTime || "—"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Billing Information */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">Billing Information</h3>
              <div className="space-y-2">
                <div className="flex gap-4 items-center">
                  <span className="text-muted-foreground w-20 shrink-0 text-xs">Bill To:</span>
                  {editing ? (
                    <Input value={manifestData.billTo} onChange={(e) => updateField('billTo', e.target.value)} className="h-7 text-xs flex-1" />
                  ) : (
                    <span className="text-foreground font-medium text-xs">{manifestData.billTo || "—"}</span>
                  )}
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-muted-foreground w-20 shrink-0 text-xs">Address:</span>
                  {editing ? (
                    <Input value={manifestData.address} onChange={(e) => updateField('address', e.target.value)} className="h-7 text-xs flex-1" />
                  ) : (
                    <span className="text-foreground text-xs">{manifestData.address || "—"}</span>
                  )}
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-muted-foreground w-20 shrink-0 text-xs">Phone:</span>
                  {editing ? (
                    <Input value={manifestData.phone} onChange={(e) => updateField('phone', e.target.value)} className="h-7 text-xs max-w-[180px]" />
                  ) : (
                    <span className="text-foreground text-xs">{manifestData.phone || "—"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Passenger & Vehicle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">Passenger Information</h3>
                <div className="space-y-2">
                  <div className="flex gap-4 items-center">
                    <span className="text-muted-foreground w-24 shrink-0 text-xs">Passenger:</span>
                    {editing ? (
                      <Input value={manifestData.passenger} onChange={(e) => updateField('passenger', e.target.value)} className="h-7 text-xs flex-1" />
                    ) : (
                      <span className="text-foreground font-medium text-xs">{manifestData.passenger || "—"}</span>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-muted-foreground w-24 shrink-0 text-xs">Booked On:</span>
                    {editing ? (
                      <Input value={manifestData.bookedOn} onChange={(e) => updateField('bookedOn', e.target.value)} className="h-7 text-xs flex-1" />
                    ) : (
                      <span className="text-foreground text-xs">{manifestData.bookedOn || "—"}</span>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-muted-foreground w-24 shrink-0 text-xs"># of Pax:</span>
                    {editing ? (
                      <Input type="number" value={manifestData.pax} onChange={(e) => updateField('pax', parseInt(e.target.value) || 1)} className="h-7 text-xs max-w-[80px]" />
                    ) : (
                      <span className="text-foreground text-xs">{manifestData.pax}</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">Vehicle</h3>
                <div className="space-y-2">
                  <div className="flex gap-4 items-center">
                    <span className="text-muted-foreground w-20 shrink-0 text-xs">Type:</span>
                    {editing ? (
                      <Input value={manifestData.vehicleType} onChange={(e) => updateField('vehicleType', e.target.value)} className="h-7 text-xs flex-1" />
                    ) : (
                      <span className="text-foreground font-medium text-xs">{manifestData.vehicleType || "—"}</span>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-muted-foreground w-20 shrink-0 text-xs">Affiliate:</span>
                    {editing ? (
                      <Input value={manifestData.affiliateName} onChange={(e) => updateField('affiliateName', e.target.value)} className="h-7 text-xs flex-1" placeholder="Optional" />
                    ) : (
                      <span className="text-muted-foreground italic text-xs">{manifestData.affiliateName || "—"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Routing Information */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-wider text-primary font-semibold">Routing Information</h3>
                {editing && (
                  <Button onClick={addLeg} size="sm" variant="outline" className="h-6 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add Leg
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {manifestData.legs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No legs added yet</p>
                ) : (
                  manifestData.legs.map((leg, index) => (
                    <div key={index} className="space-y-3">
                      {manifestData.legs.length > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Leg {index + 1}</span>
                          {editing && (
                            <button onClick={() => removeLeg(index)} className="text-destructive hover:text-destructive/80 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="rounded-md border border-border bg-secondary/30 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-primary mb-2 font-semibold">Pick-Up</p>
                        {editing ? (
                          <Textarea value={leg.pickup} onChange={(e) => updateLeg(index, 'pickup', e.target.value)} className="text-xs mb-2" rows={2} />
                        ) : (
                          <p className="text-foreground font-medium text-xs mb-2">{leg.pickup || "—"}</p>
                        )}
                        <div className="flex gap-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Tail#:</span>
                            {editing ? (
                              <Input value={leg.tailNumber || ""} onChange={(e) => updateLeg(index, 'tailNumber', e.target.value)} className="h-6 text-xs max-w-[100px]" placeholder="N/A" />
                            ) : (
                              <span>{leg.tailNumber || "N/A"}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>FBO:</span>
                            {editing ? (
                              <Input value={leg.fboPhone || ""} onChange={(e) => updateLeg(index, 'fboPhone', e.target.value)} className="h-6 text-xs max-w-[120px]" placeholder="N/A" />
                            ) : (
                              <span>{leg.fboPhone || "N/A"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-md border border-border bg-secondary/30 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-primary mb-2 font-semibold">Drop-Off</p>
                        {editing ? (
                          <Textarea value={leg.dropoff} onChange={(e) => updateLeg(index, 'dropoff', e.target.value)} className="text-xs" rows={2} />
                        ) : (
                          <p className="text-foreground font-medium text-xs">{leg.dropoff || "—"}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Notes */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">Notes / Comments</h3>
              <div className="space-y-2">
                <div className="flex gap-4 items-start">
                  <span className="text-muted-foreground w-28 shrink-0 text-xs pt-1">Driver Notes:</span>
                  {editing ? (
                    <Textarea value={manifestData.driverNotes} onChange={(e) => updateField('driverNotes', e.target.value)} className="text-xs flex-1" rows={2} />
                  ) : (
                    <span className="text-foreground text-xs">{manifestData.driverNotes || "—"}</span>
                  )}
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-muted-foreground w-28 shrink-0 text-xs pt-1">Special Requests:</span>
                  {editing ? (
                    <Textarea value={manifestData.specialRequests} onChange={(e) => updateField('specialRequests', e.target.value)} className="text-xs flex-1" rows={2} />
                  ) : (
                    <span className="text-muted-foreground italic text-xs">{manifestData.specialRequests || "—"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-6">Signature:</p>
                <div className="border-b border-border" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-6">Date:</p>
                <div className="border-b border-border" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
