"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";

interface BookingDetails {
  id: string;
  reservationNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType: string;
  totalPrice: string;
  clientName: string;
  clientEmail: string;
  status: string;
}

function BookingConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const reservationNumber = searchParams.get("reservation");
  const bookingId = searchParams.get("booking_id");

  useEffect(() => {
    if (!reservationNumber && !bookingId) {
      router.push("/");
      return;
    }

    // Fetch booking details
    const fetchBooking = async () => {
      try {
        if (bookingId) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/${bookingId}`,
            {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setBooking(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [reservationNumber, bookingId, router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md gradient-gold flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-primary-foreground font-display">W</span>
            </div>
            <span className="text-xs sm:text-sm font-display font-semibold text-foreground hidden sm:inline">Westminster Chariots</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground font-body mt-4">Loading booking details...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Success Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-primary" />
              </motion.div>
            </div>

            {/* Main Message */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Booking Submitted!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-body">
                Your ride request has been received. Our admin team will review availability and send you a payment link shortly.
              </p>
            </div>

            {/* Reservation Details */}
            {booking ? (
              <>
                <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                  <div className="pb-6 border-b border-border">
                    <p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-2">
                      Reservation Number
                    </p>
                    <p className="text-2xl font-display font-bold text-primary">{booking.reservationNumber}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="font-body text-sm">
                        <p className="text-foreground">{booking.pickupLocation}</p>
                        <p className="text-muted-foreground text-xs mt-1">→ {booking.dropoffLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary shrink-0" />
                      <div className="font-body text-sm text-foreground">
                        {new Date(`${booking.pickupDate}T00:00:00`).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at {booking.pickupTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 flex items-center justify-center text-primary shrink-0">
                        🚗
                      </div>
                      <div className="font-body text-sm text-foreground capitalize">
                        Business {booking.vehicleType === "suv" ? "SUV" : "Class"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="font-body text-sm text-muted-foreground">Estimated Total</span>
                      <span className="font-display font-bold text-lg text-primary">
                        ${parseFloat(booking.totalPrice || "0").toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                    Contact Information
                  </p>
                  <div className="flex items-center gap-3 text-sm font-body">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground">{booking.clientEmail}</span>
                  </div>
                  {booking.clientName && (
                    <div className="text-sm font-body text-foreground">
                      Booking for:{" "}
                      <span className="font-semibold">{booking.clientName}</span>
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {/* Info Box */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
              <p className="text-sm font-body text-foreground font-semibold">What happens next?</p>
              <ul className="space-y-2 text-xs font-body text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Our admin team reviews your request for availability</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>You'll receive a confirmation email with payment details</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Complete payment to secure your ride</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="font-body"
              >
                Back to Home
              </Button>
              <Button
                variant="hero"
                onClick={() => router.push("/account")}
                className="font-body gap-2"
              >
                View Your Bookings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Support */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground font-body mb-2">
                Questions? Contact our support team
              </p>
              <a
                href="tel:+15714351832"
                className="inline-flex items-center gap-2 text-sm font-body font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Phone className="h-4 w-4" />
                (571) 435-1832
              </a>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function BookingConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground font-body mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingConfirmedContent />
    </Suspense>
  );
}
