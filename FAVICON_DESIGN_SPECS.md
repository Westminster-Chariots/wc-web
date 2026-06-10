# Westminster Chariots - Favicon Design Specifications

## Brand Colors
```
Primary Blue: #09adff (rgb(9, 173, 255))
Dark Background: #0a0a0a (rgb(10, 10, 10))
Pure White: #ffffff (rgb(255, 255, 255))
Accent (subtle): #c8a45e (rgb(200, 164, 94)) - Use sparingly
```

## Design Concept
Create a minimalist, recognizable icon featuring:
- **Option A:** WC monogram (stylized W and C interlocked)
- **Option B:** Simplified luxury car silhouette with blue accent
- **Option C:** Crown/chariot wheel symbol with WC initials

**Recommended:** Option A (WC Monogram) for best recognition at small sizes

---

## Required Files & Specifications

### 1. favicon.ico
- **Size:** Multi-resolution (16x16, 32x32, 48x48)
- **Format:** ICO
- **Colors:** Full color
- **Background:** Transparent OR white
- **Use:** Browser tab icon

**Design Notes:**
- Must be legible at 16x16 pixels
- High contrast between elements
- Simple, bold shapes

---

### 2. favicon-16x16.png
- **Size:** 16x16 pixels
- **Format:** PNG-8 or PNG-24
- **Background:** Transparent
- **Use:** Browser tab (PNG fallback)

**Design:**
```
- Ultra-simplified WC or single letter W
- Blue (#09adff) on transparent
- 2px stroke weight maximum
- Center aligned
```

---

### 3. favicon-32x32.png
- **Size:** 32x32 pixels
- **Format:** PNG-24
- **Background:** Transparent
- **Use:** Browser tab, bookmarks

**Design:**
```
- WC monogram with slight detail
- Blue gradient or solid #09adff
- Optional: subtle white highlight
- 3-4px stroke weight
```

---

