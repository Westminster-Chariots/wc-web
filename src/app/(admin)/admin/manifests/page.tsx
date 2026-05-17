"use client";
import { useState, useEffect, useRef } from "react";
import { FileText, Download, Eye, FileType, Edit2, Save, Send, Search, Loader2, Plus, X, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ManifestData, ManifestVariant, ManifestLeg } from "@/lib/generateManifestPDF";
import type { InvoiceData, InvoiceItem, InvoiceVariant } from "@/lib/generateInvoicePDF";
import type { ConfirmationData, TripItem, ConfirmationVariant } from "@/lib/generateConfirmationPDF";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useDrivers } from "@/hooks/useDrivers";
import { toast } from "sonner";
import { bookingService, invoiceService, pricingService } from "@/lib/services";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export default function ManifestsPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });
  
  const [variant, setVariant] = useState<ManifestVariant>("dark");
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manifest" | "invoice" | "confirmation">("manifest");
  // documentId is now deprecated - use invoiceData.invoiceNumber instead
  const [documentId, setDocumentId] = useState("");
  const [pricingConfigs, setPricingConfigs] = useState<any[]>([]);
  const { bookings, loading } = useAdminBookings();
  const { drivers } = useDrivers();
  
  const pickupRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dropoffRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Generate proper invoice number based on client code and sequential invoice count
  const generateInvoiceNumber = (clientCode?: string, clientId?: string) => {
    if (!clientCode && !clientId) {
      // Fallback to random number if no client info
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `WC${randomNum}`;
    }
    
    // Use client code if available, otherwise use client ID
    const clientIdentifier = clientCode || clientId || 'CLIENT';
    
    // Generate sequential invoice number
    // In production, this would query the database for the last invoice number for this client
    const invoiceCount = Math.floor(Math.random() * 999) + 1; // Simulated invoice count (1-999)
    
    // Format: WC-CLIENTCODE-INVOICENUMBER-YEAR
    const year = new Date().getFullYear();
    const invoiceNum = invoiceCount.toString().padStart(3, '0');
    
    // Westminster Chariots invoice format: WC-CLIENTCODE-INVOICENUMBER-YEAR
    // Example: WC-VBH-367-001-2024 (for private client VBH-367)
    // Example: WC-WVBH-2010-001-2024 (for corporate client WVBH-2010)
    
    if (clientIdentifier === 'CLIENT') {
      return `WC-${invoiceNum}-${year}`;
    }
    
    return `WC-${clientIdentifier}-${invoiceNum}-${year}`;
  };
  
  const [manifestData, setManifestData] = useState<ManifestData>({
    reservationNumber: "",
    pickupDate: "",
    pickupTime: "",
    spotTime: "",
    billTo: "Westminster Chariots",
    address: " ",
    phone: "(571) 426-6338",
    passenger: "",
    bookedOn: "",
    pax: 1,
    vehicleType: "",
    affiliateName: "",
    legs: [],
    driverNotes: "",
    specialRequests: "",
  });

  const [driverInfo, setDriverInfo] = useState({
    driverName: "",
    vehicleType: "",
    vehicleTag: ""
  });

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
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

  // Initialize documentId for backward compatibility
  useEffect(() => {
    if (!documentId) {
      setDocumentId(generateInvoiceNumber());
    }
  }, [documentId]);

  // Load pricing configs from database
  useEffect(() => {
    const loadPricingConfigs = async () => {
      try {
        const configs = await pricingService.getConfig();
        setPricingConfigs(configs);
      } catch (error) {
        console.error('Failed to load pricing configs:', error);
      }
    };
    loadPricingConfigs();
  }, []);

  // Enhanced search across multiple fields
  const filteredBookings = bookings.filter(b => {
    if (!search.trim()) return true;
    
    const searchTerm = search.toLowerCase().trim();
    
    // Search across multiple fields
    return (
      b.reservationNumber.toLowerCase().includes(searchTerm) ||
      b.clientName.toLowerCase().includes(searchTerm) ||
      b.clientEmail?.toLowerCase().includes(searchTerm) ||
      b.pickupLocation.toLowerCase().includes(searchTerm) ||
      b.dropoffLocation.toLowerCase().includes(searchTerm) ||
      b.vehicleType.toLowerCase().includes(searchTerm) ||
      b.status.toLowerCase().includes(searchTerm) ||
      b.driverName?.toLowerCase().includes(searchTerm) ||
      b.vehicleNumber?.toLowerCase().includes(searchTerm) ||
      b.flightTail?.toLowerCase().includes(searchTerm) ||
      b.specialRequests?.toLowerCase().includes(searchTerm) ||
      b.notes?.toLowerCase().includes(searchTerm)
    );
  });

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
      address: "",
      phone: "(571) 426-6338",
      passenger: booking.clientName,
      bookedOn: bookedOnDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + bookedOnDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pax: booking.paxCount,
      vehicleType: `${booking.vehicleType.toUpperCase()}${booking.vehicleNumber ? ` (${booking.vehicleNumber})` : ''}`,
      affiliateName: "",
      legs,
      driverNotes: "",
      specialRequests: booking.specialRequests || "",
    });

    // Generate invoice data from booking
    const invoiceItems: InvoiceItem[] = groupBookings.map(b => ({
      pickupDate: b.pickupDate,
      pickupTime: b.pickupTime,
      passengerName: b.clientName,
      pickup: b.pickupLocation,
      dropoff: b.dropoffLocation,
      price: parseFloat(b.price.toString()),
    }));

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.price, 0);
    const tax = 0;
    const total = subtotal + tax;

    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Generate proper invoice number for this client using client code
    const invoiceNumber = generateInvoiceNumber(booking.clientCode, booking.clientId);

    // Use client code for display, fallback to client ID
    const accountNumber = booking.clientCode || booking.clientId || "N/A";

    setInvoiceData({
      invoiceNumber: invoiceNumber,
      clientName: booking.clientName,
      accountNumber: accountNumber,
      clientAddress: booking.clientAddress || "",
      clientPhone: booking.clientPhone || "",
      clientEmail: booking.clientEmail || "",
      invoiceDate: invoiceDate.toLocaleDateString(),
      dueDate: dueDate.toLocaleDateString(),
      paymentTerms: "NET30",
      items: invoiceItems,
      subtotal,
      tax,
      total,
    });

    setDriverInfo({
      driverName: booking.driverName || "",
      vehicleType: booking.vehicleType || "",
      vehicleTag: booking.vehicleNumber || ""
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

  const updateInvoiceField = (field: keyof InvoiceData, value: string | number) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  // Auto-calculate price when pickup/dropoff changes
  const calculatePrice = async (pickup: string, dropoff: string, vehicleType: string = 'sedan') => {
    if (!pickup || !dropoff) return 0;
    
    try {
      // Use Google Distance Matrix API to calculate distance and duration
      if (!window.google) return 0;
      
      const service = new google.maps.DistanceMatrixService();
      const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [pickup],
            destinations: [dropoff],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
          },
          (response, status) => {
            if (status === 'OK' && response) {
              resolve(response);
            } else {
              reject(status);
            }
          }
        );
      });

      const element = result.rows[0]?.elements[0];
      if (element?.status === 'OK') {
        const distanceMiles = element.distance.value / 1609.34; // Convert meters to miles
        const durationMinutes = element.duration.value / 60; // Convert seconds to minutes
        
        // Get pricing config from database
        const vehicleTypeNormalized = vehicleType.toLowerCase();
        const config = pricingConfigs.find(c => c.vehicleType.toLowerCase() === vehicleTypeNormalized);
        
        if (!config) {
          // Fallback to default pricing if config not found
          console.warn('Pricing config not found, using defaults');
          let price = 0;
          if (vehicleTypeNormalized.includes('suv')) {
            price = 37 + (4.50 * distanceMiles) + (1.55 * durationMinutes);
          } else {
            price = 30 + (4.00 * distanceMiles) + (1.25 * durationMinutes);
          }
          return Math.round(price * 100) / 100;
        }
        
        // Use database pricing formula:
        // Price = baseRate + (ratePerMile × miles) + (ratePerMinute × minutes)
        const baseRate = parseFloat(config.baseRate);
        const ratePerMile = parseFloat(config.ratePerMile);
        const ratePerMinute = parseFloat(config.ratePerMinute);
        
        const price = baseRate + (ratePerMile * distanceMiles) + (ratePerMinute * durationMinutes);
        
        return Math.round(price * 100) / 100; // Round to 2 decimals
      }
    } catch (error) {
      console.error('Price calculation error:', error);
    }
    
    return 0;
  };

  const updateInvoiceItemWithPriceCalc = async (index: number, field: keyof InvoiceItem, value: string | number) => {
    updateInvoiceItem(index, field, value);
    
    // Auto-calculate price when pickup or dropoff changes
    if (field === 'pickup' || field === 'dropoff') {
      const item = invoiceData.items[index];
      const pickup = field === 'pickup' ? value as string : item.pickup;
      const dropoff = field === 'dropoff' ? value as string : item.dropoff;
      
      if (pickup && dropoff) {
        const calculatedPrice = await calculatePrice(pickup, dropoff);
        if (calculatedPrice > 0) {
          updateInvoiceItem(index, 'price', calculatedPrice);
          toast.success(`Price auto-calculated: $${calculatedPrice.toFixed(2)}`);
        }
      }
    }
  };

  const addInvoiceItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { pickupDate: "", pickupTime: "", passengerName: "", pickup: "", dropoff: "", price: 0 }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceData.items.length <= 1) {
      toast.error("Must have at least one item");
      return;
    }
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const recalculateInvoiceTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.price, 0);
    const tax = invoiceData.tax;
    const total = subtotal + tax;
    setInvoiceData(prev => ({ ...prev, subtotal, total }));
  };

  useEffect(() => {
    recalculateInvoiceTotals();
  }, [invoiceData.items, invoiceData.tax]);

  useEffect(() => {
    if (!isLoaded || !editing) return;

    const setupAutocomplete = (input: HTMLInputElement | null, index: number, type: 'pickup' | 'dropoff') => {
      if (!input || !window.google) return;
      
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        fields: ["formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          updateInvoiceItem(index, type, place.formatted_address);
          // Clear the autocomplete dropdown
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            (pacContainer as HTMLElement).style.display = 'none';
          }
        }
      });

      // Hide autocomplete on blur
      input.addEventListener('blur', () => {
        setTimeout(() => {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            (pacContainer as HTMLElement).style.display = 'none';
          }
        }, 200);
      });

      // Show autocomplete on focus
      input.addEventListener('focus', () => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer) {
          (pacContainer as HTMLElement).style.display = 'block';
        }
      });
    };

    pickupRefs.current.forEach((ref, index) => setupAutocomplete(ref, index, 'pickup'));
    dropoffRefs.current.forEach((ref, index) => setupAutocomplete(ref, index, 'dropoff'));
  }, [isLoaded, editing, invoiceData.items.length]);

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
      if (activeTab === "manifest") {
        // Lazy load PDF generation
        const { generateManifestPDF } = await import("@/lib/generateManifestPDF");
        const doc = await generateManifestPDF(manifestData, "/assets/wc-logo-no-motto.png", variant);
        const suffix = variant === "light" ? "White" : "Black";
        doc.save(`${manifestData.reservationNumber || documentId}-Manifest-${suffix}.pdf`);
        toast.success("Manifest PDF downloaded");
      } else if (activeTab === "invoice") {
        // Lazy load invoice PDF generation
        const { generateInvoicePDF } = await import("@/lib/generateInvoicePDF");
        const doc = await generateInvoicePDF(invoiceData, "/assets/wc-logo-full.png", variant as InvoiceVariant);
        const suffix = variant === "light" ? "White" : "Black";
        doc.save(`${invoiceData.invoiceNumber}-Invoice-${suffix}.pdf`);
        toast.success("Invoice PDF downloaded");
      } else if (activeTab === "confirmation") {
        // Lazy load confirmation PDF generation
        const { generateConfirmationPDF } = await import("@/lib/generateConfirmationPDF");
        const confirmationData: ConfirmationData = {
          confirmationNumber: invoiceData.invoiceNumber,
          clientName: invoiceData.clientName,
          clientAddress: invoiceData.clientAddress,
          clientPhone: invoiceData.clientPhone,
          clientEmail: invoiceData.clientEmail,
          driverName: driverInfo.driverName || undefined,
          vehicleType: driverInfo.vehicleType || undefined,
          vehicleTag: driverInfo.vehicleTag || undefined,
          items: invoiceData.items as TripItem[],
        };
        const doc = await generateConfirmationPDF(confirmationData, "/assets/wc-logo-full.png", variant as ConfirmationVariant);
        const suffix = variant === "light" ? "White" : "Black";
        doc.save(`${invoiceData.invoiceNumber}-Confirmation-${suffix}.pdf`);
        toast.success("Trip Confirmation PDF downloaded");
      }
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadDocx = async () => {
    try {
      if (activeTab === "manifest") {
        // Lazy load DOCX generation
        const { generateManifestDocx } = await import("@/lib/generateManifestDocx");
        await generateManifestDocx(manifestData, "/assets/wc-logo-no-motto.png", variant);
        toast.success("Word document downloaded");
      } else if (activeTab === "invoice") {
        toast.error("Word format not available for invoices. Please use PDF.");
      } else if (activeTab === "confirmation") {
        toast.error("Word format not available for trip confirmations. Please use PDF.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate Word document");
    }
  };

  const handlePreview = async () => {
    try {
      if (activeTab === "manifest") {
        // Lazy load PDF generation
        const { generateManifestPDF } = await import("@/lib/generateManifestPDF");
        const doc = await generateManifestPDF(manifestData, "/assets/wc-logo-no-motto.png", variant);
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else if (activeTab === "invoice") {
        // Lazy load invoice PDF generation
        const { generateInvoicePDF } = await import("@/lib/generateInvoicePDF");
        const doc = await generateInvoicePDF(invoiceData, "/assets/wc-logo-full.png", variant as InvoiceVariant);
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else if (activeTab === "confirmation") {
        // Lazy load confirmation PDF generation
        const { generateConfirmationPDF } = await import("@/lib/generateConfirmationPDF");
        const confirmationData: ConfirmationData = {
          confirmationNumber: invoiceData.invoiceNumber,
          clientName: invoiceData.clientName,
          clientAddress: invoiceData.clientAddress,
          clientPhone: invoiceData.clientPhone,
          clientEmail: invoiceData.clientEmail,
          driverName: driverInfo.driverName || undefined,
          vehicleType: driverInfo.vehicleType || undefined,
          vehicleTag: driverInfo.vehicleTag || undefined,
          items: invoiceData.items as TripItem[],
        };
        const doc = await generateConfirmationPDF(confirmationData, "/assets/wc-logo-full.png", variant as ConfirmationVariant);
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
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

  const handleSaveInvoice = async () => {
    if (!selectedBookingId) {
      toast.error("Please select a booking first");
      return;
    }

    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    setSending(true);
    try {
      // Create invoice data from current invoiceData
      const invoicePayload = {
        bookingId: selectedBookingId,
        clientId: booking.clientId,
        invoiceNumber: invoiceData.invoiceNumber,
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        clientPhone: invoiceData.clientPhone,
        clientAddress: invoiceData.clientAddress,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        paymentTerms: invoiceData.paymentTerms,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        status: "draft" as const,
        notes: "Generated from manifests page"
      };

      await invoiceService.create(invoicePayload);
      toast.success("Invoice saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save invoice");
    } finally {
      setSending(false);
    }
  };

  const handleSendInvoiceToClient = async () => {
    if (!selectedBookingId) {
      toast.error("Please select a booking first");
      return;
    }

    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    if (!invoiceData.clientEmail) {
      toast.error("Client email is required to send invoice");
      return;
    }

    setSending(true);
    try {
      // First save the invoice
      const invoicePayload = {
        bookingId: selectedBookingId,
        clientId: booking.clientId,
        invoiceNumber: invoiceData.invoiceNumber,
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        clientPhone: invoiceData.clientPhone,
        clientAddress: invoiceData.clientAddress,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        paymentTerms: invoiceData.paymentTerms,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        status: "sent" as const,
        notes: "Sent from manifests page"
      };

      const savedInvoice = await invoiceService.create(invoicePayload);
      
      // Then send the invoice via email
      await invoiceService.sendInvoice(savedInvoice.id);
      
      toast.success(`Invoice sent to ${invoiceData.clientEmail}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to send invoice");
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
            placeholder="Search bookings by reservation #, client name, email, location, vehicle, etc..."
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
        <div className="p-4 pb-0">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mb-4 border-b border-border">
            <button
              onClick={() => setActiveTab("manifest")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "manifest"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              Driver Manifest
            </button>
            <button
              onClick={() => setActiveTab("invoice")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "invoice"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="h-4 w-4" />
              Client Invoice
            </button>
            <button
              onClick={() => setActiveTab("confirmation")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "confirmation"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="h-4 w-4" />
              Trip Confirmation
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {activeTab === "manifest" ? <FileText className="h-5 w-5 text-primary" /> : <Receipt className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-semibold">
                  {activeTab === "manifest" ? "Manifest" : activeTab === "invoice" ? "Invoice" : "Trip Confirmation"} {editing ? "Editor" : "Preview"}
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  {editing ? "Edit fields below and download or send" : "View-only mode"} · {activeTab === "confirmation" ? "Confirmation" : "Invoice"}: {invoiceData.invoiceNumber}
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
              {(activeTab === "invoice" || activeTab === "confirmation") && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5" 
                    onClick={handleSaveInvoice}
                    disabled={sending}
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save Invoice
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-1.5" 
                    onClick={handleSendInvoiceToClient}
                    disabled={sending || !invoiceData.clientEmail}
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Send to Client
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          {activeTab === "manifest" ? (
          <div className="bg-background border border-border rounded-lg p-8 max-w-3xl mx-auto space-y-6 font-body text-sm">
            <div className="flex items-center justify-between pb-4 border-b border-primary/30">
              <img src="/assets/wc-logo-no-motto.png" alt="Westminster Chariots" className="h-12 object-contain" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground"></p>
                <p className="text-xs text-muted-foreground">(571) 426-6338</p>
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
          ) : activeTab === "invoice" ? (
            <div className={`border border-border rounded-lg shadow-sm max-w-4xl mx-auto ${
              variant === "dark" ? "bg-[#1a1a1a]" : "bg-white"
            }`}>
              {/* Invoice Header - Professional Layout */}
              <div className="p-8 pb-6">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <img src="/assets/wc-logo-full.png" alt="Westminster Chariots" className="h-20 object-contain mb-3" />
                    <div className={`text-xs space-y-0.5 ${
                      variant === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <p className="text-primary font-medium">www.westminsterchariots.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className={`text-4xl font-bold mb-2 ${
                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>INVOICE</h1>
                    <div className={`text-xs space-y-1 ${
                      variant === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {editing ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-mono text-sm">#</span>
                          <Input 
                            value={invoiceData.invoiceNumber} 
                            onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)} 
                            className={`h-7 text-sm font-mono w-[180px] ${
                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                            }`} 
                          />
                        </div>
                      ) : (
                        <p className="font-mono text-sm">#{invoiceData.invoiceNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50 mb-6"></div>

                {/* Bill To & Invoice Details */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Bill To</h3>
                    <div className="space-y-2">
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Client Name</label>
                        {editing ? (
                          <Input value={invoiceData.clientName} onChange={(e) => updateInvoiceField('clientName', e.target.value)} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm font-semibold ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>{invoiceData.clientName || "—"}</p>
                        )}
                      </div>
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Account Number</label>
                        {editing ? (
                          <Input value={invoiceData.accountNumber} onChange={(e) => updateInvoiceField('accountNumber', e.target.value)} className={`h-8 text-sm font-mono ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm font-mono ${
                            variant === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>{invoiceData.accountNumber || "—"}</p>
                        )}
                      </div>
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Address</label>
                        {editing ? (
                          <Input value={invoiceData.clientAddress} onChange={(e) => updateInvoiceField('clientAddress', e.target.value)} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm ${
                            variant === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>{invoiceData.clientAddress || "—"}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`text-xs block mb-1 ${
                            variant === "dark" ? "text-gray-500" : "text-gray-500"
                          }`}>Phone</label>
                          {editing ? (
                            <Input value={invoiceData.clientPhone} onChange={(e) => updateInvoiceField('clientPhone', e.target.value)} className={`h-8 text-sm ${
                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                            }`} />
                          ) : (
                            <p className={`text-sm ${
                              variant === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>{invoiceData.clientPhone || "—"}</p>
                          )}
                        </div>
                        <div>
                          <label className={`text-xs block mb-1 ${
                            variant === "dark" ? "text-gray-500" : "text-gray-500"
                          }`}>Email</label>
                          {editing ? (
                            <Input value={invoiceData.clientEmail} onChange={(e) => updateInvoiceField('clientEmail', e.target.value)} className={`h-8 text-sm ${
                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                            }`} />
                          ) : (
                            <p className={`text-sm ${
                              variant === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>{invoiceData.clientEmail || "—"}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Invoice Details</h3>
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center py-2 border-b ${
                        variant === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <span className={`text-xs font-semibold ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Invoice Number:</span>
                        {editing ? (
                          <Input 
                            value={invoiceData.invoiceNumber} 
                            onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)} 
                            className={`h-7 text-xs max-w-[180px] font-mono ${
                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                            }`} 
                          />
                        ) : (
                          <span className={`text-sm font-mono font-bold ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>{invoiceData.invoiceNumber}</span>
                        )}
                      </div>
                      <div className={`flex justify-between items-center py-2 border-b ${
                        variant === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <span className={`text-xs font-semibold ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Invoice Date:</span>
                        {editing ? (
                          <Input 
                            type="date" 
                            value={invoiceData.invoiceDate} 
                            onChange={(e) => updateInvoiceField('invoiceDate', e.target.value)} 
                            className={`h-7 text-xs max-w-[140px] ${
                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                            }`} 
                          />
                        ) : (
                          <span className={`text-sm ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>{invoiceData.invoiceDate}</span>
                        )}
                      </div>
                      <div className={`flex justify-between items-center py-2 border-b ${
                        variant === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <span className={`text-xs font-semibold ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Due Date:</span>
                        {editing ? (
                          <Input 
                            type="date" 
                            value={invoiceData.dueDate} 
                            onChange={(e) => updateInvoiceField('dueDate', e.target.value)} 
                            className={`h-7 text-xs max-w-[140px] ${
                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                            }`} 
                          />
                        ) : (
                          <span className={`text-sm ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>{invoiceData.dueDate}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className={`text-xs font-semibold ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Payment Terms:</span>
                        {editing ? (
                          <Input value={invoiceData.paymentTerms} onChange={(e) => updateInvoiceField('paymentTerms', e.target.value)} className={`h-7 text-xs max-w-[100px] ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <span className="text-sm font-semibold text-primary">{invoiceData.paymentTerms}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Items Table */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold ${
                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>Invoice Items</h3>
                    {editing && (
                      <Button onClick={addInvoiceItem} size="sm" variant="outline" className="h-7 gap-1 text-xs">
                        <Plus className="h-3 w-3" /> Add Item
                      </Button>
                    )}
                  </div>
                  <div className={`overflow-hidden border rounded-lg ${
                    variant === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>
                    <table className="w-full">
                      <thead>
                        <tr className={variant === "dark" ? "bg-[#0a0a0a] text-primary" : "bg-gray-900 text-white"}>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Time & Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Passenger</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Routing Information</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        variant === "dark" ? "bg-[#1a1a1a] divide-gray-800" : "bg-white divide-gray-200"
                      }`}>
                        {invoiceData.items.length === 0 ? (
                          <tr>
                            <td colSpan={4} className={`py-8 text-center text-sm ${
                              variant === "dark" ? "text-gray-500" : "text-gray-500"
                            }`}>No items added yet</td>
                          </tr>
                        ) : (
                          invoiceData.items.map((item, index) => (
                            <tr key={index} className={variant === "dark" ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50"}>
                              <td className="py-8 px-4">
                                {editing ? (
                                  <div className="space-y-1">
                                    <Input 
                                      type="date" 
                                      value={item.pickupDate} 
                                      onChange={(e) => updateInvoiceItem(index, 'pickupDate', e.target.value)} 
                                      className={`h-7 text-xs ${
                                        variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                      }`} 
                                    />
                                    <Input 
                                      type="time" 
                                      value={item.pickupTime} 
                                      onChange={(e) => updateInvoiceItem(index, 'pickupTime', e.target.value)} 
                                      className={`h-7 text-xs ${
                                        variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                      }`} 
                                    />
                                  </div>
                                ) : (
                                  <div className="text-sm">
                                    <div className={`font-medium ${
                                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                                    }`}>{item.pickupDate}</div>
                                    <div className={variant === "dark" ? "text-gray-400" : "text-gray-600"}>{item.pickupTime}</div>
                                  </div>
                                )}
                              </td>
                              <td className="py-8 px-4">
                                {editing ? (
                                  <Input value={item.passengerName} onChange={(e) => updateInvoiceItem(index, 'passengerName', e.target.value)} className={`h-7 text-xs ${
                                    variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                  }`} />
                                ) : (
                                  <span className={`text-sm ${
                                    variant === "dark" ? "text-gray-100" : "text-gray-900"
                                  }`}>{item.passengerName}</span>
                                )}
                              </td>
                              <td className="py-8 px-4">
                                {editing ? (
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <button onClick={() => removeInvoiceItem(index)} className="text-destructive hover:text-destructive/80 transition-colors shrink-0 mt-1">
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                      <div className="flex-1 space-y-3">
                                        <div>
                                          <span className={`text-[10px] font-semibold uppercase block mb-1 ${
                                            variant === "dark" ? "text-gray-400" : "text-gray-600"
                                          }`}>Pickup:</span>
                                          <Input 
                                            ref={(el) => { pickupRefs.current[index] = el; }}
                                            value={item.pickup} 
                                            onChange={(e) => updateInvoiceItemWithPriceCalc(index, 'pickup', e.target.value)} 
                                            className={`h-7 text-xs ${
                                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                            }`}
                                            placeholder="Enter pickup location"
                                          />
                                        </div>
                                        <div>
                                          <span className={`text-[10px] font-semibold uppercase block mb-1 ${
                                            variant === "dark" ? "text-gray-400" : "text-gray-600"
                                          }`}>Dropoff:</span>
                                          <Input 
                                            ref={(el) => { dropoffRefs.current[index] = el; }}
                                            value={item.dropoff} 
                                            onChange={(e) => updateInvoiceItemWithPriceCalc(index, 'dropoff', e.target.value)} 
                                            className={`h-7 text-xs ${
                                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                            }`}
                                            placeholder="Enter dropoff location"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm space-y-2">
                                    <div>
                                      <span className={`text-[10px] font-semibold uppercase block mb-0.5 ${
                                        variant === "dark" ? "text-gray-400" : "text-gray-600"
                                      }`}>Pickup:</span>
                                      <span className={`leading-relaxed block text-xs ${
                                        variant === "dark" ? "text-gray-300" : "text-gray-700"
                                      }`}>{item.pickup}</span>
                                    </div>
                                    <div className={`text-primary text-sm`}>↓</div>
                                    <div>
                                      <span className={`text-[10px] font-semibold uppercase block mb-0.5 ${
                                        variant === "dark" ? "text-gray-400" : "text-gray-600"
                                      }`}>Dropoff:</span>
                                      <span className={`leading-relaxed block text-xs ${
                                        variant === "dark" ? "text-gray-300" : "text-gray-700"
                                      }`}>{item.dropoff}</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="py-8 px-4 text-right">
                                {editing ? (
                                  <Input type="number" step="0.01" value={item.price} onChange={(e) => updateInvoiceItem(index, 'price', parseFloat(e.target.value) || 0)} className={`h-7 text-xs text-right ${
                                    variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                  }`} />
                                ) : (
                                  <span className={`text-sm font-semibold ${
                                    variant === "dark" ? "text-gray-100" : "text-gray-900"
                                  }`}>${item.price.toFixed(2)}</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                  <div className="w-80">
                    <div className="space-y-3">
                      <div className={`flex justify-between items-center py-2 border-b ${
                        variant === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <span className={`text-sm ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Subtotal:</span>
                        <span className={`text-base font-semibold ${
                          variant === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}>${invoiceData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className={`flex justify-between items-center py-2 border-b ${
                        variant === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <span className={`text-sm ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Tax (if applicable):</span>
                        {editing ? (
                          <Input type="number" step="0.01" value={invoiceData.tax} onChange={(e) => updateInvoiceField('tax', parseFloat(e.target.value) || 0)} className={`h-8 text-sm text-right max-w-[120px] ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <span className={`text-base font-semibold ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>${invoiceData.tax.toFixed(2)}</span>
                        )}
                      </div>
                      <div className={`flex justify-between items-center py-3 px-4 rounded-lg border-2 mt-4 ${
                        variant === "dark" ? "bg-primary/10 border-primary/30" : "bg-primary/5 border-primary/20"
                      }`}>
                        <span className={`text-base font-bold ${
                          variant === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}>Total Amount Due:</span>
                        <span className="text-2xl font-bold text-primary">${invoiceData.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50 mb-6"></div>

                {/* Footer Message */}
                <div className={`text-sm leading-relaxed space-y-3 ${
                  variant === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  <p>
                    Thank you for choosing Westminster Chariots. We truly value your trust and the opportunity to serve you. 
                    It is our privilege to provide refined, seamless transportation delivered with punctuality, discretion, and professionalism. 
                    We look forward to serving you again.
                  </p>
                  <div className="pt-2">
                    <p className={`font-semibold ${
                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>Sincerely,</p>
                    <p className={variant === "dark" ? "text-gray-100" : "text-gray-900"}>The Westminster Chariots Team</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Trip Confirmation Template
            <div className={`border border-border rounded-lg shadow-sm max-w-4xl mx-auto ${
              variant === "dark" ? "bg-[#1a1a1a]" : "bg-white"
            }`}>
              <div className="p-8 pb-6">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <img src="/assets/wc-logo-full.png" alt="Westminster Chariots" className="h-20 object-contain mb-3" />
                    <div className={`text-xs space-y-0.5 ${
                      variant === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <p className="text-primary font-medium">www.westminsterchariots.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className={`text-4xl font-bold mb-2 ${
                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>TRIP CONFIRMATION</h1>
                    <div className={`text-xs space-y-1 ${
                      variant === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {editing ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-mono text-sm">#</span>
                          <Input 
                            value={invoiceData.invoiceNumber} 
                            onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)} 
                            className={`h-7 text-sm font-mono w-[180px] ${
                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                            }`} 
                          />
                        </div>
                      ) : (
                        <p className="font-mono text-sm">#{invoiceData.invoiceNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50 mb-6"></div>

                {/* Client & Driver Information - Side by Side */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Client Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Client Name</label>
                        {editing ? (
                          <Input value={invoiceData.clientName} onChange={(e) => updateInvoiceField('clientName', e.target.value)} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm font-semibold ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>{invoiceData.clientName || "—"}</p>
                        )}
                      </div>
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Address</label>
                        {editing ? (
                          <Input value={invoiceData.clientAddress} onChange={(e) => updateInvoiceField('clientAddress', e.target.value)} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm ${
                            variant === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>{invoiceData.clientAddress || "—"}</p>
                        )}
                      </div>
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Phone</label>
                        {editing ? (
                          <Input value={invoiceData.clientPhone} onChange={(e) => updateInvoiceField('clientPhone', e.target.value)} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm ${
                            variant === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>{invoiceData.clientPhone || "—"}</p>
                        )}
                      </div>
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Email</label>
                        {editing ? (
                          <Input value={invoiceData.clientEmail} onChange={(e) => updateInvoiceField('clientEmail', e.target.value)} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm ${
                            variant === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>{invoiceData.clientEmail || "—"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Driver Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Driver Name</label>
                        {editing ? (
                          <Input value={driverInfo.driverName} onChange={(e) => setDriverInfo(prev => ({ ...prev, driverName: e.target.value }))} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm font-semibold ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>{driverInfo.driverName || "—"}</p>
                        )}
                      </div>
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Vehicle</label>
                        {editing ? (
                          <Input value={driverInfo.vehicleType} onChange={(e) => setDriverInfo(prev => ({ ...prev, vehicleType: e.target.value }))} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm ${
                            variant === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>{driverInfo.vehicleType || "—"}</p>
                        )}
                      </div>
                      <div>
                        <label className={`text-xs block mb-1 ${
                          variant === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}>Vehicle Tag</label>
                        {editing ? (
                          <Input value={driverInfo.vehicleTag} onChange={(e) => setDriverInfo(prev => ({ ...prev, vehicleTag: e.target.value }))} className={`h-8 text-sm ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <p className={`text-sm ${
                            variant === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>{driverInfo.vehicleTag || "—"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Items Table */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold ${
                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>Trip Details</h3>
                    {editing && (
                      <Button onClick={addInvoiceItem} size="sm" variant="outline" className="h-7 gap-1 text-xs">
                        <Plus className="h-3 w-3" /> Add Item
                      </Button>
                    )}
                  </div>
                  <div className={`overflow-hidden border rounded-lg ${
                    variant === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>
                    <table className="w-full">
                      <thead>
                        <tr className={variant === "dark" ? "bg-[#0a0a0a] text-primary" : "bg-gray-900 text-white"}>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Time & Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Passenger</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Routing Information</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        variant === "dark" ? "bg-[#1a1a1a] divide-gray-800" : "bg-white divide-gray-200"
                      }`}>
                        {invoiceData.items.length === 0 ? (
                          <tr>
                            <td colSpan={4} className={`py-8 text-center text-sm ${
                              variant === "dark" ? "text-gray-500" : "text-gray-500"
                            }`}>No items added yet</td>
                          </tr>
                        ) : (
                          invoiceData.items.map((item, index) => (
                            <tr key={index} className={variant === "dark" ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50"}>
                              <td className="py-8 px-4">
                                {editing ? (
                                  <div className="space-y-1">
                                    <Input 
                                      type="date" 
                                      value={item.pickupDate} 
                                      onChange={(e) => updateInvoiceItem(index, 'pickupDate', e.target.value)} 
                                      className={`h-7 text-xs ${
                                        variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                      }`} 
                                    />
                                    <Input 
                                      type="time" 
                                      value={item.pickupTime} 
                                      onChange={(e) => updateInvoiceItem(index, 'pickupTime', e.target.value)} 
                                      className={`h-7 text-xs ${
                                        variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                      }`} 
                                    />
                                  </div>
                                ) : (
                                  <div className="text-sm">
                                    <div className={`font-medium ${
                                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                                    }`}>{item.pickupDate}</div>
                                    <div className={variant === "dark" ? "text-gray-400" : "text-gray-600"}>{item.pickupTime}</div>
                                  </div>
                                )}
                              </td>
                              <td className="py-8 px-4">
                                {editing ? (
                                  <Input value={item.passengerName} onChange={(e) => updateInvoiceItem(index, 'passengerName', e.target.value)} className={`h-7 text-xs ${
                                    variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                  }`} />
                                ) : (
                                  <span className={`text-sm ${
                                    variant === "dark" ? "text-gray-100" : "text-gray-900"
                                  }`}>{item.passengerName}</span>
                                )}
                              </td>
                              <td className="py-8 px-4">
                                {editing ? (
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <button onClick={() => removeInvoiceItem(index)} className="text-destructive hover:text-destructive/80 transition-colors shrink-0 mt-1">
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                      <div className="flex-1 space-y-3">
                                        <div>
                                          <span className={`text-[10px] font-semibold uppercase block mb-1 ${
                                            variant === "dark" ? "text-gray-400" : "text-gray-600"
                                          }`}>Pickup:</span>
                                          <Input 
                                            ref={(el) => { pickupRefs.current[index] = el; }}
                                            value={item.pickup} 
                                            onChange={(e) => updateInvoiceItemWithPriceCalc(index, 'pickup', e.target.value)} 
                                            className={`h-7 text-xs ${
                                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                            }`}
                                            placeholder="Enter pickup location"
                                          />
                                        </div>
                                        <div>
                                          <span className={`text-[10px] font-semibold uppercase block mb-1 ${
                                            variant === "dark" ? "text-gray-400" : "text-gray-600"
                                          }`}>Dropoff:</span>
                                          <Input 
                                            ref={(el) => { dropoffRefs.current[index] = el; }}
                                            value={item.dropoff} 
                                            onChange={(e) => updateInvoiceItemWithPriceCalc(index, 'dropoff', e.target.value)} 
                                            className={`h-7 text-xs ${
                                              variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                            }`}
                                            placeholder="Enter dropoff location"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm space-y-2">
                                    <div>
                                      <span className={`text-[10px] font-semibold uppercase block mb-0.5 ${
                                        variant === "dark" ? "text-gray-400" : "text-gray-600"
                                      }`}>Pickup:</span>
                                      <span className={`leading-relaxed block text-xs ${
                                        variant === "dark" ? "text-gray-300" : "text-gray-700"
                                      }`}>{item.pickup}</span>
                                    </div>
                                    <div className={`text-primary text-sm`}>↓</div>
                                    <div>
                                      <span className={`text-[10px] font-semibold uppercase block mb-0.5 ${
                                        variant === "dark" ? "text-gray-400" : "text-gray-600"
                                      }`}>Dropoff:</span>
                                      <span className={`leading-relaxed block text-xs ${
                                        variant === "dark" ? "text-gray-300" : "text-gray-700"
                                      }`}>{item.dropoff}</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="py-8 px-4 text-right">
                                {editing ? (
                                  <Input type="number" step="0.01" value={item.price} onChange={(e) => updateInvoiceItem(index, 'price', parseFloat(e.target.value) || 0)} className={`h-7 text-xs text-right ${
                                    variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                                  }`} />
                                ) : (
                                  <span className={`text-sm font-semibold ${
                                    variant === "dark" ? "text-gray-100" : "text-gray-900"
                                  }`}>${item.price.toFixed(2)}</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                  <div className="w-80">
                    <div className="space-y-3">
                      <div className={`flex justify-between items-center py-2 border-b ${
                        variant === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <span className={`text-sm ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Subtotal:</span>
                        <span className={`text-base font-semibold ${
                          variant === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}>${invoiceData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className={`flex justify-between items-center py-2 border-b ${
                        variant === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <span className={`text-sm ${
                          variant === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>Tax (if applicable):</span>
                        {editing ? (
                          <Input type="number" step="0.01" value={invoiceData.tax} onChange={(e) => updateInvoiceField('tax', parseFloat(e.target.value) || 0)} className={`h-8 text-sm text-right max-w-[120px] ${
                            variant === "dark" ? "bg-[#2a2a2a] border-gray-700 text-gray-100" : "border-gray-300"
                          }`} />
                        ) : (
                          <span className={`text-base font-semibold ${
                            variant === "dark" ? "text-gray-100" : "text-gray-900"
                          }`}>${invoiceData.tax.toFixed(2)}</span>
                        )}
                      </div>
                      <div className={`flex justify-between items-center py-3 px-4 rounded-lg border-2 mt-4 ${
                        variant === "dark" ? "bg-primary/10 border-primary/30" : "bg-primary/5 border-primary/20"
                      }`}>
                        <span className={`text-base font-bold ${
                          variant === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}>Total Amount Paid:</span>
                        <span className="text-2xl font-bold text-primary">${invoiceData.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50 mb-6"></div>

                {/* Footer Message */}
                <div className={`text-sm leading-relaxed space-y-3 ${
                  variant === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  <p>
                    Thank you for choosing Westminster Chariots. We truly value your trust and the opportunity to serve you. 
                    It is our privilege to provide refined, seamless transportation delivered with professionalism. 
                    We look forward to serving you again.
                  </p>
                  <div className="pt-2">
                    <p className={`font-semibold ${
                      variant === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>Sincerely,</p>
                    <p className={variant === "dark" ? "text-gray-100" : "text-gray-900"}>The Westminster Chariots Team</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
