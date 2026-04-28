"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Plus, Search, MoreVertical, Pencil, Trash2, Loader2, Hash, Upload, ImageIcon, Users, Briefcase,
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

const vehicleStatusOptions = [
  { value: "available", label: "Available", color: "bg-emerald-500" },
  { value: "in_use", label: "In Use", color: "bg-blue-500" },
  { value: "maintenance", label: "Maintenance", color: "bg-amber-500" },
  { value: "retired", label: "Retired", color: "bg-muted-foreground" },
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

export default function AdminFleetPage() {
  const { vehicles, loading, error, addVehicle, updateVehicle, deleteVehicle } = useFleet();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<FleetVehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FleetVehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = vehicles.filter((v) =>
    `${v.make} ${v.model} ${v.plate}`.toLowerCase().includes(search.toLowerCase())
  );

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/uploads`, {
        method: "POST",
        credentials: "include",
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

  const statusBadge = (status: string) => {
    const opt = vehicleStatusOptions.find((s) => s.value === status);
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${opt?.color || "bg-muted-foreground"}`} />
        <span className="text-[11px] text-muted-foreground capitalize">{opt?.label || status}</span>
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">Fleet</h1>
          </div>
          <p className="text-sm text-muted-foreground">{vehicles.length} vehicles</p>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Vehicle
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search fleet…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {vehicles.length === 0 ? "No vehicles yet. Add your first vehicle." : "No results."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/20 transition-colors"
              >
                <div className="h-40 bg-secondary/30 flex items-center justify-center overflow-hidden">
                  {vehicle.imageUrl ? (
                    <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="h-12 w-12 text-muted-foreground/20" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">
                        {vehicle.make} {vehicle.model}
                      </p>
                      {statusBadge(vehicle.status)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(vehicle)} className="gap-2 text-xs">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(vehicle)} className="gap-2 text-xs text-destructive">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary/60" />
                      <span className="font-mono tracking-wider">{vehicle.plate}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {vehicle.year && <span>{vehicle.year}</span>}
                      {vehicle.color && <span>{vehicle.color}</span>}
                      <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {vehicle.vehicleType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {vehicle.passengerCapacity ?? 3} pax
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {vehicle.luggageCapacity ?? 2} bags
                      </span>
                    </div>
                    {vehicle.notes && (
                      <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-2">{vehicle.notes}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingVehicle ? "Update vehicle details." : "Register a new fleet vehicle."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 pb-4">
            <div>
              <Label className="text-xs">Vehicle Image</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 relative h-36 rounded-lg border-2 border-dashed border-border bg-secondary/20 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload image</p>
                    <p className="text-[10px] text-muted-foreground/60">PNG, JPG up to 5MB</p>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Make</Label>
                <Input value={form.make} onChange={(e) => update("make", e.target.value)} placeholder="Mercedes-Benz" />
              </div>
              <div>
                <Label className="text-xs">Model *</Label>
                <Input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="S-Class" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Plate *</Label>
                <Input value={form.plate} onChange={(e) => update("plate", e.target.value)} placeholder="ABC-1234" className="font-mono" />
              </div>
              <div>
                <Label className="text-xs">Year</Label>
                <Input value={form.year} onChange={(e) => update("year", e.target.value)} placeholder="2024" />
              </div>
              <div>
                <Label className="text-xs">Color</Label>
                <Input value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="Black" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Passengers</Label>
                <Input type="number" min="1" max="20" value={form.passengerCapacity} onChange={(e) => update("passengerCapacity", e.target.value)} placeholder="3" />
              </div>
              <div>
                <Label className="text-xs">Luggage</Label>
                <Input type="number" min="0" max="20" value={form.luggageCapacity} onChange={(e) => update("luggageCapacity", e.target.value)} placeholder="2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.vehicleType}
                  onChange={(e) => update("vehicleType", e.target.value)}
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {vehicleStatusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any notes…" rows={2} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? "Saving…" : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.make} {deleteTarget?.model}</strong> ({deleteTarget?.plate})? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
