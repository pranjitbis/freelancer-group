import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        _count: {
          select: {
            proposals: {
              where: {
                status: "completed",
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate rating (you might want to compute this from actual reviews)
    const rating = 4.8; // Placeholder

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      profile: user.profile
        ? {
            title: user.profile.skills
              ? `Expert in ${user.profile.skills.split(",")[0]}`
              : "Freelancer",
            hourlyRate: user.profile.hourlyRate || 0,
            rating: rating,
            completedProjects: user._count.proposals,
            skills: user.profile.skills ? user.profile.skills.split(",") : [],
          }
        : null,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
