# Booking Flow Updates - Implementation Guide

## Changes Made to `page-new.tsx`

### 1. Added Refs and Handlers
- Added `bookingFormRef` to reference the booking form section
- Added `scrollToBookingForm()` function to scroll to booking form
- Updated modal handlers for automatic progression

### 2. Floating CTA Button
Added a floating "Book Your Ride" button that:
- Appears when user scrolls away from hero section (`showBookCTA` state)
- Smoothly animates in/out with spring physics
- Scrolls user back to booking form when clicked
- Positioned at bottom-right corner (fixed position)

### 3. Required Updates to Existing Sections

#### A. Hero Section Booking Form
Add `ref={bookingFormRef}` to the booking form container:

```tsx
<div ref={bookingFormRef} className="your-booking-form-classes">
  {/* Booking form content */}
</div>
```

#### B. Booking Field Buttons
Add `data-field` attributes to each booking field button for animation targeting:

```tsx
{/* Pickup button */}
<button 
  data-field="pickup"
  onClick={(e) => openModal("pickup", e)}
  className="your-classes"
>
  {pickup || "Pickup location"}
</button>

{/* Dropoff button */}
<button 
  data-field="dropoff"
  onClick={(e) => openModal("dropoff", e)}
  className="your-classes"
>
  {dropoff || "Dropoff location"}
</button>

{/* Date button */}
<button 
  data-field="date"
  onClick={(e) => openModal("date", e)}
  className="your-classes"
>
  {pickupDate || "Select date"}
</button>

{/* Time button */}
<button 
  data-field="time"
  onClick={(e) => openModal("time", e)}
  className="your-classes"
>
  {pickupTime || "Select time"}
</button>
```

#### C. Hero "Book a Ride" Button
The main CTA button in the hero section should have an ID for the transition effect:

```tsx
<button 
  id="hero-book-button"
  onClick={(e) => openModal("pickup", e)}
  className="your-classes"
>
  Book a Ride
</button>
```

## How It Works

### Flow Sequence:
1. User scrolls down → `showBookCTA` becomes `true`
2. Floating CTA button animates in from bottom-right
3. User clicks floating CTA → scrolls smoothly to booking form
4. As user scrolls back up, floating CTA fades out (appears to "merge" with hero button)

### Modal Progression:
1. Click "Pickup location" → Modal opens from button position
2. Select location → Modal closes back to button → **Dropoff modal auto-opens**
3. Select dropoff → Modal closes → **Date modal auto-opens**
4. Select date → Modal closes → **Time modal auto-opens**
5. Select time → Modal closes → **Validates and navigates to /book**

### Date/Time Validation:
- Date picker: `min={todayIso}` - disables past dates
- Time picker: `min={pickupDate === todayIso ? currentTime : "00:00"}` - disables past times if today

## Visual Effect

The floating CTA creates an illusion of "traveling" to the hero button:
- When scrolling down: CTA appears to "detach" from hero button
- When scrolling up: CTA appears to "merge back" into hero button
- Smooth opacity and scale transitions create seamless effect

## Next Steps

Replace the placeholder comments in `page-new.tsx`:
- `{/* Navigation - keeping existing code */}` → Add your navigation JSX
- `{/* Hero Section - keeping existing code until booking bar */}` → Add hero + booking form JSX with refs
- `{/* Audio and mute button - keeping existing code */}` → Add audio controls JSX
