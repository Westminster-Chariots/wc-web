import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /account and /admin/*
  if (pathname.startsWith("/account") || pathname.startsWith("/admin")) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com";
      
      // Forward all cookies to backend
      const cookieHeader = request.headers.get("cookie") || "";
      
      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      // User is authenticated, allow access
      return NextResponse.next();
    } catch (error) {
      // Network error or backend down
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
