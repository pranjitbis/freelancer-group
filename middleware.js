import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";
const LOGIN_PATH = "/login";
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/verify"];

function redirectToLogin(request) {
  const url = new URL(LOGIN_PATH, request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths (login, auth API endpoints)
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const { cookies } = request;
  const token = cookies.get(AUTH_COOKIE_NAME)?.value;

  // If there's no token cookie - redirect to login
  if (!token) return redirectToLogin(request);

  try {
    const verifyRes = await fetch(
      new URL("/api/auth/verify", request.url).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    if (verifyRes.ok) {
      return NextResponse.next();
    } else {
      return redirectToLogin(request);
    }
  } catch (err) {
    console.error("Middleware verify error:", err);
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/wp-admin/:path*"],
};
