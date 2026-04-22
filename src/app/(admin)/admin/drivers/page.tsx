"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, MoreVertical, Pencil, Trash2, Phone, Mail, Car, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useDrivers } from "@/hooks/useDrivers";
import type { Driver } from "@/types";

export default function DriversPage() {
  const { drivers, loading, addDriver, updateDriver, deleteDriver, refetch } = useDrivers();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    status: "available" | "unavailable" | "on_trip";
    notes: string;
    photoUrl: string;
    vehicleId: string | null;
  }>({
    name: "",
    email: "",
    phone: "",
    status: "available",
    notes: "",
    photoUrl: "",
    vehicleId: null,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.email && d.email.toLowerCase().includes(search.toLowerCase())) ||
    (d.phone && d.phone.includes(search))
  );

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

      const response = await fetch("https://wc-backend-ayx0.onrender.com/api/v1/uploads", {
        method: "POST",
        credentials: "include",
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this driver?")) return;
    try {
      await deleteDriver(id);
      toast.success("Driver deleted");
    } catch (error) {
      toast.error("Failed to delete driver");
    }
  };

  const statusColors: Record<string, string> = {
    available: "bg-status-confirmed/10 text-status-confirmed-fg border-status-confirmed/20",
    on_trip: "bg-status-pending/10 text-status-pending-fg border-status-pending/20",
    off_duty: "bg-muted text-muted-foreground border-border",
  };

  const statusLabels: Record<string, string> = {
    available: "Available",
    on_trip: "On Trip",
    off_duty: "Off Duty",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Drivers</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Manage chauffeur roster and availability</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading drivers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "No drivers match your search" : "No drivers yet"}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((driver) => (
            <div key={driver.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-4">
                {driver.photoUrl ? (
                  <img src={driver.photoUrl} alt={driver.name} className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-display font-semibold text-foreground">{driver.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-body border ${statusColors[driver.status] || statusColors.available}`}>
                      {statusLabels[driver.status] || driver.status}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {driver.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <Mail className="h-3.5 w-3.5" />
                        {driver.email}
                      </div>
                    )}
                    {driver.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <Phone className="h-3.5 w-3.5" />
                        {driver.phone}
                      </div>
                    )}
                  </div>
                  {driver.notes && (
                    <p className="text-xs text-muted-foreground font-body mt-3 italic">{driver.notes}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(driver)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(driver.id)} className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDriver ? "Edit Driver" : "Add Driver"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">Profile Photo</label>
              <div className="flex items-center gap-4">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                    <User className="h-10 w-10 text-muted-foreground" />
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
                    className="gap-2"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "unavailable" | "on_trip" })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="off_duty">Off Duty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingDriver ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
