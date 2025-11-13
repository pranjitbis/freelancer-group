import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Parse JSON body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (err) {
      console.error("JSON parse error:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
      });
    }

    // Destructure and trim inputs
    const name = body.name?.trim();
    const email = body.email?.trim();
    const password = body.password;
    const userType = body.userType || "client";

    // Validate
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // Validate userType
    if (!["client", "freelancer", "user"].includes(userType)) {
      return new Response(JSON.stringify({ error: "Invalid user type" }), {
        status: 400,
      });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
      });
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400 }
      );
    }

    console.log("Checking for existing user...");
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists:", email);
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user...");
    // Create user with appropriate role and registration method
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userType,
        registrationMethod: "email", // Track as email registration
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        registrationMethod: true,
        createdAt: true, // ADD THIS LINE
        updatedAt: true, // ADD THIS LINE
      },
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: newUser.id,
        title:
          userType === "freelancer"
            ? "Freelancer"
            : userType === "client"
            ? "Client"
            : "User",
        bio: "New user",
        available: userType === "freelancer",
      },
    });

    console.log("User created successfully:", newUser.id);

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          registrationMethod: newUser.registrationMethod,
          createdAt: newUser.createdAt, // ADD THIS LINE
          updatedAt: newUser.updatedAt, // ADD THIS LINE
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Register error details:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error meta:", error.meta);

    // Prisma unique constraint error
    if (error.code === "P2002") {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Handle other Prisma errors
    if (error.code) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}