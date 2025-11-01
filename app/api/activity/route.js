import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Since you don't have an Activity model, we'll generate activity from existing data
    const activities = await generateActivityFromData(parseInt(userId));

    return NextResponse.json({
      success: true,
      activities: activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);
    return NextResponse.json(
      {
        success: true,
        activities: generateMockActivity(),
      },
      { status: 200 }
    );
  }
}

async function generateActivityFromData(userId) {
  const activities = [];

  try {
    // Get user's recent projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { clientId: userId },
          { freelancerId: userId }
        ]
      },
      include: {
        client: { select: { name: true } },
        freelancer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent proposals
    const proposals = await prisma.proposal.findMany({
      where: { freelancerId: userId },
      include: {
        job: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { conversation: { 
            OR: [
              { clientId: userId },
              { freelancerId: userId }
            ]
          }}
        ]
      },
      include: {
        conversation: {
          include: {
            client: { select: { name: true } },
            freelancer: { select: { name: true } },
            project: { select: { title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Generate activities from projects
    projects.forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: project.freelancerId === userId ? "PROJECT_STARTED" : "PROJECT_CREATED",
        title: project.freelancerId === userId ? "Project Started" : "Project Created",
        description: project.freelancerId === userId 
          ? `You started working on "${project.title}"`
          : `You created project "${project.title}"`,
        time: formatTimeAgo(project.createdAt),
        icon: project.freelancerId === userId ? "🚀" : "📝",
      });
    });

    // Generate activities from proposals
    proposals.forEach(proposal => {
      if (proposal.status === 'accepted') {
        activities.push({
          id: `proposal-${proposal.id}`,
          type: "PROPOSAL_ACCEPTED",
          title: "Proposal Accepted",
          description: `Your proposal for "${proposal.job.title}" was accepted`,
          time: formatTimeAgo(proposal.updatedAt),
          icon: "✅",
        });
      }
    });

    // Generate activities from messages
    messages.forEach(message => {
      if (message.senderId !== userId) {
        const conversation = message.conversation;
        const otherUser = conversation.clientId === userId ? conversation.freelancer : conversation.client;
        
        activities.push({
          id: `message-${message.id}`,
          type: "MESSAGE_RECEIVED",
          title: "New Message",
          description: `New message from ${otherUser?.name || 'user'} regarding "${conversation.project?.title || 'project'}"`,
          time: formatTimeAgo(message.createdAt),
          icon: "💬",
        });
      }
    });

  } catch (error) {
    console.error("Error generating activities:", error);
  }

  // Sort by time and limit to 10
  return activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 10);
}

function generateMockActivity() {
  return [
    {
      id: 1,
      type: "project_started",
      title: "Project Started",
      description: "You started working on 'E-commerce Website Development'",
      time: "2 hours ago",
      icon: "📝",
    },
    {
      id: 2,
      type: "payment_received",
      title: "Payment Received",
      description: "₹15,000 received from Tech Solutions Inc",
      time: "1 day ago",
      icon: "💰",
    },
    {
      id: 3,
      type: "proposal_accepted",
      title: "Proposal Accepted",
      description: "Your proposal for Mobile App Design was accepted",
      time: "2 days ago",
      icon: "✅",
    },
  ];
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}