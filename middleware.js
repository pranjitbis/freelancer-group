import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const LOGIN_PATH = "/login";
const UNAUTHORIZED_PATH = "/unauthorized";

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

function redirectToUnauthorized(request) {
  const url = new URL(UNAUTHORIZED_PATH, request.url);
  return NextResponse.redirect(url);
}

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

// Function to check if token is expired
function isTokenExpired(token) {
  try {
    if (!token) return true;

    // If token is a JWT, decode and check expiration
    if (token.includes(".")) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        console.log("❌ Token expired");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}

// Function to verify token with backend
async function verifyToken(token) {
  try {
    // For demo purposes - in real app, verify with your backend
    // This is a simplified check
    if (token && token.startsWith("eyJ")) {
      // Basic JWT check
      return {
        valid: true,
        user: { id: "user_id", email: "user@example.com" },
      };
    }
    return { valid: false, user: null };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, user: null };
  }
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

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log("❌ Token expired, redirecting to unauthorized");
    const response = redirectToUnauthorized(request);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  console.log("✅ Token found, proceeding with request");

  try {
    // Verify token (optional - remove if you don't need backend verification)
    const tokenVerification = await verifyToken(token);
    if (!tokenVerification.valid) {
      console.log("❌ Invalid token, redirecting to unauthorized");
      const response = redirectToUnauthorized(request);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

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
    // Clear invalid token on error and redirect to unauthorized
    const response = redirectToUnauthorized(request);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
