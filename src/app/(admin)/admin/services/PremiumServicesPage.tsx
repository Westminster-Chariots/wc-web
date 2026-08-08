"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Search, MoreVertical, Pencil, Trash2, Loader2, Upload, ImageIcon, Users, Briefcase,
  Filter, CheckCircle, XCircle, AlertCircle, DollarSign, ArrowUpDown, X,
} from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { usePricingConfigurations } from "@/hooks/usePricingConfigurations";
import { pricingConfigurationService } from "@/lib/services";
import type { Service, VehicleType, PricingConfiguration } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { notify } from "@/lib/notify";
import PageTransition from "@/components/ui/PageTransition";
import InfoTooltip from "@/components/ui/InfoTooltip";

const vehicleTypeOptions: { value: VehicleType; label: string; color: string }[] = [
  { value: "sedan", label: "Sedan", color: "bg-primary/20 text-primary" },
  { value: "suv", label: "SUV", color: "bg-blue-500/20 text-blue-600" },
];

const emptyForm = {
  name: "",
  slug: "",
  vehicleType: "sedan" as VehicleType,
  pricingConfigurationId: "",
  description: "",
  passengerCapacity: "3",
  luggageCapacity: "2",
  features: "",
  isActive: true,
  displayOrder: "0",
};

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function errorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return err.response?.data?.error || err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

