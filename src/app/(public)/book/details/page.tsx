"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MessageSquare, ArrowRight, User, Users, Check, Phone, ArrowLeft, MapPin, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui";
import { useBookingStore } from "@/hooks/useBookingStore";
import { format } from "date-fns";
import { notify } from "@/lib/notify";

const STEPS = ["Service Class", "Pickup Info", "Log In", "Payment", "Checkout"] as const;

export default function BookingDetailsPage() {
  const router = useRouter();
  const { data, update } = useBookingStore();

  // Redirect if no vehicle selected
  useEffect(() => {
    if (!data.pickup || !data.dropoff || !data.selectedVehicle) {
      router.push("/book");
    }
  }, [data.pickup, data.dropoff, data.selectedVehicle, router]);

  if (!data.pickup || !data.dropoff || !data.selectedVehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const [flightNumber, setFlightNumber] = useState(data.flightNumber);
  const [specialRequests, setSpecialRequests] = useState(data.specialRequests);
  const [forSomeoneElse, setForSomeoneElse] = useState(data.bookingForSomeoneElse);
  const [guestFirstName, setGuestFirstName] = useState(data.guestFirstName);
  const [guestLastName, setGuestLastName] = useState(data.guestLastName);
  const [guestEmail, setGuestEmail] = useState(data.guestEmail);
  const [guestPhone, setGuestPhone] = useState(data.guestPhone);

  const currentStep = 1;

  const formattedDate = data.pickupDate ? format(new Date(data.pickupDate + "T00:00:00"), "EEE, MMM d, yyyy") : null;
  const formattedTime = data.pickupTime ? format(new Date(`2000-01-01T${data.pickupTime}`), "h:mm a") : null;

  const handleSubmit = () => {
    // Validation
    if (forSomeoneElse) {
      if (!guestFirstName.trim() || !guestLastName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
        notify.error("Please fill in all guest information fields");
        return;
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        notify.error("Please enter a valid email address");
        return;
      }
    }

    if (data.isPickupAirport && flightNumber && flightNumber.length < 2) {
      notify.error("Please enter a valid flight number");
      return;
    }

    update({
      flightNumber,
      specialRequests,
      bookingForSomeoneElse: forSomeoneElse,
      guestFirstName: forSomeoneElse ? guestFirstName : "",
      guestLastName: forSomeoneElse ? guestLastName : "",
      guestEmail: forSomeoneElse ? guestEmail : "",
      guestPhone: forSomeoneElse ? guestPhone : "",
    });
    router.push("/book/login");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Trip Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-glass hover:shadow-blue transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground font-body mb-1">Your Trip</p>
            <h3 className="text-sm sm:text-base font-display font-semibold text-foreground capitalize">
              {data.selectedVehicle === "sedan" ? "Business Class Sedan" : "Business SUV"}
            </h3>
          </div>
          <Link href="/book">
            <button className="p-2 rounded-lg glass-card hover:shadow-blue transition-all duration-300 group hover:scale-105">
              <ArrowLeft className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
          </Link>
        </div>
        
        <div className="space-y-2 text-xs sm:text-sm font-body">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Pickup</p>
              <p className="text-foreground truncate">{data.pickup}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Dropoff</p>
              <p className="text-foreground truncate">{data.dropoff}</p>
            </div>
          </div>
          {formattedDate && formattedTime && (
            <div className="flex items-center gap-2 pt-1">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <p className="text-foreground">{formattedDate} at {formattedTime}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6 sm:p-8 mb-24 shadow-glass"
      >
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Trip Details</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">Help your chauffeur prepare for the best experience</p>
        </div>

        <div className="space-y-6">
          {/* Who is this for */}
          <div className="space-y-3">
            <Label className="text-sm font-body text-foreground font-semibold">Who is this booking for?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForSomeoneElse(false)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-body transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  !forSomeoneElse
                    ? "border-primary bg-blue-gradient text-white shadow-blue"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:shadow-glass"
                }`}
              >
                <User className="h-5 w-5 shrink-0" />
                <span className="font-semibold">For myself</span>
              </button>
              <button
                type="button"
                onClick={() => setForSomeoneElse(true)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-body transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  forSomeoneElse
                    ? "border-primary bg-blue-gradient text-white shadow-blue"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:shadow-glass"
                }`}
              >
                <Users className="h-5 w-5 shrink-0" />
                <span className="font-semibold">Someone else</span>
              </button>
            </div>
          </div>

          {/* Guest Information */}
          <AnimatePresence>
            {forSomeoneElse && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }} 
                className="space-y-4 overflow-hidden glass-card rounded-xl p-4 sm:p-5 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-sm font-display font-semibold text-foreground">Guest Information</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestFirst" className="text-xs font-body text-muted-foreground font-semibold">
                      First Name *
                    </Label>
                    <Input
                      id="guestFirst"
                      placeholder="John"
                      value={guestFirstName}
                      onChange={(e) => setGuestFirstName(e.target.value)}
                      maxLength={50}
                      className="bg-background border-border font-body h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestLast" className="text-xs font-body text-muted-foreground font-semibold">
                      Last Name *
                    </Label>
                    <Input
                      id="guestLast"
                      placeholder="Doe"
                      value={guestLastName}
                      onChange={(e) => setGuestLastName(e.target.value)}
                      maxLength={50}
                      className="bg-background border-border font-body h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail" className="text-xs font-body text-muted-foreground font-semibold">
                    Guest Email *
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="guest@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    maxLength={100}
                    className="bg-background border-border font-body h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPhone" className="text-xs font-body text-muted-foreground font-semibold">
                    Guest Phone *
                  </Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    maxLength={20}
                    className="bg-background border-border font-body h-11"
                  />
                  <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    The chauffeur may contact this number for pickup coordination
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flight Number */}
          {data.isPickupAirport && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 glass-card rounded-xl p-4 sm:p-5 border border-primary/20"
            >
              <Label htmlFor="flight" className="text-sm font-body text-foreground font-semibold flex items-center gap-2">
                <Plane className="h-4 w-4 text-primary" />
                Flight Number {data.isPickupAirport ? "(Optional)" : ""}
              </Label>
              <Input
                id="flight"
                placeholder="e.g. UA 1234, AA 567"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                maxLength={12}
                className="bg-background border-border font-body h-11"
              />
              <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground font-body">
                  We'll monitor your flight and adjust pickup time automatically for delays
                </p>
              </div>
            </motion.div>
          )}

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-body text-foreground font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Special Requests (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Child seat needed, extra stop, specific entrance, luggage assistance, etc."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              maxLength={500}
              rows={4}
              className="bg-background border-border font-body resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-body">Let us know how we can make your trip perfect</p>
              <p className="text-[11px] text-muted-foreground font-body font-mono">{specialRequests.length}/500</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-primary/20 z-40 shadow-glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/book")} 
            className="font-body gap-2 hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 sm:flex-initial gap-2 px-8 sm:px-12 bg-blue-gradient shadow-blue hover:scale-105 transition-all duration-300"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
