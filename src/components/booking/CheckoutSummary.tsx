"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Car, Plane, Clock, Shield, Pencil, Plus, Trash2, Route, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/FormInputs";
import DatePicker from "./DatePicker";
import RouteVisualization from "./RouteVisualization";
import { format } from "date-fns";
import type { TripLeg } from "@/hooks/useBookingStore";
import LocationInput from "@/components/booking/LocationInput";

interface CheckoutSummaryProps {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType: "sedan" | "suv";
  basePrice: number;
  tax: number;
  total: number;
  distanceMiles: number;
  durationMinutes: number;
  flightNumber?: string;
  specialRequests?: string;
  additionalLegs: TripLeg[];
  legPrices: number[];
  grandTotal: number;
  loading: boolean;
  bookingForSomeoneElse?: boolean;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  onPay: () => void;
  onBack: () => void;
  onEditVehicle: () => void;
  onEditDetails: () => void;
  onAddLeg: (leg: TripLeg) => void;
  onRemoveLeg: (index: number) => void;
  onUpdateLeg: (index: number, leg: TripLeg) => void;
}

function formatDateStr(d: string) {
  if (!d) return "";
  try {
    return format(new Date(d + "T00:00:00"), "EEE, MMM d, yyyy");
  } catch (err) {
    return d;
  }
}

function formatTimeStr(t: string) {
  if (!t) return "";
  try {
    return format(new Date(`2000-01-01T${t}`), "h:mm a");
  } catch (err) {
    return t;
  }
}

