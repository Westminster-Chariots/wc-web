"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Car, Plane, Clock, Shield, Pencil, Plus, Trash2, Route, Check, Users, CreditCard, Calendar, Map, Package, Star, ChevronRight, X, Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/FormInputs";
import { format } from "date-fns";
import type { TripLeg } from "@/hooks/useBookingStore";
import LocationInput from "@/components/booking/LocationInput";
import Image from "next/image";

interface EnhancedCheckoutSummaryProps {
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

const EnhancedCheckoutSummary = ({
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  vehicleType,
  basePrice,
  tax,
  total,
  distanceMiles,
  durationMinutes,
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
}: EnhancedCheckoutSummaryProps) => {
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

  const vehicleImage = vehicleType === "sedan" ? "/assets/sedan-profile.png" : "/assets/suv-profile.png";
  const vehicleName = vehicleType === "sedan" ? "Business Class" : "Business SUV";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Complete Your Booking
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground font-body mt-2">
          Review your trip details and submit your request
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trip Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Card */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Your Vehicle</h3>
                  <p className="text-sm text-muted-foreground font-body">Premium chauffeur service</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onEditVehicle} className="gap-2">
                <Edit3 className="h-3.5 w-3.5" /> Change
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-full sm:w-48 h-40 rounded-xl overflow-hidden border border-border/30">
                <Image src={vehicleImage} alt={vehicleName} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded-full">
                    {vehicleName}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-base font-display font-semibold text-foreground">{vehicleName}</h4>
                  <p className="text-sm text-muted-foreground font-body">
                    {vehicleType === "sedan" ? "Mercedes-Benz S-Class or similar" : "Mercedes-Benz GLS or similar"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-body">
                      {vehicleType === "sedan" ? "3 passengers" : "5 passengers"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-body">
                      {vehicleType === "sedan" ? "2 luggage" : "5 luggage"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-body text-muted-foreground">Vehicle fare</span>
                    <span className="text-lg font-display font-bold text-foreground">${basePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Route Card */}
          <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Map className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Primary Route</h3>
                  <p className="text-sm text-muted-foreground font-body">Main trip details</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onEditDetails} className="gap-2">
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Pickup</p>
                  <p className="text-base font-body text-foreground">{pickup}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ChevronRight className="h-5 w-5 text-muted-foreground rotate-90 sm:rotate-0" />
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Drop-off</p>
                  <p className="text-base font-body text-foreground">{dropoff}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Date & Time</p>
                    <p className="text-sm font-body text-foreground">
                      {formatDateStr(pickupDate)} at {formatTimeStr(pickupTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Distance & Duration</p>
                    <p className="text-sm font-body text-foreground">
                      {distanceMiles.toFixed(1)} miles • {durationMinutes} min
                    </p>
                  </div>
                </div>
              </div>

              {flightNumber && (
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className="h-8 w-8 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Plane className="h-4 w-4 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Flight Information</p>
                    <p className="text-sm font-body text-foreground">{flightNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Routes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">Additional Routes</h3>
              <span className="text-sm text-muted-foreground font-body">
                {additionalLegs.length} route{additionalLegs.length !== 1 ? "s" : ""} added
              </span>
            </div>

            <AnimatePresence>
              {additionalLegs.map((leg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-border/50 bg-card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{i + 2}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">Route {i + 2}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingIndex !== i && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(i)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { onRemoveLeg(i); if (editingIndex === i) setEditingIndex(null); }}
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </div>

                  {editingIndex === i ? (
                    <div className="space-y-3">
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
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                          <Input
                            type="date"
                            min={today}
                            value={editLeg.pickupDate}
                            onChange={(e) => setEditLeg(l => ({ ...l, pickupDate: e.target.value }))}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                          <Input
                            type="time"
                            min={editLeg.pickupDate === today ? currentTime : "00:00"}
                            value={editLeg.pickupTime}
                            onChange={(e) => setEditLeg(l => ({ ...l, pickupTime: e.target.value }))}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingIndex(null)}>
                          Cancel
                        </Button>
                        <Button variant="hero" size="sm" onClick={handleSaveEdit} disabled={!isEditLegValid} className="gap-1">
                          <Save className="h-3.5 w-3.5" /> Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-body text-foreground">{leg.pickup}</p>
                          <p className="text-xs text-muted-foreground">→ {leg.dropoff}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-body">
                          {formatDateStr(leg.pickupDate)} at {formatTimeStr(leg.pickupTime)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border/30">
                        <span className="text-muted-foreground">Estimated fare</span>
                        <span className="font-semibold text-foreground">${legPrices[i]?.toFixed(2) ?? "—"}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Route Button/Form */}
            {/* {!showAddForm ? (
              <Button
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5 gap-2 h-12"
              >
                <Plus className="h-5 w-5" />
                <Route className="h-5 w-5" />
                Add Another Route
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">New Route Details</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="h-7 px-2">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-3">
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
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                      <Input
                        type="date"
                        min={today}
                        value={newLeg.pickupDate}
                        onChange={(e) => setNewLeg(l => ({ ...l, pickupDate: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                      <Input
                        type="time"
                        min={newLeg.pickupDate === today ? currentTime : "00:00"}
                        value={newLeg.pickupTime}
                        onChange={(e) => setNewLeg(l => ({ ...l, pickupTime: e.target.value }))}
                        className="h-9"
                      />
                    </div>
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
            )} */}
          </div>
        </div>

        {/* Right Column: Price Summary & Actions */}
        <div className="space-y-6">
          {/* Price Summary Card */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/90 p-5 sm:p-6 shadow-lg">
            <h3 className="text-lg font-display font-bold text-foreground mb-4">Price Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Primary route ({distanceMiles.toFixed(1)} mi)</span>
                <span className="font-semibold text-foreground">${basePrice.toFixed(2)}</span>
              </div>
              
              {additionalLegs.map((_, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Route {i + 2}</span>
                  <span className="font-semibold text-foreground">${legPrices[i]?.toFixed(2) ?? "—"}</span>
                </div>
              ))}
              
              <div className="pt-3 border-t border-border/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (20%)</span>
                  <span className="font-semibold text-foreground">${totalTax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-base font-display font-bold text-foreground">Total Amount</span>
                  <span className="text-2xl font-display font-bold text-primary">${grandTotalWithTax.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">All prices include fees, tolls, and taxes</p>
              </div>
            </div>
          </div>

          {/* Security & Payment Info */}
          <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Secure Booking</h4>
                <p className="text-xs text-muted-foreground">Your payment information is protected</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Payment Process</h4>
                <p className="text-xs text-muted-foreground">Pay after availability is confirmed</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Once availability is confirmed by our dispatch team, you will receive a secure payment link to complete your booking.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="hero"
              onClick={onPay}
              disabled={loading}
              className="w-full h-12 gap-2 text-base"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  Submit Booking Request
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full h-11"
            >
              Back to Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedCheckoutSummary;