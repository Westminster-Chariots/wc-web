// Content-Security-Policy - currently REPORT-ONLY, not enforced. Next.js
// (App Router) injects its own hydration bootstrap (self.__next_f/__next_r)
// via inline <script> tags with no nonce; an enforced script-src without
// 'unsafe-inline' or a nonce blocks that inline script outright, which
// breaks hydration site-wide (confirmed live: blank/partial homepage,
// "Invariant: Expected a request ID to be defined... self.__next_r").
// Report-Only mode cannot block anything by spec - it only logs violations
// to the console - so it's safe to ship broadly while the exact required
// host list (especially Clover's actual runtime traffic) is still being
// discovered. This must become a real enforced policy (via Next.js
// middleware-generated per-request nonces threaded through script tags -
// the officially documented approach, which has caching/dynamic-rendering
// implications that need their own testing pass) before any production
// deployment. Do NOT flip this to the enforcing 'Content-Security-Policy'
// header without that nonce work done and verified against real traffic.
//
// Every host below is required by a specific, already-in-use integration -
// nothing broad is allowed without justification:
//   - *.clover.com: the Clover Hosted iFrame SDK (script + the iframes it
//     mounts) is confirmed to load from checkout.(sandbox.dev.)clover.com,
//     but our own backend separately calls scl(-sandbox).dev.clover.com for
//     the charge API, and there is no official list of every host the SDK's
//     client-side code itself may call (token submission, telemetry, etc.) -
//     we could not observe this directly (no browser automation available
//     in this environment). Scoping to *.clover.com rather than the single
//     checkout host is a deliberate, documented widening limited to Clover's
//     own domain; narrow it back to the exact host(s) once verified against
//     real DevTools network traffic.
//   - accounts.google.com: Google Sign-In button script + its iframe
//     (src/components/ui/GoogleSignInButton.tsx).
//   - maps.googleapis.com / maps.gstatic.com: @react-google-maps/api, used by
//     MapPreview on the booking/checkout flow.
//   - res.cloudinary.com: vehicle/fleet images (already in images.remotePatterns).
//   - www.google.com / www.gstatic.com: the invisible reCAPTCHA the Clover
//     Hosted iFrame SDK loads on its own initiative for fraud protection -
//     confirmed via live DevTools traffic during checkout verification
//     (recaptcha/api.js + the api2/anchor and api2/bframe iframes it embeds).
//     Was previously undocumented/unobserved; now added per the "narrow once
//     verified against real traffic" note above. fonts.googleapis.com /
//     fonts.gstatic.com are also loaded by this same reCAPTCHA widget for its
//     own UI font, hence the additions to font-src/style-src below too.
// 'unsafe-inline' on style-src is required by the Google Maps JS SDK itself,
// which injects inline styles for map tiles/controls - there is no
// documented way to avoid this short of dropping Google Maps.
function buildCsp() {
  const isProd = process.env.NODE_ENV === "production";
  const cloverHosts = "https://*.clover.com";
  const apiConnectSrc = isProd
    ? "https://wc-backend-ayx0.onrender.com"
    : "https://wc-backend-ayx0.onrender.com https://wc-backend-ayx0.onrender.com";

  const directives = [
    `default-src 'self'`,
    `script-src 'self' ${cloverHosts} https://accounts.google.com https://maps.googleapis.com https://www.google.com https://www.gstatic.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://maps.gstatic.com https://maps.googleapis.com https://*.googleusercontent.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `frame-src ${cloverHosts} https://accounts.google.com https://www.google.com`,
    `connect-src 'self' ${apiConnectSrc} https://maps.googleapis.com ${cloverHosts}`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'self'`,
  ];
  // Browsers ignore upgrade-insecure-requests on http:// origins (which
  // localhost dev intentionally uses), so it's safe to always include - it
  // only takes effect where the page itself is already served over https.
  directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            // Report-Only: see the long comment above buildCsp() - this
            // cannot block rendering by spec, only log violations to the
            // console. Change to 'Content-Security-Policy' only after the
            // nonce-based production approach is implemented and tested.
            key: 'Content-Security-Policy-Report-Only',
            value: buildCsp(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
