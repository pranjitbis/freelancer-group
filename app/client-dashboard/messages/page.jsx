"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Banner from "../components/page";
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
  FiCreditCard,
  FiArrowLeft,
  FiMenu,
  FiChevronLeft,
  FiRefreshCw,
} from "react-icons/fi";
import {
  FaWallet,
  FaEllipsisV,
  FaPaperclip,
  FaSmile,
  FaRupeeSign,
  FaExchangeAlt,
} from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import styles from "./ClientMessages.module.css";

// Currency configuration
const CURRENCIES = {
  USD: {
    symbol: "$",
    code: "USD",
    name: "US Dollar",
    icon: FiDollarSign,
    locale: "en-US",
  },
  INR: {
    symbol: "₹",
    code: "INR",
    name: "Indian Rupee",
    icon: FaRupeeSign,
    locale: "en-IN",
  },
};

// Default exchange rates (you can update these from an API)
const DEFAULT_EXCHANGE_RATES = {
  USD: 1,
  INR: 83.5, // 1 USD = 83.5 INR
};

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("INR");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [error, setError] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_EXCHANGE_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState("INR");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationParam = searchParams.get("conversation");

  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState({});

  // Use custom socket hook
  const { socket, isConnected, error: socketError } = useSocket(currentUser.id);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1168;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      fetchWalletBalance();
      fetchExchangeRates();
    }
  }, [currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }

      updateConversationLastMessage(message.conversationId, message);
    };

    const handleMessageSent = (message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === message.tempId
            ? { ...message, tempId: undefined }
            : msg
        )
      );
      scrollToBottom();
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
      if (activeConversation) {
        loadMessages(activeConversation.id);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("payment_request_updated", handlePaymentRequestUpdate);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("payment_request_updated", handlePaymentRequestUpdate);
    };
  }, [socket, activeConversation]);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    if (conversationParam && conversations.length > 0) {
      const targetConversation = conversations.find(
        (conv) => conv.id === parseInt(conversationParam)
      );
      if (targetConversation) {
        setActiveConversation(targetConversation);
        loadMessages(targetConversation.id);
        if (isMobile) {
          setShowSidebar(false);
        }
      }
    }
  }, [conversationParam, conversations, isMobile]);

  // Join conversation room when active conversation changes
  useEffect(() => {
    if (socket && isConnected && activeConversation) {
      socket.emit("join_conversation", {
        conversationId: activeConversation.id,
        userId: currentUser.id,
      });
      console.log("Connected");
    } else {
      console.log("Not Connected");
    }
  }, [socket, isConnected, activeConversation, currentUser.id]);

  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      // You can replace this with your actual exchange rate API
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data.rates);
      } else {
        // Fallback to default rates if API fails
        setExchangeRates(DEFAULT_EXCHANGE_RATES);
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      setExchangeRates(DEFAULT_EXCHANGE_RATES);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(`/api/wallet?userId=${currentUser.id}`);
      const data = await response.json();

      if (data.success) {
        setWalletBalance(data.wallet?.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const loadConversations = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/messages/accepted-conversations?userId=${currentUser.id}&userType=client`
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
        setMessages(data.messages || []);
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

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    setMessages([]);
    loadMessages(conversation.id);
    setShowPaymentModal(false);
    setError("");

    // On mobile, hide sidebar when conversation is selected
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToConversations = () => {
    setShowSidebar(true);
    setActiveConversation(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !socket || !isConnected) {
      setError("Not connected to server. Please wait...");
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
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

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    socket.emit("send_message", {
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      content: newMessage,
      messageType: "TEXT",
      tempId,
    });

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

  // Currency conversion functions
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;

    // Convert to USD first, then to target currency
    const amountInUSD =
      fromCurrency === "USD" ? amount : amount / exchangeRates[fromCurrency];

    return toCurrency === "USD"
      ? amountInUSD
      : amountInUSD * exchangeRates[toCurrency];
  };

  const formatCurrency = (amount, currencyCode = "INR") => {
    const currency = CURRENCIES[currencyCode];
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCurrencySymbol = (currencyCode) => {
    return CURRENCIES[currencyCode]?.symbol || "₹";
  };

  const getCurrencyIcon = (currencyCode) => {
    const CurrencyIcon = CURRENCIES[currencyCode]?.icon || FaRupeeSign;
    return <CurrencyIcon className={styles.currencyIcon} />;
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

  const getConvertedAmount = (amount, fromCurrency, toCurrency) => {
    return convertCurrency(amount, fromCurrency, toCurrency);
  };

  const handlePaymentAction = async (paymentRequestId, action) => {
    if (action === "approved" && walletBalance <= 0) {
      setShowPaymentModal(true);
      return;
    }

    setIsProcessingPayment(true);
    setError("");
    try {
      const response = await fetch(
        `/api/payment-requests/${paymentRequestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: action,
            clientId: currentUser.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Reload messages to show updated status
        loadMessages(activeConversation.id);
        fetchWalletBalance();

        // Send system message via socket
        if (socket && isConnected) {
          socket.emit("send_message", {
            conversationId: activeConversation.id,
            senderId: currentUser.id,
            content: `Payment request ${action} by client`,
            messageType: "SYSTEM",
          });
        }

        alert(`Payment request ${action} successfully!`);
      } else {
        setError(data.error || "Failed to process payment request");
      }
    } catch (error) {
      console.error("❌ Error updating payment request:", error);
      setError("Failed to process payment request");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleWalletRecharge = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) < 10) {
      alert("Please enter a valid amount (minimum ₹10)");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Convert amount to INR if payment is in USD
      const amountInINR =
        paymentCurrency === "USD"
          ? convertCurrency(parseFloat(paymentAmount), "USD", "INR")
          : parseFloat(paymentAmount);

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInINR,
          userId: currentUser.id,
          currency: "INR", // Razorpay only supports INR
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      await loadRazorpayScript();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Freelance Platform",
        description: "Wallet Recharge",
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert(
              `Payment successful! ${getCurrencySymbol(
                paymentCurrency
              )}${paymentAmount} added to your wallet.`
            );
            setWalletBalance(verifyData.walletBalance);
            setShowPaymentModal(false);
            setPaymentAmount("");
            fetchWalletBalance();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: {
          color: "#667eea",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
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
    return conversation.freelancer;
  };

  const hasAcceptedProposal = (conversation) => {
    return conversation.proposals && conversation.proposals.length > 0;
  };

  const getUnreadCount = (conversation) => {
    return conversation._count?.messages || 0;
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

  // Generate unique key for messages
  const getMessageKey = (message) => {
    if (message.id && message.id !== "temp") {
      return `message-${message.id}`;
    }
    if (message.tempId) {
      return `temp-${message.tempId}`;
    }
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  const presetAmounts = {
    INR: [100, 200, 500, 1000, 2000, 5000],
    USD: [10, 20, 50, 100, 200, 500],
  };

  const toggleDisplayCurrency = () => {
    setDisplayCurrency(displayCurrency === "INR" ? "USD" : "INR");
  };

  const getWalletBalanceInDisplayCurrency = () => {
    return convertCurrency(walletBalance, "INR", displayCurrency);
  };

  const getWalletBalanceInOtherCurrency = () => {
    const otherCurrency = displayCurrency === "INR" ? "USD" : "INR";
    return convertCurrency(walletBalance, "INR", otherCurrency);
  };

  return (
    <>
      <Banner />

      <div className={styles.clientMessages}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.header}
          >
            <div className={styles.headerContent}>
              <button
                onClick={() => router.back()}
                className={styles.backButton}
              >
                <FiArrowLeft />
              </button>

              {/* Mobile menu button */}
              {isMobile && (
                <button
                  className={styles.menuButton}
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <FiMenu />
                </button>
              )}

              <div>
                <h1 className={styles.title}>Messages</h1>
                <p className={styles.subtitle}>
                  Communicate with your freelancers
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error Display */}
          {error && (
            <div className={styles.errorBanner}>
              <FiX className={styles.errorIcon} />
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className={styles.errorClose}
              >
                <FiX />
              </button>
            </div>
          )}

          <div className={styles.content}>
            {/* Conversations Sidebar */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{
                    x: isMobile ? -300 : 0,
                    opacity: isMobile ? 0 : 1,
                  }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`${styles.sidebar} ${
                    !showSidebar ? styles.sidebarHidden : ""
                  }`}
                >
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
                            {getOtherUser(conversation)?.name?.charAt(0) || "F"}
                          </div>
                          <div className={styles.conversationInfo}>
                            <div className={styles.conversationHeader}>
                              <h4>
                                {getOtherUser(conversation)?.name ||
                                  "Freelancer"}
                              </h4>
                              <span className={styles.time}>
                                {conversation.messages[0] &&
                                  formatTime(
                                    conversation.messages[0].createdAt
                                  )}
                              </span>
                            </div>
                            <p className={styles.lastMessage}>
                              {conversation.messages[0]?.content ||
                                "No messages yet"}
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
                          Accept a proposal to start messaging freelancers
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Area */}
            <div
              className={`${styles.chatArea} ${
                !showSidebar ? styles.chatAreaFull : ""
              }`}
            >
              {activeConversation ? (
                <>
                  <div className={styles.chatHeader}>
                    <div className={styles.chatUserInfo}>
                      {/* Mobile back button */}
                      {isMobile && (
                        <button
                          className={styles.backToConversations}
                          onClick={handleBackToConversations}
                        >
                          <FiChevronLeft />
                        </button>
                      )}
                      <div className={styles.chatAvatar}>
                        {getOtherUser(activeConversation)?.name?.charAt(0) ||
                          "F"}
                      </div>
                      <div>
                        <h3>
                          {getOtherUser(activeConversation)?.name ||
                            "Freelancer"}
                        </h3>
                        <p className={styles.userStatus}>
                          {activeConversation.project?.title ||
                            "Direct Message"}
                          {isTyping && (
                            <span className={styles.typingIndicator}>
                              • {typingUser || "Freelancer"} is typing...
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={styles.chatActions}>
                      <button className={styles.menuButton}>
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>

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

                        const messageCurrency = message.currency || "USD";
                        const displayAmount = getDisplayAmount(message);
                        const convertedAmount = getConvertedAmount(
                          displayAmount,
                          messageCurrency,
                          displayCurrency
                        );

                        return (
                          <div key={getMessageKey(message)}>
                            {showDate && (
                              <div className={styles.dateDivider}>
                                <span>{formatDate(message.createdAt)}</span>
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
                                  {getOtherUser(
                                    activeConversation
                                  )?.name?.charAt(0) || "F"}
                                </div>
                              )}

                              <div className={styles.messageContentWrapper}>
                                {message.messageType === "PAYMENT_REQUEST" && (
                                  <div
                                    className={`${styles.message} ${styles.paymentRequest}`}
                                  >
                                    <div className={styles.paymentHeader}>
                                      {getCurrencyIcon(messageCurrency)}
                                      <span>Payment Request</span>
                                    </div>
                                    <div className={styles.paymentDetails}>
                                      <div className={styles.paymentAmount}>
                                        <div className={styles.amountPrimary}>
                                          {formatCurrency(
                                            convertedAmount,
                                            displayCurrency
                                          )}
                                        </div>
                                        {messageCurrency !==
                                          displayCurrency && (
                                          <div
                                            className={styles.amountSecondary}
                                          >
                                            {formatCurrency(
                                              displayAmount,
                                              messageCurrency
                                            )}
                                          </div>
                                        )}
                                        <p>
                                          {message.content?.replace(
                                            "Payment Request: ",
                                            ""
                                          )}
                                        </p>
                                      </div>
                                      {message.paymentRequest?.status ===
                                        "pending" && (
                                        <div className={styles.paymentActions}>
                                          <button
                                            className={styles.approveButton}
                                            onClick={() =>
                                              handlePaymentAction(
                                                message.paymentRequest.id,
                                                "approved"
                                              )
                                            }
                                            disabled={isProcessingPayment}
                                          >
                                            {isProcessingPayment
                                              ? "Processing..."
                                              : "Approve & Pay"}
                                          </button>
                                          <button
                                            className={styles.rejectButton}
                                            onClick={() =>
                                              handlePaymentAction(
                                                message.paymentRequest.id,
                                                "rejected"
                                              )
                                            }
                                            disabled={isProcessingPayment}
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                      {message.paymentRequest?.status !==
                                        "pending" && (
                                        <div className={styles.paymentStatus}>
                                          <span
                                            className={`${
                                              styles.status
                                            } ${getPaymentStatusColor(
                                              message.paymentRequest?.status
                                            )}`}
                                          >
                                            {message.paymentRequest?.status?.toUpperCase() ||
                                              "PENDING"}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {message.messageType ===
                                  "PAYMENT_COMPLETED" && (
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
                                  {currentUser.name?.charAt(0) || "C"}
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
                          disabled={!isConnected}
                        />
                        <button className={styles.emojiButton}>
                          <FaSmile />
                        </button>
                      </div>
                      <motion.button
                        onClick={handleSendMessage}
                        className={styles.sendButton}
                        disabled={!newMessage.trim() || !isConnected}
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
                      with freelancers
                    </p>
                    {isMobile && (
                      <button
                        className={styles.showConversationsButton}
                        onClick={() => setShowSidebar(true)}
                      >
                        <FiMenu />
                        Show Conversations
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.modalOverlay}
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className={styles.paymentModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Add Money to Wallet</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className={styles.closeButton}
                  >
                    <FiX />
                  </button>
                </div>

                <div className={styles.walletInfoSection}>
                  <div className={styles.currentBalance}>
                    <FaWallet className={styles.walletIcon} />
                    <div>
                      <span>Current Balance</span>
                      <div className={styles.balanceAmounts}>
                        <div className={styles.balancePrimary}>
                          {formatCurrency(walletBalance, "INR")}
                        </div>
                        <div className={styles.balanceSecondary}>
                          {formatCurrency(
                            convertCurrency(walletBalance, "INR", "USD"),
                            "USD"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className={styles.balanceNote}>
                    Your wallet balance is low. Add money to approve payments.
                  </p>
                </div>

                <div className={styles.currencySelector}>
                  <h4>Select Currency</h4>
                  <div className={styles.currencyOptions}>
                    <button
                      className={`${styles.currencyOption} ${
                        paymentCurrency === "INR" ? styles.selected : ""
                      }`}
                      onClick={() => setPaymentCurrency("INR")}
                    >
                      <FaRupeeSign />
                      INR (Indian Rupee)
                    </button>
                    <button
                      className={`${styles.currencyOption} ${
                        paymentCurrency === "USD" ? styles.selected : ""
                      }`}
                      onClick={() => setPaymentCurrency("USD")}
                    >
                      <FiDollarSign />
                      USD (US Dollar)
                    </button>
                  </div>
                </div>

                <div className={styles.presetAmounts}>
                  <h4>Quick Select</h4>
                  <div className={styles.amountGrid}>
                    {presetAmounts[paymentCurrency].map((amount) => (
                      <button
                        key={amount}
                        className={`${styles.amountButton} ${
                          paymentAmount === amount.toString()
                            ? styles.selected
                            : ""
                        }`}
                        onClick={() => setPaymentAmount(amount.toString())}
                      >
                        {getCurrencySymbol(paymentCurrency)}
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.customAmount}>
                  <h4>Custom Amount</h4>
                  <div className={styles.amountInput}>
                    <span className={styles.currencySymbol}>
                      {getCurrencySymbol(paymentCurrency)}
                    </span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      min="10"
                      step="10"
                    />
                  </div>
                  {paymentCurrency === "USD" && paymentAmount && (
                    <div className={styles.convertedAmount}>
                      {formatCurrency(
                        convertCurrency(
                          parseFloat(paymentAmount) || 0,
                          "USD",
                          "INR"
                        ),
                        "INR"
                      )}
                    </div>
                  )}
                  <p className={styles.minAmount}>
                    Minimum amount: {getCurrencySymbol(paymentCurrency)}10
                  </p>
                </div>

                <div className={styles.paymentActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.payButton}
                    onClick={handleWalletRecharge}
                    disabled={
                      isProcessingPayment ||
                      !paymentAmount ||
                      parseFloat(paymentAmount) < 10
                    }
                  >
                    {isProcessingPayment ? (
                      "Processing..."
                    ) : (
                      <>
                        <FiCreditCard />
                        Pay {getCurrencySymbol(paymentCurrency)}
                        {paymentAmount || 0}
                      </>
                    )}
                  </button>
                </div>

                <div className={styles.securityNote}>
                  <FiCheckCircle className={styles.securityIcon} />
                  <span>Secure payment powered by Razorpay</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
