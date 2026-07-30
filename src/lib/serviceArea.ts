// Single source of truth for "is this address inside our service area" -
// shared by every address input (pickup, dropoff, and additional stops) so
// they can't drift out of sync with each other the way the old per-file
// Virginia-only checks had (book/page.tsx's inline autocomplete restricted
// pickup but not dropoff; CheckoutSummary's stop editor restricted neither).
//
// Service area: Virginia, Maryland, and Washington, D.C. Country stays
// restricted to the US separately (via componentRestrictions/
// AutocompleteOptions.componentRestrictions in each caller) - this module
// only decides which addresses WITHIN the US count as in-area.
//
// D.C. is a federal district, not a state, so it never carries an
// "administrative_area_level_1" of "District of Columbia" the way a real
// state name would - Google's formatted addresses render it as
// "Washington, DC ..." instead. The check below matches on the free-text
// description/formatted address (the only thing available at the
// autocomplete-prediction stage, before a place is selected and structured
// address_components become available) rather than parsed components,
// matching how this validation always worked for the previous VA-only rule.
const SERVICE_AREA_MATCHERS = [
  ", va",
  ", virginia",
  ", md",
  ", maryland",
  ", dc",
  ", d.c.",
  "washington, dc",
  "washington, d.c.",
  "district of columbia",
];

export function isInServiceArea(addressText: string): boolean {
  const lower = addressText.toLowerCase();
  return SERVICE_AREA_MATCHERS.some((matcher) => lower.includes(matcher));
}

// Loose biasing box (not a hard cutoff - Google's Places locationBias/bounds
// only rank results, they don't exclude anything outside them) generously
// covering Virginia, Maryland, and Washington, D.C.
export const SERVICE_AREA_BOUNDS = {
  north: 39.72,
  south: 36.5407,
  east: -75.05,
  west: -83.6753,
};

export const SERVICE_AREA_LABEL = "Virginia, Maryland, or Washington, D.C.";
