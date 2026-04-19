import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Middleware can't access localStorage, so we let client-side useAuth handle protection
  // Just allow all requests through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
  ],
};
