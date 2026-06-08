# 50+ Mile Distance Pricing Multiplier

## Overview
All trips with a distance greater than 50 miles now have their pricing multiplied by 2x to ensure profitability on long-distance journeys.

## Implementation

### Rule
```
If distance > 50 miles:
  Final Price = Base Price × 2
Else:
  Final Price = Base Price
```

Where Base Price = `baseRate + (ratePerMile × distance) + (ratePerMinute × duration)`

### Example Calculations

**Trip Under 50 Miles:**
- Distance: 30 miles
- Duration: 45 minutes
- Vehicle: Sedan (baseRate: $30, ratePerMile: $4, ratePerMinute: $1.25)
- Calculation: $30 + ($4 × 30) + ($1.25 × 45) = $30 + $120 + $56.25 = $206.25
- **Final Price: $206.25**

**Trip Over 50 Miles:**
- Distance: 75 miles
- Duration: 90 minutes
- Vehicle: Sedan (baseRate: $30, ratePerMile: $4, ratePerMinute: $1.25)
- Calculation: $30 + ($4 × 75) + ($1.25 × 90) = $30 + $300 + $112.50 = $442.50
- Multiplier Applied: $442.50 × 2 = $885.00
- **Final Price: $885.00**

## Files Modified

### 1. `src/hooks/usePricing.ts`
**Modified Functions:**
- `calculatePrice()` - Added 2x multiplier for distance > 50 miles
- `calculateVehicleSpecificPrice()` - Added 2x multiplier in both public and authenticated pricing fetch paths

### 2. `src/app/(public)/book/page.tsx`
**Modified Section:**
- Fallback pricing calculation - Added 2x multiplier for distance > 50 miles

## Where It Applies

The 2x multiplier is applied in all pricing calculations across:

✅ **Home Page Booking Form** - Initial vehicle selection
✅ **/book Page** - Vehicle selection and pricing display
✅ **VehiclePricingDisplay Component** - All vehicle cards
✅ **Checkout Page** - Final price calculation
✅ **CheckoutSummary Component** - Price breakdown display
✅ **Additional Legs** - Multi-stop trips
✅ **Vehicle-Specific Pricing** - Custom vehicle rates
✅ **Category Pricing** - Sedan/SUV fallback rates
✅ **Fallback Pricing** - When API is unavailable

## Tax Calculation

The 2x multiplier is applied to the **base price before tax**:

```
Base Price (with multiplier if > 50 miles) = $442.50 × 2 = $885.00
Tax (20%) = $885.00 × 0.20 = $177.00
Total = $885.00 + $177.00 = $1,062.00
```

## Testing Checklist

- [ ] Trip under 50 miles shows normal pricing
- [ ] Trip at exactly 50 miles shows normal pricing
- [ ] Trip at 50.1 miles shows 2x pricing
- [ ] Trip over 50 miles shows 2x pricing
- [ ] Pricing consistent across /book page
- [ ] Pricing consistent on checkout page
- [ ] Tax calculated on multiplied amount
- [ ] Additional legs over 50 miles also get 2x multiplier
- [ ] Both sedan and SUV get multiplier
- [ ] Fallback pricing includes multiplier
- [ ] Vehicle-specific pricing includes multiplier

## Business Logic

**Threshold:** 50 miles (exclusive)
- 50.0 miles = Normal pricing
- 50.1 miles = 2x pricing

**Rationale:**
Longer trips increase:
- Fuel costs
- Driver time
- Vehicle wear and tear
- Opportunity cost (vehicle unavailable for other bookings)

The 2x multiplier ensures profitability on extended journeys while remaining competitive for standard trips.

## Future Considerations

If more granular pricing tiers are needed:
```javascript
if (distance > 100) {
  basePrice = basePrice * 3;
} else if (distance > 50) {
  basePrice = basePrice * 2;
}
```

Or implement a sliding scale:
```javascript
const multiplier = distance > 50 ? 1 + ((distance - 50) / 50) : 1;
basePrice = basePrice * multiplier;
```
