# Virginia Pickup Location Restriction with Validation

## Overview
Pickup locations in the booking form are now restricted to Virginia, United States only with validation and error messaging. Drop-off locations remain unrestricted.

## What Was Changed

### 1. LocationInput Component
- Added `restrictToVirginia` prop
- Added `onValidationError` callback prop
- When enabled:
  - Geographic bounds set to Virginia coordinates (36.5407°N to 39.4660°N, -83.6753°W to -75.2420°W)
  - Results filtered to only show Virginia addresses (containing ", VA" or "Virginia")
  - Validates location on blur (when user clicks away)
  - Shows red border and error message for invalid locations
  - Prevents submission with invalid locations

### 2. BookingModal Component  
- Pickup modal now passes `restrictToVirginia={true}` to LocationInput
- Added validation error state handling
- Continue button disabled when validation error exists
- Shows error message below button for invalid pickup locations
- Drop-off modal remains unrestricted

### 3. BookingModals Component (Home Page)
- Pickup modal now passes `restrictToVirginia={true}` to LocationInput
- Added validation error state handling
- Continue button disabled when validation error exists
- Shows error message: "Please select a valid location in Virginia to continue"
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
- When selecting pickup location, only Virginia addresses shown in suggestions
- If user types non-Virginia location, validation triggers on blur
- Red border appears on input field
- Error message shown: "Pickup location must be in Virginia"
- Continue button is disabled until valid Virginia location selected
- Additional error message below button: "Please select a valid location in Virginia to continue"
- Drop-off can be anywhere

### /book Page
- Initial booking: Pickup restricted to Virginia with validation
- Red border and error message for invalid locations
- Continue button disabled with validation error
- Edit mode: Pickup restricted to Virginia with notification on invalid selection
- Error shown if user tries to select non-Virginia pickup

### Visual Feedback
- **Valid Location**: Normal blue border, no error message, button enabled
- **Invalid Location**: Red border, error message displayed, button disabled
- **Empty Field**: Normal border, button disabled
- **Typing**: Error clears as user types new input

## Validation Logic

### When Validation Occurs
1. **On Blur** - When user clicks away from input field
2. **On Continue** - Button remains disabled if error exists
3. **On Type** - Error clears when user starts typing again

### Validation Check
```javascript
const isVirginiaLocation = location.toLowerCase().includes(', va') || 
                          location.toLowerCase().includes(', virginia') || 
                          location.toLowerCase().includes('virginia');
```

### Error Messages
- **In Input Field**: "Pickup location must be in Virginia"
- **Below Continue Button**: "Please select a valid location in Virginia to continue"
- **Edit Mode**: Notification toast with error message

## Error States

### Visual Indicators
```
Normal State:
- Blue border on focus
- No error message
- Button enabled (if location filled)

Error State:
- Red border
- Error text in red below input
- Button disabled
- Additional error message below button

Typing State:
- Clears error immediately
- Returns to normal state
- Button remains disabled until valid selection
```

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

**Validation on Blur:**
```javascript
onBlur={() => {
  setTimeout(() => {
    if (restrictToVirginia && query && !selected) {
      validateLocation();
    }
  }, 200);
}}
```

## Testing Checklist
- [ ] Home page pickup shows only VA suggestions
- [ ] Typing "New York" shows no suggestions
- [ ] Selecting VA location allows continue
- [ ] Typing non-VA location shows error on blur
- [ ] Error message displays in red
- [ ] Input border turns red on error
- [ ] Continue button disabled with error
- [ ] Error clears when typing new input
- [ ] /book page pickup restricted to VA
- [ ] /book page shows validation errors
- [ ] Edit mode pickup restricted to VA
- [ ] Drop-off locations unrestricted on all pages

## User Flow Example

### Scenario 1: Valid Virginia Location
1. User opens pickup modal
2. Types "Reagan National Airport"
3. Selects suggestion
4. No error shown
5. Continue button enabled
6. Proceeds to next step ✅

### Scenario 2: Invalid Non-Virginia Location
1. User opens pickup modal
2. Types "123 Main St, New York, NY"
3. Clicks outside input (blur)
4. Red border appears
5. Error message: "Pickup location must be in Virginia"
6. Continue button disabled
7. Additional error: "Please select a valid location in Virginia to continue"
8. User must select Virginia location to proceed ❌

### Scenario 3: Correction Flow
1. User has error state
2. Starts typing new location
3. Error clears immediately
4. Types "Arlington, VA"
5. Selects suggestion
6. Continue button enabled
7. Proceeds to next step ✅

## Future Enhancements
If you need to expand to other states:
1. Add state parameter to `restrictToVirginia` prop (rename to `restrictToState`)
2. Create bounds mapping for each state
3. Update filtering logic to check for specified state
4. Update error messages dynamically based on state
