"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useBookingStore, type TripLeg } from "@/hooks/useBookingStore";
import { useAuth } from "@/hooks/useAuth";
import { useRouteDetails, fetchRouteDetails } from "@/hooks/useRouteDetails";
import { usePricing } from "@/hooks/usePricing";
import { useFleet } from "@/hooks/useFleet";
import type { RouteDetails } from "@/types";
import { notify } from "@/lib/notify";
import { bookingService } from "@/lib/services";
import { chargeBooking } from "@/lib/cloverCharge";
import type { QuotePreviewResponse } from "@/lib/services";
import { Button } from "@/components/ui/button";
import CheckoutSummary from "@/components/booking/CheckoutSummary";
import CloverPayment from "@/components/booking/CloverPayment";
import PriceMismatchBanner, { type PriceMismatchLeg } from "@/components/booking/PriceMismatchBanner";
import type { CreateBookingPayload } from "@/types";

const CHECKOUT_ATTEMPT_STORAGE_KEY = "wc_checkout_attempt_id";
const CHECKOUT_ATTEMPT_FINGERPRINT_KEY = "wc_checkout_attempt_fingerprint";
const BOOKING_CREATE_TIMEOUT_MS = 15_000;
const CHARGE_TIMEOUT_MS = 30_000;
const PAYMENT_VERIFICATION_POLL_INTERVAL_MS = 3_000;
const PAYMENT_VERIFICATION_TIMEOUT_MS = 2 * 60_000;

// Polls the booking's own paymentStatus (via the standard authenticated
// GET /bookings/:id, already used everywhere else) until it resolves to a
// terminal state or the polling window runs out. Used after an AMBIGUOUS
// charge outcome (a 500, a stale/processing 409, or a client-side network
// timeout) - none of these tell us whether Clover actually captured the
// card, only that this specific HTTP request didn't complete cleanly. A
// real incident (db.transaction() throwing after Clover had already
// confirmed a successful charge) is exactly the scenario this exists for:
// polling lets the UI catch up to the true state once the backend's own
// idempotent/stale-processing logic (or a manual reconciliation) resolves
// it, instead of the customer being shown a dead end or, worse, a second
// Pay button.
async function pollPaymentStatus(bookingId: string): Promise<"paid" | "failed" | "indeterminate"> {
  const deadline = Date.now() + PAYMENT_VERIFICATION_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const booking = await bookingService.getById(bookingId);
      if (booking.paymentStatus === "paid") return "paid";
      if (booking.paymentStatus === "failed") return "failed";
    } catch {
      // Transient network/API error while polling - keep trying until the
      // deadline; a single failed poll must not be treated as a payment
      // failure.
    }
    await new Promise((resolve) => setTimeout(resolve, PAYMENT_VERIFICATION_POLL_INTERVAL_MS));
  }
  return "indeterminate";
}

// Every field that feeds the server-calculated price. If the primary trip is
// edited via /book/details (a full navigation away and back - this page
// component remounts, so no in-memory ref survives the round trip) after a
// booking was already created, the persisted checkoutAttemptId would
// otherwise still match and the backend's idempotent-reuse path would
// silently return the now-stale (pre-edit) booking, even though the UI is
// showing a total for the edited trip. Comparing this fingerprint against
// what was stored alongside the attempt id is what makes that detectable
// across a remount, where local component state cannot help.
export function computeTripFingerprint(args: {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  selectedVehicle: string | null;
  selectedVehicleId: string | null;
  additionalLegs: { pickup: string; dropoff: string; pickupDate: string; pickupTime: string }[];
}): string {
  return JSON.stringify({
    pickup: args.pickup,
    dropoff: args.dropoff,
    pickupDate: args.pickupDate,
    pickupTime: args.pickupTime,
    vehicle: args.selectedVehicleId || args.selectedVehicle,
    legs: args.additionalLegs.map((l) => ({ pickup: l.pickup, dropoff: l.dropoff, pickupDate: l.pickupDate, pickupTime: l.pickupTime })),
  });
}

