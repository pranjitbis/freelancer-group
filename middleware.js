import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const LOGIN_PATH = "/login"; // Fixed: Changed from /auth/login to /login
const PUBLIC_PATHS = [
  "/",
  "/login", // Fixed path
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
  "/contact",
  "/services",
];

// Paths that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/wp-admin",
  "/freelancer-dashboard",
  "/client-dashboard",
  "/profile",
  "/settings",
  "/messages",
  "/projects",
  "/wallet",
];

function redirectToLogin(request) {
  const url = new URL(LOGIN_PATH, request.url);
  // Only add callbackUrl if we're not already going to login
  if (!request.nextUrl.pathname.startsWith(LOGIN_PATH)) {
    url.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search
    );
  }
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
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    if (verifyRes.ok) {
      const data = await verifyRes.json();
      console.log(
        "✅ Token verified successfully. User role:",
        data.user?.role
      );

      // Check role-based access
      if (pathname.startsWith("/wp-admin")) {
        if (data.user?.role !== "admin") {
          console.log("❌ Non-admin user trying to access admin area");
          const url = new URL("/unauthorized", request.url);
          return NextResponse.redirect(url);
        }
        console.log("✅ Admin access granted");
      }

      // Check if user is trying to access wrong dashboard
      if (
        pathname.startsWith("/client-dashboard") &&
        data.user?.role !== "client"
      ) {
        console.log("❌ Non-client user trying to access client dashboard");
        // Redirect to appropriate dashboard based on role
        const redirectPaths = {
          admin: "/wp-admin",
          freelancer: "/freelancer-dashboard",
          user: "/dashboard",
        };
        const redirectPath = redirectPaths[data.user?.role] || "/dashboard";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }

      if (
        pathname.startsWith("/freelancer-dashboard") &&
        data.user?.role !== "freelancer"
      ) {
        console.log(
          "❌ Non-freelancer user trying to access freelancer dashboard"
        );
        const redirectPaths = {
          admin: "/wp-admin",
          client: "/client-dashboard",
          user: "/dashboard",
        };
        const redirectPath = redirectPaths[data.user?.role] || "/dashboard";
        return NextResponse.redirect(new URL(redirectPath, request.url));
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
