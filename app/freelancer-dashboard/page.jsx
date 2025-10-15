"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiDollarSign,
  FiDownload,
  FiUpload,
  FiCheck,
  FiClock,
  FiUser,
  FiTrendingUp,
  FiEye,
  FiBriefcase,
  FiMessageSquare,
  FiCreditCard,
  FiStar,
} from "react-icons/fi";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [projects, setProjects] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const userResponse = await fetch("/api/auth/verify");
      if (userResponse.ok) {
        const userData = await userResponse.json(); // FIXED: Changed userData to userResponse
        console.log("User data:", userData);
        setUser(userData.user);

        if (userData.user && userData.user.id) {
          // Load all data in parallel
          await Promise.all([
            loadProjects(userData.user.id),
            loadWalletData(userData.user.id),
            loadStats(userData.user.id),
          ]);
        } else {
          console.error("User ID not found in response");
        }
      } else {
        console.error("Failed to verify user:", userResponse.status);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async (userId) => {
    try {
      console.log("Loading projects for user:", userId);
      const response = await fetch(`/api/projects/freelancer?userId=${userId}`);
      console.log("Projects response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Projects data:", data);

        if (data.success && data.projects) {
          const formattedProjects = data.projects.map((project) => ({
            id: project.id,
            title: project.title,
            status: project.status,
            client: project.client?.name || "Unknown Client",
            budget: project.budget,
            progress: project.progress || 0,
            totalPaid: project.totalPaid || 0,
            deadline: project.createdAt,
            type: "Development",
            clientRating: project.client?.avgRating || 0,
            reviewCount: project.client?.reviewCount || 0,
            lastMessage: project.lastMessage,
            paymentRequests: project.paymentRequests || [],
            createdAt: project.createdAt,
            completedAt: project.completedAt,
          }));
          setProjects(formattedProjects);
          console.log("Formatted projects:", formattedProjects);
        } else {
          console.log("No projects found or API error");
          setProjects([]);
        }
      } else {
        console.error("Failed to fetch projects:", response.status);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    }
  };

  const loadWalletData = async (userId) => {
    try {
      console.log("Loading wallet for user:", userId);
      const response = await fetch(`/api/wallet?userId=${userId}`);
      console.log("Wallet response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Wallet data:", data);

        if (data.success && data.wallet) {
          setWalletBalance(data.wallet.balance || 0);
          setTransactions(data.wallet.transactions || []);
        } else {
          console.log("No wallet data found");
          setWalletBalance(0);
          setTransactions([]);
        }
      } else {
        console.error("Failed to fetch wallet:", response.status);
        setWalletBalance(0);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
      setWalletBalance(0);
      setTransactions([]);
    }
  };

  const loadStats = async (userId) => {
    try {
      // Calculate stats from projects and wallet data
      const completedProjects = projects.filter(
        (p) => p.status === "completed"
      ).length;
      const activeProjects = projects.filter(
        (p) => p.status === "active"
      ).length;
      const totalEarnings = projects
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.totalPaid, 0);

      // Calculate average client rating
      const allRatings = projects
        .map((p) => p.clientRating)
        .filter((r) => r > 0);
      const avgClientRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, rating) => sum + rating, 0) /
            allRatings.length
          : 0;

      const newStats = {
        totalEarnings,
        completedProjects,
        activeProjects,
        clientSatisfaction: Math.round(avgClientRating * 20), // Convert 5-star to percentage
        responseRate: 95,
        totalProjects: projects.length,
      };

      console.log("Calculated stats:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats({
        totalEarnings: 0,
        completedProjects: 0,
        activeProjects: 0,
        clientSatisfaction: 0,
        responseRate: 0,
        totalProjects: 0,
      });
    }
  };

  // Update stats when projects change
  useEffect(() => {
    if (projects.length > 0 && user) {
      loadStats(user.id);
    }
  }, [projects, user]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      try {
        // Implementation for sending messages
        const message = {
          id: messages.length + 1,
          sender: "You",
          content: newMessage,
          time: "Just now",
          unread: false,
          avatar: user.name?.substring(0, 2) || "U",
        };
        setMessages([message, ...messages]);
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handlePayment = async () => {
    if (paymentAmount && !isNaN(paymentAmount) && paymentAmount > 0 && user) {
      setIsLoading(true);
      try {
        // Create Razorpay order for wallet recharge
        const orderResponse = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(paymentAmount),
            userId: user.id,
            planType: "wallet_recharge",
          }),
        });

        const orderData = await orderResponse.json();

        if (orderData.success) {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: "Freelancer Pro",
            description: "Wallet Recharge",
            order_id: orderData.order.id,
            handler: async function (response) {
              const verifyResponse = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  planType: "wallet_recharge",
                  userId: user.id,
                  amount: orderData.order.amount,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                setWalletBalance(verifyData.walletBalance);
                alert(`Payment of ₹${paymentAmount} successful!`);
                setPaymentAmount("");
                // Reload wallet data to get updated transactions
                loadWalletData(user.id);
              } else {
                alert("Payment verification failed");
              }
            },
            prefill: {
              name: user.name || "User",
              email: user.email || "",
            },
            theme: {
              color: "#3B82F6",
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        }
      } catch (error) {
        console.error("Payment error:", error);
        alert("Payment failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleWithdraw = async (amount) => {
    if (!user) return;

    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Withdrawal request for ₹${amount} submitted!`);
        setWalletBalance(data.newBalance);
        // Reload wallet data to get updated transactions
        loadWalletData(user.id);
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Withdrawal failed. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
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
    return formatDate(dateString);
  };

  const getStatusColor = (status) => {
    if (!status) return "#6B7280";
    switch (status.toLowerCase()) {
      case "completed":
        return "#10B981";
      case "active":
        return "#3B82F6";
      case "pending":
        return "#F59E0B";
      case "in progress":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.section}
    >
      <div className={styles.sectionHeader}>
        <h2>Dashboard Overview</h2>
        <p className={styles.welcomeText}>
          Welcome back, {user?.name || "User"}! Here's your freelance overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <motion.div
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div
            className={styles.statIcon}
            style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
          >
            <FiDollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>₹{stats.totalEarnings?.toLocaleString() || "0"}</h3>
            <p>Total Earnings</p>
          </div>
          <div className={styles.statTrend}>
            <FiTrendingUp size={16} />
            <span>+12%</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div
            className={styles.statIcon}
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <FiCheck size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.completedProjects || 0}</h3>
            <p>Completed Projects</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div
            className={styles.statIcon}
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
          >
            <FiBriefcase size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.activeProjects || 0}</h3>
            <p>Active Projects</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div
            className={styles.statIcon}
            style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}
          >
            <FiUser size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.clientSatisfaction || 0}%</h3>
            <p>Client Satisfaction</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Projects */}
      <div className={styles.dashboardGrid}>
        <div className={styles.quickActions}>
          <h3>Quick Actions</h3>
          <div className={styles.actionGrid}>
            <motion.button
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection("messages")}
            >
              <FiMessageSquare size={20} />
              <span>Check Messages</span>
            </motion.button>
            <motion.button
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection("payments")}
            >
              <FiCreditCard size={20} />
              <span>Manage Payments</span>
            </motion.button>
            <motion.button
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection("projects")}
            >
              <FiBriefcase size={20} />
              <span>View Projects</span>
            </motion.button>
            <motion.button
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection("wallet")}
            >
              <FiDollarSign size={20} />
              <span>Wallet</span>
            </motion.button>
          </div>
        </div>

        <div className={styles.recentProjects}>
          <div className={styles.sectionHeader}>
            <h3>Recent Projects</h3>
            <span className={styles.badge}>{projects.length} Total</span>
          </div>
          <div className={styles.projectList}>
            {projects.slice(0, 3).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={styles.projectItem}
              >
                <div className={styles.projectInfo}>
                  <h4>{project.title}</h4>
                  <div className={styles.projectMeta}>
                    <span className={styles.clientName}>{project.client}</span>
                    {project.clientRating > 0 && (
                      <div className={styles.rating}>
                        <FiStar size={12} fill="#F59E0B" color="#F59E0B" />
                        <span>{project.clientRating}</span>
                        <span>({project.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.projectStatus}>
                  <span
                    className={styles.status}
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {project.status}
                  </span>
                  <div className={styles.projectFinancials}>
                    <span className={styles.budget}>₹{project.budget}</span>
                    {project.totalPaid > 0 && (
                      <span className={styles.paid}>
                        Paid: ₹{project.totalPaid}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {projects.length === 0 && (
              <div className={styles.emptyState}>
                <FiBriefcase size={32} />
                <p>No projects yet</p>
                <span>Start by bidding on available jobs</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderMessages = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.section}
    >
      <div className={styles.sectionHeader}>
        <h2>Messages</h2>
        <span className={styles.badge}>
          {messages.filter((m) => m.unread).length} Unread
        </span>
      </div>

      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={styles.messageCard}
              >
                <div className={styles.messageAvatar}>
                  {project.client?.substring(0, 2) || "C"}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <div className={styles.messageSender}>
                      <strong>{project.client}</strong>
                      <span className={styles.projectTitle}>
                        {" "}
                        - {project.title}
                      </span>
                    </div>
                    <span className={styles.messageTime}>
                      {formatTimeAgo(project.createdAt)}
                    </span>
                  </div>
                  {project.lastMessage ? (
                    <p className={styles.messageText}>
                      {project.lastMessage.content}
                    </p>
                  ) : (
                    <p className={styles.messageText}>No messages yet</p>
                  )}
                  <div className={styles.messageActions}>
                    <button className={styles.messageButton}>Reply</button>
                    <button className={styles.messageButton}>
                      View Project
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FiMessageSquare size={32} />
              <p>No messages yet</p>
              <span>Messages will appear here when clients contact you</span>
            </div>
          )}
        </div>

        <div className={styles.messageInputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className={styles.messageInput}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <motion.button
            onClick={handleSendMessage}
            className={styles.sendButton}
            disabled={!newMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSend />
            Send
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.section}
    >
      <h2>Payments & Wallet</h2>

      <div className={styles.paymentGrid}>
        <div className={styles.paymentCard}>
          <h3>Quick Recharge</h3>
          <p>Add funds to your wallet instantly</p>
          <div className={styles.paymentInputContainer}>
            <div className={styles.amountInputWrapper}>
              <FiDollarSign className={styles.currencyIcon} />
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className={styles.paymentInput}
                min="1"
              />
            </div>
            <motion.button
              onClick={handlePayment}
              className={styles.payButton}
              disabled={
                !paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiUpload />
              Pay ₹{paymentAmount || "0"}
            </motion.button>
          </div>
        </div>

        <div className={styles.walletCard}>
          <div className={styles.walletHeader}>
            <h3>Wallet Balance</h3>
            <div className={styles.balance}>
              ₹{walletBalance.toLocaleString()}
            </div>
            <p>Available for withdrawal</p>
          </div>

          <div className={styles.walletActions}>
            <motion.button
              className={styles.withdrawButton}
              onClick={() => handleWithdraw(1000)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiDownload />
              Withdraw Funds
            </motion.button>
          </div>
        </div>
      </div>

      <div className={styles.transactionHistory}>
        <h4>Recent Transactions</h4>
        {transactions.length > 0 ? (
          transactions.slice(0, 5).map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.transaction}
            >
              <div className={styles.transactionInfo}>
                <div>
                  <strong>{transaction.description}</strong>
                  <span>{formatTimeAgo(transaction.createdAt)}</span>
                </div>
                <span
                  className={`${styles.transactionStatus} ${
                    styles[transaction.status]
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <div
                className={`${styles.transactionAmount} ${
                  styles[transaction.type]
                }`}
              >
                {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
              </div>
            </motion.div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <FiCreditCard size={24} />
            <p>No transactions yet</p>
            <span>Your transaction history will appear here</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderProjects = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.section}
    >
      <div className={styles.sectionHeader}>
        <h2>My Projects ({projects.length})</h2>
        <div className={styles.projectFilters}>
          <button className={`${styles.filterButton} ${styles.active}`}>
            All
          </button>
          <button className={styles.filterButton}>Active</button>
          <button className={styles.filterButton}>Completed</button>
          <button className={styles.filterButton}>Pending</button>
        </div>
      </div>

      <div className={styles.projectsGrid}>
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={styles.projectCard}
            >
              <div className={styles.projectHeader}>
                <h3>{project.title}</h3>
                <span className={styles.projectType}>{project.type}</span>
              </div>

              <div className={styles.projectClient}>
                <div className={styles.clientInfo}>
                  <span className={styles.clientName}>{project.client}</span>
                  {project.clientRating > 0 && (
                    <div className={styles.clientRating}>
                      <FiStar size={14} fill="#F59E0B" color="#F59E0B" />
                      <span>{project.clientRating}</span>
                      <span>({project.reviewCount})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.projectDetails}>
                <div className={styles.detailItem}>
                  <span>Budget:</span>
                  <strong>₹{project.budget}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Paid:</span>
                  <strong>₹{project.totalPaid}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Started:</span>
                  <strong>{formatDate(project.createdAt)}</strong>
                </div>
                {project.completedAt && (
                  <div className={styles.detailItem}>
                    <span>Completed:</span>
                    <strong>{formatDate(project.completedAt)}</strong>
                  </div>
                )}
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <motion.div
                    className={styles.progressFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  />
                </div>
              </div>

              <div className={styles.projectFooter}>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {project.status}
                </span>
                <div className={styles.projectActions}>
                  <button className={styles.actionBtn}>View</button>
                  <button className={styles.actionBtn}>Message</button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className={styles.emptyProjects}>
            <FiBriefcase size={48} />
            <h3>No Projects Yet</h3>
            <p>Start by bidding on available jobs to get your first project</p>
            <button className={styles.primaryButton}>Browse Jobs</button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderWallet = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.section}
    >
      <h2>Wallet Management</h2>

      <div className={styles.walletOverview}>
        <div className={styles.balanceCard}>
          <h3>Total Balance</h3>
          <div className={styles.balanceAmount}>
            ₹{walletBalance.toLocaleString()}
          </div>
          <div className={styles.balanceBreakdown}>
            <div className={styles.breakdownItem}>
              <span>Available</span>
              <strong>₹{walletBalance.toLocaleString()}</strong>
            </div>
            <div className={styles.breakdownItem}>
              <span>In Progress</span>
              <strong>₹1,200</strong>
            </div>
            <div className={styles.breakdownItem}>
              <span>Pending</span>
              <strong>₹800</strong>
            </div>
          </div>
        </div>

        <div className={styles.walletActions}>
          <motion.button
            className={styles.walletActionButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleWithdraw(1000)}
          >
            <FiDownload />
            <span>Withdraw</span>
          </motion.button>
          <motion.button
            className={styles.walletActionButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection("payments")}
          >
            <FiUpload />
            <span>Add Funds</span>
          </motion.button>
          <motion.button
            className={styles.walletActionButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiEye />
            <span>Statement</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "messages":
        return renderMessages();
      case "payments":
        return renderPayments();
      case "projects":
        return renderProjects();
      case "wallet":
        return renderWallet();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={styles.dashboardPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.contentSection}
        >
          {isLoading ? (
            <div className={styles.loading}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={styles.spinner}
              />
              <p>Loading your dashboard...</p>
            </div>
          ) : (
            renderContent()
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