// Stable per-visit id so a page refresh, back/forward navigation, or a
// Strict Mode remount that re-fires booking creation sends the same value -
// the backend uses it to reuse the existing pending booking instead of
// creating a duplicate. Persisted in sessionStorage (not a ref) specifically
// so it survives a full page reload, which a ref cannot. Reused only when
// the trip fingerprint also still matches what was recorded for that id -
// otherwise a fresh id is issued so the next create is treated as a brand
// new attempt (a fresh booking reflecting the current trip) instead of
// reusing a booking whose stored details no longer match what's displayed.
export function resolveCheckoutAttemptId(fingerprint: string): string {
  if (typeof window === "undefined") return "";
  const storedId = sessionStorage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
  const storedFingerprint = sessionStorage.getItem(CHECKOUT_ATTEMPT_FINGERPRINT_KEY);
  if (storedId && storedFingerprint === fingerprint) {
    return storedId;
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem(CHECKOUT_ATTEMPT_STORAGE_KEY, id);
  sessionStorage.setItem(CHECKOUT_ATTEMPT_FINGERPRINT_KEY, fingerprint);
  return id;
}

export default function BookingCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, addLeg, removeLeg, updateLeg } = useBookingStore();
  const { vehicles } = useFleet();
  const prefersReducedMotion = useReducedMotion();

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string>("");
  const bookingCreateAttempted = useRef(false);
  // The just-created booking's own server-computed total, in cents - used as
  // expectedAmountCents at charge time instead of any client-side
  // recomputation. Set together with bookingId in createBooking().
  const [createdBookingTotalCents, setCreatedBookingTotalCents] = useState<number | null>(null);
  // Gate A: populated when booking creation's actual total differs from the
  // quote the customer last accepted. While set, CloverPayment does not
  // render - the card can't be tokenized until this is explicitly cleared
  // via handleAcceptUpdatedPrice, which only updates acceptedQuoteCents and
  // never itself charges or navigates.
  const [creationMismatch, setCreationMismatch] = useState<{
    previousAmountCents: number;
    newAmountCents: number;
    legs: PriceMismatchLeg[];
  } | null>(null);

  // Gate 0: the signed quote presented at booking-creation time was
  // rejected by the backend (expired, tampered, or the trip no longer
  // matches what it was quoted for - see POST /bookings' quoteId handling).
  // A fresh quote has already been fetched into `quote`/`acceptedQuoteCents`
  // by the time this is set; it is held here ONLY for display, and
  // deliberately blocks the auto-create effect (see its `quoteInvalidated`
  // guard below) until the customer explicitly re-accepts via
  // handleConfirmRefreshedQuote - never retried silently with the new
  // amount.
  const [quoteInvalidated, setQuoteInvalidated] = useState<{
    previousAmountCents: number;
    newAmountCents: number;
    legs: PriceMismatchLeg[];
  } | null>(null);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  // "verifying": an ambiguous charge outcome is being resolved by polling -
  // the Pay button must stay hidden the whole time. "indeterminate": polling
  // timed out with no resolution - the Pay button must stay hidden
  // permanently for this page load; the customer is told not to pay again
  // and directed to their account/support instead.
  const [paymentVerification, setPaymentVerification] = useState<"idle" | "verifying" | "indeterminate">("idle");
  const { calculatePrice, getAuthoritativeQuote } = usePricing();

  const { route } = useRouteDetails(data.pickup, data.dropoff);

  const [legRouteError, setLegRouteError] = useState(false);

  // Resolves each leg's distance/duration and backfills them into the store
  // (data.additionalLegs) - the single source of truth every pricing call
  // (quote and booking creation alike) reads from. This effect no longer
  // keeps its own separate copy of the resolved routes: that used to exist
  // as `legRoutes` state and be read by the quote request instead of
  // data.additionalLegs, which could disagree with what createBooking() sent
  // whenever this effect's async fetch hadn't finished yet on a fresh mount
  // (data.additionalLegs can already hold valid values from before this
  // mount; the old legRoutes state always started empty). See git history
  // for the removed state if a legs-specific route cache is needed again -
  // just make sure both the quote and booking creation keep reading the same
  // array.
  useEffect(() => {
    let isMounted = true;
    async function fetchLegRoutes() {
      if ((data.additionalLegs || []).length === 0) {
        setLegRouteError(false);
        return;
      }
      const routes = await Promise.all(
        (data.additionalLegs || []).map(leg => fetchRouteDetails(leg.pickup, leg.dropoff))
      );
      if (!isMounted) return;
      const validRoutes = routes.filter(Boolean) as RouteDetails[];
      setLegRouteError(validRoutes.length !== (data.additionalLegs || []).length);

      // The Add/Edit journey form only collects pickup/dropoff/date/time - it
      // has no distance field of its own, so a leg added or edited through
      // it starts with no distanceMiles/durationMinutes. createBooking()'s
      // payload reads those fields directly off the store leg, so without
      // this backfill every UI-added/edited leg would be sent (and priced,
      // and charged) as a 0-mile ride. Skips legs whose stored value already
      // matches the freshly routed one, so this doesn't loop.
      (data.additionalLegs || []).forEach((leg, i) => {
        const resolved = routes[i];
        if (!resolved) return;
        if (leg.distanceMiles !== resolved.distance || leg.durationMinutes !== resolved.duration) {
          updateLeg(i, { ...leg, distanceMiles: resolved.distance, durationMinutes: resolved.duration });
        }
      });
    }
    fetchLegRoutes();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.additionalLegs]);

  // A leg's distanceMiles/durationMinutes must be resolved (backfilled above)
  // before a quote can be requested or the booking auto-created -
  // createBooking() sends these values verbatim as the server-side pricing
  // input for that leg, so creating (or quoting) with an unresolved (0)
  // distance would lock in an undercharge.
  const legsReady = (data.additionalLegs || []).every(
    (leg) => (leg.distanceMiles ?? 0) > 0 && (leg.durationMinutes ?? 0) > 0
  );

  // Backend-authoritative quote - the same calculation booking creation
  // itself uses. Replaces the old client-side calculatePrice()/
  // calculateVehicleSpecificPrice() computation for anything that will
  // actually be charged: what's displayed here, what's "accepted" (Gate A,
  // below), and eventually what's sent as expectedAmountCents all trace back
  // to this one backend response, not an independent client formula.
  const [quote, setQuote] = useState<QuotePreviewResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  // true only when the quote endpoint could not be reached/failed - distinct
  // from "not ready yet" (still resolving route/legs). Gates booking
  // creation and payment off entirely; see the fallback-estimate render
  // below.
  const [quoteError, setQuoteError] = useState(false);
  // The total the customer last saw and implicitly accepted by proceeding -
  // established the moment a quote first loads for the current trip, and
  // re-established whenever the trip changes (a fresh quote for a fresh
  // trip has nothing "prior" to compare against). Compared against what
  // booking creation actually persists - see Gate A, below.
  const [acceptedQuoteCents, setAcceptedQuoteCents] = useState<number | null>(null);
  // Guards against an in-flight request's response landing after a NEWER
  // request has already been issued (e.g. the trip was edited again before
  // the first quote came back) - only the most recently issued request's
  // result is allowed to update state. Every call to fetchQuote() (from the
  // effect below or a manual retry after an expired/mismatched quote) claims
  // the next id; a response is applied only if its id is still current.
  const quoteRequestIdRef = useRef(0);

  // Extracted from the effect below so a stale/expired/mismatched quote
  // discovered at booking-creation time (see handleQuoteInvalidated) can
  // request a fresh one on demand, not just on trip-detail changes.
  // Returns the fresh quote so a caller mid-retry can use its (new)
  // combinedTotalCents/quoteId immediately, without waiting on a re-render.
  const fetchQuote = useCallback(async (): Promise<QuotePreviewResponse | null> => {
    const requestId = ++quoteRequestIdRef.current;
    if (!route || !data.selectedVehicle || !legsReady) {
      if (requestId === quoteRequestIdRef.current) setQuote(null);
      return null;
    }
    setQuoteLoading(true);
    setQuoteError(false);
    try {
      const result = await getAuthoritativeQuote({
        vehicleType: data.selectedVehicle!,
        vehicleId: data.selectedVehicleId || undefined,
        distanceMiles: route.distance,
        durationMinutes: route.duration,
        // Must read the same source createBooking() reads (the store's
        // data.additionalLegs), not the separate legRoutes component state.
        // legRoutes is reset to [] on every mount and only repopulates
        // after its own async fetch resolves (see the fetchLegRoutes
        // effect above), while data.additionalLegs can already hold valid,
        // previously-backfilled distances/durations from before this
        // mount (e.g. returning from /book/details, or a page refresh).
        // legsReady (which gates this whole effect) is itself computed
        // from data.additionalLegs, so it can already be true while
        // legRoutes is still empty - sending legRoutes here would quote
        // (and let the customer accept) a total missing every additional
        // leg's cost, moments before createBooking() creates the real
        // booking with all legs included. Root cause of "the quote was
        // right, the created booking's total was different."
        additionalLegs: (data.additionalLegs || []).map((leg) => ({
          distanceMiles: leg.distanceMiles ?? 0,
          durationMinutes: leg.durationMinutes ?? 0,
        })),
      });
      if (requestId === quoteRequestIdRef.current) {
        setQuote(result);
        setAcceptedQuoteCents(result.combinedTotalCents);
      }
      return result;
    } catch (err) {
      console.error("Failed to fetch authoritative quote:", err);
      if (requestId === quoteRequestIdRef.current) {
        setQuote(null);
        setQuoteError(true);
      }
      return null;
    } finally {
      if (requestId === quoteRequestIdRef.current) setQuoteLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, data.selectedVehicle, data.selectedVehicleId, data.additionalLegs, legsReady]);

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, data.selectedVehicle, data.selectedVehicleId, data.additionalLegs, legsReady]);

  // Estimate-only display for when the quote endpoint can't be reached -
  // clearly labeled as such in the render below, and never used to gate
  // booking creation or payment (quote stays null, which is what actually
  // blocks those).
  const fallbackEstimate = useMemo(() => {
    if (!route || !data.selectedVehicle) return null;
    const fb = calculatePrice(route.distance, route.duration, data.selectedVehicle);
    if (!fb) return null;
    // Same source as createBooking() and the authoritative-quote request
    // above - see the comment there.
    const fbLegPrices = (data.additionalLegs || []).map(
      (leg) => calculatePrice(leg.distanceMiles ?? 0, leg.durationMinutes ?? 0, data.selectedVehicle || "sedan")?.totalPrice ?? 0
    );
    return {
      basePrice: fb.basePrice,
      gratuity: fb.gratuity,
      total: fb.totalPrice,
      legPrices: fbLegPrices,
      grandTotal: fb.totalPrice + fbLegPrices.reduce((a, b) => a + b, 0),
    };
  }, [route, data.selectedVehicle, data.additionalLegs, calculatePrice]);

  // Reproduced bug: while the authoritative quote is genuinely still in
  // flight (not yet resolved, not yet errored - e.g. the ~800ms route-fetch
  // debounce settling faster than a cold/slow backend's pricing response),
  // this used to fall through to fallbackEstimate unconditionally, so the
  // customer briefly saw a real dollar figure computed from stale/local
  // rates (calculatePrice(), which does not match live pricing_config) as
  // "Total due" before it snapped to the correct quote total moments later.
  // fallbackEstimate is only a legitimate stand-in for the one case it's
  // actually labeled for elsewhere on this page: quoteError (the quote
  // endpoint is unreachable). Any other null-quote state is "still
  // loading" and must show nothing rather than an unverified number.
  const priceReady = quote != null;
  const showFallback = !priceReady && quoteError;
  const basePrice = priceReady ? quote!.legs[0]?.basePrice ?? 0 : showFallback ? fallbackEstimate?.basePrice ?? 0 : 0;
  const gratuity = priceReady ? quote!.legs[0]?.gratuity ?? 0 : showFallback ? fallbackEstimate?.gratuity ?? 0 : 0;
  const legPrices = priceReady ? quote!.legs.slice(1).map((l) => l.totalPrice) : showFallback ? fallbackEstimate?.legPrices ?? [] : [];
  const grandTotal = priceReady ? quote!.combinedTotal : showFallback ? fallbackEstimate?.grandTotal ?? 0 : 0;

  const vehicleImage = useMemo(() => {
    if (!data.selectedVehicle || vehicles.length === 0) return null;
    const vehicle = data.selectedVehicleId
      ? vehicles.find((v) => v.id === data.selectedVehicleId)
      : vehicles.find((v) => v.vehicleType === data.selectedVehicle);
    return vehicle?.imageUrl || null;
  }, [vehicles, data.selectedVehicle, data.selectedVehicleId]);

  useEffect(() => {
    if (!user) {
      router.push("/book/login");
    } else if (!data.pickup || !data.dropoff || !data.selectedVehicle) {
      router.push("/book");
    }
  }, [user, data.pickup, data.dropoff, data.selectedVehicle, router]);

  const createBooking = async () => {
    if (!route || !data.selectedVehicle || !user) return;

    setBookingError("");
    setCreatingBooking(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BOOKING_CREATE_TIMEOUT_MS);
    try {
      const bookingPayload: CreateBookingPayload = {
        pickup: data.pickup,
        dropoff: data.dropoff,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        vehicleType: data.selectedVehicle,
        vehicleId: data.selectedVehicleId || undefined,
        distanceMiles: route.distance,
        durationMinutes: route.duration,
        isAirportPickup: data.isPickupAirport,
        flightNumber: data.flightNumber || undefined,
        specialRequests: data.specialRequests || undefined,
        clientName: user.fullName || user.email?.split("@")[0] || "Guest",
        clientEmail: user.email || "",
        clientPhone: user.phone || undefined,
        bookingForSomeoneElse: data.bookingForSomeoneElse,
        guestFirstName: data.guestFirstName || undefined,
        guestLastName: data.guestLastName || undefined,
        guestEmail: data.guestEmail || undefined,
        guestPhone: data.guestPhone || undefined,
        additionalLegs: data.additionalLegs.length > 0 ? data.additionalLegs.map((leg) => ({
          pickup: leg.pickup,
          dropoff: leg.dropoff,
          pickupDate: leg.pickupDate,
          pickupTime: leg.pickupTime,
          distanceMiles: leg.distanceMiles || 0,
          durationMinutes: leg.durationMinutes || 0,
        })) : undefined,
        checkoutAttemptId: resolveCheckoutAttemptId(
          computeTripFingerprint({
            pickup: data.pickup,
            dropoff: data.dropoff,
            pickupDate: data.pickupDate,
            pickupTime: data.pickupTime,
            selectedVehicle: data.selectedVehicle,
            selectedVehicleId: data.selectedVehicleId,
            additionalLegs: data.additionalLegs || [],
          })
        ),
        // Locks this booking's price to the quote the customer is currently
        // looking at - never omitted while a valid quote exists. The
        // backend re-verifies it against these exact trip inputs and
        // refuses (409, handled below) rather than silently recomputing if
        // it's expired, tampered, or no longer matches this trip.
        quoteId: quote?.quoteId,
      };

      const booking = await bookingService.create(bookingPayload, controller.signal);
      setBookingId(booking.id);

      // Gate A: compare what the customer last accepted (the quote shown
      // just before this request fired) against what the backend actually
      // persisted. These can differ if pricing config changed in the
      // narrow window between the quote preview and this creation request -
      // rather than silently swapping the displayed number, block payment
      // entirely until the customer explicitly reviews and accepts it.
      const createdCents = Math.round((booking.groupTotalPrice ?? booking.totalPrice ?? 0) * 100);
      setCreatedBookingTotalCents(createdCents);
      if (acceptedQuoteCents !== null && createdCents !== acceptedQuoteCents) {
        const legsForBanner: PriceMismatchLeg[] =
          booking.legs && booking.legs.length > 0
            ? booking.legs.map((l) => ({
                legOrder: l.legOrder,
                pickupLocation: l.pickupLocation,
                dropoffLocation: l.dropoffLocation,
                totalPrice: l.totalPrice ?? 0,
              }))
            : [{ legOrder: 1, pickupLocation: data.pickup, dropoffLocation: data.dropoff, totalPrice: booking.totalPrice ?? 0 }];
        setCreationMismatch({ previousAmountCents: acceptedQuoteCents, newAmountCents: createdCents, legs: legsForBanner });
      } else {
        setCreationMismatch(null);
      }
    } catch (err) {
      // The backend rejected the quote presented alongside this request
      // (expired, tampered, or the trip changed since it was issued - see
      // POST /bookings' quoteId validation). Never fall back to a locally
      // recomputed amount here: fetch a genuinely fresh, backend-signed
      // quote and require the customer to explicitly review and re-accept
      // it (Gate 0, below) before booking creation is retried.
      const quoteRejectionCode =
        axios.isAxiosError(err) && err.response?.status === 409 && typeof err.response.data?.code === "string"
          ? (err.response.data.code as string)
          : null;
      if (quoteRejectionCode && quoteRejectionCode.startsWith("quote_")) {
        const previousAmountCents = acceptedQuoteCents;
        bookingCreateAttempted.current = false;
        const fresh = await fetchQuote();
        if (fresh && previousAmountCents !== null && fresh.combinedTotalCents !== previousAmountCents) {
          const legsForBanner: PriceMismatchLeg[] = fresh.legs.map((leg, i) => ({
            legOrder: i + 1,
            pickupLocation: i === 0 ? data.pickup : data.additionalLegs[i - 1]?.pickup ?? "",
            dropoffLocation: i === 0 ? data.dropoff : data.additionalLegs[i - 1]?.dropoff ?? "",
            totalPrice: leg.totalPrice,
          }));
          setQuoteInvalidated({ previousAmountCents, newAmountCents: fresh.combinedTotalCents, legs: legsForBanner });
        } else if (!fresh) {
          setBookingError("Your price quote expired and a new one could not be retrieved. Please try again.");
        }
        // fresh && amount unchanged: the quote token itself needed
        // refreshing (e.g. it simply expired) but the price is identical -
        // no customer-facing change to review, so the retry below proceeds
        // automatically with the new token.
        return;
      }

      const timedOut = controller.signal.aborted;
      const errorMessage = timedOut
        ? "Preparing your reservation is taking longer than expected. Please try again."
        : err instanceof Error ? err.message : "Failed to prepare your reservation";
      setBookingError(errorMessage);
    } finally {
      clearTimeout(timeoutId);
      setCreatingBooking(false);
    }
  };

  // Reservation is created automatically once trip details are ready, so the
  // customer only has one action left on this page: pay. Guarded so it only
  // fires once per visit (StrictMode-safe) rather than on every re-render.
  // Gated on `quote` (a real backend-authoritative quote), not just
  // `legsReady` - a booking must never be created (and Gate A/payment must
  // never become reachable) while running on an unverified local estimate.
  useEffect(() => {
    if (bookingCreateAttempted.current) return;
    // quoteInvalidated (Gate 0) means the customer must explicitly review
    // the refreshed price first - see handleConfirmRefreshedQuote, the only
    // path that clears it and retries.
    if (!user || !route || !data.selectedVehicle || bookingId || !legsReady || !quote || quoteInvalidated) return;
    bookingCreateAttempted.current = true;
    createBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, route, data.selectedVehicle, bookingId, legsReady, quote, quoteInvalidated]);

  const handleRetryBookingCreation = () => {
    if (!legsReady || !quote || quoteInvalidated) return;
    bookingCreateAttempted.current = false;
    createBooking();
  };

  // Gate 0's accept action - the customer has reviewed the refreshed quote
  // (fetched already, see createBooking's catch block) and explicitly
  // chosen to proceed at the new amount. Clearing quoteInvalidated is what
  // lets the auto-create effect above fire again.
  const handleConfirmRefreshedQuote = () => {
    setQuoteInvalidated(null);
    bookingCreateAttempted.current = false;
  };

  // Populated when the backend refuses to charge because what this screen
  // displayed no longer matches its fresh, authoritative recomputation (a
  // leg's price changed after the page loaded - e.g. an admin correction
  // while the customer sat on checkout). The Clover token from the attempt
  // that triggered it is kept so a reviewed retry can reuse it without
  // making the customer re-enter their card.
  const [priceMismatch, setPriceMismatch] = useState<{
    token: string;
    authoritativeAmount: number;
    authoritativeAmountCents: number;
    previousAmountCents: number;
    reason?: string;
    legs: PriceMismatchLeg[];
  } | null>(null);

  const attemptCharge = async (token: string, expectedAmountCents: number) => {
    if (!bookingId) {
      notify.error("Booking information missing");
      return;
    }

    setPaymentProcessing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHARGE_TIMEOUT_MS);
    try {
      const chargeResult = await chargeBooking(bookingId, token, expectedAmountCents, controller.signal);

      // The backend refused to charge because the total this screen showed
      // no longer matches its fresh authoritative recomputation. Nothing
      // was charged and no payment row was created - the customer must
      // explicitly review the new breakdown before paying, not have the
      // new amount charged silently.
      if (chargeResult.kind === "mismatch") {
        setPriceMismatch({
          token: chargeResult.token,
          authoritativeAmount: chargeResult.authoritativeAmount,
          authoritativeAmountCents: chargeResult.authoritativeAmountCents,
          previousAmountCents: chargeResult.previousAmountCents,
          reason: chargeResult.reason,
          legs: chargeResult.legs,
        });
        return;
      }

      // A clean 402 with Clover's own decline reason is the ONLY response
      // this backend ever produces to mean "definitely no charge, safe to
      // retry" - see cloverCharge.ts for the full reasoning.
      if (chargeResult.kind === "decline") {
        throw new Error(chargeResult.message);
      }

      if (chargeResult.kind === "ambiguous") {
        console.error("Ambiguous charge response - verifying via poll instead of assuming failure", {
          status: chargeResult.status,
          code: chargeResult.code,
        });
        setPaymentVerification("verifying");
        const outcome = await pollPaymentStatus(bookingId);
        if (outcome === "paid") {
          notify.success("Payment verified! Your booking is confirmed.");
          sessionStorage.removeItem("wc_booking");
          sessionStorage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
          sessionStorage.removeItem(CHECKOUT_ATTEMPT_FINGERPRINT_KEY);
          router.push(`/booking-confirmed?booking_id=${bookingId}`);
          return;
        }
        if (outcome === "failed") {
          setPaymentVerification("idle");
          notify.error("Payment was not completed. Please try again.");
          return;
        }
        // "indeterminate" - stays indeterminate for this page load. Never
        // shows a Pay button again here; the customer is directed elsewhere.
        setPaymentVerification("indeterminate");
        return;
      }

      // chargeResult.kind === "success"
      notify.success("Payment successful! Your booking is confirmed.");
      sessionStorage.removeItem("wc_booking");
      sessionStorage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
      sessionStorage.removeItem(CHECKOUT_ATTEMPT_FINGERPRINT_KEY);

      // Redirect only happens after the backend has verified payment.
      router.push(`/booking-confirmed?reservation=${chargeResult.reservationNumber}&booking_id=${bookingId}`);
    } catch (err) {
      console.error("Payment error:", err);
      // Aborting our own fetch on a client-side timeout is exactly as
      // ambiguous as a 500 - the request may have completed on the backend
      // even though we gave up waiting for the response. Verify via poll
      // rather than assuming failure and inviting a second charge attempt.
      if (controller.signal.aborted) {
        setPaymentVerification("verifying");
        const outcome = await pollPaymentStatus(bookingId);
        if (outcome === "paid") {
          notify.success("Payment verified! Your booking is confirmed.");
          sessionStorage.removeItem("wc_booking");
          sessionStorage.removeItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
          sessionStorage.removeItem(CHECKOUT_ATTEMPT_FINGERPRINT_KEY);
          router.push(`/booking-confirmed?booking_id=${bookingId}`);
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

  // expectedAmountCents is the booking's own actual created total, not a
  // client recomputation - by the time CloverPayment can even render,
  // Gate A has already confirmed this equals what the customer accepted, so
  // this request should never itself trigger Gate B except for a genuine
  // change in the few seconds between booking creation and tokenization.
  const handlePaymentSuccess = (token: string) =>
    attemptCharge(token, createdBookingTotalCents ?? Math.round(grandTotal * 100));

  // Customer has reviewed the revised breakdown and explicitly chosen to pay
  // the new authoritative amount - reuse the same Clover token (already
  // validated, no need to re-enter card details) and send the exact cents
  // the backend just told us it will charge.
  const handleConfirmMismatchedPayment = () => {
    if (!priceMismatch) return;
    const { token, authoritativeAmountCents } = priceMismatch;
    setPriceMismatch(null);
    attemptCharge(token, authoritativeAmountCents);
  };

  const handleDismissMismatch = () => setPriceMismatch(null);

  // Gate A's accept action. Deliberately does nothing beyond updating local
  // state - no charge, no tokenization, no navigation. The customer still
  // has to separately click Pay inside CloverPayment (which only renders
  // once creationMismatch is cleared) to actually proceed.
  const handleAcceptUpdatedPrice = () => {
    if (!creationMismatch) return;
    setAcceptedQuoteCents(creationMismatch.newAmountCents);
    setCreationMismatch(null);
  };

  const handlePaymentError = (error: string) => {
    notify.error(error);
  };

  const handleEditVehicle = () => {
    router.push("/book");
  };

  const handleEditDetails = () => {
    router.push("/book/details");
  };

  // Editing legs after the booking was already auto-created would otherwise
  // leave a stale booking on the server (there is no update-booking-details
  // endpoint) while the displayed total moves on - what's shown must never
  // diverge from what's actually charged. If a booking already exists,
  // clear it so the auto-create effect below re-fires; resolveCheckoutAttemptId
  // (called from inside createBooking) detects the fingerprint no longer
  // matches and issues a fresh attempt id, so the re-fire creates a brand
  // new booking reflecting the edited legs rather than reusing the stale
  // one. The superseded booking is simply abandoned, unpaid. No-ops while a
  // payment is actively in flight or a (re)creation is already in progress -
  // CheckoutSummary disables the leg controls for that same window via
  // legsLocked, so this is a defense-in-depth guard, not the primary one.
  const invalidateStaleBooking = () => {
    if (paymentProcessing || creatingBooking) return;
    if (bookingId) {
      setBookingId(null);
      bookingCreateAttempted.current = false;
    }
    // A mismatch breakdown was computed for the booking/legs as they existed
    // at that moment - editing legs now makes it stale too.
    setPriceMismatch(null);
    setCreationMismatch(null);
    setQuoteInvalidated(null);
    setCreatedBookingTotalCents(null);
    // acceptedQuoteCents is deliberately NOT reset here - the quote-fetch
    // effect re-establishes it once the edited trip's new route/legs
    // resolve into a fresh quote, so there's no gap where Gate A would
    // compare against a stale or absent baseline.
  };

  const handleAddLeg = (leg: TripLeg) => {
    if (paymentProcessing || creatingBooking) return;
    invalidateStaleBooking();
    addLeg(leg);
  };
  const handleRemoveLeg = (index: number) => {
    if (paymentProcessing || creatingBooking) return;
    invalidateStaleBooking();
    removeLeg(index);
  };
  const handleUpdateLeg = (index: number, leg: TripLeg) => {
    if (paymentProcessing || creatingBooking) return;
    invalidateStaleBooking();
    // The edit form seeds from the existing leg (which carries its OLD
    // distanceMiles/durationMinutes) but only lets the user change
    // pickup/dropoff/date/time - without stripping distance here, a save
    // would write new addresses paired with the stale distance, and since
    // that stale distance is still >0, legsReady would pass immediately and
    // let createBooking fire before the re-fetch backfills the correct one.
    // Clearing it makes legsReady correctly wait for re-resolution, exactly
    // like a freshly added leg.
    updateLeg(index, { ...leg, distanceMiles: undefined, durationMinutes: undefined });
  };

  if (!user || !data.pickup || !data.dropoff || !data.selectedVehicle || !route) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin motion-reduce:animate-none mx-auto mb-4" role="status" aria-label="Loading" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div {...motionProps} className="min-h-screen bg-gradient-to-b from-background to-primary/[0.02]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-16">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={paymentProcessing}
          className="gap-2 mb-4 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Review and pay</h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Your reservation is confirmed only after payment is completed below.
          </p>
        </header>

        <div className="space-y-5">
          {quoteError && (
            <div role="status" className="flex gap-3 p-3 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <span className="font-medium text-foreground">Estimated total</span> — we couldn&apos;t reach our pricing
                service to confirm your exact price. Booking and payment are unavailable until this is resolved; please
                try again in a moment.
              </p>
            </div>
          )}

          <CheckoutSummary
            pickup={data.pickup}
            dropoff={data.dropoff}
            pickupDate={data.pickupDate}
            pickupTime={data.pickupTime}
            vehicleType={data.selectedVehicle!}
            vehicleImage={vehicleImage || undefined}
            basePrice={basePrice}
            distanceMiles={route.distance}
            durationMinutes={route.duration}
            flightNumber={data.flightNumber}
            specialRequests={data.specialRequests}
            additionalLegs={data.additionalLegs || []}
            legPrices={legPrices || []}
            gratuity={gratuity}
            grandTotal={grandTotal}
            loading={quoteLoading || (!priceReady && !showFallback)}
            bookingForSomeoneElse={data.bookingForSomeoneElse}
            guestFirstName={data.guestFirstName}
            guestLastName={data.guestLastName}
            guestEmail={data.guestEmail}
            guestPhone={data.guestPhone}
            onEditVehicle={handleEditVehicle}
            onEditDetails={handleEditDetails}
            onAddLeg={handleAddLeg}
            onRemoveLeg={handleRemoveLeg}
            onUpdateLeg={handleUpdateLeg}
            legsLocked={creatingBooking || paymentProcessing}
          />

          {/* Secure payment card */}
          <div className="rounded-2xl border border-border bg-card shadow-glass p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="text-base font-display font-bold text-foreground">Secure payment</h2>
            </div>
            <p className="text-xs text-muted-foreground font-body mb-5">
              Enter your card details below to confirm and reserve your ride.
            </p>

            {creatingBooking && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Preparing your reservation…
              </div>
            )}

            {!creatingBooking && bookingError && (
              <div role="alert" className="space-y-3">
                <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-red-800 dark:text-red-200">{bookingError}</p>
                </div>
                <Button variant="outline" onClick={handleRetryBookingCreation} className="w-full">
                  Try again
                </Button>
              </div>
            )}

            {!creatingBooking && !bookingError && !bookingId && !legsReady && (
              legRouteError ? (
                <div role="alert" className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    We couldn&apos;t calculate the route for one of your journeys. Check that each pickup and drop-off address is valid, then remove and re-add the affected journey.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center" role="status" aria-live="polite">
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Calculating journey distances…
                </div>
              )
            )}

            {paymentVerification === "verifying" && (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground py-8 justify-center text-center" role="status" aria-live="polite">
                <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
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

            {/* Gate 0: the signed quote presented at booking-creation time
                was rejected by the backend (expired, or the trip changed
                since it was issued) and a fresh one has already been
                fetched. Shown instead of Gate A/booking creation retrying
                automatically - the customer must explicitly accept the
                refreshed price. */}
            {quoteInvalidated && (
              <PriceMismatchBanner
                title="Your quote needed to be refreshed"
                reason="Your previous price quote expired or no longer matched your trip details."
                previousAmount={quoteInvalidated.previousAmountCents / 100}
                newAmount={quoteInvalidated.newAmountCents / 100}
                legs={quoteInvalidated.legs}
              >
                <Button onClick={handleConfirmRefreshedQuote} disabled={paymentProcessing || creatingBooking} className="w-full">
                  Confirm price and continue
                </Button>
              </PriceMismatchBanner>
            )}

            {/* Gate A: booking creation's actual total differs from what the
                customer accepted before it fired. CloverPayment is not
                rendered at all while this is showing - the card cannot be
                tokenized until this is explicitly resolved. */}
            {creationMismatch && (
              <PriceMismatchBanner
                previousAmount={creationMismatch.previousAmountCents / 100}
                newAmount={creationMismatch.newAmountCents / 100}
                legs={creationMismatch.legs}
              >
                <Button onClick={handleAcceptUpdatedPrice} disabled={paymentProcessing} className="w-full">
                  Accept updated price
                </Button>
              </PriceMismatchBanner>
            )}

            {/* Gate B: the backend refused an actual charge attempt because
                the total no longer matched (409 totals_mismatch). */}
            {priceMismatch && (
              <PriceMismatchBanner
                previousAmount={priceMismatch.previousAmountCents / 100}
                newAmount={priceMismatch.authoritativeAmount}
                legs={priceMismatch.legs}
                reason={priceMismatch.reason}
              >
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDismissMismatch} disabled={paymentProcessing} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmMismatchedPayment} disabled={paymentProcessing} className="flex-1">
                    Pay ${priceMismatch.authoritativeAmount.toFixed(2)}
                  </Button>
                </div>
              </PriceMismatchBanner>
            )}

            {!creatingBooking && !bookingError && bookingId && paymentVerification === "idle" && !priceMismatch && !creationMismatch && !quoteInvalidated && quote && (
              <CloverPayment
                amount={grandTotal}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isProcessing={paymentProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
