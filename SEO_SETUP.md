
# SEO Setup Guide

## Overview
Westminster Chariots web app is fully optimized for search engines with comprehensive metadata, structured data, and proper indexing controls.

---

## Features Implemented

### 1. **Meta Tags & Open Graph**
- Dynamic page titles with template
- Comprehensive descriptions
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs for all pages

### 2. **Structured Data (JSON-LD)**
- Organization schema
- LocalBusiness schema
- WebSite schema with search action
- Service catalog with offerings

### 3. **Favicons & PWA**
- Adaptive SVG favicon (light/dark mode)
- Apple touch icon
- Web app manifest for PWA support
- Theme color meta tags

### 4. **Robots & Sitemap**
- `robots.txt` with proper crawl rules
- Dynamic XML sitemap
- Admin routes excluded from indexing
- Auth pages marked noindex

### 5. **Page-Specific Metadata**
- Homepage: Full SEO optimization
- Book page: Booking-focused keywords
- Auth pages: noindex to prevent indexing
- Admin: Completely blocked from search engines

---

## Setup Instructions

### 1. **Environment Variables**
Add to your `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://westminsterchariots.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

### 2. **Google Search Console**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://westminsterchariots.com`
3. Verify ownership using the meta tag method
4. Copy verification code to `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
5. Submit sitemap: `https://westminsterchariots.com/sitemap.xml`

### 3. **Favicon Assets**
Generate proper favicon assets from the WC logo (`/public/assets/wc-logo-white.png`):

**Required files:**
- `/public/favicon.ico` (32x32, multi-size: 16x16, 32x32, 48x48)
- `/public/icon-192.png` (192x192 for Android)
- `/public/icon-512.png` (512x512 for Android)
- `/public/apple-touch-icon.png` (180x180 for iOS)

**Steps:**
1. Open `/public/assets/wc-logo-white.png` in an image editor
2. Create a square version with the WC logo centered on a dark background (#0a0a0a)
3. Use [RealFaviconGenerator](https://realfavicongenerator.net/) to generate all sizes:
   - Upload the square logo
   - Choose "Dark background" for iOS
   - Download the package
   - Extract files to `/public/`

Alternatively, use ImageMagick:
```bash
# Create square versions
convert public/assets/wc-logo-white.png -background "#0a0a0a" -gravity center -extent 512x512 public/icon-512.png
convert public/icon-512.png -resize 192x192 public/icon-192.png
convert public/icon-512.png -resize 180x180 public/apple-touch-icon.png
convert public/icon-512.png -resize 32x32 public/favicon.ico
```

### 4. **Open Graph Image**
Update `/public/og-image.png`:
- Size: 1200x630px
- Format: PNG or JPG
- Content: Westminster Chariots branding + tagline
- File size: < 1MB

### 5. **Social Media Links**
Update social media URLs in `/src/lib/metadata.ts`:

```typescript
sameAs: [
  "https://www.facebook.com/westminsterchariots",
  "https://www.instagram.com/westminsterchariots",
  "https://www.linkedin.com/company/westminsterchariots",
],
```

---

## Testing

### 1. **Meta Tags**
Test with:
- [Meta Tags Checker](https://metatags.io/)
- [Open Graph Debugger](https://www.opengraph.xyz/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### 2. **Structured Data**
Validate with:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

### 3. **Mobile & PWA**
Test with:
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

### 4. **Sitemap**
Verify at:
- `https://westminsterchariots.com/sitemap.xml`
- Submit to Google Search Console

---

## Keywords Strategy

### Primary Keywords
- luxury car service DC
- black car service Washington DC
- executive transportation
- chauffeur service Virginia
- airport transfer DC

### Long-tail Keywords
- Mercedes-Benz chauffeur service DC
- corporate car service Northern Virginia
- DCA airport transfer service
- diplomatic transportation Washington DC
- 24/7 chauffeur service Maryland

### Local SEO
- Washington DC chauffeur
- Northern Virginia car service
- DMV luxury transportation
- Triangle VA car service

---

## Performance Checklist

- [ ] All images optimized (WebP/AVIF)
- [ ] Lazy loading enabled
- [ ] Core Web Vitals passing
- [ ] Mobile-first responsive
- [ ] HTTPS enabled
- [ ] Sitemap submitted
- [ ] Google Analytics connected
- [ ] Schema markup validated

---

## Monitoring

### Tools to Use
1. **Google Search Console** - Track search performance
2. **Google Analytics 4** - User behavior
3. **Bing Webmaster Tools** - Bing indexing
4. **Ahrefs/SEMrush** - Keyword rankings (optional)

### Key Metrics
- Organic traffic
- Click-through rate (CTR)
- Average position
- Core Web Vitals
- Mobile usability

---

## Next Steps

1. Generate proper favicon assets from WC logo
2. Create 1200x630 Open Graph image
3. Set up Google Search Console
4. Submit sitemap
5. Monitor indexing status
6. Add Google Analytics tracking
7. Set up conversion tracking for bookings

---

## Contact

For SEO questions or updates, contact the development team.
