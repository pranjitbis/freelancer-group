import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let io;

// Fix the markMessagesAsRead function
const markMessagesAsRead = async (conversationId, userId) => {
  try {
    console.log(
      `📖 Marking messages as read for user ${userId} in conversation ${conversationId}`
    );

    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
        NOT: {
          senderId: parseInt(userId),
        },
        readBy: {
          none: {
            id: parseInt(userId),
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (unreadMessages.length === 0) {
      console.log(`ℹ️ No unread messages for user ${userId}`);
      return;
    }

    const messageIds = unreadMessages.map((msg) => msg.id);

    for (const messageId of messageIds) {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          readBy: {
            connect: { id: parseInt(userId) },
          },
        },
      });
    }

    console.log(
      `✅ Marked ${messageIds.length} messages as read for user ${userId}`
    );
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    throw error;
  }
};

export function initSocketServer(server) {
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
    socket.on("join_conversation", async (data) => {
      const { conversationId, userId } = data;
      if (!conversationId || !userId) return;

      socket.join(`conversation_${conversationId}`);
      console.log(`💬 User ${userId} joined conversation: ${conversationId}`);

      try {
        await markMessagesAsRead(conversationId, userId);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const {
          conversationId,
          senderId,
          content,
          messageType,
          tempId,
          amount,
          paymentRequestId,
        } = data;

        console.log("📤 Sending message:", {
          conversationId,
          senderId,
          content: content?.substring(0, 50) + "...",
          messageType,
          amount,
        });

        const messageData = {
          content,
          messageType: messageType || "TEXT",
          senderId: parseInt(senderId),
          conversationId: parseInt(conversationId),
        };

        if (messageType === "PAYMENT_REQUEST") {
          messageData.amount = amount ? parseFloat(amount) : null;
          messageData.paymentRequestId = paymentRequestId
            ? parseInt(paymentRequestId)
            : null;
        }

        const message = await prisma.message.create({
          data: messageData,
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
              },
            },
            readBy: {
              select: { id: true, name: true },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: parseInt(conversationId) },
          data: { updatedAt: new Date() },
        });

        socket.to(`conversation_${conversationId}`).emit("receive_message", {
          ...message,
          tempId,
        });

        socket.emit("message_sent", {
          ...message,
          tempId,
        });

        console.log(`✅ Message saved and broadcasted: ${message.id}`);
      } catch (error) {
        console.error("❌ Message error:", error);
        socket.emit("message_error", {
          tempId: data.tempId,
          error: "Failed to send message",
        });
      }
    });

    // FIXED: Payment request events - only broadcast to other users
    socket.on("payment_request_created", (data) => {
      const { conversationId, paymentRequest, message } = data;
      if (!conversationId) return;

      console.log(
        "💰 Broadcasting payment request creation to other users:",
        paymentRequest?.id
      );

      socket
        .to(`conversation_${conversationId}`)
        .emit("payment_request_created", {
          paymentRequest,
          message,
        });
    });

    socket.on("payment_request_updated", (data) => {
      const { conversationId, paymentRequest } = data;
      if (!conversationId) return;

      console.log(
        "💰 Broadcasting payment request update:",
        paymentRequest?.id
      );

      socket
        .to(`conversation_${conversationId}`)
        .emit("payment_request_updated", {
          paymentRequest,
        });
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

// FIXED: Better error handling for getIO
export function getIO() {
  if (!io) {
    console.warn("⚠️ Socket.io not initialized yet");
    return null;
  }
  return io;
}
