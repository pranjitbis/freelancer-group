import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create user
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role = "user" } = body;

    console.log("👤 Creating user:", { name, email, role });

    // Validate required fields
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
      });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role,
      },
    });

    // Create default free plan for user
    await prisma.userPlan.create({
      data: {
        planType: "free",
        connects: 10,
        usedConnects: 0,
        userId: user.id,
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ User created successfully:", userWithoutPassword.email);

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: userWithoutPassword,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("🚨 Error creating user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

// Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        userPlan: {
          select: {
            planType: true,
            connects: true,
            usedConnects: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
