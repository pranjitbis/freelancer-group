"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

export const useSSE = (currentUser) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlersRef = useRef(new Set());

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !currentUser?.id) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/messages/events?userId=${currentUser.id}&t=${Date.now()}`;
    console.log("🔌 Connecting to SSE:", url);

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE connection established");
        setIsConnected(true);
        setConnectionStatus("connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 SSE message received:", data);
          
          // Call all registered message handlers
          messageHandlersRef.current.forEach(handler => {
            try {
              handler(data);
            } catch (error) {
              console.error("Error in message handler:", error);
            }
          });
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE connection error:", error);
        setIsConnected(false);
        setConnectionStatus("error");
        
        // Attempt reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect SSE...");
          setConnectionStatus("reconnecting");
          connect();
        }, 3000);
      };

    } catch (error) {
      console.error("❌ Failed to create SSE connection:", error);
      setConnectionStatus("error");
    }
  }, [currentUser?.id]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  const addMessageHandler = useCallback((handler) => {
    messageHandlersRef.current.add(handler);
    
    // Return cleanup function
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    addMessageHandler
  };
};