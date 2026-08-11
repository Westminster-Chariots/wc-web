import type { HourlyPricingSummaryOption } from "@/types";

// Redesigned 2026-08-11: HourlyPricingSummary.options IS the bookable
// duration list now (each entry already priced server-side) - no more
// interval/custom generation math on the frontend at all. This file is
// just small helpers over that array.

// Every currently-bookable duration (minutes), ascending. The options array
// GET /services returns is already server-filtered to active durations, so
// this is just an extraction + defensive sort, not real "generation."
export function buildDurationOptionsMinutes(options: HourlyPricingSummaryOption[]): number[] {
  return options.map((o) => o.durationMinutes).sort((a, b) => a - b);
}

// Full details (price, mileage, priceSource) for one specific duration -
// what /book actually needs to render a card once a duration is chosen,
// rather than just the bare minutes number.
export function findDurationOption(options: HourlyPricingSummaryOption[], durationMinutes: number): HourlyPricingSummaryOption | undefined {
  return options.find((o) => o.durationMinutes === durationMinutes);
}

// The homepage's duration field is a generic fallback (see
// HOURLY_DURATION_MIN/MAX_HOURS in HeroSection.tsx) picked before any
// service is chosen, so it won't generally land on a value a specific
// service's real config actually allows. /book calls this once a service is
// selected to find the closest duration that service will actually accept -
// never the requested value itself unless it happens to already be valid.
// Ties (equally close on both sides) resolve to the smaller option.
export function snapToNearestDuration(requestedMinutes: number, options: HourlyPricingSummaryOption[]): number {
  const minutesList = buildDurationOptionsMinutes(options);
  return minutesList.reduce((closest, option) =>
    Math.abs(option - requestedMinutes) < Math.abs(closest - requestedMinutes) ? option : closest
  );
}

// "150" -> "2h 30m" (or "2h" / "45m" when one part is zero).
export function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
