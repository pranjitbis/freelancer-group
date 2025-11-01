import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocket(userId) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    console.log("🔌 Initializing socket connection for user:", userId);

    // Use the correct path and configuration
    const newSocket = io({
      path: "/api/socketio/",
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
    });

    socketRef.current = newSocket;

    const connectionTimeout = setTimeout(() => {
      if (!isConnected) {
        console.log("❌ Connection timeout - falling back to polling");
        setError("Connection timeout. Using fallback mode.");
        // Don't close the socket, let it continue trying
      }
    }, 5000);

    newSocket.on("connect", () => {
      clearTimeout(connectionTimeout);
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      setError("");
      newSocket.emit("join_user", userId);
    });

    newSocket.on("connection_confirmed", (data) => {
      console.log("✅ Connection confirmed:", data);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
      setError(`Connection failed: ${error.message}`);
    });

    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket");
      clearTimeout(connectionTimeout);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return { socket, isConnected, error };
}
