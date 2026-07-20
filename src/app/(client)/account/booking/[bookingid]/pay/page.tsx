"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Calendar, Car, MapPin, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { bookingService } from "@/lib/services";
import { chargeBooking } from "@/lib/cloverCharge";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import CloverPayment from "@/components/booking/CloverPayment";
import type { Booking } from "@/types";

const CHARGE_TIMEOUT_MS = 30_000;
const PAYMENT_VERIFICATION_POLL_INTERVAL_MS = 3_000;
const PAYMENT_VERIFICATION_TIMEOUT_MS = 2 * 60_000;

// Polls the booking's own paymentStatus until it resolves or the window
// runs out - see checkout/page.tsx's identical helper for the full incident
// context (a 500 or timeout on the charge call does not mean no charge, it
// means this request didn't complete cleanly; the true state has to be
// checked, not assumed).
async function pollPaymentStatus(bookingId: string): Promise<"paid" | "failed" | "indeterminate"> {
  const deadline = Date.now() + PAYMENT_VERIFICATION_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const b = await bookingService.getById(bookingId);
      if (b.paymentStatus === "paid") return "paid";
      if (b.paymentStatus === "failed") return "failed";
    } catch {
      // Transient - keep polling until the deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, PAYMENT_VERIFICATION_POLL_INTERVAL_MS));
  }
  return "indeterminate";
}

function formatDate(d: string) {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  } catch {
    return d;
  }
}