const CheckoutSummary = ({
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  vehicleType,
  basePrice,
  tax,
  total,
  distanceMiles,
  flightNumber,
  specialRequests,
  additionalLegs,
  legPrices,
  grandTotal,
  loading,
  bookingForSomeoneElse,
  guestFirstName,
  guestLastName,
  guestEmail,
  guestPhone,
  onPay,
  onBack,
  onEditVehicle,
  onEditDetails,
  onAddLeg,
  onRemoveLeg,
  onUpdateLeg,
}: CheckoutSummaryProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLeg, setNewLeg] = useState<TripLeg>({ pickup: "", dropoff: "", pickupDate: "", pickupTime: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLeg, setEditLeg] = useState<TripLeg>({ pickup: "", dropoff: "", pickupDate: "", pickupTime: "" });

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const currentTime = format(now, "HH:mm");

  const isDateTimeInPast = (date: string, time: string) => {
    if (!date || !time) return false;
    return new Date(`${date}T${time}`) < new Date();
  };

  const isNewLegValid =
    newLeg.pickup &&
    newLeg.dropoff &&
    newLeg.pickupDate &&
    newLeg.pickupTime &&
    !isDateTimeInPast(newLeg.pickupDate, newLeg.pickupTime);

  const isEditLegValid =
    editingIndex !== null &&
    editLeg.pickup &&
    editLeg.dropoff &&
    editLeg.pickupDate &&
    editLeg.pickupTime &&
    !isDateTimeInPast(editLeg.pickupDate, editLeg.pickupTime);

  const handleAddLeg = () => {
    if (!isNewLegValid) return;
    onAddLeg(newLeg);
    setNewLeg({ pickup: "", dropoff: "", pickupDate: "", pickupTime: "" });
    setShowAddForm(false);
  };

  const handleStartEdit = (i: number) => {
    setEditingIndex(i);
    setEditLeg({ ...additionalLegs[i] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    if (!editLeg.pickup || !editLeg.dropoff || !editLeg.pickupDate || !editLeg.pickupTime) return;
    onUpdateLeg(editingIndex, editLeg);
    setEditingIndex(null);
  };

  const totalTax = grandTotal * 0.2;
  const grandTotalWithTax = grandTotal + totalTax;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Review booking request</h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">
          Confirm your ride details and submit the request for admin availability review.
        </p>
      </div>

      {/* Primary Leg */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">1</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide">Primary Route</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onEditDetails} className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1 shrink-0">
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Car className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-body text-foreground capitalize">
              Business {vehicleType === "suv" ? "SUV" : "Class"}
            </span>
          </div>

          <div className="flex items-start gap-3 mt-3">
            <RouteVisualization pickup={pickup} dropoff={dropoff} index={0} />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-body text-foreground">
              {formatDateStr(pickupDate)} at {formatTimeStr(pickupTime)}
            </span>
          </div>

          {flightNumber && (
            <div className="flex items-center gap-3">
              <Plane className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-body text-foreground">{flightNumber}</span>
            </div>
          )}

          {specialRequests && (
            <div className="pt-2 border-t border-border">
              <p className="text-[11px] text-muted-foreground font-body mb-1">Special Requests</p>
              <p className="text-xs text-foreground font-body">{specialRequests}</p>
            </div>
          )}

          {bookingForSomeoneElse && guestFirstName && (
            <div className="pt-2 border-t border-border space-y-1.5">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wide">Booking for Guest</p>
              </div>
              <p className="text-sm font-body text-foreground">{guestFirstName} {guestLastName}</p>
              {guestEmail && <p className="text-xs font-body text-muted-foreground">{guestEmail}</p>}
              {guestPhone && <p className="text-xs font-body text-muted-foreground">{guestPhone}</p>}
            </div>
          )}

          <div className="flex justify-between text-xs font-body pt-2 border-t border-border">
            <span className="text-muted-foreground">{distanceMiles.toFixed(1)} mi</span>
            <span className="text-foreground font-semibold">${basePrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="hidden md:block md:col-span-1">
          <div className="rounded-lg overflow-hidden shadow-lg h-full bg-gradient-to-br from-white/40 to-primary/5 p-3 flex flex-col items-center justify-center">
            {loading ? (
              <div className="h-28 w-full animate-pulse bg-slate-200 rounded-md" />
            ) : (
              <img src={vehicleType === "suv" ? "/assets/suv-profile.png" : "/assets/sedan-profile.png"} alt="vehicle" className="h-28 w-full object-cover rounded-md border border-border" />
            )}
            <p className="text-sm font-display font-bold mt-3">Premium Business {vehicleType === "suv" ? "SUV" : "Sedan"}</p>
            <p className="text-xs text-muted-foreground mt-1">Comfort and privacy guaranteed</p>
          </div>
        </div>
      </div>

      {/* Additional Legs */}
      <AnimatePresence>
        {(additionalLegs || []).map((leg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{i + 2}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide">Additional Route</span>
              </div>
              <div className="flex items-center gap-1">
                {editingIndex !== i && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(i)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { onRemoveLeg(i); if (editingIndex === i) setEditingIndex(null); }}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </Button>
              </div>
            </div>

            {editingIndex === i ? (
              <div className="grid gap-3">
                <LocationInput
                  label="Pickup Location"
                  placeholder="e.g. Reagan National Airport"
                  value={editLeg.pickup}
                  onChange={(val) => setEditLeg(l => ({ ...l, pickup: val }))}
                  icon="pickup"
                />
                <LocationInput
                  label="Drop-off Location"
                  placeholder="e.g. The Ritz-Carlton"
                  value={editLeg.dropoff}
                  onChange={(val) => setEditLeg(l => ({ ...l, dropoff: val }))}
                  icon="dropoff"
                />
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    value={editLeg.pickupDate}
                    min={today}
                    onChange={(v) => setEditLeg(l => ({ ...l, pickupDate: v }))}
                    label="Date"
                  />
                  <Input
                    type="time"
                    min={editLeg.pickupDate === today ? currentTime : "00:00"}
                    value={editLeg.pickupTime}
                    onChange={(e) => setEditLeg(l => ({ ...l, pickupTime: e.target.value }))}
                    label="Time"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingIndex(null)} className="font-body">Cancel</Button>
                  <Button variant="hero" size="sm" onClick={handleSaveEdit} disabled={!isEditLegValid} className="gap-1 font-body">
                    <Check className="h-3 w-3" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <>

                <RouteVisualization pickup={leg.pickup} dropoff={leg.dropoff} index={i + 1} />

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-body text-foreground">
                    {formatDateStr(leg.pickupDate)} at {formatTimeStr(leg.pickupTime)}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-body pt-2 border-t border-border">
                  <span className="text-muted-foreground">Estimated fare</span>
                  <span className="text-foreground font-semibold">${legPrices[i]?.toFixed(2) ?? "—"}</span>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Route Button / Form */}
      {!showAddForm ? (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5 gap-2 font-body"
        >
          <Plus className="h-4 w-4" />
          <Route className="h-4 w-4" />
          Add Another Route
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/20 bg-card p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary font-body uppercase tracking-wide">New Route</span>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="h-7 px-2 text-xs text-muted-foreground">
              Cancel
            </Button>
          </div>

          <div className="grid gap-3">
            <LocationInput
              label="Pickup Location"
              placeholder="e.g. 1600 Pennsylvania Ave NW"
              value={newLeg.pickup}
              onChange={(val) => setNewLeg(l => ({ ...l, pickup: val }))}
              icon="pickup"
            />
            <LocationInput
              label="Drop-off Location"
              placeholder="e.g. Dulles International Airport"
              value={newLeg.dropoff}
              onChange={(val) => setNewLeg(l => ({ ...l, dropoff: val }))}
              icon="dropoff"
            />
            <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  value={newLeg.pickupDate}
                  min={today}
                  onChange={(v) => setNewLeg(l => ({ ...l, pickupDate: v }))}
                  label="Date"
                />
                <Input
                  type="time"
                  min={newLeg.pickupDate === today ? currentTime : "00:00"}
                  value={newLeg.pickupTime}
                  onChange={(e) => setNewLeg(l => ({ ...l, pickupTime: e.target.value }))}
                  label="Time"
                />
            </div>
          </div>

          <Button
            variant="hero"
            onClick={handleAddLeg}
            disabled={!isNewLegValid}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Route
          </Button>
        </motion.div>
      )}

      {/* Price breakdown */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Primary route ({Number(distanceMiles || 0).toFixed(1)} mi)</span>
          <span className="text-foreground">${Number(basePrice || 0).toFixed(2)}</span>
        </div>
        {(additionalLegs || []).map((_, i) => (
          <div key={i} className="flex justify-between text-sm font-body">
            <span className="text-muted-foreground">Route {i + 2}</span>
            <span className="text-foreground">${Number(legPrices[i] || 0)?.toFixed(2) ?? "—"}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-body pt-1 border-t border-border">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">${Number(grandTotal || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Tax (20%)</span>
          <span className="text-foreground">${Number(totalTax || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-body pt-2 border-t border-border">
          <span className="text-foreground font-semibold">Total</span>
          <span className="text-primary font-display font-bold text-lg">${Number(grandTotalWithTax || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground font-body">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        <span>Once availability is confirmed by the admin, you will receive a secure payment link.</span>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="font-body">
          Back
        </Button>
        <Button variant="hero" onClick={onPay} disabled={loading} className="flex-1 gap-2">
          {loading ? "Submitting…" : "Submit booking request"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

export default CheckoutSummary;
