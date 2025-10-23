import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const {
      clientId,
      freelancerId,
      jobTitle,
      jobDescription,
      budget,
      timeframe,
      message,
    } = await request.json();

    console.log("💼 Hire request received");

    // Validation
    if (!clientId || !freelancerId || !jobTitle || !jobDescription || !budget) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check if users exist
    const [client, freelancer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parseInt(clientId) },
      }),
      prisma.user.findUnique({
        where: { id: parseInt(freelancerId) },
        include: { profile: true },
      }),
    ]);

    if (!client || !freelancer) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Create job post
    const jobPost = await prisma.jobPost.create({
      data: {
        title: jobTitle,
        description: jobDescription,
        category: "direct-hire",
        skills: "Custom Project",
        budget: parseFloat(budget),
        deadline: new Date(
          Date.now() + (parseInt(timeframe) || 30) * 24 * 60 * 60 * 1000
        ),
        experienceLevel: "intermediate",
        status: "active",
        userId: parseInt(clientId),
      },
    });

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        clientId: parseInt(clientId),
        freelancerId: parseInt(freelancerId),
        projectId: jobPost.id,
      },
    });

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        coverLetter:
          message || `I'd like to hire you for: ${jobTitle}. ${jobDescription}`,
        bidAmount: parseFloat(budget),
        timeframe: parseInt(timeframe) || 30,
        status: "pending",
        jobId: jobPost.id,
        freelancerId: parseInt(freelancerId),
        conversationId: conversation.id,
      },
    });

    // Create initial message
    await prisma.message.create({
      data: {
        content:
          message ||
          `Hi ${freelancer.name}, I'd like to hire you for "${jobTitle}". Budget: $${budget}.`,
        messageType: "TEXT",
        senderId: parseInt(clientId),
        conversationId: conversation.id,
        jobId: jobPost.id,
        proposalId: proposal.id,
      },
    });

    return NextResponse.json({
      success: true,
      proposal: {
        id: proposal.id,
        status: proposal.status,
        jobTitle: jobTitle,
        freelancerName: freelancer.name,
      },
      message: "Hire request sent successfully!",
    });
  } catch (error) {
    console.error("❌ Error creating hire request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send hire request",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
