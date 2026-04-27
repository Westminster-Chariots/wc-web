# Westminster Chariots — Web Frontend

Premium chauffeur service platform serving the Washington DC Metropolitan Area.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form
- **Maps:** Google Maps API
- **Real-time:** Pusher
- **Payments:** Stripe
- **PDF Generation:** jsPDF
- **Document Generation:** docx

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (wc-backend)

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Fill in your environment variables in `.env.local`:

```env
# Required
NEXT_PUBLIC_API_URL=https://wc-backend-ayx0.onrender.com/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
NEXT_PUBLIC_STRIPE_PK=your_stripe_publishable_key

# Optional
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
wc-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/          # Public routes (landing, booking, auth)
│   │   ├── (client)/          # Client dashboard routes
│   │   ├── (admin)/           # Admin panel routes
│   │   └── api/               # API route handlers
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── booking/          # Booking flow components
│   │   ├── dashboard/        # Admin dashboard components
│   │   └── account/          # Client account components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── services.ts      # API service functions
│   │   ├── validation.ts    # Form validation
│   │   └── security.ts      # Security utilities
│   └── types/               # TypeScript type definitions
├── public/                   # Static assets
└── package.json
```

## Key Features

### Public Routes
- **Landing Page** (`/`) - Hero, services, fleet showcase
- **Booking Flow** (`/book`) - Multi-step booking with Google Maps integration
- **Authentication** (`/auth`) - Login, register, Google OAuth
- **Password Reset** (`/reset-password`)

### Client Routes
- **Account Dashboard** (`/account`) - View bookings, manage profile

### Admin Routes
- **Dashboard** (`/admin`) - KPIs, active rides, dispatch grid
- **Schedule** (`/admin/schedule`) - Calendar view (day/week/month)
- **Bookings** (`/admin/bookings`) - Manage all bookings
- **Clients** (`/admin/clients`) - Client management
- **Drivers** (`/admin/drivers`) - Driver management
- **Fleet** (`/admin/fleet`) - Vehicle inventory
- **Manifests** (`/admin/manifests`) - Generate trip manifests & invoices
- **Live Map** (`/admin/map`) - Real-time driver tracking
- **Pricing** (`/admin/pricing`) - Rate configuration
- **Campaigns** (`/admin/campaigns`) - Email marketing
- **Settings** (`/admin/settings`) - System configuration
- **Audit Log** (`/admin/audit`) - Admin action history

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Yes | Google Maps API key |
| `NEXT_PUBLIC_STRIPE_PK` | Yes | Stripe publishable key |
| `NEXT_PUBLIC_PUSHER_KEY` | No | Pusher app key (for real-time) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | No | Pusher cluster (e.g., us2) |
| `NEXT_PUBLIC_SITE_URL` | No | Site URL for metadata |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth client ID |

## Authentication

The app uses JWT-based authentication with tokens stored in localStorage (will migrate to httpOnly cookies).

- **Login:** Email/password or Google OAuth
- **Registration:** Email verification required
- **Password Reset:** Email-based token flow
- **Session:** Auto-refresh every 5 minutes

## API Integration

All API calls go through `src/lib/api.ts` which includes:

- Automatic token injection
- Token refresh on 401
- Rate limiting
- Retry logic with exponential backoff
- Error handling with user-friendly messages

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm run start
```

## Testing

Currently no tests implemented. See `TEST_REPORT.md` for testing recommendations.

## Contributing

This is a private project for Westminster Chariots.

## License

Proprietary - Westminster Chariots LLC

## Support

For issues or questions, contact: book@westminsterchariots.com
