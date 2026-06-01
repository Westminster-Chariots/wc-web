# Services Images Guide

## Overview

Each service in Westminster Chariots requires **two images** for optimal presentation across different pages:

1. **`image`** - Used for service cards/widgets on the listing page
2. **`detailImage`** - Used for the hero banner on the detail page

---

## Image Requirements

### Image 1: Service Card/Widget (`image`)

**Used on:** `/services` (Services listing page)

**Purpose:** Thumbnail/preview image shown in the service grid

**Specifications:**
- **Aspect Ratio:** 3:4 (portrait) or 4:3 (landscape)
- **Recommended Size:** 800x1000px or 1000x800px
- **Format:** JPG or WebP
- **File Size:** < 200KB (optimized)
- **Focus:** Should showcase the service type clearly
- **Composition:** Vertical or square composition works best for cards

**Current Location:** `/public/assets/svc-[service-name].jpg`

**Examples:**
- `/assets/svc-airport.jpg` - Airport terminal or luxury car at airport
- `/assets/svc-corporate.jpg` - Executive in business attire with vehicle
- `/assets/svc-wedding.jpg` - Decorated wedding vehicle or couple

---

### Image 2: Detail Page Hero (`detailImage`)

**Used on:** `/services/[slug]` (Individual service detail page)

**Purpose:** Large hero banner that sets the tone for the service

**Specifications:**
- **Aspect Ratio:** 16:9 or 21:9 (wide cinematic)
- **Recommended Size:** 1920x1080px or 2560x1080px
- **Format:** JPG or WebP
- **File Size:** < 500KB (optimized)
- **Focus:** Immersive, atmospheric shot that tells a story
- **Composition:** Horizontal with room for text overlay on left or center

**Current Location:** `/public/assets/svc-[service-name].jpg` (currently same as image)

**Ideal Shots:**
- Wide angle of vehicle in context (airport, city, venue)
- Interior shots showing luxury and comfort
- Lifestyle shots with passengers enjoying the service
- Atmospheric evening/night shots for date night, night out, concerts
- Monument/landmark shots for city tours

---

## Current Status

### ✅ Implemented Structure

All 11 services now have both `image` and `detailImage` fields in the data structure:

```typescript
{
  slug: "airport-transfers",
  title: "Washington DC Airport Transfers",
  image: "/assets/svc-airport.jpg",        // Card image
  detailImage: "/assets/svc-airport.jpg",  // Hero banner
  // ... other fields
}
```

### 🔄 TODO: Replace Placeholder Images

Currently, both `image` and `detailImage` point to the same file. You need to:

1. **Create or source 11 new hero banner images** (one per service)
2. **Name them appropriately** (e.g., `svc-airport-hero.jpg`)
3. **Place them in** `/public/assets/`
4. **Update the `detailImage` field** in `/src/lib/services-data.ts`

---

## Services List & Image Needs

| Service | Slug | Current Image | Detail Image Needed |
|---------|------|---------------|---------------------|
| Airport Transfers | `airport-transfers` | ✅ `/assets/svc-airport.jpg` | 🔄 Wide shot of airport terminal or luxury car at pickup |
| Corporate Car Service | `corporate-car-service` | ✅ `/assets/svc-corporate.jpg` | 🔄 Executive in vehicle or city skyline |
| Hourly Car Service | `hourly-car-service` | ✅ `/assets/svc-hourly.jpg` | 🔄 Chauffeur waiting or vehicle in urban setting |
| Long Distance | `long-distance` | ✅ `/assets/svc-longdistance.jpg` | 🔄 Highway/road trip scene or scenic route |
| Night Out | `night-out` | ✅ `/assets/svc-nightout.jpg` | 🔄 City nightlife or vehicle at upscale venue |
| Concert Transportation | `concert-transportation` | ✅ `/assets/svc-concert.jpg` | 🔄 Concert venue exterior or crowd scene |
| Wedding Transportation | `wedding-transportation` | ✅ `/assets/svc-wedding.jpg` | 🔄 Decorated vehicle or romantic couple shot |
| Prom Limo Service | `prom-limo-service` | ✅ `/assets/svc-prom.jpg` | 🔄 Teens in formal wear or elegant SUV |
| City Tours | `city-tours` | ✅ `/assets/svc-citytour.jpg` | 🔄 DC monuments or Capitol building wide shot |
| Date Night | `date-night` | ✅ `/assets/svc-datenight.jpg` | 🔄 Romantic restaurant or couple in vehicle |
| Church Service | `church-car-service` | ✅ `/assets/svc-church.jpg` | 🔄 Church exterior or peaceful morning scene |

