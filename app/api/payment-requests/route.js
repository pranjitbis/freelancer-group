import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getIO } from "@/lib/socket-server";

const prisma = new PrismaClient();

// Helper function to format currency
function formatCurrency(amount, currency = "USD") {
  if (!amount && amount !== 0) return "-";

  const formatter = new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  return formatter.format(amount);
}

// Create payment request
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      conversationId,
      freelancerId,
      clientId,
      amount,
      description,
      dueDate,
      currency = "USD", // This comes from frontend
    } = body;

    console.log("📦 Creating payment request:", {
      conversationId,
      freelancerId,
      clientId,
      amount,
      description,
      dueDate,
      currency, // Log the currency from frontend
    });

    // Validate required fields
    if (!conversationId || !freelancerId) {
      return NextResponse.json(
        { success: false, error: "Missing conversationId or freelancerId" },
        { status: 400 }
      );
    }

    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Validate currency
    if (!["USD", "INR"].includes(currency)) {
      return NextResponse.json(
        { success: false, error: "Invalid currency. Use USD or INR" },
        { status: 400 }
      );
    }

    // First, get the conversation to find the clientId
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
      include: {
        project: { select: { title: true, id: true } },
        client: { select: { id: true, name: true, currency: true } },
        freelancer: { select: { id: true, name: true, currency: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Use the clientId from the conversation if not provided
    const resolvedClientId = clientId || conversation.clientId;
    if (!resolvedClientId) {
      return NextResponse.json(
        { success: false, error: "Client ID not found" },
        { status: 400 }
      );
    }

    console.log("🔍 Resolved clientId:", resolvedClientId);

    // Get users with their currency preferences
    const [freelancer, client] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parseInt(freelancerId) },
        select: { name: true, currency: true },
      }),
      prisma.user.findUnique({
        where: { id: parseInt(resolvedClientId) },
        select: { name: true, currency: true },
      }),
    ]);

    if (!freelancer) {
      return NextResponse.json(
        { success: false, error: "Freelancer not found" },
        { status: 404 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Use the currency sent from the frontend (freelancer's selection)
    const selectedCurrency = currency || "USD";

    console.log("💰 Selected currency:", selectedCurrency);

    let paymentRequest;
    let paymentMessage;

    await prisma.$transaction(async (tx) => {
      // Create payment request with the SELECTED currency
      paymentRequest = await tx.paymentRequest.create({
        data: {
          amount: paymentAmount,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          conversationId: parseInt(conversationId),
          freelancerId: parseInt(freelancerId),
          clientId: parseInt(resolvedClientId),
          clientName: client?.name || "Client",
          freelancerName: freelancer?.name || "Freelancer",
          projectTitle: conversation?.project?.title || "Project",
          status: "pending",
          currency: selectedCurrency, // Use selected currency here
        },
      });

      console.log("✅ Payment request created:", {
        id: paymentRequest.id,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency, // Should now be the selected currency
      });

      // Create payment request message with the SELECTED currency
      paymentMessage = await tx.message.create({
        data: {
          content: `Payment Request: ${description}`,
          messageType: "PAYMENT_REQUEST",
          amount: paymentAmount,
          senderId: parseInt(freelancerId),
          conversationId: parseInt(conversationId),
          paymentRequestId: paymentRequest.id,
          currency: selectedCurrency, // Use selected currency here
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
          paymentRequest: {
            select: {
              id: true,
              amount: true,
              status: true,
              description: true,
              currency: true,
            },
          },
        },
      });

      console.log("💬 Payment request message created:", {
        messageId: paymentMessage.id,
        amount: paymentMessage.amount,
        currency: paymentMessage.currency, // Should now be the selected currency
        paymentRequestId: paymentMessage.paymentRequestId,
      });
    });

    // Update conversation last activity
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { updatedAt: new Date() },
    });

    // Socket.io broadcast
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${conversationId}`).emit(
          "payment_request_created",
          {
            paymentRequest,
            message: paymentMessage,
          }
        );
        console.log("📢 Payment request broadcasted via Socket.io");
      }
    } catch (socketError) {
      console.error("Socket.io broadcast failed:", socketError);
    }

    return NextResponse.json({
      success: true,
      paymentRequest,
      paymentMessage,
      message: "Payment request created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating payment request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Get payment requests for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType");
    const status = searchParams.get("status");

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, error: "Missing userId or userType" },
        { status: 400 }
      );
    }

    const whereClause = {
      ...(userType === "client"
        ? { clientId: parseInt(userId) }
        : { freelancerId: parseInt(userId) }),
      ...(status && status !== "all" ? { status } : {}),
    };

    console.log("🔍 Fetching payment requests with where clause:", whereClause);

    const paymentRequests = await prisma.paymentRequest.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
            profile: { select: { avatar: true } },
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
            profile: { select: { avatar: true } },
          },
        },
        conversation: {
          include: {
            project: { select: { title: true, id: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${paymentRequests.length} payment requests`);

    return NextResponse.json({
      success: true,
      paymentRequests,
    });
  } catch (error) {
    console.error("❌ Error fetching payment requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment requests",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
