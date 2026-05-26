"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, MoreVertical, Pencil, Trash2, Phone, Mail, Car, Upload, User, 
  Filter, Download, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Star, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { useDrivers } from "@/hooks/useDrivers";
import type { Driver } from "@/types";
import PageTransition from "@/components/ui/PageTransition";

const statusOptions = [
  { value: "available", label: "Available", color: "bg-emerald-500", icon: CheckCircle },
  { value: "on_trip", label: "On Trip", color: "bg-blue-500", icon: Car },
  { value: "off_duty", label: "Off Duty", color: "bg-muted-foreground", icon: XCircle },
];

const ratingOptions = [
  { value: "all", label: "All Ratings" },
  { value: "4.5+", label: "4.5+ Stars" },
  { value: "4.0+", label: "4.0+ Stars" },
  { value: "3.5+", label: "3.5+ Stars" },
];

export default function PremiumDriversPage() {
  const { drivers, loading, addDriver, updateDriver, deleteDriver, refetch } = useDrivers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    status: "available" | "off_duty" | "unavailable" | "on_trip";
    notes: string;
    photoUrl: string;
    vehicleId: string | null;
    rating?: number;
    tripsCompleted?: number;
  }>({
    name: "",
    email: "",
    phone: "",
    status: "available",
    notes: "",
    photoUrl: "",
    vehicleId: null,
    rating: 4.8,
    tripsCompleted: 0,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; driverId: string | null; driverName: string }>({ 
    open: false, 
    driverId: null, 
    driverName: "" 
  });

  const filtered = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.email && d.email.toLowerCase().includes(search.toLowerCase())) ||
      (d.phone && d.phone.includes(search));
    
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    
    // Mock rating filter (in real app, drivers would have ratings)
    const matchesRating = ratingFilter === "all" || 
      (ratingFilter === "4.5+" && (d.rating || 0) >= 4.5) ||
      (ratingFilter === "4.0+" && (d.rating || 0) >= 4.0) ||
      (ratingFilter === "3.5+" && (d.rating || 0) >= 3.5);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === "available").length,
    onTrip: drivers.filter(d => d.status === "on_trip").length,
    offDuty: drivers.filter(d => d.status === "off_duty").length,
    averageRating: drivers.length > 0 
      ? (drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length).toFixed(1)
      : "0.0",
  };

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        email: driver.email || "",
        phone: driver.phone || "",
        status: driver.status as "available" | "unavailable" | "on_trip",
        notes: driver.notes || "",
        photoUrl: driver.photoUrl || "",
        vehicleId: driver.vehicleId,
        rating: driver.rating || 4.8,
        tripsCompleted: driver.tripsCompleted || 0,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "available",
        notes: "",
        photoUrl: "",
        vehicleId: null,
        rating: 4.8,
        tripsCompleted: 0,
      });
    }
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "driver_photo");

      const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/uploads`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      setFormData((prev) => ({ ...prev, photoUrl: url }));
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
        toast.success("Driver updated");
      } else {
        await addDriver(formData);
        toast.success("Driver added");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save driver");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteConfirm({ open: true, driverId: id, driverName: name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.driverId) return;
    try {
      await deleteDriver(deleteConfirm.driverId);
      toast.success("Driver deleted");
    } catch (error) {
      toast.error("Failed to delete driver");
    } finally {
      setDeleteConfirm({ open: false, driverId: null, driverName: "" });
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const opt = statusOptions.find((s) => s.value === status);
    const Icon = opt?.icon || AlertCircle;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        status === "available" ? "bg-emerald-500/10 text-emerald-600" :
        status === "on_trip" ? "bg-blue-500/10 text-blue-600" :
        "bg-muted-foreground/10 text-muted-foreground"
      }`}>
        <Icon className="h-3 w-3" />
        <span>{opt?.label || status}</span>
      </div>
    );
  };

  const RatingStars = ({ rating = 0 }: { rating?: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.floor(rating)
                ? "text-amber-500 fill-amber-500"
                : star === Math.ceil(rating) && rating % 1 >= 0.5
                ? "text-amber-500 fill-amber-500/50"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
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
                  <User className="relative h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">Driver Management</h1>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Manage your professional chauffeur team with real-time status and performance tracking
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
                onClick={() => handleOpenDialog()}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Plus className="h-4 w-4" />
                Add Driver
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Total Drivers</p>
                <p className="text-lg font-display font-bold text-foreground">{stats.total}</p>
              </div>
              <User className="h-5 w-5 text-primary" />
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
                <p className="text-xs text-muted-foreground font-body">On Trip</p>
                <p className="text-lg font-display font-bold text-blue-600">{stats.onTrip}</p>
              </div>
              <Car className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Avg. Rating</p>
                <p className="text-lg font-display font-bold text-amber-600">{stats.averageRating}</p>
              </div>
              <Star className="h-5 w-5 text-amber-500" />
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
                  placeholder="Search by name, email, phone..."
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
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {ratingOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 border-border hover:bg-secondary"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Drivers Grid */}
        {loading ? (
          <div className="glass-strong rounded-2xl p-8 border border-white/[0.12] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-body">Loading drivers...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 border border-white/[0.12] text-center">
            <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h4 className="text-lg font-display font-semibold text-foreground mb-2">
              {drivers.length === 0 ? "No drivers yet" : "No results found"}
            </h4>
            <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
              {drivers.length === 0 
                ? "Add your first professional chauffeur to start managing your team."
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {drivers.length === 0 && (
              <Button
                onClick={() => handleOpenDialog()}
                className="mt-4 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Plus className="h-4 w-4" />
                Add First Driver
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((driver) => (
                <motion.div
                  key={driver.id}
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
                    
                    <div className="p-5">
                      {/* Header with photo and actions */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {driver.photoUrl ? (
                              <img 
                                src={driver.photoUrl} 
                                alt={driver.name} 
                                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" 
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                                <User className="h-7 w-7 text-primary/60" />
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1">
                              <StatusBadge status={driver.status} />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="text-lg font-display font-semibold text-foreground">{driver.name}</h3>
                            <RatingStars rating={driver.rating ?? undefined} />
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(driver)} className="gap-2 py-2.5">
                              <Pencil className="h-4 w-4" />
                              <span className="font-body">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(driver.id, driver.name)} className="gap-2 py-2.5 text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="font-body">Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-3 mb-4">
                        {(driver.email || driver.phone) && (
                          <div className="space-y-2">
                            {driver.email && (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground font-body truncate">{driver.email}</span>
                              </div>
                            )}
                            
                            {driver.phone && (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground font-body">{driver.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Performance Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Trips</p>
                              <p className="text-sm font-semibold text-foreground">{driver.tripsCompleted || 0}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Experience</p>
                              <p className="text-sm font-semibold text-foreground">2+ yrs</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {driver.notes && (
                        <div className="px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm text-foreground line-clamp-2">{driver.notes}</p>
                        </div>
                      )}
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
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto glass-strong border border-white/[0.12] shadow-glass-elevated">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground text-xl">
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingDriver ? "Update driver details and status." : "Add a new professional chauffeur to your team."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2 pb-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {formData.photoUrl ? (
                    <img 
                      src={formData.photoUrl} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" 
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                      <User className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="gap-2 border-border hover:bg-secondary"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                    placeholder="John Smith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "off_duty" | "unavailable" | "on_trip" })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="off_duty">Off Duty</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none"
                    placeholder="Any special skills, certifications, or notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)} 
                  className="flex-1 border-border hover:bg-secondary"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {editingDriver ? "Update Driver" : "Add Driver"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, driverId: null, driverName: "" })}
          title="Delete Driver"
          description={`Are you sure you want to delete ${deleteConfirm.driverName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          variant="destructive"
        />
      </div>
    </PageTransition>
  );
}