import { NextResponse } from "next/server";

// Store active connections
const clients = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  console.log(`🔌 User ${userId} connecting to SSE...`);

  // Set up Server-Sent Events headers
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache, no-transform",
    "Content-Encoding": "none",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  let controller;

  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this client
      clients.set(userId, controller);

      console.log(
        `✅ User ${userId} connected. Total clients: ${clients.size}`
      );

      // Send connection confirmation
      const connectMessage = {
        type: "connected",
        message: "Connected to real-time messaging",
        userId: userId,
        timestamp: new Date().toISOString(),
      };

      sendToClient(userId, connectMessage);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        clients.delete(userId);
        console.log(
          `❌ User ${userId} disconnected. Remaining clients: ${clients.size}`
        );
      });
    },
  });

  return new Response(stream, { headers });
}

// Send message to specific users
export async function POST(request) {
  try {
    const { type, data, targetUserIds } = await request.json();

    console.log("📤 Broadcasting via SSE:", { type, targetUserIds });

    switch (type) {
      case "new_message":
        await broadcastNewMessage(data, targetUserIds);
        break;

      case "typing_start":
        broadcastToUsers(targetUserIds, {
          type: "typing_start",
          data: data,
          timestamp: new Date().toISOString(),
        });
        break;

      case "typing_stop":
        broadcastToUsers(targetUserIds, {
          type: "typing_stop",
          data: data,
          timestamp: new Date().toISOString(),
        });
        break;

      case "message_read":
        broadcastToUsers(targetUserIds, {
          type: "message_read",
          data: data,
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        console.log("Unknown message type:", type);
    }

    return NextResponse.json({
      success: true,
      message: "Event broadcasted",
    });
  } catch (error) {
    console.error("❌ SSE broadcast error:", error);
    return NextResponse.json(
      { error: "Failed to broadcast event" },
      { status: 500 }
    );
  }
}

// Broadcast new message
async function broadcastNewMessage(messageData, targetUserIds) {
  const eventData = {
    type: "new_message",
    data: messageData,
    timestamp: new Date().toISOString(),
  };

  broadcastToUsers(targetUserIds, eventData);
  console.log(`📨 New message broadcasted to ${targetUserIds.length} users`);
}

// Send data to specific users
function broadcastToUsers(userIds, data) {
  const dataString = `data: ${JSON.stringify(data)}\n\n`;
  let sentCount = 0;

  userIds.forEach((userId) => {
    const client = clients.get(userId);
    if (client) {
      try {
        client.enqueue(dataString);
        sentCount++;
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
        clients.delete(userId);
      }
    }
  });

  console.log(`✅ Sent to ${sentCount}/${userIds.length} users`);
}

// Send to a specific client
function sendToClient(userId, data) {
  const client = clients.get(userId);
  if (client) {
    try {
      const dataString = `data: ${JSON.stringify(data)}\n\n`;
      client.enqueue(dataString);
    } catch (error) {
      console.error(`Error sending to user ${userId}:`, error);
      clients.delete(userId);
    }
  }
}
