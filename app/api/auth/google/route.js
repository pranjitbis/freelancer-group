import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") || "user";

    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is missing");
      return NextResponse.redirect("/login?error=Auth configuration error");
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error("NEXTAUTH_URL is missing");
      return NextResponse.redirect("/login?error=Auth configuration error");
    }

    // Use EXACT redirect URI that matches Google Console
    const redirectUri = "http://localhost:3000/api/auth/google/callback";

    console.log("Using redirect URI:", redirectUri);

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile email",
        access_type: "offline",
        prompt: "consent",
        state: JSON.stringify({ userType }),
      }
    )}`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Google auth initiation error:", error);
    return NextResponse.redirect("/login?error=Auth configuration error");
  }
}
