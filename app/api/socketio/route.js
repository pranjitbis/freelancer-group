import { Server } from "socket.io";

let io;

export async function GET(request) {
  return new Response(
    JSON.stringify({
      status: "active",
      message: "Socket.io server is ready",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function POST(request) {
  return new Response(
    JSON.stringify({
      status: "active",
      message: "Socket.io server is ready",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// Socket.io server initialization
export function initSocketIO(server) {
  if (io) {
    return io;
  }

  console.log("🚀 Initializing Socket.io server...");

  io = new Server(server, {
    path: "/api/socketio/",
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    connectTimeout: 10000,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Join user room
    socket.on("join_user", (userId) => {
      if (!userId) return;

      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined room: user_${userId}`);

      socket.emit("connection_confirmed", {
        userId,
        socketId: socket.id,
        message: "Successfully connected to server",
      });
    });

    // Join conversation room
    socket.on("join_conversation", (data) => {
      const { conversationId, userId } = data;
      if (!conversationId || !userId) return;

      socket.join(`conversation_${conversationId}`);
      console.log(`💬 User ${userId} joined conversation: ${conversationId}`);
    });

    // Send message
    socket.on("send_message", (data) => {
      try {
        const { conversationId, senderId, content, messageType, tempId } = data;

        console.log("📤 Sending message:", {
          conversationId,
          senderId,
          content: content?.substring(0, 50) + "...",
        });

        // Broadcast to conversation room except sender
        socket.to(`conversation_${conversationId}`).emit("receive_message", {
          id: tempId,
          tempId,
          content,
          senderId: parseInt(senderId),
          conversationId: parseInt(conversationId),
          messageType: messageType || "TEXT",
          createdAt: new Date().toISOString(),
          sender: {
            id: parseInt(senderId),
            name: "User", // You can fetch actual user data here
          },
        });

        // Confirm to sender
        socket.emit("message_sent", {
          id: tempId,
          tempId,
          content,
          senderId: parseInt(senderId),
          conversationId: parseInt(conversationId),
          messageType: messageType || "TEXT",
          createdAt: new Date().toISOString(),
          sender: {
            id: parseInt(senderId),
            name: "You",
          },
        });

        console.log(`✅ Message broadcasted: ${tempId}`);
      } catch (error) {
        console.error("❌ Message error:", error);
        socket.emit("message_error", {
          tempId: data.tempId,
          error: "Failed to send message",
        });
      }
    });

    // Typing indicators
    socket.on("typing_start", (data) => {
      const { conversationId, userId, userName } = data;
      if (!conversationId || !userId) return;

      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId,
        userName,
        conversationId,
      });
    });

    socket.on("typing_stop", (data) => {
      const { conversationId, userId } = data;
      if (!conversationId || !userId) return;

      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        userId,
        conversationId,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Client disconnected:", socket.id, "Reason:", reason);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });

  console.log("✅ Socket.io server initialized successfully");
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocketIO first.");
  }
  return io;
}
