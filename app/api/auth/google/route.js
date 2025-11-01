import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all users
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

    // Format the response with proper registration method detection
    const formattedUsers = users.map((user) => {
      // Detect registration method more accurately
      let registrationMethod = user.registrationMethod;

      // If no explicit registration method, detect based on password
      if (!registrationMethod) {
        if (
          user.password === "google_oauth" ||
          user.password === "" ||
          !user.password
        ) {
          registrationMethod = "google";
        } else {
          registrationMethod = "email";
        }
      }

      // Update user in database if registration method is missing
      if (!user.registrationMethod) {
        // You can optionally update the user here, but be careful with concurrent requests
        console.log(
          `Updating registration method for ${user.email} to ${registrationMethod}`
        );
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "active",
        avatar: user.avatar,
        registrationMethod: registrationMethod,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        profile: user.profile
          ? {
              id: user.profile.id,
              phoneNumber: user.profile.phoneNumber,
              title: user.profile.title,
              bio: user.profile.bio,
              location: user.profile.location,
              available: user.profile.available,
              experience: user.profile.experience,
              skills: user.profile.skills,
              hourlyRate: user.profile.hourlyRate,
            }
          : null,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        users: formattedUsers,
        total: users.length,
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
        message: error.message,
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
