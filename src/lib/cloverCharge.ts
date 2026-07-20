export type ChargeMismatch = {
  kind: "mismatch";
  token: string;
  authoritativeAmount: number;
  authoritativeAmountCents: number;
  previousAmountCents: number;
  differenceCents: number;
  reason?: string;
  legs: { legOrder: number | null; pickupLocation: string; dropoffLocation: string; totalPrice: number }[];
};

export type ChargeDecline = { kind: "decline"; message: string };

export type ChargeAmbiguous = { kind: "ambiguous"; status: number; code?: string };

export type ChargeSuccess = { kind: "success"; reservationNumber?: string };

export type ChargeResult = ChargeMismatch | ChargeDecline | ChargeAmbiguous | ChargeSuccess;

// Shared authenticated Clover charge request, used by both the fresh-checkout
// flow (checkout/page.tsx) and the resume-payment flow (pay/page.tsx). Both
// previously duplicated this fetch + auth-header + response-classification
// logic identically; extracted here so it exists in exactly one place that's
// reviewed and tested once. Behavior is unchanged from the prior inline
// implementations - only the caller-specific navigation/toast/polling
// reactions to each outcome stay in the page components.
//
// requireAuth on the backend accepts either the access_token cookie (only
// ever set in development - see auth.ts) or a Bearer header. credentials:
// "include" alone is not production-safe, since production never sets that
// cookie; the Bearer header (same localStorage token the centralized `api`
// axios client attaches) is what actually works in both environments. This
// bypasses the axios client deliberately, not by oversight: it also needs to
// disambiguate a definite decline (402, safe to retry) from every other
// non-2xx outcome (ambiguous - may have already charged, must be verified by
// polling, never blindly retried), which the generic client doesn't do.
export async function chargeBooking(
  bookingId: string,
  cloverToken: string,
  expectedAmountCents: number,
  signal: AbortSignal
): Promise<ChargeResult> {
  const accessToken = localStorage.getItem("access_token");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/clover-payments/charge`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ bookingId, cloverToken, expectedAmountCents }),
      signal,
    }
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
      code?: string;
      authoritativeAmount?: number;
      authoritativeAmountCents?: number;
      previousAmountCents?: number;
      differenceCents?: number;
      reason?: string;
      legs?: { legOrder: number | null; pickupLocation: string; dropoffLocation: string; totalPrice: number }[];
    };

    // The backend refused to charge because the total this screen showed no
    // longer matches its fresh authoritative recomputation. Nothing was
    // charged and no payment row was created - the customer must explicitly
    // review the new breakdown before paying, not have the new amount
    // charged silently.
    if (response.status === 409 && errorData.code === "totals_mismatch") {
      return {
        kind: "mismatch",
        token: cloverToken,
        authoritativeAmount: errorData.authoritativeAmount ?? 0,
        authoritativeAmountCents: errorData.authoritativeAmountCents ?? 0,
        previousAmountCents: errorData.previousAmountCents ?? expectedAmountCents,
        differenceCents: errorData.differenceCents ?? (errorData.authoritativeAmountCents ?? 0) - expectedAmountCents,
        reason: errorData.reason,
        legs: errorData.legs ?? [],
      };
    }

    // A clean 402 with Clover's own decline reason is the ONLY response this
    // backend ever produces to mean "definitely no charge, safe to retry":
    // that path is reached only after Clover's response was parsed and
    // explicitly indicated failure/incomplete capture, and payments.status is
    // set to "failed" before returning. Everything else - a 500 (a crash
    // after Clover may have already succeeded), a 409 (already
    // processing/stale-processing), or any other unexpected status - is
    // ambiguous: this HTTP request didn't complete cleanly, but that says
    // nothing about whether the card was actually charged. Ambiguous
    // outcomes must be verified by polling, not retried blindly.
    if (response.status === 402) {
      // errorData.error is always the literal string "Payment failed" - the
      // actual decline reason (e.g. "Insufficient funds", "Your card was
      // declined") is in `details`. Falling back to `.error` here is what
      // produced the generic, unhelpful "Payment failed" banner instead of a
      // message the customer could act on.
      return {
        kind: "decline",
        message: errorData.details || errorData.error || "Payment declined. Please check your card details and try again.",
      };
    }

    return { kind: "ambiguous", status: response.status, code: errorData.code };
  }

  const result = (await response.json()) as { reservationNumber?: string };
  return { kind: "success", reservationNumber: result.reservationNumber };
}
