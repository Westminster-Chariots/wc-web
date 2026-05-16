# Services Section Update - Installation Required

## Required Packages

The services carousel requires embla-carousel packages. Install them with:

```bash
npm install embla-carousel-react embla-carousel-autoplay
```

## Changes Made

### 1. Created Services Data File
- **File**: `src/lib/services-data.ts`
- Contains all 11 services with detailed information matching golden-chariot-style
- Includes service images from `/assets/svc-*.jpg`

### 2. Created Services Carousel Component
- **File**: `src/components/home/sections/ServicesCarousel.tsx`
- Embla carousel with autoplay (4.5s delay)
- Stops on mouse hover
- Navigation buttons (prev/next)
- Responsive: 1 slide on mobile, 2 on tablet, 3 on desktop
- Next.js Image optimization with lazy loading
- Proper image sizes for performance

### 3. Updated Homepage Services Section
- **File**: `src/components/home/sections/ServicesSection.tsx`
- Now uses the carousel instead of static grid
- Matches golden-chariot-style design
- Light theme with proper contrast

### 4. Updated Services Page
- **File**: `src/app/(public)/services/page.tsx`
- Grid layout with all services
- Each card is clickable and links to anchor
- Hover effects with image zoom
- Matches golden-chariot-style design

## Service Images Used

All images are from `/public/assets/`:
- `svc-airport.jpg` - Airport Transfers
- `svc-corporate.jpg` - Corporate Car Service
- `svc-hourly.jpg` - Hourly Car Service
- `svc-longdistance.jpg` - Long Distance
- `svc-nightout.jpg` - Night Out
- `svc-concert.jpg` - Concert Transportation
- `svc-wedding.jpg` - Wedding Transportation
- `svc-prom.jpg` - Prom Service
- `svc-citytour.jpg` - City Tours
- `svc-datenight.jpg` - Date Night
- `svc-church.jpg` - Church Car Service

## Features

### Homepage Carousel
- Automatic rotation every 4.5 seconds
- Pauses on hover
- Manual navigation with prev/next buttons
- Smooth transitions
- Responsive breakpoints
- Optimized images with Next.js Image

### Services Page
- 3-column grid (responsive)
- Hover effects on cards
- Image zoom on hover (scale 1.10)
- Gradient overlays
- Clean, minimal design
- Fast loading with optimized images

## Performance Optimizations

1. **Lazy Loading**: Images load only when needed
2. **Responsive Images**: Different sizes for different viewports
3. **Priority Loading**: Hero images load first
4. **Optimized Sizes**: Proper `sizes` attribute for Next.js Image
5. **Smooth Animations**: Hardware-accelerated transforms

## Next Steps

1. Install the required packages:
   ```bash
   npm install embla-carousel-react embla-carousel-autoplay
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

3. Test the carousel on the homepage at `/#services`
4. Test the services page at `/services`
5. Verify all images load correctly
6. Test responsive behavior on mobile/tablet/desktop