export default function PremiumServicesPage() {
  const { services, loading, error, addService, updateService, deleteService } = useServices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compatible, active pricing configurations for the FORM's currently
  // selected vehicle type - real, backend-driven data, never hardcoded
  // options (see DROPDOWN BEHAVIOR requirement). Refetches automatically
  // whenever form.vehicleType changes.
  const { configurations: compatibleConfigurations, loading: configLoading, error: configError } = usePricingConfigurations(form.vehicleType);

  // Separate, unfiltered (including inactive) lookup used only to render a
  // configuration NAME on each service card below - a card must still show
  // the correct name even for the rare case where a service's assigned
  // configuration was deactivated after assignment (defensive; normal
  // operation blocks that at deactivation time - see routes/pricing.ts's
  // PATCH /configurations/:id).
  const [allConfigurationNames, setAllConfigurationNames] = useState<Record<string, PricingConfiguration>>({});
  useEffect(() => {
    pricingConfigurationService
      .getAllAdmin()
      .then((all) => setAllConfigurationNames(Object.fromEntries(all.map((c) => [c.id, c]))))
      .catch((err) => console.error("[PremiumServicesPage] Failed to load pricing configuration names:", err));
  }, []);

  // Required "clear an incompatible selection when vehicle class changes"
  // behavior: once the compatible list for the CURRENT form.vehicleType has
  // loaded, if the currently-selected pricingConfigurationId isn't in it
  // (a stale selection from before the vehicle type changed, or - rarely -
  // one that was deactivated out from under an edit in progress), clear it
  // and require the admin to choose a compatible one before saving.
  useEffect(() => {
    if (configLoading || !form.pricingConfigurationId) return;
    const stillCompatible = compatibleConfigurations.some((c) => c.id === form.pricingConfigurationId);
    if (!stillCompatible) {
      setForm((f) => ({ ...f, pricingConfigurationId: "" }));
    }
    // Only re-run when the compatible list itself changes (i.e. after a
    // vehicleType-triggered refetch resolves) - not on every form edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compatibleConfigurations, configLoading]);

  const filtered = services.filter((s) => {
    const matchesSearch = `${s.name} ${s.slug}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? s.isActive : !s.isActive);
    const matchesClass = classFilter === "all" || s.vehicleType === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    inactive: services.filter((s) => !s.isActive).length,
    sedans: services.filter((s) => s.vehicleType === "sedan").length,
    suvs: services.filter((s) => s.vehicleType === "suv").length,
  };

  const openAdd = () => {
    setEditingService(null);
    setForm(emptyForm);
    setImagePreview(null);
    setSlugTouched(false);
    setDialogOpen(true);
  };

  // Looks the service up by id in the CURRENT `services` state (the single
  // source of truth, refetched after every mutation - see useServices.ts)
  // rather than trusting whatever object reference the caller happens to
  // hold. Guarantees the dialog always initializes from the live persisted
  // isActive value, even if it's opened immediately after a toggle from the
  // three-dot menu.
  const openEdit = (id: string) => {
    const s = services.find((svc) => svc.id === id);
    if (!s) return;
    setEditingService(s);
    setForm({
      name: s.name,
      slug: s.slug,
      vehicleType: s.vehicleType,
      pricingConfigurationId: s.pricingConfigurationId,
      description: s.description || "",
      passengerCapacity: s.passengerCapacity.toString(),
      luggageCapacity: s.luggageCapacity.toString(),
      features: s.features.join("\n"),
      isActive: s.isActive,
      displayOrder: s.displayOrder.toString(),
    });
    setImagePreview(s.imageUrl);
    setSlugTouched(true);
    setDialogOpen(true);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify.error("Image must be under 5MB");
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "service_image");

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/uploads`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Upload failed");
      }
      const { url } = await response.json();
      setImagePreview(url);
      notify.success("Image uploaded");
    } catch (error) {
      console.error("Image upload failed:", error);
      notify.error(errorMessage(error, "Failed to upload image"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      notify.error("Name and slug are required");
      return;
    }
    if (!form.pricingConfigurationId) {
      notify.error("Select a pricing configuration before saving");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Service> = {
        name: form.name.trim(),
        slug: slugify(form.slug),
        vehicleType: form.vehicleType,
        pricingConfigurationId: form.pricingConfigurationId,
        description: form.description.trim() || null,
        imageUrl: imagePreview,
        passengerCapacity: parseInt(form.passengerCapacity) || 1,
        luggageCapacity: parseInt(form.luggageCapacity) || 0,
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
        isActive: form.isActive,
        displayOrder: parseInt(form.displayOrder) || 0,
      };

      if (editingService) {
        await updateService(editingService.id, payload);
        notify.success("Service updated");
      } else {
        await addService(payload);
        notify.success("Service added");
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      notify.error(errorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const result = await deleteService(deleteTarget.id);
      notify.success(result.service ? "Service deactivated (existing bookings reference it)" : "Service removed");
    } catch (err) {
      notify.error(errorMessage(err, "Failed to delete"));
    } finally {
      setDeleteTarget(null);
    }
  };

  // Direct, always-reversible Active/Inactive toggle - a PATCH only, never
  // routed through the DELETE endpoint (which soft-deletes ONLY when a
  // booking references the service and hard-deletes otherwise). Deactivating
  // a service with no historical bookings yet must never destroy the row.
  const handleToggleActive = async (service: Service) => {
    try {
      await updateService(service.id, { isActive: !service.isActive });
      notify.success(service.isActive ? "Service deactivated" : "Service activated");
    } catch (err) {
      notify.error(errorMessage(err, "Failed to update status"));
    }
  };

  const update = (key: string, value: string | boolean) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !slugTouched) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
      isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
    }`}>
      {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      <span>{isActive ? "Active" : "Inactive"}</span>
    </div>
  );

  const ClassBadge = ({ vehicleType }: { vehicleType: string }) => {
    const opt = vehicleTypeOptions.find((c) => c.value === vehicleType);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${opt?.color || "bg-secondary text-secondary-foreground"}`}>
        {opt?.label || vehicleType}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="rounded-2xl p-6 border border-border bg-card shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-md" />
                  <Tag className="relative h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-1.5">
                  Services
                  <InfoTooltip text="Customer-facing booking class. Customers book services, not physical vehicles." />
                </h1>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Customer-facing booking classes shown on the public booking page - independent of Fleet vehicle inventory. Pricing is owned entirely by the Pricing module; a service only references a saved pricing configuration.
              </p>
            </div>
            <Button
              size="sm"
              onClick={openAdd}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Total</p>
                <p className="text-lg font-display font-bold text-foreground">{stats.total}</p>
              </div>
              <Tag className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Active</p>
                <p className="text-lg font-display font-bold text-emerald-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Inactive</p>
                <p className="text-lg font-display font-bold text-amber-600">{stats.inactive}</p>
              </div>
              <XCircle className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Sedan classes</p>
                <p className="text-lg font-display font-bold text-primary">{stats.sedans}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">SUV classes</p>
                <p className="text-lg font-display font-bold text-blue-600">{stats.suvs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl p-5 border border-border bg-card shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="all">All Classes</option>
                  {vehicleTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="rounded-2xl p-8 border border-border bg-card flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-body">Loading services...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl p-8 border border-border bg-card text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-sm text-destructive font-body">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-8 border border-border bg-card text-center">
            <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h4 className="text-lg font-display font-semibold text-foreground mb-2">
              {services.length === 0 ? "No services yet" : "No results found"}
            </h4>
            <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
              {services.length === 0
                ? "Add your first customer-facing booking class - it will appear on the public booking page once active."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {services.length === 0 && (
              <Button onClick={openAdd} className="mt-4 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="h-4 w-4" />
                Add First Service
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative group"
                >
                  <div className="relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    <div className="h-40 bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center overflow-hidden relative">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                          <p className="text-xs text-muted-foreground/50 mt-2">No image</p>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <StatusBadge isActive={service.isActive} />
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h3 className="text-base font-display font-semibold text-foreground">{service.name}</h3>
                          <div className="flex items-center gap-2">
                            <ClassBadge vehicleType={service.vehicleType} />
                            <span className="text-[10px] text-muted-foreground font-mono">{service.slug}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(service.id)} className="gap-2 py-2.5">
                              <Pencil className="h-4 w-4" />
                              <span className="font-body">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(service)}
                              className={`gap-2 py-2.5 ${service.isActive ? "text-amber-600" : "text-emerald-600"}`}
                            >
                              {service.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              <span className="font-body">{service.isActive ? "Deactivate" : "Reactivate"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(service)} className="gap-2 py-2.5 text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="font-body">Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {service.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Passengers</p>
                            <p className="text-sm font-semibold text-foreground">{service.passengerCapacity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Luggage</p>
                            <p className="text-sm font-semibold text-foreground">{service.luggageCapacity}</p>
                          </div>
                        </div>
                      </div>

                      {/* Only the assigned configuration's NAME is shown -
                          never its formula values. Editing/viewing those
                          numbers belongs exclusively to the Pricing module. */}
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold uppercase tracking-wide mb-1">
                          <DollarSign className="h-3 w-3" />
                          Pricing Configuration
                        </div>
                        <p className="text-sm text-foreground font-medium">
                          {allConfigurationNames[service.pricingConfigurationId]?.name ?? (
                            <span className="text-muted-foreground italic">Loading…</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
                        <ArrowUpDown className="h-3 w-3" />
                        Sort order: {service.displayOrder}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto glass-strong border border-white/[0.12] shadow-glass-elevated">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground text-xl">
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingService ? "Update this booking class's details and assigned pricing configuration." : "Create a new customer-facing booking class."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2 pb-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Service Image</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 rounded-xl border-2 border-dashed border-border bg-secondary/20 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors duration-300 overflow-hidden group"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Upload className="h-8 w-8 text-white" />
                        <p className="text-sm text-white ml-2">Change Image</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        aria-label="Remove image"
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload service image</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Name *</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Business Sedan" className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                    Slug *
                    <InfoTooltip text="URL-friendly identifier used internally to reference this service. Auto-generated from the name, but can be edited." />
                  </Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => { setSlugTouched(true); update("slug", e.target.value); }}
                    placeholder="business-sedan"
                    className="bg-secondary/50 border-border font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Vehicle Class *</Label>
                  <select
                    className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.vehicleType}
                    onChange={(e) => update("vehicleType", e.target.value)}
                  >
                    {vehicleTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">Used for dispatch matching against Fleet - never links to one specific vehicle.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                    Sort Order
                    <InfoTooltip text="Controls the display order of this service on the public booking page. Lower numbers appear first." />
                  </Label>
                  <Input type="number" value={form.displayOrder} onChange={(e) => update("displayOrder", e.target.value)} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                    Passenger Capacity
                    <InfoTooltip text="Maximum number of passengers this service class can accommodate." />
                  </Label>
                  <Input type="number" min="1" max="20" value={form.passengerCapacity} onChange={(e) => update("passengerCapacity", e.target.value)} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                    Luggage Capacity
                    <InfoTooltip text="Maximum number of luggage pieces this service class can accommodate." />
                  </Label>
                  <Input type="number" min="0" max="20" value={form.luggageCapacity} onChange={(e) => update("luggageCapacity", e.target.value)} className="bg-secondary/50 border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Customer-facing description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Premium sedan for up to 3 passengers."
                  rows={2}
                  className="bg-secondary/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Features (one per line)</Label>
                <Textarea
                  value={form.features}
                  onChange={(e) => update("features", e.target.value)}
                  placeholder={"Professional chauffeur\nBottled water & amenities"}
                  rows={3}
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Pricing Configuration - the ONLY pricing-related control on
                  this page. No rate/formula/fee/condition fields here at
                  all: those belong exclusively to the Pricing module. This
                  dropdown is entirely data-driven (usePricingConfigurations
                  fetches real, active, vehicleType-matching rows - never a
                  hardcoded Sedan/SUV pair) and re-filters automatically
                  whenever Vehicle Class above changes. */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <DollarSign className="h-4 w-4" />
                  Pricing Configuration *
                  <InfoTooltip text="Determines which pricing profile this service uses. Multiple services can share the same pricing configuration." />
                </div>
                <p className="text-[11px] text-muted-foreground -mt-1">
                  Assigns this service to a saved pricing configuration from the Pricing module - the formula, rates, and conditions all live there, never here.
                </p>

                {configLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading pricing configurations…
                  </div>
                ) : configError ? (
                  <div className="flex items-center gap-2 text-sm text-destructive py-2">
                    <AlertCircle className="h-4 w-4" />
                    {configError}
                  </div>
                ) : compatibleConfigurations.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2">
                    No active {form.vehicleType === "suv" ? "SUV" : "Sedan"} pricing configurations exist yet - create one in the Pricing module first.
                  </div>
                ) : (
                  <select
                    className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.pricingConfigurationId}
                    onChange={(e) => update("pricingConfigurationId", e.target.value)}
                  >
                    <option value="">Select a pricing configuration…</option>
                    {compatibleConfigurations.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-1">
                      Active
                      <InfoTooltip text="Inactive services are hidden from new customer bookings but remain attached to historical bookings." />
                    </Label>
                    <StatusBadge isActive={form.isActive} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {form.isActive
                      ? "Visible to customers and available for new bookings."
                      : "Hidden from customers. Existing bookings remain unchanged."}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() => update("isActive", !form.isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.isActive ? "bg-primary" : "bg-secondary"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              <Button onClick={handleSave} disabled={saving || !form.pricingConfigurationId} className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saving ? "Saving..." : editingService ? "Update Service" : "Add Service"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="glass-strong border border-white/[0.12] shadow-glass-elevated">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground text-xl">Remove Service</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Remove <strong>{deleteTarget?.name}</strong>? If any bookings reference it, it will be deactivated instead of deleted so historical bookings keep displaying correctly - otherwise it&apos;s removed permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border hover:bg-secondary">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remove Service
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
