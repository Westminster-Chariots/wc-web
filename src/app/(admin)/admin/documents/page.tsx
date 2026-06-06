"use client";
import { useState, useEffect } from "react";
import { FileText, Search, Loader2, Download, Eye, Filter, Calendar, RefreshCw, X, Edit, User, Car, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { documentService, bookingService, type Document } from "@/lib/services";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useDrivers } from "@/hooks/useDrivers";

export default function DocumentHistoryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { bookings } = useAdminBookings();
  const { drivers } = useDrivers();

  useEffect(() => {
    loadDocuments();
  }, [typeFilter, dateFrom, dateTo]);

  const loadDocuments = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const filters: any = {};
      if (typeFilter !== "all") {
        filters.type = typeFilter;
      }
      const data = await documentService.getAll(filters);
      setDocuments(data);
      toast.success(`Loaded ${data.length} document${data.length !== 1 ? 's' : ''}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to load documents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get booking info for each document
  const documentsWithBookings = documents.map(doc => {
    const booking = doc.bookingId ? bookings.find(b => b.id === doc.bookingId) : null;
    const driver = booking?.driverId ? drivers.find(d => d.id === booking.driverId) : null;
    return { ...doc, booking, driver };
  });

  const filteredDocuments = documentsWithBookings.filter(doc => {
    // Search filter
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      const matchesSearch = 
        doc.documentNumber.toLowerCase().includes(searchTerm) ||
        doc.clientEmail.toLowerCase().includes(searchTerm) ||
        doc.clientName.toLowerCase().includes(searchTerm) ||
        doc.booking?.reservationNumber.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Client filter
    if (clientFilter.trim()) {
      if (!doc.clientName.toLowerCase().includes(clientFilter.toLowerCase())) return false;
    }

    // Driver filter
    if (driverFilter && driverFilter !== "all") {
      if (!doc.booking?.driverId || doc.booking.driverId !== driverFilter) return false;
    }

    // Vehicle type filter
    if (vehicleTypeFilter && vehicleTypeFilter !== "all") {
      if (!doc.booking?.vehicleType || doc.booking.vehicleType !== vehicleTypeFilter) return false;
    }

    // Booking ID filter
    if (bookingIdFilter.trim()) {
      if (!doc.booking?.reservationNumber.toLowerCase().includes(bookingIdFilter.toLowerCase())) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setClientFilter("");
    setDriverFilter("");
    setVehicleTypeFilter("");
    setBookingIdFilter("");
  };

  const hasActiveFilters = search || typeFilter !== "all" || dateFrom || dateTo || clientFilter || driverFilter || vehicleTypeFilter || bookingIdFilter;

  // Get unique vehicle types from bookings
  const vehicleTypes = Array.from(new Set(bookings.map(b => b.vehicleType).filter(Boolean)));

  const handlePreview = async (doc: Document) => {
    try {
      const { documentData } = doc;
      
      if (doc.documentType === "driver_manifest") {
        const { generateManifestPDF } = await import("@/lib/generateManifestPDF");
        const pdfDoc = await generateManifestPDF(documentData.manifestData, "/assets/wc-logo-no-motto.png", "light");
        const blob = pdfDoc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else if (doc.documentType === "client_invoice") {
        const { generateInvoicePDF } = await import("@/lib/generateInvoicePDF");
        const pdfDoc = await generateInvoicePDF(documentData.invoiceData, "/assets/wc-logo-full.png", "light");
        const blob = pdfDoc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else if (doc.documentType === "trip_confirmation") {
        const { generateConfirmationPDF } = await import("@/lib/generateConfirmationPDF");
        const confirmationData = {
          confirmationNumber: documentData.invoiceData.invoiceNumber,
          clientName: documentData.invoiceData.clientName,
          clientAddress: documentData.invoiceData.clientAddress,
          clientPhone: documentData.invoiceData.clientPhone,
          clientEmail: documentData.invoiceData.clientEmail,
          driverName: documentData.driverInfo?.driverName,
          vehicleType: documentData.driverInfo?.vehicleType,
          vehicleTag: documentData.driverInfo?.vehicleTag,
          items: documentData.invoiceData.items,
        };
        const pdfDoc = await generateConfirmationPDF(confirmationData, "/assets/wc-logo-full.png", "light");
        const blob = pdfDoc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (error) {
      toast.error("Failed to preview document");
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { documentData } = doc;
      
      if (doc.documentType === "driver_manifest") {
        const { generateManifestPDF } = await import("@/lib/generateManifestPDF");
        const pdfDoc = await generateManifestPDF(documentData.manifestData, "/assets/wc-logo-no-motto.png", "light");
        pdfDoc.save(`${doc.documentNumber}-Manifest.pdf`);
      } else if (doc.documentType === "client_invoice") {
        const { generateInvoicePDF } = await import("@/lib/generateInvoicePDF");
        const pdfDoc = await generateInvoicePDF(documentData.invoiceData, "/assets/wc-logo-full.png", "light");
        pdfDoc.save(`${doc.documentNumber}-Invoice.pdf`);
      } else if (doc.documentType === "trip_confirmation") {
        const { generateConfirmationPDF } = await import("@/lib/generateConfirmationPDF");
        const confirmationData = {
          confirmationNumber: documentData.invoiceData.invoiceNumber,
          clientName: documentData.invoiceData.clientName,
          clientAddress: documentData.invoiceData.clientAddress,
          clientPhone: documentData.invoiceData.clientPhone,
          clientEmail: documentData.invoiceData.clientEmail,
          driverName: documentData.driverInfo?.driverName,
          vehicleType: documentData.driverInfo?.vehicleType,
          vehicleTag: documentData.driverInfo?.vehicleTag,
          items: documentData.invoiceData.items,
        };
        const pdfDoc = await generateConfirmationPDF(confirmationData, "/assets/wc-logo-full.png", "light");
        pdfDoc.save(`${doc.documentNumber}-Confirmation.pdf`);
      }
      toast.success("Document downloaded");
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "driver_manifest": return "Driver Manifest";
      case "client_invoice": return "Client Invoice";
      case "trip_confirmation": return "Trip Confirmation";
      default: return type;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case "driver_manifest": return "bg-blue-100 text-blue-800";
      case "client_invoice": return "bg-green-100 text-green-800";
      case "trip_confirmation": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">Document History</h1>
          </div>
          <Button
            onClick={loadDocuments}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">View and manage all saved documents</p>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document #, booking #, client name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 whitespace-nowrap"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">{[search, typeFilter !== "all", dateFrom, dateTo, clientFilter, driverFilter, vehicleTypeFilter, bookingIdFilter].filter(Boolean).length}</span>}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <Label className="text-xs mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Document Type
              </Label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Types</option>
                <option value="driver_manifest">Driver Manifests</option>
                <option value="client_invoice">Client Invoices</option>
                <option value="trip_confirmation">Trip Confirmations</option>
              </select>
            </div>

            <div>
              <Label className="text-xs mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date From
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date To
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Client Name
              </Label>
              <Input
                placeholder="Filter by client..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Driver
              </Label>
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Drivers</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs mb-2 flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5" />
                Vehicle Type
              </Label>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Vehicles</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs mb-2 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Reservation #
              </Label>
              <Input
                placeholder="Filter by booking #..."
                value={bookingIdFilter}
                onChange={(e) => setBookingIdFilter(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document #</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Driver</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm font-semibold text-foreground">{doc.documentNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeBadge(doc.documentType)}`}>
                        {getDocumentTypeLabel(doc.documentType)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {doc.booking ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-semibold text-primary block">#{doc.booking.reservationNumber}</span>
                          <span className="text-xs text-muted-foreground">{doc.booking.pickupDate}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No booking</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="text-sm text-foreground block">{doc.clientName}</span>
                        <span className="text-xs text-muted-foreground">{doc.clientEmail}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {doc.driver ? (
                        <span className="text-sm text-foreground">{doc.driver.name}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {doc.booking ? (
                        <span className="text-sm text-foreground uppercase">{doc.booking.vehicleType}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(doc)} className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} className="gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                        {doc.booking && (
                          <Button variant="ghost" size="sm" onClick={() => window.location.href = `/admin/manifests?booking=${doc.bookingId}`} className="gap-1.5">
                            <Edit className="h-3.5 w-3.5" />
                            Update
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
