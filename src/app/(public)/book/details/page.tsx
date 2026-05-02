"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, MessageSquare, ArrowRight, User, Users, Check, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui";
import { useBookingStore } from "@/hooks/useBookingStore";

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

  const handleSubmit = () => {
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
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Trip Details</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">Help your chauffeur prepare for the best experience</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-body text-foreground">Who is this booking for?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForSomeoneElse(false)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-body transition-all ${
                  !forSomeoneElse
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                <span>Book for myself</span>
              </button>
              <button
                type="button"
                onClick={() => setForSomeoneElse(true)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-body transition-all ${
                  forSomeoneElse
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>For someone else</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {forSomeoneElse && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                <p className="text-sm font-display font-semibold text-foreground">Guest Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="guestFirst" className="text-xs font-body text-muted-foreground">
                      First Name *
                    </Label>
                    <Input
                      id="guestFirst"
                      placeholder="First name"
                      value={guestFirstName}
                      onChange={(e) => setGuestFirstName(e.target.value)}
                      maxLength={50}
                      className="bg-secondary border-border font-body"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guestLast" className="text-xs font-body text-muted-foreground">
                      Last Name *
                    </Label>
                    <Input
                      id="guestLast"
                      placeholder="Last name"
                      value={guestLastName}
                      onChange={(e) => setGuestLastName(e.target.value)}
                      maxLength={50}
                      className="bg-secondary border-border font-body"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guestEmail" className="text-xs font-body text-muted-foreground">
                    Guest Email *
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="guest@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    maxLength={100}
                    className="bg-secondary border-border font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guestPhone" className="text-xs font-body text-muted-foreground">
                    Guest Phone *
                  </Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    maxLength={20}
                    className="bg-secondary border-border font-body"
                  />
                  <p className="text-[11px] text-muted-foreground font-body">The chauffeur may contact this number for pickup coordination</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {data.isPickupAirport && (
            <div className="space-y-2">
              <Label htmlFor="flight" className="text-sm font-body text-foreground flex items-center gap-2">
                <Plane className="h-4 w-4 text-primary" />
                Flight Number
              </Label>
              <Input
                id="flight"
                placeholder="e.g. UA 1234"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                maxLength={12}
                className="bg-secondary border-border font-body"
              />
              <p className="text-[11px] text-muted-foreground font-body">We'll monitor your flight and adjust pickup time for delays</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-body text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Special Requests
            </Label>
            <Textarea
              id="notes"
              placeholder="Child seat needed, extra stop, specific entrance, etc."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              maxLength={500}
              rows={3}
              className="bg-secondary border-border font-body resize-none"
            />
            <p className="text-[11px] text-muted-foreground font-body text-right">{specialRequests.length}/500</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => router.push("/book")} className="font-body">
              Back
            </Button>
            <Button variant="hero" onClick={handleSubmit} className="flex-1 gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
    </>
  );
}
