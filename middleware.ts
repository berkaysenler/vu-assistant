import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

  // API routes that don't require authentication
  const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a public route, allow access
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access a protected route
  if (!authToken) {
    // If it's an API route, return 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Otherwise, redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (authToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
};
