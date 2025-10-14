import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const userPlan = await prisma.userPlan.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!userPlan) {
      // Create default free plan if not exists
      const newPlan = await prisma.userPlan.create({
        data: {
          planType: "free",
          connects: 10,
          usedConnects: 0,
          userId: parseInt(userId),
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      return NextResponse.json({ plan: newPlan });
    }

    return NextResponse.json({ plan: userPlan });
  } catch (error) {
    console.error("Get user plan error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user plan" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, planType } = body;

    if (!userId || !planType) {
      return NextResponse.json(
        { error: "userId and planType are required" },
        { status: 400 }
      );
    }

    const planConfig = {
      free: { connects: 10, price: 0 },
      premium: { connects: 100, price: 19 },
    };

    const config = planConfig[planType];
    if (!config) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

    const userPlan = await prisma.userPlan.upsert({
      where: { userId: parseInt(userId) },
      update: {
        planType,
        connects: config.connects,
        usedConnects: 0, // Reset used connects when changing plan
        expiresAt,
      },
      create: {
        planType,
        connects: config.connects,
        usedConnects: 0,
        expiresAt,
        userId: parseInt(userId),
      },
    });

    // Record plan change
    await prisma.connectTransaction.create({
      data: {
        type: "plan_change",
        amount: config.connects,
        description: `Upgraded to ${planType} plan with ${config.connects} connects`,
        userId: parseInt(userId),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Plan updated to ${planType} successfully`,
      plan: userPlan,
    });
  } catch (error) {
    console.error("Update user plan error:", error);
    return NextResponse.json(
      { error: "Failed to update user plan" },
      { status: 500 }
    );
  }
}
