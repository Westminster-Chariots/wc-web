import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /account and /admin/*
  if (pathname.startsWith("/account") || pathname.startsWith("/admin")) {
    // Check if access_token cookie exists
    const accessToken = request.cookies.get("access_token");
    
    if (!accessToken) {
      // No cookie, redirect to auth
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Cookie exists, allow access
    // The useAuth hook will verify the token validity on the client side
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
