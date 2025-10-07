import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const LOGIN_PATH = "/login";
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/verify",
  "/api/auth/register",
  "/_next",
  "/favicon.ico",
];

// Paths that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/wp-admin", // Adding wp-admin to protected paths
];

function redirectToLogin(request) {
  const url = new URL(LOGIN_PATH, request.url);
  url.searchParams.set(
    "callbackUrl",
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.redirect(url);
}

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

function isProtectedPath(pathname) {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Only check authentication for protected paths
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const { cookies } = request;
  const token = cookies.get(AUTH_COOKIE_NAME)?.value;

  // If there's no token cookie - redirect to login
  if (!token) {
    console.log("No token found, redirecting to login");
    return redirectToLogin(request);
  }

  try {
    const verifyUrl = new URL("/api/auth/verify", request.url);

    const verifyRes = await fetch(verifyUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "", // Forward cookies
      },
      body: JSON.stringify({ token }),
    });

    if (verifyRes.ok) {
      const userData = await verifyRes.json();

      // Check if accessing admin routes requires admin role
      if (pathname.startsWith("/wp-admin")) {
        if (userData.role !== "admin") {
          // Redirect non-admin users trying to access wp-admin
          const url = new URL("/login", request.url);
          return NextResponse.redirect(url);
        }
      }

      // Clone the request headers and set user data for use in routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-data", JSON.stringify(userData));

      const response = NextResponse.next();
      response.headers.set("x-user-data", JSON.stringify(userData));

      return response;
    } else {
      console.log("Token verification failed, redirecting to login");
      // Clear invalid token
      const response = redirectToLogin(request);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  } catch (err) {
    console.error("Middleware verify error:", err);
    // Clear invalid token on error
    const response = redirectToLogin(request);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
