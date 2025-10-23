// app/api/freelancer/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const skills = searchParams.get("skills") || "";
    const minRate = searchParams.get("minRate");
    const maxRate = searchParams.get("maxRate");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    const skip = (page - 1) * limit;

    console.log("🔍 Fetching freelancers from database...");

    // Build where clause - get users who have profiles
    const where = {
      profile: {
        isNot: null,
      },
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        {
          profile: {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { bio: { contains: search, mode: "insensitive" } },
              { skills: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Skills filter
    if (skills) {
      where.profile.skills = { contains: skills, mode: "insensitive" };
    }

    // Hourly rate filter
    if (minRate || maxRate) {
      where.profile.hourlyRate = {};
      if (minRate) where.profile.hourlyRate.gte = parseFloat(minRate);
      if (maxRate) where.profile.hourlyRate.lte = parseFloat(maxRate);
    }

    // Category filter
    if (category !== "all") {
      where.profile.skills = {
        contains: category,
        mode: "insensitive",
      };
    }

    // Fetch freelancers from database
    const [freelancers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          reviewsReceived: true,
          freelancerProjects: {
            where: {
              status: "completed",
            },
          },
          _count: {
            select: {
              freelancerProjects: {
                where: {
                  status: "completed",
                },
              },
              reviewsReceived: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    console.log(`✅ Found ${freelancers.length} freelancers`);

    // Process freelancer data
    const processedFreelancers = freelancers.map((freelancer) => {
      // Calculate average rating
      const totalRating = freelancer.reviewsReceived.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating =
        freelancer.reviewsReceived.length > 0
          ? (totalRating / freelancer.reviewsReceived.length).toFixed(1)
          : "0.0";

      // Process skills
      const skillsArray = freelancer.profile?.skills
        ? freelancer.profile.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0)
        : [];

      // FIXED: Properly handle profile image
      // Check multiple possible image sources in order of priority
      let profileImage = null;

      // 1. First check user's main avatar
      if (freelancer.avatar) {
        profileImage = freelancer.avatar;
      }
      // 2. Then check profile avatar
      else if (freelancer.profile?.avatar) {
        profileImage = freelancer.profile.avatar;
      }
      // 3. Check if there's a profileImage field (if you add it to schema)
      else if (freelancer.profileImage) {
        profileImage = freelancer.profileImage;
      }

      console.log(`👤 Freelancer ${freelancer.name} image:`, {
        userAvatar: freelancer.avatar,
        profileAvatar: freelancer.profile?.avatar,
        finalImage: profileImage,
      });

      return {
        id: freelancer.id,
        name: freelancer.name,
        email: freelancer.email,
        // FIXED: Use consistent field name
        avatar: profileImage,
        profileImage: profileImage, // Add this for compatibility
        profile: {
          ...freelancer.profile,
          // Ensure profile also has the image
          avatar: profileImage,
        },
        avgRating,
        skills: skillsArray,
        reviewCount: freelancer.reviewsReceived.length,
        completedProjects: freelancer._count.freelancerProjects,
        isAvailable: freelancer.profile?.available ?? true,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      freelancers: processedFreelancers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching freelancers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
