"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Plus, Search, MoreVertical, Pencil, Trash2, Loader2, Hash, Upload, ImageIcon, Users, Briefcase,
  Filter, Download, RefreshCw, CheckCircle, XCircle, AlertCircle, Wrench, Battery
} from "lucide-react";
import { useFleet, type VehicleClass } from "@/hooks/useFleet";
import type { FleetVehicle } from "@/types";
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

const vehicleStatusOptions = [
  { value: "available", label: "Available", color: "bg-emerald-500", icon: CheckCircle },
  { value: "in_use", label: "In Use", color: "bg-blue-500", icon: Car },
  { value: "maintenance", label: "Maintenance", color: "bg-amber-500", icon: Wrench },
  { value: "retired", label: "Retired", color: "bg-muted-foreground", icon: XCircle },
];

const vehicleTypeOptions = [
  { value: "sedan", label: "Sedan", color: "bg-primary/20 text-primary" },
  { value: "suv", label: "SUV", color: "bg-blue-500/20 text-blue-600" },
];

const emptyForm = {
  make: "Mercedes-Benz",
  model: "",
  plate: "",
  year: new Date().getFullYear().toString(),
  color: "Black",
  vehicleType: "sedan" as VehicleClass,
  status: "available",
  notes: "",
  passengerCapacity: "3",
  luggageCapacity: "2",
};