// Resumes payment for an EXISTING booking by id, rather than creating a new
// one. Deliberately a separate page from /book/checkout (which drives trip
// details from useBookingStore's client-side draft) - that page has no
// concept of "load an already-created booking's fixed details", and
// retrofitting a dual-mode branch into it risked regressing the working
// fresh-checkout flow. This page is intentionally simpler: no trip editing,
// no multi-leg support - it only pays the exact amount the server already
// has on file for this booking.
export default function ResumeBookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const bookingId = params.bookingid as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentVerification, setPaymentVerification] = useState<"idle" | "verifying" | "indeterminate">("idle");
  // Populated when the backend refuses to charge because the total shown
  // here no longer matches its fresh, authoritative recomputation - see
  // checkout/page.tsx's identical mechanism for the full reasoning.
  const [priceMismatch, setPriceMismatch] = useState<{
    token: string;
    authoritativeAmount: number;
    authoritativeAmountCents: number;
    legs: { legOrder: number | null; pickupLocation: string; dropoffLocation: string; totalPrice: number }[];
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await bookingService.getById(bookingId);

      // Reject if already paid - confirmation stays unavailable until paid,
      // but if it's already paid there's nothing left to pay for.
      if (data.paymentStatus === "paid") {
        notify.success("This booking is already paid.");
        router.push(`/booking-confirmed?reservation=${data.reservationNumber}&booking_id=${data.id}`);
        return;
      }

      // Reject if cancelled - a cancelled booking can't be paid regardless
      // of its prior payment state.
      if (data.status === "cancelled") {
        setLoadError("This booking has been cancelled and can no longer be paid.");
        setLoading(false);
        return;
      }

      // A multi-leg trip is paid as a whole, against the primary (legOrder 1)
      // leg's id - if a secondary leg's id was loaded (e.g. from a link to
      // that specific leg's detail page), redirect to the primary's pay page
      // rather than trying to charge a leg that was never meant to be billed
      // individually.
      if (data.tripGroupId && (data.legOrder ?? 1) !== 1) {
        const primaryLeg = data.legs?.find((leg) => (leg.legOrder ?? 1) === 1);
        if (primaryLeg && primaryLeg.id !== data.id) {
          router.replace(`/account/booking/${primaryLeg.id}/pay`);
          return;
        }
      }

      setBooking(data);
    } catch (err: any) {
      // The backend enforces ownership (403) and existence (404) - surface
      // both as the same generic message rather than distinguishing them,
      // so this can't be used to probe which booking ids exist.
      setLoadError("This reservation could not be found or you don't have access to it.");
    } finally {
      setLoading(false);
    }
  };

  const attemptCharge = async (token: string, expectedAmountCents: number) => {
    if (!booking) return;
    setPaymentProcessing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHARGE_TIMEOUT_MS);
    try {
      const chargeResult = await chargeBooking(booking.id, token, expectedAmountCents, controller.signal);

      // The backend refused to charge because the total shown here no
      // longer matches its fresh authoritative recomputation. Nothing was
      // charged and no payment row was created - the customer must
      // explicitly review the new breakdown before paying.
      if (chargeResult.kind === "mismatch") {
        setPriceMismatch({
          token: chargeResult.token,
          authoritativeAmount: chargeResult.authoritativeAmount,
          authoritativeAmountCents: chargeResult.authoritativeAmountCents,
          legs: chargeResult.legs,
        });
        return;
      }

      // A clean 402 (Clover's own decline) is the only response that
      // definitely means "no charge, safe to retry" - see cloverCharge.ts
      // for the full reasoning. Everything else is ambiguous and must be
      // verified, not assumed failed.
      if (chargeResult.kind === "decline") {
        // errorData.error is always the literal string "Payment failed" -
        // the actual decline reason lives in `details`. See cloverCharge.ts
        // for the full explanation.
        throw new Error(chargeResult.message);
      }

      if (chargeResult.kind === "ambiguous") {
        console.error("Ambiguous charge response - verifying via poll instead of assuming failure", {
          status: chargeResult.status,
          code: chargeResult.code,
        });
        setPaymentVerification("verifying");
        const outcome = await pollPaymentStatus(booking.id);
        if (outcome === "paid") {
          notify.success("Payment verified! Your booking is confirmed.");
          router.push(`/booking-confirmed?booking_id=${booking.id}`);
          return;
        }
        if (outcome === "failed") {
          setPaymentVerification("idle");
          notify.error("Payment was not completed. Please try again.");
          return;
        }
        setPaymentVerification("indeterminate");
        return;
      }

      // chargeResult.kind === "success"
      notify.success("Payment successful! Your booking is confirmed.");
      router.push(`/booking-confirmed?reservation=${chargeResult.reservationNumber}&booking_id=${booking.id}`);
    } catch (err) {
      console.error("Resume payment error:", err);
      if (controller.signal.aborted) {
        setPaymentVerification("verifying");
        const outcome = await pollPaymentStatus(booking.id);
        if (outcome === "paid") {
          notify.success("Payment verified! Your booking is confirmed.");
          router.push(`/booking-confirmed?booking_id=${booking.id}`);
        } else if (outcome === "failed") {
          setPaymentVerification("idle");
          notify.error("Payment was not completed. Please try again.");
        } else {
          setPaymentVerification("indeterminate");
        }
      } else {
        notify.error(err instanceof Error ? err.message : "Payment failed. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setPaymentProcessing(false);
    }
  };

  const handlePaymentSuccess = (token: string) => {
    if (!booking) return;
    const expectedAmountCents = Math.round(Number(booking.groupTotalPrice ?? booking.totalPrice ?? 0) * 100);
    attemptCharge(token, expectedAmountCents);
  };

  // Customer reviewed the revised breakdown and chose to pay the new
  // authoritative amount - reuse the already-validated Clover token so they
  // don't have to re-enter card details.
  const handleConfirmMismatchedPayment = () => {
    if (!priceMismatch) return;
    const { token, authoritativeAmountCents } = priceMismatch;
    setPriceMismatch(null);
    attemptCharge(token, authoritativeAmountCents);
  };

  const handleDismissMismatch = () => setPriceMismatch(null);

  const handlePaymentError = (error: string) => notify.error(error);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin motion-reduce:animate-none" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-foreground font-body">{loadError || "Unable to load this reservation."}</p>
          <Button variant="outline" onClick={() => router.push("/account")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to account
          </Button>
        </div>
      </div>
    );
  }

  // groupTotalPrice is the authoritative combined total for the whole trip
  // (identical to totalPrice for a single-leg booking) - this is exactly the
  // amount the backend will charge, so it must be what's displayed here too.
  const amount = Number(booking.groupTotalPrice ?? booking.totalPrice ?? 0);
  const legs = booking.legs && booking.legs.length > 1 ? booking.legs : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/[0.02]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-16">
        <Button variant="ghost" onClick={() => router.push(`/account/booking/${booking.id}`)} className="gap-2 mb-6 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to booking
        </Button>

        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Complete payment</h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Reservation #{booking.reservationNumber} — your booking is confirmed only after payment is completed below.
          </p>
        </header>

        <div className="space-y-5">
          {/* Fixed trip recap - no editing here, this is an existing booking's
              details as recorded server-side, not an in-progress draft. */}
          <div className="rounded-2xl border border-border bg-card shadow-glass p-5 sm:p-6 space-y-3">
            <h2 className="text-base font-display font-bold text-foreground mb-2">
              {legs ? `Your trip (${legs.length} journeys)` : "Your trip"}
            </h2>

            {legs ? (
              <div className="space-y-4">
                {legs.map((leg, i) => (
                  <div key={leg.id} className={i > 0 ? "pt-3 border-t border-border/60" : ""}>
                    <p className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide mb-1.5">
                      Journey {i + 1}
                    </p>
                    <div className="flex items-start gap-2.5 mb-1.5">
                      <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-sm font-body text-foreground">
                        {formatDate(leg.pickupDate)} · {leg.pickupTime?.slice(0, 5)}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0 text-sm font-body text-foreground">
                        <p className="truncate">{leg.pickupLocation}</p>
                        <p className="truncate text-muted-foreground">→ {leg.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-2.5 pt-3 border-t border-border/60">
                  <Car className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm font-body text-foreground capitalize">
                    Business {booking.vehicleType === "suv" ? "SUV" : "Class"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm font-body text-foreground">
                    {formatDate(booking.pickupDate)} · {booking.pickupTime?.slice(0, 5)}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0 text-sm font-body text-foreground">
                    <p className="truncate">{booking.pickupLocation}</p>
                    <p className="truncate text-muted-foreground">→ {booking.dropoffLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Car className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm font-body text-foreground capitalize">
                    Business {booking.vehicleType === "suv" ? "SUV" : "Class"}
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-border">
              <span className="text-foreground font-semibold text-sm">Total due</span>
              <span className="text-primary font-display font-bold text-xl">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment card */}
          <div className="rounded-2xl border border-border bg-card shadow-glass p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="text-base font-display font-bold text-foreground">Secure payment</h2>
            </div>
            <p className="text-xs text-muted-foreground font-body mb-5">
              Enter your card details below to confirm and reserve your ride.
            </p>

            {booking.paymentStatus === "failed" && booking.paymentFailureReason && paymentVerification === "idle" && (
              <div role="alert" className="flex gap-3 p-4 mb-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Your last payment attempt didn&apos;t go through</p>
                  <p className="mt-0.5">{booking.paymentFailureReason}</p>
                </div>
              </div>
            )}

            {paymentVerification === "verifying" && (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground py-8 justify-center text-center" role="status" aria-live="polite">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
                <p className="font-medium text-foreground">Verifying payment…</p>
                <p className="text-xs max-w-xs">
                  Your last attempt didn&apos;t confirm right away. We&apos;re checking whether it went through - do not close this page or submit another payment.
                </p>
              </div>
            )}

            {paymentVerification === "indeterminate" && (
              <div role="alert" className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">We couldn&apos;t confirm your payment status</p>
                  <p className="mt-1">
                    Do not submit another payment for this ride. Check your{" "}
                    <button type="button" onClick={() => router.push("/account")} className="underline font-medium">
                      account
                    </button>{" "}
                    in a few minutes, or contact support if it doesn&apos;t update.
                  </p>
                </div>
              </div>
            )}

            {priceMismatch && (
              <div role="alert" className="space-y-3">
                <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-sm text-amber-800 dark:text-amber-200 flex-1">
                    <p className="font-medium">Your total has changed</p>
                    <p className="mt-1">
                      The price for this trip was updated since you loaded this page. Your card has not been
                      charged. Please review the new total before paying.
                    </p>
                    <ul className="mt-3 space-y-1">
                      {priceMismatch.legs.map((leg, i) => (
                        <li key={leg.legOrder ?? i} className="flex justify-between gap-4">
                          <span>
                            Journey {leg.legOrder ?? i + 1}: {leg.pickupLocation} → {leg.dropoffLocation}
                          </span>
                          <span className="font-medium">${leg.totalPrice.toFixed(2)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-4 font-semibold border-t border-amber-200 dark:border-amber-900 pt-1 mt-1">
                        <span>New total</span>
                        <span>${priceMismatch.authoritativeAmount.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDismissMismatch} disabled={paymentProcessing} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmMismatchedPayment} disabled={paymentProcessing} className="flex-1">
                    Pay ${priceMismatch.authoritativeAmount.toFixed(2)}
                  </Button>
                </div>
              </div>
            )}

            {paymentVerification === "idle" && !priceMismatch && (
              <CloverPayment
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isProcessing={paymentProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
