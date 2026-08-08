"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Car, Plane, Clock, Route as RouteIcon, Pencil, Trash2, Check, Users, Gauge, Calendar, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/FormInputs";
import DatePicker from "./DatePicker";
import RouteVisualization from "./RouteVisualization";
import MapPreview from "./MapPreview";
import { format } from "date-fns";
import type { TripLeg } from "@/hooks/useBookingStore";
import LocationInput from "@/components/booking/LocationInput";

interface CheckoutSummaryProps {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType: "sedan" | "suv";
  // Display name of the selected Service/Class (e.g. "First Class"),
  // cached at selection time on /book. Falls back to a generic
  // "Business Sedan/SUV" label below when absent (e.g. an older booking
  // flow that never set it) - see the two render sites for the fallback.
  serviceName?: string;
  vehicleImage?: string;
  basePrice: number;
  distanceMiles: number;
  durationMinutes: number;
  flightNumber?: string;
  specialRequests?: string;
  additionalLegs: TripLeg[];
  legPrices: number[];
  gratuity: number;
  grandTotal: number;
  loading: boolean;
  // True only when grandTotal/basePrice come from the unverified client-side
  // fallback estimate (checkout/page.tsx's quoteError case), not a real
  // signed backend quote. Never affects `gratuity`, which the caller always
  // sets to exactly 0 in that case - this only changes the label so the
  // customer never mistakes this figure for a confirmed, payable price.
  isEstimate?: boolean;
  bookingForSomeoneElse?: boolean;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  onEditVehicle: () => void;
  onEditDetails: () => void;
  onAddLeg: (leg: TripLeg) => void;
  onRemoveLeg: (index: number) => void;
  onUpdateLeg: (index: number, leg: TripLeg) => void;
  // True while the parent is (re)creating the booking after a leg change -
  // Add/Edit/Remove are disabled for that window so a second edit can't race
  // ahead of the in-flight request and get silently dropped from the
  // eventual charge amount.
  legsLocked?: boolean;
}

function formatDateStr(d: string) {
  if (!d) return "";
  try {
    return format(new Date(d + "T00:00:00"), "EEE, MMM d, yyyy");
  } catch {
    return d;
  }
}

function formatTimeStr(t: string) {
  if (!t) return "";
  try {
    return format(new Date(`2000-01-01T${t}`), "h:mm a");
  } catch {
    return t;
  }
}

function formatDuration(minutes: number) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