---

## How to Update Images

### Step 1: Prepare Your Images

1. Gather or create 11 hero banner images (16:9 aspect ratio)
2. Optimize them for web (compress to < 500KB)
3. Name them clearly (e.g., `svc-airport-hero.jpg`)

### Step 2: Add to Project

```bash
# Place images in the public assets folder
cp your-images/* /public/assets/
```

### Step 3: Update Data File

Edit `/src/lib/services-data.ts`:

```typescript
{
  slug: "airport-transfers",
  title: "Washington DC Airport Transfers",
  image: "/assets/svc-airport.jpg",              // Keep existing
  detailImage: "/assets/svc-airport-hero.jpg",   // Update to new image
  // ...
}
```

### Step 4: Test

1. Visit `/services` - Check that card images look good
2. Click on a service - Check that hero banner looks good
3. Verify all 11 services have proper images

---

## Image Sourcing Recommendations

### Stock Photo Sites (Free)
- **Unsplash** - High-quality, free images
- **Pexels** - Great for lifestyle and vehicle shots
- **Pixabay** - Good variety of transportation images

### Stock Photo Sites (Paid)
- **Shutterstock** - Professional quality
- **Adobe Stock** - High-end imagery
- **Getty Images** - Premium options

### Search Keywords
- "luxury car interior"
- "chauffeur service"
- "airport limousine"
- "executive transportation"
- "wedding car decorated"
- "DC monuments night"
- "corporate travel"
- "city skyline vehicle"

### AI Image Generation (Alternative)
- **Midjourney** - High-quality AI images
- **DALL-E** - OpenAI's image generator
- **Stable Diffusion** - Open-source option

**Example Prompts:**
- "Luxury black Mercedes sedan at airport terminal, professional photography, cinematic lighting, 16:9"
- "Executive businessman in luxury car interior, professional setting, wide angle, 16:9"
- "Washington DC monuments at night, wide cinematic shot, professional photography"

---

## Design Tips

### For Card Images (`image`)
- ✅ Clear subject (vehicle or service context)
- ✅ Good contrast for text overlay
- ✅ Vertical or square composition
- ✅ Focus on key service element

### For Hero Banners (`detailImage`)
- ✅ Wide, cinematic composition
- ✅ Room for text overlay (usually left or center)
- ✅ Atmospheric and aspirational
- ✅ High quality and sharp
- ✅ Consistent color grading across all services
- ✅ Dark gradient overlay area for white text

---

## Technical Implementation

### Where Images Are Used

**Services Listing Page** (`/services/page.tsx`):
```tsx
<Image
  src={service.image}  // Card image
  alt={service.title}
  fill
  className="object-cover"
/>
```

**Service Detail Page** (`/services/[slug]/page.tsx`):
```tsx
<Image
  src={service.detailImage}  // Hero banner
  alt={service.title}
  fill
  priority
  className="object-cover"
/>
```

### Image Optimization

Next.js automatically optimizes images using the `<Image>` component:
- Lazy loading (except `priority` images)
- Responsive sizing
- WebP conversion
- Blur placeholder

---

## Checklist

- [x] Add `detailImage` field to TypeScript type
- [x] Add `detailImage` to all 11 services
- [x] Update detail page to use `detailImage`
- [ ] Source/create 11 hero banner images
- [ ] Optimize images for web
- [ ] Upload to `/public/assets/`
- [ ] Update `detailImage` paths in data file
- [ ] Test all service pages
- [ ] Verify mobile responsiveness
- [ ] Check image loading performance

---

## Support

For questions or issues:
- **Email:** book@westminsterchariots.com
- **Phone:** +1 (571) 426-6338

---

**Last Updated:** January 2024
