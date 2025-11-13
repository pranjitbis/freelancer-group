import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const LOGIN_PATH = "/auth/login";

// Only these paths are publicly accessible without authentication
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/login",
  "/register",
  "/auth/error",
  "/api/auth",
  "/api/auth/login",
  "/api/auth/verify",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/callback",
  "/_next",
  "/favicon.ico",
  "/find-work",
  "/home",
  "/about",
  "/contact-us",
  "/our-team",
  "/services/virtual-assistance",
  "/services/form-filling",
  "/services/web-development",
  "/services/e-commerce-solutions",
  "/services/travel-bookings",
  "/services/data-visualization",
  "/services/freelancer-hub/freelancer-plan",
  "/freelancer-hub/hire-freelancer",
  "/career",
  "/unauthorized",
];

function redirectToLogin(request) {
  const url = new URL(LOGIN_PATH, request.url);
  url.searchParams.set(
    "callbackUrl",
    encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)
  );
  return NextResponse.redirect(url);
}

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log(`🛡️ Middleware checking: ${pathname}`);

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    console.log(`✅ Public path, allowing access: ${pathname}`);
    return NextResponse.next();
  }

  // ALL OTHER PATHS REQUIRE AUTHENTICATION
  console.log(`🔒 Path requires authentication: ${pathname}`);

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // If there's no token cookie - redirect to login
  if (!token) {
    console.log("❌ No token found, redirecting to login");
    return redirectToLogin(request);
  }

  console.log("✅ Token found, proceeding with request");

  try {
    // Add token to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-auth-token", token);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  } catch (err) {
    console.error("🚨 Middleware error:", err);
    // Clear invalid token on error
    const response = redirectToLogin(request);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
