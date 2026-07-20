"use client";
import { AlertCircle } from "lucide-react";

export interface PriceMismatchLeg {
  legOrder: number | null;
  pickupLocation: string;
  dropoffLocation: string;
  totalPrice: number;
}

interface PriceMismatchBannerProps {
  title?: string;
  reason?: string;
  previousAmount: number;
  newAmount: number;
  legs: PriceMismatchLeg[];
  children?: React.ReactNode;
}

// Shared itemized old-total/new-total/difference/per-journey breakdown, used
// by both price-mismatch moments in the checkout flow:
//  - Gate A (pre-payment): the total the customer accepted before booking
//    creation vs. what the booking was actually created with.
//  - Gate B (charge-time): the backend's 409 totals_mismatch response.
// One component so both look and behave identically, and so a future change
// to what's shown only has to happen once. Action buttons are the caller's
// responsibility (passed as children) since the two gates require different
// actions (Gate A: accept-only, no charge; Gate B: cancel or pay-new-total).
export default function PriceMismatchBanner({
  title = "Your total has changed",
  reason,
  previousAmount,
  newAmount,
  legs,
  children,
}: PriceMismatchBannerProps) {
  const difference = newAmount - previousAmount;
  const differenceLabel = `${difference >= 0 ? "+" : "-"}$${Math.abs(difference).toFixed(2)}`;

  return (
    <div role="alert" className="space-y-3">
      <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-amber-800 dark:text-amber-200 flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-1">
            {reason || "The price for this trip was updated since you last saw it."} Your card has not been charged.
            Please review the new total before paying.
          </p>

          <ul className="mt-3 space-y-1">
            {legs.map((leg, i) => (
              <li key={leg.legOrder ?? i} className="flex justify-between gap-4">
                <span>
                  Journey {leg.legOrder ?? i + 1}: {leg.pickupLocation} → {leg.dropoffLocation}
                </span>
                <span className="font-medium">${leg.totalPrice.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 space-y-1 border-t border-amber-200 dark:border-amber-900 pt-2">
            <div className="flex justify-between gap-4">
              <dt>Previous total</dt>
              <dd>${previousAmount.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4 font-semibold">
              <dt>New total</dt>
              <dd>${newAmount.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-xs opacity-80">
              <dt>Difference</dt>
              <dd>{differenceLabel}</dd>
            </div>
          </dl>
        </div>
      </div>
      {children}
    </div>
  );
}
