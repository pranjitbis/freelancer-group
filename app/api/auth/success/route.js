// app/api/auth/success/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { NextResponse } from "next/server";

// Role-based redirect paths
const redirectPaths = {
  admin: "/wp-admin",
  client: "/client-dashboard",
  freelancer: "/freelancer-dashboard",
  user: "/dashboard",
};

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("🔀 Auth success handler - Session:", session);

    if (!session || !session.user) {
      console.log("No session found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRole = session.user.role || "user";
    const redirectPath = redirectPaths[userRole] || "/dashboard";

    console.log(
      `🎯 Redirecting user ${session.user.email} with role ${userRole} to ${redirectPath}`
    );

    // Create proper URL for redirect
    const targetUrl = new URL(redirectPath, request.url);
    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error("Auth success handler error:", error);
    // Fallback to default dashboard with proper URL
    const fallbackUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(fallbackUrl);
  }
}