### 4. apple-touch-icon.png
- **Size:** 180x180 pixels
- **Format:** PNG-24
- **Background:** Solid color (dark #0a0a0a recommended)
- **Use:** iOS home screen, Safari bookmarks

**Design:**
```
- Centered WC monogram or logo
- Icon occupies ~70% of space (126x126px area)
- Blue (#09adff) icon on dark background
- Optional: subtle blue glow effect around icon
- Padding: 27px on all sides
```

**iOS Safe Area:**
- Apple applies rounded corners automatically
- Keep important elements 10% from edges
- Test with corner radius of 28px (18% of 180px)

---

### 5. icon-192.png (Android)
- **Size:** 192x192 pixels
- **Format:** PNG-24
- **Background:** Solid color (dark #0a0a0a) OR transparent
- **Use:** Android home screen, PWA

**Design:**
```
- Similar to apple-touch-icon
- Icon occupies ~75% of space (144x144px area)
- Blue icon on dark background
- Padding: 24px on all sides
- Can include subtle company name below icon (optional)
```

**Android Maskable:**
- Safe zone: 80px radius circle from center
- Allow 20% bleed for adaptive icons

---

### 6. icon-512.png (Android Large)
- **Size:** 512x512 pixels
- **Format:** PNG-24
- **Background:** Solid color (dark #0a0a0a) OR transparent
- **Use:** Android splash screens, PWA

**Design:**
```
- High-resolution version of icon-192
- Icon occupies 384x384px area
- Blue icon with subtle details visible at this size
- Optional: light blue glow/shadow effect
- Padding: 64px on all sides
```

---

### 7. icon.svg (Scalable)
- **Format:** SVG
- **Viewbox:** 0 0 100 100 (or appropriate)
- **Colors:** #09adff, #ffffff
- **Use:** Modern browsers, scalable needs

**Design Requirements:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- Clean, optimized paths -->
  <!-- No embedded fonts -->
  <!-- Use currentColor for flexibility -->
</svg>
```

**SVG Specs:**
- Vector paths only (no raster)
- Optimized with SVGO
- Maximum 2-3 colors
- Compound paths for efficiency

---

### 8. safari-pinned-tab.svg
- **Format:** SVG (monochrome)
- **Color:** Single color (black paths)
- **Viewbox:** 0 0 16 16
- **Use:** Safari pinned tabs

**Design:**
```
- Monochrome silhouette version
- Black fills only (Safari applies tint)
- High contrast
- Simple shapes that read at small sizes
```

---

### 9. mstile-150x150.png (Windows)
- **Size:** 150x150 pixels
- **Format:** PNG-24
- **Background:** Transparent
- **Use:** Windows Start menu tile

**Design:**
```
- Icon centered, ~100x100px
- White icon on transparent background
- Windows applies background color from browserconfig.xml
- Clean, bold design
```

---

## Design Guidelines

### Do's ✅
- Keep designs SIMPLE and BOLD
- Use high contrast
- Ensure legibility at smallest size (16px)
- Test on both light and dark backgrounds
- Use consistent styling across all sizes
- Center align all icons
- Apply proper padding/safe areas

### Don'ts ❌
- Don't include fine details that disappear at small sizes
- Don't use gradients on icons smaller than 32px
- Don't place elements too close to edges
- Don't use thin strokes (< 2px at small sizes)
- Don't include text unless absolutely necessary
- Don't use more than 3 colors

---

## Testing Requirements

### Browser Testing
- Chrome (Windows, Mac, Linux)
- Firefox
- Safari (Mac, iOS)
- Edge
- Mobile browsers (iOS Safari, Chrome Android)

### Size Testing
```
16px - Must be clearly recognizable
32px - Should show some detail
180px - Full detail visible
512px - High-resolution, crisp
```

### Background Testing
- White background
- Black background
- Dark blue background
- Light gray background

---

## File Delivery Checklist

- [ ] favicon.ico (multi-resolution)
- [ ] favicon-16x16.png
- [ ] favicon-32x32.png
- [ ] apple-touch-icon.png (180x180)
- [ ] icon-192.png
- [ ] icon-512.png
- [ ] icon.svg
- [ ] safari-pinned-tab.svg
- [ ] mstile-150x150.png

**Naming Convention:** Exact names as listed above

**Compression:**
- PNG: Optimized with TinyPNG or similar
- SVG: Optimized with SVGO
- ICO: Properly formatted multi-resolution

---

## Design Inspiration

### Style Reference
- Minimalist luxury
- Tech-forward but sophisticated
- Clean, geometric shapes
- Premium feel without being ornate

### Mood
- Professional
- Trustworthy
- Modern
- Elegant

### Similar Brands (for reference)
- Mercedes-Benz (three-pointed star simplicity)
- BMW (circular emblem clarity)
- Tesla (T lettermark boldness)

---

## Quick Design Templates

### Template 1: WC Monogram
```
W and C letters interlocked
- W in front, C behind
- Blue (#09adff) with white highlights
- Modern sans-serif letterforms
- Slightly geometric/angular
```

### Template 2: Crown Icon
```
Simplified crown with 3 points
- Center point slightly higher
- Blue (#09adff) crown
- Optional: WC initials below
- Minimal, elegant design
```

### Template 3: Car Silhouette
```
Side view luxury sedan silhouette
- Simplified to 3-4 shapes
- Blue (#09adff) body
- White windshield highlight
- Wheels suggested, not detailed
```

---

## Color Combinations

### Primary (Recommended)
```
Icon: #09adff (blue)
Background: #0a0a0a (dark)
Highlight: #ffffff (white)
```

### Alternate 1
```
Icon: #ffffff (white)
Background: #09adff (blue)
Accent: #0a0a0a (dark)
```

### Alternate 2
```
Icon: #09adff (blue) + #ffffff (white)
Background: transparent
Use: For favicon.ico and small sizes
```

---

## Next Steps

1. **Create master design** at 512x512px
2. **Export all sizes** from master
3. **Test on devices** (phone, tablet, desktop)
4. **Optimize files** (compress PNGs, minimize SVGs)
5. **Place in** `/public` folder
6. **Update** `layout.tsx` with new references
7. **Test in browsers** to verify appearance

---

## Tools Recommended

**Design:**
- Figma (free, browser-based)
- Adobe Illustrator
- Sketch (Mac only)
- Affinity Designer

**Export/Optimization:**
- Favicon Generator: https://realfavicongenerator.net/
- TinyPNG: https://tinypng.com/
- SVGO: https://jakearchibald.github.io/svgomg/

**Testing:**
- Browser DevTools
- Real devices
- Favicon checker: https://realfavicongenerator.net/favicon_checker

---

**Created:** January 2025
**For:** Westminster Chariots Rebrand
**Theme:** Blue & White Luxury
