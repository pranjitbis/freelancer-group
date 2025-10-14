import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const LOGIN_PATH = "/auth/login"; // Fixed path to match your login page
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register", 
  "/api/auth/login",
  "/api/auth/verify",
  "/api/auth/register",
  "/api/auth/logout",
  "/_next",
  "/favicon.ico",
  "/find-work",
  "/home",
];

// Paths that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/wp-admin",
  "/freelancer-dashboard",
  "/client-dashboard",
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

  console.log(`🛡️ Middleware checking: ${pathname}`);

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    console.log(`✅ Public path, skipping auth: ${pathname}`);
    return NextResponse.next();
  }

  // Only check authentication for protected paths
  if (!isProtectedPath(pathname)) {
    console.log(`✅ Non-protected path, skipping auth: ${pathname}`);
    return NextResponse.next();
  }

  console.log(`🔒 Protected path, checking auth: ${pathname}`);

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // If there's no token cookie - redirect to login
  if (!token) {
    console.log("❌ No token found, redirecting to login");
    return redirectToLogin(request);
  }

  console.log("✅ Token found, verifying...");

  try {
    // Verify token by calling the verify API
    const verifyUrl = new URL("/api/auth/verify", request.url);
    
    const verifyRes = await fetch(verifyUrl, {
      method: "GET", // Use GET instead of POST
      headers: {
        "Content-Type": "application/json",
        Cookie: `${AUTH_COOKIE_NAME}=${token}`, // Pass the token as cookie
      },
    });

    if (verifyRes.ok) {
      const data = await verifyRes.json();
      console.log("✅ Token verified successfully:", data.user);

      // Check if accessing admin routes requires admin role
      if (pathname.startsWith("/wp-admin")) {
        if (data.user.role !== "admin") {
          console.log("❌ Non-admin user trying to access admin area");
          const url = new URL("/unauthorized", request.url);
          return NextResponse.redirect(url);
        }
        console.log("✅ Admin access granted");
      }

      // Add user data to headers for use in routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", data.user.id);
      requestHeaders.set("x-user-role", data.user.role);
      requestHeaders.set("x-user-email", data.user.email);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return response;
    } else {
      console.log("❌ Token verification failed");
      // Clear invalid token and redirect to login
      const response = redirectToLogin(request);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  } catch (err) {
    console.error("🚨 Middleware verify error:", err);
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