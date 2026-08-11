"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Plane, Car, User, DollarSign, FileText, Loader2, Mail, CheckCircle2, Circle, Send, CreditCard, AlertTriangle, ChevronDown, XCircle, RotateCw } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import PageTransition from "@/components/ui/PageTransition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import PaymentConfirmDialog from "@/components/booking/PaymentConfirmDialog";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useDrivers } from "@/hooks/useDrivers";
import { usePaymentEmailStatus, useResendPaymentEmails } from "@/hooks/useApi";
import { bookingService } from "@/lib/services";
import type { PaymentEmailState } from "@/lib/services";
import { formatDurationMinutes } from "@/lib/hourlyDuration";
import { toast } from "sonner";

// Renders the single status enum the /email-status endpoint returns for one
// email - deliberately trusts only this field, never independently deriving
// "sent" or "failed" from other data, so the UI structurally cannot show two
// contradictory states for the same email.
const PaymentEmailRow = ({ label, state }: { label: string; state?: PaymentEmailState }) => {
  if (!state) {
    return (
      <div className="flex items-start gap-2.5 py-2">
        <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin mt-0.5 shrink-0" />
        <p className="text-xs font-body text-muted-foreground">{label}</p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-border/60 last:border-b-0">
      {state.status === "sent" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />}
      {state.status === "failed" && <XCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 shrink-0" />}
      {state.status === "not_sent" && <Circle className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />}
      <div className="text-xs font-body">
        <p className="text-foreground font-semibold">
          {label}: {state.status === "sent" ? "Sent" : state.status === "failed" ? "Failed" : "Not sent"}
        </p>
        {state.status === "sent" && state.timestamp && (
          <p className="text-muted-foreground mt-0.5">{new Date(state.timestamp).toLocaleString()}</p>
        )}
        {state.status === "failed" && (
          <p className="text-muted-foreground mt-0.5">
            {state.timestamp ? `${new Date(state.timestamp).toLocaleString()} — ` : ""}
            {state.description || "Email provider rejected the request."}
          </p>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
    <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
    <div>
      <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">{label}</p>
      <p className="text-sm text-foreground font-body mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { bookings, loading, updateStatus, assignDriver } = useAdminBookings();
  const { drivers } = useDrivers();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showLegacyPaymentLink, setShowLegacyPaymentLink] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState(false);

  const booking = bookings.find((b) => b.id === id);
  // Fetched independently of the main booking list - mirrors how
  // /resend-emails is already a separate on-demand admin action, not part of
  // the bulk bookings payload.
  const { data: emailStatus } = usePaymentEmailStatus(booking?.paymentStatus === "paid" ? id : "");
  const resendPaymentEmails = useResendPaymentEmails();

  const handleConfirmResend = () => {
    setShowResendConfirm(false);
    resendPaymentEmails.mutate(id);
  };

  // Find sibling legs if part of a group
  const groupLegs = booking?.groupId
    ? bookings.filter((b) => b.groupId === booking.groupId).sort((a, b) => (a.legOrder ?? 1) - (b.legOrder ?? 1))
    : [];

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (!booking) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <p className="text-lg text-muted-foreground font-body">Booking not found</p>
          <button onClick={() => router.push("/admin")} className="mt-4 text-primary underline text-sm font-body">
            Back to Dashboard
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Booking #{booking.reservationNumber}
            </h2>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {booking.pickupDate} · {booking.pickupTime}
            </p>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-3xl space-y-6">
          {/* Status & Actions */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border glass p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <StatusBadge status={booking.status} />
              {booking.groupId && (
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                  Leg {booking.legOrder ?? 1} · {booking.groupId}
                </span>
              )}
            </div>

            {/* Driver Assignment */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground font-body">Driver:</span>
              {booking.status !== "done" && booking.status !== "cancelled" ? (
                <Select
                  value={booking.driverId || "unassigned"}
                  onValueChange={(val) => {
                    const driverId = val === "unassigned" ? null : val;
                    assignDriver(booking.id, driverId);
                    const name = drivers.find((d) => d.id === val)?.name || "Unassigned";
                    toast.success(`Driver updated to ${name}`);
                  }}
                >
                  <SelectTrigger className="h-8 w-[180px] text-xs border-border bg-secondary font-body">
                    <User className="h-3 w-3 text-primary mr-1 shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border-border">
                    <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm text-foreground font-body">{booking.driver || "Unassigned"}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Send Manifest button - only show when driver is assigned */}
              {booking.driverId && booking.status !== "done" && booking.status !== "cancelled" && (
                <Button
                  onClick={async () => {
                    try {
                      await bookingService.sendManifest(booking.id);
                      toast.success("Manifest sent to driver");
                      window.location.reload();
                    } catch (error) {
                      toast.error("Failed to send manifest");
                    }
                  }}
                  variant="outline"
                  className="w-full gap-2"
                  size="sm"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {booking.emailPhase === "manifest_sent" ? "Resend Manifest" : "Send Manifest to Driver"}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Payment - the payments table is the sole source of truth here, never
              emailPhase. A paid booking shows a clean confirmation with no
              payment-link action at all; an unpaid one shows its real status
              plus a clearly-labeled, opt-in legacy fallback rather than a
              default "Send Payment Link" button that bypassed the payments
              table entirely. */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }} className="rounded-lg border border-border glass p-5">
            <h3 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment
            </h3>
            {booking.paymentStatus === "paid" ? (
              <div className="flex items-start gap-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs font-body">
                  <p className="text-foreground font-semibold">Paid via {booking.paymentMethod === "clover" ? "Clover" : booking.paymentMethod || "card"}</p>
                  {booking.cloverPaymentId && (
                    <p className="text-muted-foreground mt-0.5 font-mono">Charge ref: {booking.cloverPaymentId}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={`flex items-start gap-3 rounded-md p-3 border ${
                  booking.paymentStatus === "failed"
                    ? "bg-red-500/10 border-red-500/20"
                    : booking.paymentStatus === "processing"
                      ? "bg-amber-500/10 border-amber-500/20"
                      : "bg-muted/50 border-border"
                }`}>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${booking.paymentStatus === "failed" ? "text-red-600" : "text-muted-foreground"}`} />
                  <div className="text-xs font-body">
                    <p className="text-foreground font-semibold">
                      {booking.paymentStatus === "failed" ? "Payment failed" : booking.paymentStatus === "processing" ? "Payment processing" : "Not yet paid"}
                    </p>
                    {booking.paymentFailureReason && (
                      <p className="text-muted-foreground mt-0.5">{booking.paymentFailureReason}</p>
                    )}
                    <p className="text-muted-foreground mt-0.5">Customer completes payment through checkout - this booking has not been charged.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLegacyPaymentLink((v) => !v)}
                  className="w-full mt-2 flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground font-body py-1"
                >
                  <span>Manual payment link (legacy - phone bookings only)</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLegacyPaymentLink ? "rotate-180" : ""}`} />
                </button>
                {showLegacyPaymentLink && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[10px] text-muted-foreground font-body">
                      Bypasses the Clover checkout entirely and does not create a payments record. Only use this for bookings taken outside the website (e.g. by phone).
                    </p>
                    <Button
                      onClick={() => setShowPaymentDialog(true)}
                      className="w-full gap-2"
                      size="sm"
                      variant="outline"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {booking.emailPhase === "payment_requested" ? "Resend Payment Link" : "Send Payment Link"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Payment Emails - distinct from the Email Workflow tracker below,
              which tracks dispatch-notification phases (emailPhase), not the
              payment-linked confirmation/invoice emails. Only shown once
              there is a payment to have email state for. */}
          {booking.paymentStatus === "paid" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="rounded-lg border border-border glass p-5">
              <h3 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Payment Emails
              </h3>
              <div>
                <PaymentEmailRow label="Booking confirmation" state={emailStatus?.confirmation} />
                <PaymentEmailRow label="Paid invoice" state={emailStatus?.invoice} />
              </div>

              {emailStatus && (emailStatus.confirmation.status !== "sent" || emailStatus.invoice.status !== "sent") && (
                <div className="mt-3">
                  {!showResendConfirm ? (
                    <Button
                      onClick={() => setShowResendConfirm(true)}
                      className="w-full gap-2"
                      size="sm"
                      variant="outline"
                      disabled={resendPaymentEmails.isPending}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      Resend emails
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-muted-foreground font-body">
                        This sends a real email to the customer for whichever of the two above is not yet sent. Continue?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleConfirmResend}
                          className="flex-1 gap-2"
                          size="sm"
                          disabled={resendPaymentEmails.isPending}
                        >
                          {resendPaymentEmails.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
                          Confirm resend
                        </Button>
                        <Button
                          onClick={() => setShowResendConfirm(false)}
                          className="flex-1"
                          size="sm"
                          variant="outline"
                          disabled={resendPaymentEmails.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-lg border border-border glass p-5">
            <h3 className="text-sm font-display font-semibold text-foreground mb-3">Trip Details</h3>
            <InfoRow icon={User} label="Client" value={booking.clientName} />
            <InfoRow icon={Mail} label="Email" value={booking.clientEmail} />
            <InfoRow icon={MapPin} label="Pickup" value={booking.pickupLocation} />
            {booking.bookingType === "hourly" ? (
              <InfoRow
                icon={Clock}
                label="Charter"
                value={
                  booking.hourlyDurationMinutes
                    ? `By the hour - ${formatDurationMinutes(booking.hourlyDurationMinutes)}${
                        booking.includedMiles != null ? `, ${booking.includedMiles} miles included` : ""
                      }`
                    : "By the hour"
                }
              />
            ) : (
              <InfoRow icon={MapPin} label="Dropoff" value={booking.dropoffLocation} />
            )}
            <InfoRow icon={Clock} label="Date & Time" value={`${booking.pickupDate} at ${booking.pickupTime}`} />
            <InfoRow icon={Car} label="Vehicle" value={booking.vehicleType.toUpperCase()} />
            {booking.vehicleNumber && <InfoRow icon={Car} label="Vehicle #" value={booking.vehicleNumber} />}
            {booking.flightTail && <InfoRow icon={Plane} label="Flight" value={booking.flightTail} />}
            {booking.specialRequests && <InfoRow icon={FileText} label="Special Requests" value={booking.specialRequests} />}
            {/* Base/Gratuity breakdown only when THIS booking's own stored
                gratuity is actually nonzero - never re-derived from the
                admin's current gratuity setting, so a booking already
                created stays showing exactly what it was charged even if
                gratuity is later toggled or its percentage changed. */}
            {booking.basePrice != null && booking.gratuity != null && booking.gratuity > 0 ? (
              <>
                <InfoRow icon={DollarSign} label="Base Price" value={`$${booking.basePrice.toFixed(2)}`} />
                <InfoRow icon={DollarSign} label="Gratuity" value={`$${booking.gratuity.toFixed(2)}`} />
                <InfoRow icon={DollarSign} label="Total Price" value={`$${booking.price.toFixed(2)}`} />
              </>
            ) : (
              <InfoRow icon={DollarSign} label="Price" value={`$${booking.price}`} />
            )}
            {booking.distanceMiles && <InfoRow icon={MapPin} label="Distance" value={`${booking.distanceMiles} miles`} />}
            {booking.durationMinutes && <InfoRow icon={Clock} label="Duration" value={`${booking.durationMinutes} minutes`} />}
          </motion.div>

          {/* Email Workflow Tracker */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-lg border border-border glass p-5">
            <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email Workflow
            </h3>
            <div className="space-y-3">
              {[
                { phase: "pending_sent", label: "Booking Pending Email", desc: "Sent when booking is received" },
                { phase: "payment_requested", label: "Payment Link Sent", desc: "Sent after admin confirms availability" },
                { phase: "confirmed_sent", label: "Confirmation Email", desc: "Sent when chauffeur assignment is finalized" },
                { phase: "manifest_sent", label: "Final Manifest Email", desc: "Sent with PDF manifest attached" },
              ].map(({ phase, label, desc }, i) => {
                const phases = ["none", "pending_sent", "payment_requested", "confirmed_sent", "manifest_sent"];
                const emailPhase = booking.emailPhase || "none";
                const currentPhaseIndex = phases.indexOf(emailPhase);
                const isComplete = i < currentPhaseIndex;
                const isCurrent = i === currentPhaseIndex;

                return (
                  <div key={phase} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-status-confirmed" />
                      ) : (
                        <Circle className={`h-4 w-4 ${isCurrent ? "text-primary" : "text-muted-foreground/30"}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-body font-semibold ${isComplete ? "text-foreground" : isCurrent ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {label}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-body">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Multi-leg siblings - price/payment shown here is the whole
              trip's, since only the primary (legOrder 1) leg is ever
              charged; each leg's own $ figure below is its individual fare,
              which sums to the combined total the customer was charged. */}
          {groupLegs.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border glass p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-display font-semibold text-foreground">Trip Group — {groupLegs.length} Legs</h3>
                <span className="text-xs font-body text-muted-foreground">
                  Combined: <span className="font-semibold text-foreground">${(booking.groupTotalPrice ?? booking.price).toFixed(2)}</span>
                </span>
              </div>
              <div className="space-y-2">
                {groupLegs.map((leg) => (
                  <button
                    key={leg.id}
                    onClick={() => router.push(`/admin/bookings/${leg.id}`)}
                    className={`w-full text-left rounded-md border p-3 transition-all cursor-pointer ${
                      leg.id === booking.id
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-primary">Leg {leg.legOrder ?? 1}</span>
                        <StatusBadge status={leg.status} />
                      </div>
                      <span className="text-xs text-muted-foreground font-body">{leg.pickupTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-1 truncate">
                      {leg.pickupLocation} → {leg.dropoffLocation}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-semibold text-foreground">${leg.price.toFixed(2)}</span>
                      {(leg.legOrder ?? 1) === 1 && (
                        <span className="text-[10px] font-body text-muted-foreground">
                          {booking.paymentStatus === "paid" ? "Trip payment charged here ✓" : "Trip payment charges here"}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Payment Confirmation Dialog */}
        {booking && (
          <PaymentConfirmDialog
            open={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            booking={{
              id: booking.id,
              reservationNumber: booking.reservationNumber,
              clientName: booking.clientName ?? null,
              clientEmail: booking.clientEmail ?? null,
              price: booking.price,
              pickupDate: booking.pickupDate,
              pickupTime: booking.pickupTime,
              pickupLocation: booking.pickupLocation,
              dropoffLocation: booking.dropoffLocation,
            }}
            onConfirm={async (finalPrice, paymentLink, emailMessage) => {
              await bookingService.sendPaymentLink(booking.id, finalPrice, paymentLink, emailMessage);
              // Refetch to update email phase
              window.location.reload();
            }}
          />
        )}
      </div>
    </PageTransition>
  );
}
