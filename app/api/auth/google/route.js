import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") || "user";

    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is missing");
      return NextResponse.redirect(
        "https://aroliya.com/login?error=Auth configuration error"
      );
    }

    // Use production redirect URI
    const redirectUri = "https://aroliya.com/api/auth/google/callback";

    console.log("Using production redirect URI:", redirectUri);

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
    return NextResponse.redirect(
      "https://aroliya.com/login?error=Auth configuration error"
    );
  }
}