const CheckoutSummary = ({
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  vehicleType,
  serviceName,
  vehicleImage,
  basePrice,
  distanceMiles,
  durationMinutes,
  flightNumber,
  specialRequests,
  additionalLegs,
  legPrices,
  gratuity,
  grandTotal,
  loading,
  isEstimate = false,
  bookingForSomeoneElse,
  guestFirstName,
  guestLastName,
  guestEmail,
  guestPhone,
  onEditVehicle,
  onEditDetails,
  onAddLeg,
  onRemoveLeg,
  onUpdateLeg,
  legsLocked,
}: CheckoutSummaryProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLeg, setEditLeg] = useState<TripLeg>({ pickup: "", dropoff: "", pickupDate: "", pickupTime: "" });
  const [editLegTouched, setEditLegTouched] = useState(false);
  const [isAddingLeg, setIsAddingLeg] = useState(false);
  const [newLeg, setNewLeg] = useState<TripLeg>({ pickup: "", dropoff: "", pickupDate: "", pickupTime: "" });
  const [newLegTouched, setNewLegTouched] = useState(false);

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const currentTime = format(now, "HH:mm");

  const isDateTimeInPast = (date: string, time: string) => {
    if (!date || !time) return false;
    return new Date(`${date}T${time}`) < new Date();
  };

  const isEditLegValid =
    editingIndex !== null &&
    editLeg.pickup &&
    editLeg.dropoff &&
    editLeg.pickupDate &&
    editLeg.pickupTime &&
    !isDateTimeInPast(editLeg.pickupDate, editLeg.pickupTime);

  const handleStartEdit = (i: number) => {
    setEditingIndex(i);
    setEditLeg({ ...additionalLegs[i] });
  };

  const handleSaveEdit = () => {
    setEditLegTouched(true);
    if (editingIndex === null) return;
    if (!editLeg.pickup || !editLeg.dropoff || !editLeg.pickupDate || !editLeg.pickupTime || isDateTimeInPast(editLeg.pickupDate, editLeg.pickupTime)) return;
    onUpdateLeg(editingIndex, editLeg);
    setEditingIndex(null);
    setEditLegTouched(false);
  };

  const isNewLegValid =
    newLeg.pickup && newLeg.dropoff && newLeg.pickupDate && newLeg.pickupTime &&
    !isDateTimeInPast(newLeg.pickupDate, newLeg.pickupTime);

  const handleStartAdd = () => {
    setIsAddingLeg(true);
    setNewLeg({ pickup: "", dropoff: "", pickupDate: "", pickupTime: "" });
    setNewLegTouched(false);
  };

  const handleSaveAdd = () => {
    setNewLegTouched(true);
    if (!newLeg.pickup || !newLeg.dropoff || !newLeg.pickupDate || !newLeg.pickupTime || isDateTimeInPast(newLeg.pickupDate, newLeg.pickupTime)) return;
    onAddLeg(newLeg);
    setIsAddingLeg(false);
    setNewLegTouched(false);
  };

  const legsTotal = (legPrices || []).reduce((a, b) => a + b, 0);
  const fareTotal = basePrice + legsTotal;
  const durationLabel = formatDuration(durationMinutes);

  return (
    <div className="space-y-5">
      {/* Trip recap card */}
      <div className="rounded-2xl border border-border bg-card shadow-glass overflow-hidden">
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-display font-bold text-foreground">Your trip</h2>
              <p className="text-xs text-muted-foreground font-body mt-0.5">{additionalLegs.length > 0 ? `Journey 1 of ${additionalLegs.length + 1}` : "Journey 1"}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditDetails}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 gap-1 shrink-0"
            >
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          </div>

          {/* Route */}
          <RouteVisualization pickup={pickup} dropoff={dropoff} />

          <MapPreview pickup={pickup} dropoff={dropoff} className="w-full rounded-lg overflow-hidden" />

          {/* Trip details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-body">Date &amp; time</p>
                <p className="text-sm font-body text-foreground font-medium truncate">
                  {formatDateStr(pickupDate)} · {formatTimeStr(pickupTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Car className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-body">Service</p>
                <p className="text-sm font-body text-foreground font-medium capitalize">
                  {serviceName || `Business ${vehicleType === "suv" ? "SUV" : "Class"}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <RouteIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-body">Distance</p>
                <p className="text-sm font-body text-foreground font-medium">{distanceMiles.toFixed(1)} mi</p>
              </div>
            </div>
            {durationLabel && (
              <div className="flex items-start gap-2.5">
                <Gauge className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-body">Est. duration</p>
                  <p className="text-sm font-body text-foreground font-medium">{durationLabel}</p>
                </div>
              </div>
            )}
            {flightNumber && (
              <div className="flex items-start gap-2.5">
                <Plane className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-body">Flight</p>
                  <p className="text-sm font-body text-foreground font-medium">{flightNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle image */}
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border border-border p-3 flex items-center gap-3">
            {loading ? (
              <div className="h-16 w-24 shrink-0 animate-pulse bg-muted rounded-md" />
            ) : (
              <Image
                src={vehicleImage || (vehicleType === "suv" ? "/assets/suv-profile.png" : "/assets/sedan-profile.png")}
                alt={vehicleType === "suv" ? "Selected SUV" : "Selected sedan"}
                width={160}
                height={90}
                className="h-16 w-24 shrink-0 object-cover rounded-md border border-border"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-foreground">{serviceName || `Premium Business ${vehicleType === "suv" ? "SUV" : "Sedan"}`}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Comfort and privacy guaranteed</p>
            </div>
            <button
              type="button"
              onClick={onEditVehicle}
              className="ml-auto shrink-0 text-xs text-primary hover:underline font-body"
            >
              Change
            </button>
          </div>

          {specialRequests && (
            <div className="pt-1 border-t border-border">
              <p className="text-[11px] text-muted-foreground font-body mb-1 mt-3">Special requests</p>
              <p className="text-sm text-foreground font-body">{specialRequests}</p>
            </div>
          )}

          {bookingForSomeoneElse && guestFirstName && (
            <div className="pt-3 border-t border-border space-y-1.5">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <p className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wide">Booking for guest</p>
              </div>
              <p className="text-sm font-body text-foreground">{guestFirstName} {guestLastName}</p>
              {guestEmail && <p className="text-xs font-body text-muted-foreground">{guestEmail}</p>}
              {guestPhone && <p className="text-xs font-body text-muted-foreground">{guestPhone}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Additional legs */}
      <AnimatePresence>
        {(additionalLegs || []).map((leg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-border bg-card shadow-glass p-5 sm:p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{i + 2}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide">Journey {i + 2}</span>
              </div>
              <div className="flex items-center gap-1">
                {editingIndex !== i && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={legsLocked}
                    onClick={() => handleStartEdit(i)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 gap-1"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={legsLocked}
                  onClick={() => { onRemoveLeg(i); if (editingIndex === i) setEditingIndex(null); }}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 gap-1"
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
                  light
                />
                <LocationInput
                  label="Drop-off Location"
                  placeholder="e.g. The Ritz-Carlton"
                  value={editLeg.dropoff}
                  onChange={(val) => setEditLeg(l => ({ ...l, dropoff: val }))}
                  icon="dropoff"
                  light
                />
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    value={editLeg.pickupDate}
                    min={today}
                    onChange={(v) => setEditLeg(l => ({ ...l, pickupDate: v }))}
                    label="Date"
                    light
                  />
                  <Input
                    type="time"
                    min={editLeg.pickupDate === today ? currentTime : "00:00"}
                    value={editLeg.pickupTime}
                    onChange={(e) => setEditLeg(l => ({ ...l, pickupTime: e.target.value }))}
                    label="Time"
                  />
                </div>
                {editLegTouched && !isEditLegValid && (
                  <p role="alert" className="text-xs text-destructive">Please enter valid pickup, drop-off, date and time (not in the past).</p>
                )}
                <div className="mt-2">
                  <MapPreview pickup={editLeg.pickup} dropoff={editLeg.dropoff} />
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
                <div className="mt-3">
                  <MapPreview pickup={leg.pickup} dropoff={leg.dropoff} />
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
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

      {/* Add another journey */}
      <AnimatePresence mode="wait">
        {isAddingLeg ? (
          <motion.div
            key="add-leg-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-primary/30 bg-card shadow-glass p-5 sm:p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{additionalLegs.length + 2}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide">
                  New journey
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingLeg(false)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <X className="h-3 w-3" /> Cancel
              </Button>
            </div>
            <div className="grid gap-3">
              <LocationInput
                label="Pickup Location"
                placeholder="e.g. Reagan National Airport"
                value={newLeg.pickup}
                onChange={(val) => setNewLeg((l) => ({ ...l, pickup: val }))}
                icon="pickup"
                light
              />
              <LocationInput
                label="Drop-off Location"
                placeholder="e.g. The Ritz-Carlton"
                value={newLeg.dropoff}
                onChange={(val) => setNewLeg((l) => ({ ...l, dropoff: val }))}
                icon="dropoff"
                light
              />
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  value={newLeg.pickupDate}
                  min={today}
                  onChange={(v) => setNewLeg((l) => ({ ...l, pickupDate: v }))}
                  label="Date"
                  light
                />
                <Input
                  type="time"
                  min={newLeg.pickupDate === today ? currentTime : "00:00"}
                  value={newLeg.pickupTime}
                  onChange={(e) => setNewLeg((l) => ({ ...l, pickupTime: e.target.value }))}
                  label="Time"
                />
              </div>
              {newLegTouched && !isNewLegValid && (
                <p role="alert" className="text-xs text-destructive">Please enter valid pickup, drop-off, date and time (not in the past).</p>
              )}
              {newLeg.pickup && newLeg.dropoff && (
                <div className="mt-2">
                  <MapPreview pickup={newLeg.pickup} dropoff={newLeg.dropoff} />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddingLeg(false)} className="font-body">Cancel</Button>
                <Button variant="hero" size="sm" onClick={handleSaveAdd} disabled={!isNewLegValid} className="gap-1 font-body">
                  <Check className="h-3 w-3" /> Add journey
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="add-leg-button"
            type="button"
            onClick={handleStartAdd}
            disabled={legsLocked}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-card/50 hover:bg-primary/5 transition-colors p-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary font-body disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card/50"
          >
            <Plus className="h-4 w-4" /> {legsLocked ? "Updating trip…" : "Add another journey"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Price breakdown card */}
      <div className="rounded-2xl border border-border bg-card shadow-glass p-5 sm:p-6">
        <h2 className="text-base font-display font-bold text-foreground mb-4">Price breakdown</h2>
        {loading ? (
          // The caller (checkout/page.tsx) sets loading=true whenever the
          // authoritative price isn't ready yet AND there's nothing safe to
          // show in its place (not the labeled quoteError estimate) - a
          // skeleton here, not "$0.00", is what prevents a not-yet-verified
          // figure from ever being visible as though it were the real total.
          <div className="space-y-2.5" role="status" aria-label="Calculating price">
            <div className="h-4 w-32 animate-pulse bg-muted rounded" />
            <div className="h-8 w-40 animate-pulse bg-muted rounded mt-2" />
          </div>
        ) : (
          <>
            {isEstimate && (
              <p className="text-xs text-muted-foreground mb-2">
                Unconfirmed estimate — not payable until a confirmed price loads.
              </p>
            )}
            <dl className="space-y-2.5 text-sm font-body">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fare</dt>
                <dd className="text-foreground font-medium">${fareTotal.toFixed(2)}</dd>
              </div>
              {gratuity > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Gratuity</dt>
                  <dd className="text-foreground font-medium">${gratuity.toFixed(2)}</dd>
                </div>
              )}
            </dl>
            <div className="flex justify-between items-baseline pt-4 mt-4 border-t border-border">
              <dt className="text-foreground font-semibold">{isEstimate ? "Estimated total" : "Total due"}</dt>
              <dd className="text-primary font-display font-bold text-2xl">${Number(grandTotal || 0).toFixed(2)}</dd>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutSummary;
