import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          registrationMethod: user.registrationMethod,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          profile: user.profile
            ? {
                phoneNumber: user.profile.phoneNumber,
                title: user.profile.title,
                bio: user.profile.bio,
                location: user.profile.location,
                available: user.profile.available,
              }
            : null,
        })),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch users",
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Name, email, and password are required",
        }),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User with this email already exists",
        }),
        { status: 400 }
      );
    }

    // Hash password (you'll need to import bcrypt)
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        registrationMethod: "email", // Track registration method
      },
      include: {
        profile: true,
      },
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: newUser.id,
        title:
          role === "freelancer"
            ? "Freelancer"
            : role === "client"
            ? "Client"
            : "User",
        bio: "New user",
        available: role === "freelancer",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          registrationMethod: newUser.registrationMethod,
          createdAt: newUser.createdAt,
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
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to create user",
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
