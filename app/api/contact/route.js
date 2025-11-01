// app/api/contact/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId, freelancerId, subject, message, projectDetails } = body;

    // Validate required fields
    if (!clientId || !freelancerId || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if client has premium plan
    const clientPlan = await prisma.userPlan.findUnique({
      where: { userId: parseInt(clientId) },
    });

    if (!clientPlan || clientPlan.planType !== "premium") {
      return NextResponse.json(
        {
          success: false,
          error: "Premium plan required to contact freelancers",
        },
        { status: 403 }
      );
    }

    // Check if freelancer exists
    const freelancer = await prisma.user.findUnique({
      where: { id: parseInt(freelancerId) },
      select: { id: true, name: true, email: true },
    });

    if (!freelancer) {
      return NextResponse.json(
        { success: false, error: "Freelancer not found" },
        { status: 404 }
      );
    }

    // Create contact request
    const contactRequest = await prisma.contactRequest.create({
      data: {
        clientId: parseInt(clientId),
        freelancerId: parseInt(freelancerId),
        subject,
        message,
        projectDetails: projectDetails || null,
        status: "pending",
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        freelancer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Here you would typically:
    // 1. Send email notification to freelancer
    // 2. Create notification in the system
    // 3. Update any relevant analytics

    console.log("Contact request created:", contactRequest.id);

    return NextResponse.json({
      success: true,
      message: "Contact request sent successfully",
      contactRequest: {
        id: contactRequest.id,
        subject: contactRequest.subject,
        createdAt: contactRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating contact request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send contact request",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // 'sent' or 'received'

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: "User ID and type are required" },
        { status: 400 }
      );
    }

    let contactRequests;

    if (type === "sent") {
      contactRequests = await prisma.contactRequest.findMany({
        where: { clientId: parseInt(userId) },
        include: {
          freelancer: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "received") {
      contactRequests = await prisma.contactRequest.findMany({
        where: { freelancerId: parseInt(userId) },
        include: {
          client: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type parameter" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      contactRequests,
    });
  } catch (error) {
    console.error("Error fetching contact requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact requests" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
