# Virginia Pickup Location Restriction

## Overview
Pickup locations in the booking form are now restricted to Virginia, United States only. Drop-off locations remain unrestricted.

## What Was Changed

### 1. LocationInput Component
- Added `restrictToVirginia` prop
- When enabled:
  - Geographic bounds set to Virginia coordinates (36.5407°N to 39.4660°N, -83.6753°W to -75.2420°W)
  - Results filtered to only show Virginia addresses (containing ", VA" or "Virginia")

### 2. BookingModal Component  
- Pickup modal now passes `restrictToVirginia={true}` to LocationInput
- Drop-off modal remains unrestricted

### 3. BookingModals Component (Home Page)
- Pickup modal now passes `restrictToVirginia={true}` to LocationInput
- Drop-off modal remains unrestricted

### 4. Book Page Edit Mode
- Pickup autocomplete restricted to Virginia with bounds and validation
- Shows error notification if non-Virginia location selected
- Drop-off autocomplete remains unrestricted

## Virginia Geographic Bounds
```javascript
{
  north: 39.4660,  // Northern border
  south: 36.5407,  // Southern border  
  east: -75.2420,  // Eastern border
  west: -83.6753   // Western border
}
```

## User Experience

### Home Page Booking Form
- When selecting pickup location, only Virginia addresses shown
- Drop-off can be anywhere

### /book Page
- Initial booking: Pickup restricted to Virginia
- Edit mode: Pickup restricted to Virginia with validation
- Error shown if user tries to select non-Virginia pickup

## Technical Details

**Files Modified:**
- `src/components/booking/LocationInput.tsx`
- `src/components/booking/BookingModal.tsx`
- `src/components/home/BookingModals.tsx`
- `src/app/(public)/book/page.tsx`

**Filtering Logic:**
```javascript
// Results filtered to Virginia only
filtered = predictions.filter(p => {
  const desc = p.description.toLowerCase();
  return desc.includes(', va') || 
         desc.includes(', virginia') || 
         desc.includes('virginia');
});
```

## Testing Checklist
- [ ] Home page booking form pickup restricted to VA
- [ ] Home page booking form dropoff unrestricted
- [ ] /book page initial load respects restriction
- [ ] /book page edit mode pickup restricted to VA
- [ ] /book page edit mode dropoff unrestricted
- [ ] Error notification shown for non-VA pickup in edit mode
- [ ] Autocomplete suggestions only show Virginia locations for pickup

## Future Enhancements
If you need to expand to other states:
1. Add state parameter to `restrictToVirginia` prop (rename to `restrictToState`)
2. Create bounds mapping for each state
3. Update filtering logic to check for specified state
