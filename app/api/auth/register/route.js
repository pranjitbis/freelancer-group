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
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400 }
      );
    }

    // Destructure and trim inputs
    const name = body.name?.trim();
    const email = body.email?.trim();
    const password = body.password;

    // Validate
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    // Prisma unique constraint error
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({ error: "Email already in use" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