export default function PremiumFleetPage() {
  const { vehicles, loading, error, addVehicle, updateVehicle, deleteVehicle } = useFleet();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<FleetVehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FleetVehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = vehicles.filter((v) => {
    const matchesSearch = `${v.make} ${v.model} ${v.plate}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const matchesType = typeFilter === "all" || v.vehicleType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === "available").length,
    inUse: vehicles.filter(v => v.status === "in_use").length,
    maintenance: vehicles.filter(v => v.status === "maintenance").length,
    sedans: vehicles.filter(v => v.vehicleType === "sedan").length,
    suvs: vehicles.filter(v => v.vehicleType === "suv").length,
  };

  const openAdd = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (v: FleetVehicle) => {
    setEditingVehicle(v);
    setForm({
      make: v.make,
      model: v.model,
      plate: v.plate || "",
      year: v.year?.toString() || "",
      color: v.color || "",
      vehicleType: v.vehicleType,
      status: v.status,
      notes: v.notes || "",
      passengerCapacity: v.passengerCapacity?.toString() || "3",
      luggageCapacity: v.luggageCapacity?.toString() || "2",
    });
    setImageFile(null);
    setImagePreview(v.imageUrl || null);
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
      formData.append("type", "vehicle_image");

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/uploads`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Upload error:", errorData);
        throw new Error(errorData.error || "Upload failed");
      }
      
      const { url } = await response.json();
      
      setImageFile(file);
      setImagePreview(url);
      notify.success("Image uploaded");
    } catch (error: any) {
      console.error("Image upload failed:", error);
      notify.error(error.message || "Failed to upload image");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.model.trim() || !form.plate.trim()) {
      notify.error("Model and plate are required");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        make: form.make.trim(),
        model: form.model.trim(),
        plate: form.plate.trim().toUpperCase(),
        year: form.year ? parseInt(form.year) : null,
        color: form.color.trim() || null,
        vehicleType: form.vehicleType,
        status: form.status,
        notes: form.notes.trim() || null,
        passengerCapacity: form.passengerCapacity ? parseInt(form.passengerCapacity) : 3,
        luggageCapacity: form.luggageCapacity ? parseInt(form.luggageCapacity) : 2,
        imageUrl: imagePreview || null,
      };
      
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, payload);
        notify.success("Vehicle updated");
      } else {
        await addVehicle(payload);
        notify.success("Vehicle added");
      }
      setDialogOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      notify.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVehicle(deleteTarget.id);
      notify.success("Vehicle removed");
    } catch (err: any) {
      notify.error(err.message || "Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const StatusBadge = ({ status }: { status: string }) => {
    const opt = vehicleStatusOptions.find((s) => s.value === status);
    const Icon = opt?.icon || AlertCircle;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        status === "available" ? "bg-emerald-500/10 text-emerald-600" :
        status === "in_use" ? "bg-blue-500/10 text-blue-600" :
        status === "maintenance" ? "bg-amber-500/10 text-amber-600" :
        "bg-muted-foreground/10 text-muted-foreground"
      }`}>
        <Icon className="h-3 w-3" />
        <span>{opt?.label || status}</span>
      </div>
    );
  };

  const TypeBadge = ({ type }: { type: string }) => {
    const opt = vehicleTypeOptions.find((t) => t.value === type);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${opt?.color || "bg-secondary text-secondary-foreground"}`}>
        {opt?.label || type}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="glass-strong rounded-2xl p-6 border border-white/[0.12] shadow-glass-elevated">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-md" />
                  <Car className="relative h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">Fleet Management</h1>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Manage your luxury vehicle fleet with real-time status tracking
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border hover:bg-secondary"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              <Button
                size="sm"
                onClick={openAdd}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Total</p>
                <p className="text-lg font-display font-bold text-foreground">{stats.total}</p>
              </div>
              <Car className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Available</p>
                <p className="text-lg font-display font-bold text-emerald-600">{stats.available}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">In Use</p>
                <p className="text-lg font-display font-bold text-blue-600">{stats.inUse}</p>
              </div>
              <Car className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Maintenance</p>
                <p className="text-lg font-display font-bold text-amber-600">{stats.maintenance}</p>
              </div>
              <Wrench className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Sedans</p>
                <p className="text-lg font-display font-bold text-primary">{stats.sedans}</p>
              </div>
              <Car className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">SUVs</p>
                <p className="text-lg font-display font-bold text-blue-600">{stats.suvs}</p>
              </div>
              <Car className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-strong rounded-2xl p-5 border border-white/[0.12] shadow-glass-elevated">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by make, model, plate..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
              </div>
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
                  {vehicleStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="all">All Types</option>
                  {vehicleTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border hover:bg-secondary"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="glass-strong rounded-2xl p-8 border border-white/[0.12] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-body">Loading fleet...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-strong rounded-2xl p-8 border border-white/[0.12] text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-sm text-destructive font-body">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 border border-white/[0.12] text-center">
            <Car className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h4 className="text-lg font-display font-semibold text-foreground mb-2">
              {vehicles.length === 0 ? "No vehicles yet" : "No results found"}
            </h4>
            <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
              {vehicles.length === 0 
                ? "Add your first luxury vehicle to start managing your fleet."
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {vehicles.length === 0 && (
              <Button
                onClick={openAdd}
                className="mt-4 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Plus className="h-4 w-4" />
                Add First Vehicle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative group"
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/2 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Main card */}
                  <div className="relative glass-strong rounded-2xl border border-white/[0.12] shadow-glass-elevated hover:shadow-glass-elevated-hover transition-all duration-300 overflow-hidden">
                    
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-2xl bg-background" />
                    </div>
                    
                    {/* Vehicle Image */}
                    <div className="h-48 bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center overflow-hidden relative">
                      {vehicle.imageUrl ? (
                        <img 
                          src={vehicle.imageUrl} 
                          alt={`${vehicle.make} ${vehicle.model}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="text-center">
                          <Car className="h-16 w-16 text-muted-foreground/20" />
                          <p className="text-xs text-muted-foreground/50 mt-2">No image</p>
                        </div>
                      )}
                      
                      {/* Status badge overlay */}
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={vehicle.status} />
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <h3 className="text-lg font-display font-semibold text-foreground">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <div className="flex items-center gap-2">
                            <TypeBadge type={vehicle.vehicleType} />
                            {vehicle.year && (
                              <span className="text-xs text-muted-foreground">{vehicle.year}</span>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg glass hover:bg-secondary/50 transition-colors relative group">
                              <div className="absolute inset-0 bg-primary/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <MoreVertical className="relative h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-strong border border-white/[0.12] shadow-glass-elevated">
                            <DropdownMenuItem onClick={() => openEdit(vehicle)} className="gap-2 py-2.5">
                              <Pencil className="h-4 w-4" />
                              <span className="font-body">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(vehicle)} className="gap-2 py-2.5 text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="font-body">Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Plate and Specs */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                          <Hash className="h-4 w-4 text-primary" />
                          <span className="font-mono font-bold text-foreground tracking-wider">
                            {vehicle.plate}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Passengers</p>
                              <p className="text-sm font-semibold text-foreground">{vehicle.passengerCapacity ?? 3}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Luggage</p>
                              <p className="text-sm font-semibold text-foreground">{vehicle.luggageCapacity ?? 2}</p>
                            </div>
                          </div>
                        </div>
                        
                        {vehicle.color && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                            <div 
                              className="h-4 w-4 rounded-full border" 
                              style={{ backgroundColor: vehicle.color.toLowerCase() }}
                            />
                            <span className="text-sm text-foreground">{vehicle.color}</span>
                          </div>
                        )}
                        
                        {vehicle.notes && (
                          <div className="px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Notes</p>
                            <p className="text-sm text-foreground line-clamp-2">{vehicle.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Animated bottom border */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
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
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingVehicle ? "Update vehicle details and status." : "Register a new luxury vehicle to your fleet."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2 pb-4">
              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Vehicle Image</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-48 rounded-xl border-2 border-dashed border-border bg-secondary/20 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors duration-300 overflow-hidden group"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Upload className="h-8 w-8 text-white" />
                        <p className="text-sm text-white ml-2">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Click to upload vehicle image</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Make *</Label>
                  <Input 
                    value={form.make} 
                    onChange={(e) => update("make", e.target.value)} 
                    placeholder="Mercedes-Benz" 
                    className="bg-secondary/50 border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Model *</Label>
                  <Input 
                    value={form.model} 
                    onChange={(e) => update("model", e.target.value)} 
                    placeholder="S-Class" 
                    className="bg-secondary/50 border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">License Plate *</Label>
                  <Input 
                    value={form.plate} 
                    onChange={(e) => update("plate", e.target.value)} 
                    placeholder="ABC-1234" 
                    className="bg-secondary/50 border-border font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Year</Label>
                  <Input 
                    value={form.year} 
                    onChange={(e) => update("year", e.target.value)} 
                    placeholder="2024" 
                    className="bg-secondary/50 border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Color</Label>
                  <Input 
                    value={form.color} 
                    onChange={(e) => update("color", e.target.value)} 
                    placeholder="Black" 
                    className="bg-secondary/50 border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Vehicle Type *</Label>
                  <select
                    className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.vehicleType}
                    onChange={(e) => update("vehicleType", e.target.value)}
                  >
                    {vehicleTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Passenger Capacity</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={form.passengerCapacity} 
                    onChange={(e) => update("passengerCapacity", e.target.value)} 
                    placeholder="3" 
                    className="bg-secondary/50 border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Luggage Capacity</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="20" 
                    value={form.luggageCapacity} 
                    onChange={(e) => update("luggageCapacity", e.target.value)} 
                    placeholder="2" 
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Status</Label>
                <select
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {vehicleStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Notes</Label>
                <Textarea 
                  value={form.notes} 
                  onChange={(e) => update("notes", e.target.value)} 
                  placeholder="Any maintenance notes, special features, or additional information..." 
                  rows={3} 
                  className="bg-secondary/50 border-border"
                />
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saving ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="glass-strong border border-white/[0.12] shadow-glass-elevated">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground text-xl">Remove Vehicle</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to remove <strong>{deleteTarget?.make} {deleteTarget?.model}</strong> ({deleteTarget?.plate}) from the fleet? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border hover:bg-secondary">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Vehicle
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}