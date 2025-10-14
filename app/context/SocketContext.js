"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      {
        path: "/api/socket/io",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketInstance.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
      setIsConnected(false);
      setConnectionError("Disconnected from server");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setIsConnected(false);
      setConnectionError("Failed to connect");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};
