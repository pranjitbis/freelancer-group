import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");

    let userType = "user";

    // Parse state to get userType
    try {
      if (stateParam) {
        const stateData = JSON.parse(stateParam);
        userType = stateData.userType || "user";
      }
    } catch (e) {
      console.log("Using default user type");
    }

    if (!code) {
      return NextResponse.redirect(
        "https://aroliya.com/login?error=No authorization code received"
      );
    }

    // Use production redirect URI
    const redirectUri = "https://aroliya.com/api/auth/google/callback";

    console.log("Using production redirect URI:", redirectUri);

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokens);
      return NextResponse.redirect(
        "https://aroliya.com/login?error=Token exchange failed"
      );
    }

    // Get user info from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from Google");
    }

    const googleUser = await userResponse.json();

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (!user) {
      // Create new user with selected role and Google registration method
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          name: googleUser.name,
          password: "google_oauth",
          role: userType,
          status: "active",
          avatar: googleUser.picture,
          registrationMethod: "google",
        },
      });

      await prisma.userProfile.create({
        data: {
          userId: user.id,
          title:
            userType === "freelancer"
              ? "Freelancer"
              : userType === "client"
              ? "Client"
              : "User",
          bio: "",
          available: userType === "freelancer",
        },
      });

      console.log(
        `✅ New Google user created: ${googleUser.email} with role: ${userType}`
      );
    } else {
      // Update last login for existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          registrationMethod:
            user.registrationMethod === "email"
              ? "google"
              : user.registrationMethod,
        },
      });
      console.log(`✅ Existing user logged in via Google: ${googleUser.email}`);
    }

    // Determine redirect URL based on user role
    const getRedirectUrl = (role) => {
      switch (role) {
        case "admin":
          return "/wp-admin";
        case "client":
          return "/client-dashboard";
        case "freelancer":
          return "/freelancer-dashboard";
        case "user":
        default:
          return "/dashboard";
      }
    };

    const redirectUrl = getRedirectUrl(user.role);

    // Create JWT token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        registrationMethod: user.registrationMethod,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "30d" }
    );

    // Redirect to appropriate dashboard on aroliya.com
    const response = NextResponse.redirect(`https://aroliya.com${redirectUrl}`);

    // Set secure cookies for production
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true, // Use secure cookies in production
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("userRole", user.role, {
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("registrationMethod", user.registrationMethod, {
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      "https://aroliya.com/login?error=Google authentication failed"
    );
  }
}
