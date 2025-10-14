"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import {
  FiSend,
  FiDollarSign,
  FiSearch,
  FiUser,
  FiCheck,
  FiCheckCircle,
  FiX,
  FiMessageCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { FaEllipsisV, FaPaperclip, FaSmile } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import styles from "./FreelancerMessages.module.css";

// Generate unique ID for temporary messages
const generateUniqueId = () => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function FreelancerMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentRequest, setShowPaymentRequest] = useState(false);
  const [paymentRequestData, setPaymentRequestData] = useState({
    amount: "",
    description: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Add refs to track state
  const isSendingRef = useRef(false);
  const paymentRequestInProgressRef = useRef(false);
  const lastPaymentRequestIdRef = useRef(null); // Track the last payment request ID

  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationParam = searchParams.get("conversation");

  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState({});

  // Use custom socket hook
  const { socket, isConnected, error: socketError } = useSocket(currentUser.id);

  // Set socket error
  useEffect(() => {
    if (socketError) {
      setError(socketError);
    }
  }, [socketError]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (currentUser.id) {
      loadConversations();
    }
  }, [currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners - SIMPLIFIED to prevent duplicates
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log("📨 Received new message:", message);

      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        // CRITICAL FIX: Skip if this is our own payment request that we just sent
        if (
          message.messageType === "PAYMENT_REQUEST" &&
          message.senderId === currentUser.id &&
          lastPaymentRequestIdRef.current === message.id
        ) {
          console.log(
            "🚫 Skipping own payment request from socket:",
            message.id
          );
          return;
        }

        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === message.id);

          if (messageExists) {
            console.log("🔄 Message already exists, updating:", message.id);
            return prev.map((msg) => (msg.id === message.id ? message : msg));
          } else {
            console.log("➕ Adding new message from socket:", message.id);
            return [...prev, message];
          }
        });
        scrollToBottom();
      }

      updateConversationLastMessage(message.conversationId, message);
    };

    const handleMessageSent = (message) => {
      console.log("✅ Message sent confirmation:", message);
      isSendingRef.current = false;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === message.tempId
            ? { ...message, tempId: undefined }
            : msg
        )
      );
      scrollToBottom();
    };

    const handleMessageError = (errorData) => {
      console.error("❌ Message error:", errorData);
      setError(errorData.error);
      isSendingRef.current = false;

      setMessages((prev) =>
        prev.filter((msg) => msg.tempId !== errorData.tempId)
      );
    };

    const handleUserTyping = (data) => {
      if (activeConversation && data.conversationId === activeConversation.id) {
        setIsTyping(true);
        setTypingUser(data.userName);
      }
    };

    const handleUserStopTyping = (data) => {
      if (activeConversation && data.conversationId === activeConversation.id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    const handlePaymentRequestUpdate = (data) => {
      console.log("💰 Payment request updated:", data);
      if (activeConversation) {
        // Reload messages to get updated payment request status
        loadMessages(activeConversation.id);
      }
    };

    // Remove any existing listeners first to prevent duplicates
    socket.off("receive_message");
    socket.off("message_sent");
    socket.off("message_error");
    socket.off("user_typing");
    socket.off("user_stop_typing");
    socket.off("payment_request_updated");

    // Add new listeners - REMOVED payment_request_created listener
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("message_error", handleMessageError);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("payment_request_updated", handlePaymentRequestUpdate);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("message_error", handleMessageError);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("payment_request_updated", handlePaymentRequestUpdate);
    };
  }, [socket, activeConversation, currentUser.id]);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    if (conversationParam && conversations.length > 0) {
      const targetConversation = conversations.find(
        (conv) => conv.id === parseInt(conversationParam)
      );
      if (targetConversation) {
        setActiveConversation(targetConversation);
        loadMessages(targetConversation.id);
      }
    }
  }, [conversationParam, conversations]);

  // Join conversation room when active conversation changes
  useEffect(() => {
    if (socket && isConnected && activeConversation) {
      socket.emit("join_conversation", {
        conversationId: activeConversation.id,
        userId: currentUser.id,
      });
    }
  }, [socket, isConnected, activeConversation, currentUser.id]);

  const loadConversations = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/messages/accepted-conversations?userId=${currentUser.id}&userType=freelancer`
      );
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);

        if (
          data.conversations.length > 0 &&
          !activeConversation &&
          !conversationParam
        ) {
          handleConversationSelect(data.conversations[0]);
        }
      } else {
        setError(data.error || "Failed to load conversations");
      }
    } catch (error) {
      console.error("❌ Error loading conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/messages/${conversationId}?userId=${currentUser.id}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("📩 Loaded messages:", data.messages);

        // Reset the last payment request ID when loading new messages
        lastPaymentRequestIdRef.current = null;

        const uniqueMessages = removeDuplicateMessages(data.messages);
        console.log(
          "🔄 Unique messages after deduplication:",
          uniqueMessages.length
        );
        setMessages(uniqueMessages);
      } else {
        setError(data.error || "Failed to load messages");
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove duplicate messages
  const removeDuplicateMessages = useCallback((messages) => {
    const seen = new Set();
    return messages.filter((message) => {
      const identifier = message.id;
      if (seen.has(identifier)) {
        console.log("🚫 Removing duplicate message:", identifier);
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }, []);

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    setMessages([]);
    loadMessages(conversation.id);
    setShowPaymentRequest(false);
    setError("");
    // Reset the last payment request ID when switching conversations
    lastPaymentRequestIdRef.current = null;
  };

  const handleSendMessage = async () => {
    if (isSendingRef.current) {
      console.log("⏳ Already sending a message, please wait...");
      return;
    }

    if (!newMessage.trim() || !activeConversation || !socket || !isConnected) {
      setError("Not connected to server. Please wait...");
      return;
    }

    isSendingRef.current = true;

    const tempId = generateUniqueId();
    const tempMessage = {
      id: tempId,
      tempId,
      content: newMessage,
      senderId: currentUser.id,
      conversationId: activeConversation.id,
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      readBy: [],
    };

    setMessages((prev) => {
      const messageExists = prev.some((msg) => msg.tempId === tempId);
      if (messageExists) {
        console.log("🔄 Temp message already exists:", tempId);
        return prev;
      }
      return [...prev, tempMessage];
    });

    const messageToSend = newMessage;
    setNewMessage("");
    scrollToBottom();

    try {
      socket.emit("send_message", {
        conversationId: activeConversation.id,
        senderId: currentUser.id,
        content: messageToSend,
        messageType: "TEXT",
        tempId,
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
      isSendingRef.current = false;
      setError("Failed to send message");
    }

    handleStopTyping();
  };

  const handleTypingStart = () => {
    if (!socket || !isConnected || !activeConversation) return;

    socket.emit("typing_start", {
      conversationId: activeConversation.id,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!socket || !isConnected || !activeConversation) return;

    socket.emit("typing_stop", {
      conversationId: activeConversation.id,
      userId: currentUser.id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const updateConversationLastMessage = (conversationId, message) => {
    setConversations((prev) =>
      prev
        .map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [
                  {
                    content: message.content,
                    createdAt: message.createdAt,
                    sender: message.sender,
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : conv
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  // COMPLETELY FIXED: Payment request function
  const handleCreatePaymentRequest = async () => {
    if (paymentRequestInProgressRef.current) {
      console.log("⏳ Payment request already in progress...");
      return;
    }

    if (
      !paymentRequestData.amount ||
      !paymentRequestData.description ||
      !activeConversation
    ) {
      alert("Please fill all payment request fields");
      return;
    }

    if (
      isNaN(paymentRequestData.amount) ||
      parseFloat(paymentRequestData.amount) <= 0
    ) {
      alert("Please enter a valid amount");
      return;
    }

    paymentRequestInProgressRef.current = true;
    setIsProcessing(true);
    setError("");

    try {
      console.log("🔄 Creating payment request...");

      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          freelancerId: currentUser.id,
          clientId: activeConversation.clientId,
          amount: parseFloat(paymentRequestData.amount),
          description: paymentRequestData.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Payment request and message created:", {
          paymentRequest: data.paymentRequest,
          paymentMessage: data.paymentMessage,
        });

        // CRITICAL FIX: Store the payment message ID to prevent duplicates from socket
        lastPaymentRequestIdRef.current = data.paymentMessage.id;

        // Add the payment message to the state
        setMessages((prev) => {
          const messageExists = prev.some(
            (msg) => msg.id === data.paymentMessage.id
          );

          if (messageExists) {
            console.log("🔄 Payment message already exists, updating");
            return prev.map((msg) =>
              msg.id === data.paymentMessage.id ? data.paymentMessage : msg
            );
          }

          // Add new payment message while preserving all existing messages
          return [...prev, data.paymentMessage];
        });

        scrollToBottom();

        // Reset form and state
        setPaymentRequestData({ amount: "", description: "" });
        setShowPaymentRequest(false);

        // Reload conversations to update the list
        await loadConversations();

        console.log("✅ Payment request completed successfully");
      } else {
        setError(data.error || "Failed to create payment request");
        console.error("❌ Payment request failed:", data.error);
      }
    } catch (error) {
      console.error("❌ Error creating payment request:", error);
      setError("Failed to create payment request");
    } finally {
      setIsProcessing(false);
      paymentRequestInProgressRef.current = false;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getOtherUser = (conversation) => {
    return conversation.client;
  };

  const hasAcceptedProposal = (conversation) => {
    return conversation.proposals && conversation.proposals.length > 0;
  };

  const getUnreadCount = (conversation) => {
    return conversation._count?.messages || 0;
  };

  const getPaymentStatus = (paymentRequest) => {
    if (!paymentRequest) return "pending";
    return paymentRequest.status || "pending";
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "approved":
        return styles.approved;
      case "rejected":
        return styles.rejected;
      case "completed":
        return styles.completed;
      default:
        return styles.pending;
    }
  };

  const getDisplayAmount = (message) => {
    if (message.amount !== null && message.amount !== undefined) {
      return message.amount;
    }

    if (message.paymentRequest?.amount) {
      return message.paymentRequest.amount;
    }

    return 0;
  };

  const getMessageKey = (message, index) => {
    if (message.id) {
      return `message-${message.id}-${index}`;
    }
    if (message.tempId) {
      return `temp-${message.tempId}-${index}`;
    }
    return `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}-${index}`;
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      getOtherUser(conversation)
        ?.name?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.project?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.freelancerMessages}>
      {/* Connection Status */}
      <div
        className={`${styles.connectionStatus} ${
          isConnected ? styles.connected : styles.disconnected
        }`}
      >
        {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        {!isConnected && (
          <button
            onClick={() => window.location.reload()}
            className={styles.reconnectButton}
          >
            Reconnect
          </button>
        )}
      </div>

      <div className={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.header}
        >
          <div className={styles.headerContent}>
            <button onClick={() => router.back()} className={styles.backButton}>
              <FiArrowLeft />
            </button>
            <div>
              <h1 className={styles.title}>Messages</h1>
              <p className={styles.subtitle}>Communicate with your clients</p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{conversations.length}</span>
              <span className={styles.statLabel}>Active Projects</span>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <div className={styles.errorBanner}>
            <FiX className={styles.errorIcon} />
            <span>{error}</span>
            <button onClick={() => setError("")} className={styles.errorClose}>
              <FiX />
            </button>
          </div>
        )}

        <div className={styles.content}>
          {/* Conversations Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.conversationsList}>
              {isLoading && conversations.length === 0 ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={`conversation-${conversation.id}`}
                    className={`${styles.conversationItem} ${
                      activeConversation?.id === conversation.id
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.conversationAvatar}>
                      {getOtherUser(conversation)?.name?.charAt(0) || "C"}
                    </div>
                    <div className={styles.conversationInfo}>
                      <div className={styles.conversationHeader}>
                        <h4>{getOtherUser(conversation)?.name || "Client"}</h4>
                        <span className={styles.time}>
                          {conversation.messages[0] &&
                            formatTime(conversation.messages[0].createdAt)}
                        </span>
                      </div>
                      <p className={styles.lastMessage}>
                        {conversation.messages[0]?.content || "No messages yet"}
                      </p>
                      {conversation.project && (
                        <span className={styles.projectTag}>
                          {conversation.project.title}
                        </span>
                      )}
                      {hasAcceptedProposal(conversation) && (
                        <span className={styles.acceptedBadge}>
                          <FiCheckCircle size={12} />
                          Project Accepted
                        </span>
                      )}
                    </div>
                    {getUnreadCount(conversation) > 0 && (
                      <div className={styles.unreadBadge}>
                        {getUnreadCount(conversation)}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className={styles.noConversations}>
                  <FiMessageCircle
                    size={48}
                    className={styles.noConversationsIcon}
                  />
                  <p>No active conversations</p>
                  <span>
                    Get your proposals accepted to see conversations here
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={styles.chatArea}>
            {activeConversation ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.chatUserInfo}>
                    <div className={styles.chatAvatar}>
                      {getOtherUser(activeConversation)?.name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <h3>
                        {getOtherUser(activeConversation)?.name || "Client"}
                      </h3>
                      <p className={styles.userStatus}>
                        {activeConversation.project?.title || "Direct Message"}
                        {isTyping && (
                          <span className={styles.typingIndicator}>
                            • {typingUser || "Client"} is typing...
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={styles.chatActions}>
                    <motion.button
                      className={styles.paymentRequestButton}
                      onClick={() => setShowPaymentRequest(!showPaymentRequest)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isProcessing}
                    >
                      <FiDollarSign size={16} />
                      {isProcessing ? "Processing..." : "Request Payment"}
                    </motion.button>
                    <button className={styles.menuButton}>
                      <FaEllipsisV />
                    </button>
                  </div>
                </div>

                {/* Payment Request Form */}
                <AnimatePresence>
                  {showPaymentRequest && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.paymentRequestForm}
                    >
                      <div className={styles.formHeader}>
                        <h4>Create Payment Request</h4>
                        <button
                          className={styles.closeButton}
                          onClick={() => setShowPaymentRequest(false)}
                          disabled={isProcessing}
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Amount (₹)</label>
                        <input
                          type="number"
                          value={paymentRequestData.amount}
                          onChange={(e) =>
                            setPaymentRequestData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          placeholder="Enter amount"
                          min="1"
                          step="0.01"
                          disabled={isProcessing}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                          value={paymentRequestData.description}
                          onChange={(e) =>
                            setPaymentRequestData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe what this payment is for..."
                          rows="3"
                          disabled={isProcessing}
                        />
                      </div>
                      <div className={styles.formActions}>
                        <button
                          className={styles.cancelButton}
                          onClick={() => setShowPaymentRequest(false)}
                          disabled={isProcessing}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.submitButton}
                          onClick={handleCreatePaymentRequest}
                          disabled={
                            isProcessing ||
                            !paymentRequestData.amount ||
                            !paymentRequestData.description
                          }
                        >
                          {isProcessing ? "Sending..." : "Send Request"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={styles.messagesContainer}>
                  {isLoading && messages.length === 0 ? (
                    <div className={styles.loadingState}>
                      <div className={styles.spinner}></div>
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className={styles.noMessages}>
                      <FiMessageCircle
                        size={48}
                        className={styles.noMessagesIcon}
                      />
                      <p>No messages yet. Start the conversation!</p>
                      <span>
                        Introduce yourself and discuss project details
                      </span>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const showDate =
                        index === 0 ||
                        new Date(message.createdAt).toDateString() !==
                          new Date(
                            messages[index - 1].createdAt
                          ).toDateString();

                      const isSent = message.senderId === currentUser.id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1].senderId !== message.senderId;

                      return (
                        <div key={getMessageKey(message, index)}>
                          {showDate && (
                            <div className={styles.dateDivider}>
                              {formatDate(message.createdAt)}
                            </div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.messageWrapper} ${
                              isSent
                                ? styles.sentWrapper
                                : styles.receivedWrapper
                            }`}
                          >
                            {!isSent && showAvatar && (
                              <div className={styles.messageAvatar}>
                                {getOtherUser(activeConversation)?.name?.charAt(
                                  0
                                ) || "C"}
                              </div>
                            )}

                            <div className={styles.messageContentWrapper}>
                              {message.messageType === "PAYMENT_REQUEST" && (
                                <div
                                  className={`${styles.message} ${
                                    styles.paymentRequest
                                  } ${
                                    isSent
                                      ? styles.sentPayment
                                      : styles.receivedPayment
                                  }`}
                                >
                                  <div className={styles.paymentHeader}>
                                    <FiDollarSign
                                      className={styles.paymentIcon}
                                    />
                                    <span>
                                      {isSent
                                        ? "Payment Request Sent"
                                        : "Payment Request"}
                                    </span>
                                  </div>
                                  <div className={styles.paymentDetails}>
                                    <div className={styles.paymentAmount}>
                                      <strong>
                                        ₹{getDisplayAmount(message).toFixed(2)}
                                      </strong>
                                      <p>
                                        {message.content?.replace(
                                          "Payment Request: ",
                                          ""
                                        )}
                                      </p>
                                    </div>
                                    <div className={styles.paymentStatus}>
                                      <span
                                        className={`${
                                          styles.status
                                        } ${getPaymentStatusColor(
                                          getPaymentStatus(
                                            message.paymentRequest
                                          )
                                        )}`}
                                      >
                                        {getPaymentStatus(
                                          message.paymentRequest
                                        ).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {message.messageType === "PAYMENT_COMPLETED" && (
                                <div
                                  className={`${styles.message} ${styles.paymentCompleted}`}
                                >
                                  <FiCheckCircle
                                    className={styles.successIcon}
                                  />
                                  <span>{message.content}</span>
                                </div>
                              )}

                              {message.messageType === "TEXT" && (
                                <div
                                  className={`${styles.message} ${
                                    isSent ? styles.sent : styles.received
                                  }`}
                                >
                                  <div className={styles.messageBubble}>
                                    <p>{message.content}</p>
                                    <div className={styles.messageMeta}>
                                      <span className={styles.messageTime}>
                                        {formatTime(message.createdAt)}
                                      </span>
                                      {isSent && (
                                        <div className={styles.messageStatus}>
                                          {message.readBy &&
                                          message.readBy.length > 0 ? (
                                            <FiCheckCircle
                                              className={styles.readIcon}
                                            />
                                          ) : (
                                            <FiCheck
                                              className={styles.sentIcon}
                                            />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {message.messageType === "SYSTEM" && (
                                <div className={styles.systemMessage}>
                                  <span>{message.content}</span>
                                </div>
                              )}
                            </div>

                            {isSent && showAvatar && (
                              <div className={styles.messageAvatar}>
                                {currentUser.name?.charAt(0) || "F"}
                              </div>
                            )}
                          </motion.div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={styles.inputContainer}>
                  <div className={styles.inputWrapper}>
                    <button className={styles.attachButton}>
                      <FaPaperclip />
                    </button>
                    <div className={styles.messageInputContainer}>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          if (e.target.value.trim()) {
                            handleTypingStart();
                          } else {
                            handleStopTyping();
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className={styles.messageInput}
                        disabled={!isConnected || isSendingRef.current}
                      />
                      <button className={styles.emojiButton}>
                        <FaSmile />
                      </button>
                    </div>
                    <motion.button
                      onClick={handleSendMessage}
                      className={styles.sendButton}
                      disabled={
                        !newMessage.trim() ||
                        !isConnected ||
                        isSendingRef.current
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoIosSend />
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.noConversation}>
                <div className={styles.noConversationContent}>
                  <FiUser size={64} className={styles.noConversationIcon} />
                  <h3>Select a conversation</h3>
                  <p>
                    Choose a conversation from the sidebar to start messaging
                    with clients
                  </p>
                  <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                      <FiDollarSign className={styles.featureIcon} />
                      <span>Send payment requests</span>
                    </div>
                    <div className={styles.featureItem}>
                      <FiMessageCircle className={styles.featureIcon} />
                      <span>Real-time messaging</span>
                    </div>
                    <div className={styles.featureItem}>
                      <FiCheckCircle className={styles.featureIcon} />
                      <span>Project collaboration</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
