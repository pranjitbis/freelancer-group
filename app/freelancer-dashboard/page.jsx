"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiMoneyStack } from "react-icons/gi";
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
  FiCalendar,
  FiArrowUpRight,
  FiBarChart,
  FiTarget,
  FiSearch,
  FiFilter,
  FiUsers,
  FiAward,
  FiGlobe,
  FiActivity,
  FiPieChart,
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
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userResponse = await fetch("/api/auth/verify");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("✅ User data loaded:", userData);
        setUser(userData.user);

        if (userData.user?.id) {
          await Promise.all([
            loadProjects(userData.user.id),
            loadWalletData(userData.user.id),
            loadMessages(userData.user.id),
            loadRecentActivity(userData.user.id),
          ]);
        }
      } else {
        console.error("❌ Failed to verify user");
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async (userId) => {
    try {
      console.log("🔄 Loading projects for user:", userId);
      const response = await fetch(`/api/projects/freelancer?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Projects API response:", data);

        if (data.success && data.projects) {
          const formattedProjects = data.projects.map((project) => ({
            id: project.id,
            title: project.title,
            status: project.status || "active",
            client: project.client?.name || "Unknown Client",
            budget: project.budget || 0,
            progress: project.progress || 0,
            totalPaid: project.totalPaid || 0,
            deadline: project.deadline,
            type: project.category || project.type || "Development",
            clientRating: project.clientRating || 0,
            reviewCount: project.reviewCount || 0,
            createdAt: project.createdAt,
            skills: project.skills || [],
            description: project.description,
          }));

          setProjects(formattedProjects);
          calculateStats(formattedProjects);
          console.log("📊 Loaded real projects:", formattedProjects.length);
        } else {
          console.log("ℹ️ No projects found in response");
          setProjects([]);
        }
      } else {
        console.error("❌ Projects API error:", response.status);
      }
    } catch (error) {
      console.error("❌ Error loading projects:", error);
    }
  };

  const loadWalletData = async (userId) => {
    try {
      console.log("🔄 Loading freelancer wallet for user:", userId);
      const response = await fetch(`/api/freelancer/wallet?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Freelancer Wallet API response:", data);

        if (data.success && data.wallet) {
          setWalletBalance(data.wallet.balance || 0);
          const formattedTransactions =
            data.wallet.transactions?.map((transaction) => ({
              id: transaction.id,
              type: transaction.type,
              amount: transaction.amount,
              description: transaction.description,
              createdAt: transaction.createdAt,
              status: transaction.status,
            })) || [];

          setTransactions(formattedTransactions);
          console.log("💰 Freelancer wallet balance:", data.wallet.balance);
          console.log(
            "💰 Freelancer transactions:",
            formattedTransactions.length
          );
        } else {
          console.log("ℹ️ No freelancer wallet data found");
          setWalletBalance(0);
          setTransactions([]);
        }
      } else {
        console.error("❌ Freelancer Wallet API error:", response.status);
      }
    } catch (error) {
      console.error("❌ Error loading freelancer wallet data:", error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      console.log("🔄 Loading messages for user:", userId);

      // Try to load conversations without query parameters first
      const conversationsResponse = await fetch(`/api/conversations`);

      console.log("💬 Conversations API status:", conversationsResponse.status);

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        console.log("💬 Conversations API response:", conversationsData);

        if (
          conversationsData.success &&
          conversationsData.conversations?.length > 0
        ) {
          const firstConversation = conversationsData.conversations[0];
          console.log("💬 First conversation:", firstConversation);

          // Load messages for the first conversation
          const messagesResponse = await fetch(
            `/api/conversations/${firstConversation.id}/messages`
          );

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            console.log("💬 Messages API response:", messagesData);

            if (messagesData.success && messagesData.messages) {
              const formattedMessages = messagesData.messages
                .slice(0, 5)
                .map((msg) => ({
                  id: msg.id,
                  sender: msg.sender?.name || "Unknown",
                  content: msg.content,
                  time: formatTimeAgo(msg.createdAt),
                  unread: !msg.readBy || msg.readBy.length === 0,
                }));
              setMessages(formattedMessages);
              console.log("💬 Loaded messages:", formattedMessages.length);
            } else {
              console.log("ℹ️ No messages found in conversation");
              setMessages([]);
            }
          } else {
            console.error("❌ Messages API error:", messagesResponse.status);
            setMessages([]);
          }
        } else {
          console.log("ℹ️ No conversations found");
          setMessages([]);
        }
      } else {
        console.log("💬 Conversations API not available, using mock messages");
        // Use mock data as fallback
        useMockMessages();
      }
    } catch (error) {
      console.log("💬 Messages load failed, using mock data:", error);
      useMockMessages();
    }
  };

  const useMockMessages = () => {
    const mockMessages = [
      {
        id: 1,
        sender: "Client A",
        content: "Thanks for the great work on the project!",
        time: "2h ago",
        unread: false,
      },
      {
        id: 2,
        sender: "Client B",
        content: "Can we schedule a call to discuss the next phase?",
        time: "1d ago",
        unread: true,
      },
      {
        id: 3,
        sender: "Client C",
        content: "The deliverables look perfect, thank you!",
        time: "3d ago",
        unread: false,
      },
    ];

    setMessages(mockMessages);
    console.log("💬 Using mock messages:", mockMessages.length);
  };

  const loadRecentActivity = async (userId) => {
    try {
      console.log("🔄 Loading activity for user:", userId);
      const response = await fetch(`/api/freelancer/wallet?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.wallet && data.wallet.transactions) {
          const recentTransactions = data.wallet.transactions
            .slice(0, 4)
            .map((transaction) => ({
              id: transaction.id,
              type: "payment_received",
              title:
                transaction.type === "credit"
                  ? "Payment Received"
                  : "Withdrawal",
              description: transaction.description,
              time: formatTimeAgo(transaction.createdAt),
              icon: transaction.type === "credit" ? <GiMoneyStack /> : "📤",
            }));

          setRecentActivity(recentTransactions);
          console.log(
            "📈 Loaded activity from freelancer transactions:",
            recentTransactions.length
          );
        } else {
          console.log("ℹ️ No transaction activity found");
          setRecentActivity([]);
        }
      } else {
        console.error("❌ Activity API error:", response.status);
        // Use mock activity as fallback
        useMockActivity();
      }
    } catch (error) {
      console.error("❌ Error loading activity, using mock data:", error);
      useMockActivity();
    }
  };

  const useMockActivity = () => {
    const mockActivity = [
      {
        id: 1,
        type: "payment_received",
        title: "Payment Received",
        description: "Project completion payment - Website Redesign",
        time: "2h ago",
        icon: <GiMoneyStack />,
      },
      {
        id: 2,
        type: "project_completed",
        title: "Project Completed",
        description: "E-commerce dashboard development",
        time: "1d ago",
        icon: <FiCheck />,
      },
      {
        id: 3,
        type: "new_project",
        title: "New Project",
        description: "Mobile app UI/UX design",
        time: "2d ago",
        icon: <FiBriefcase />,
      },
    ];

    setRecentActivity(mockActivity);
  };

  const calculateStats = (projectsData) => {
    const completedProjects = projectsData.filter(
      (p) => p.status === "completed"
    ).length;
    const activeProjects = projectsData.filter(
      (p) => p.status === "active"
    ).length;
    const totalEarnings = projectsData
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.totalPaid || 0), 0);

    const allRatings = projectsData
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
      clientSatisfaction: Math.round(avgClientRating * 20),
      responseRate: 95,
      totalProjects: projectsData.length,
      avgProjectValue:
        projectsData.length > 0
          ? Math.round(
              projectsData.reduce((sum, p) => sum + (p.budget || 0), 0) /
                projectsData.length
            )
          : 0,
    };

    console.log("📈 Calculated stats:", newStats);
    setStats(newStats);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: "You",
        content: newMessage,
        time: "Just now",
        unread: false,
      };
      setMessages([message, ...messages]);
      setNewMessage("");

      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newMessage,
            recipientId: "client",
          }),
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handlePayment = async () => {
    if (paymentAmount && !isNaN(paymentAmount) && paymentAmount > 0) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/freelancer/wallet/add-funds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            amount: parseFloat(paymentAmount),
            description: "Wallet Top-up",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const newBalance = walletBalance + parseFloat(paymentAmount);
            setWalletBalance(newBalance);

            const transaction = {
              id: Date.now(),
              type: "credit",
              amount: parseFloat(paymentAmount),
              description: "Wallet Top-up",
              createdAt: new Date().toISOString(),
              status: "completed",
            };

            setTransactions([transaction, ...transactions]);
            setPaymentAmount("");
            alert(`Successfully added ₹${paymentAmount} to your wallet!`);

            await loadWalletData(user?.id);
          }
        } else {
          throw new Error("Payment failed");
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
    if (amount <= walletBalance) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/freelancer/wallet/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            amount: amount,
            description: "Withdrawal to Bank Account",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const newBalance = walletBalance - amount;
            setWalletBalance(newBalance);

            const transaction = {
              id: Date.now(),
              type: "debit",
              amount: amount,
              description: "Withdrawal to Bank Account",
              createdAt: new Date().toISOString(),
              status: "completed",
            };

            setTransactions([transaction, ...transactions]);
            alert(`Withdrawal request for ₹${amount} submitted!`);

            await loadWalletData(user?.id);
          }
        } else {
          throw new Error("Withdrawal failed");
        }
      } catch (error) {
        console.error("Withdrawal error:", error);
        alert("Withdrawal failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Insufficient balance for withdrawal");
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
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <FiCheck className={styles.statusIcon} />;
      case "active":
        return <FiActivity className={styles.statusIcon} />;
      case "pending":
        return <FiClock className={styles.statusIcon} />;
      case "in progress":
        return <FiTrendingUp className={styles.statusIcon} />;
      default:
        return <FiBriefcase className={styles.statusIcon} />;
    }
  };

  // Professional Banner Component
  const ProfessionalBanner = () => (
    <motion.div
      className={styles.professionalBanner}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.bannerContent}>
        <div className={styles.bannerText}>
          <div className={styles.bannerBadge}>
            <FiAward className={styles.badgeIcon} />
            <span>The #1 Freelancing Hub in Asia</span>
          </div>
          <h1 className={styles.bannerTitle}>
            Welcome back, {user?.name || "Professional"}!
          </h1>
          <p className={styles.bannerSubtitle}>
            Your freelance career is growing stronger. Here's your progress
            today.
          </p>
        </div>
        <div className={styles.bannerStats}>
          <div className={styles.bannerStat}>
            <FiUsers className={styles.statIcon} />
            <div>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Active Freelancers</span>
            </div>
          </div>
          <div className={styles.bannerStat}>
            <FiGlobe className={styles.statIcon} />
            <div>
              <span className={styles.statNumber}>120+</span>
              <span className={styles.statLabel}>Countries</span>
            </div>
          </div>
          <div className={styles.bannerStat}>
            <FiBriefcase className={styles.statIcon} />
            <div>
              <span className={styles.statNumber}>25K+</span>
              <span className={styles.statLabel}>Projects Completed</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render functions
  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.section}
    >
      <ProfessionalBanner />

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <motion.div
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIconContainer}>
              <FiDollarSign className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Earnings</span>
              <h3 className={styles.statValue}>
                ₹{stats.totalEarnings?.toLocaleString() || "0"}
              </h3>
            </div>
          </div>
          <div className={styles.statTrend}>
            <FiTrendingUp className={styles.trendIcon} />
            <span>From {stats.completedProjects || 0} completed projects</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIconContainer}>
              <FiBriefcase className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Active Projects</span>
              <h3 className={styles.statValue}>
                {stats.activeProjects || "0"}
              </h3>
            </div>
          </div>
          <div className={styles.statSubtext}>
            {stats.totalProjects || "0"} total projects
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIconContainer}>
              <FiStar className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Client Satisfaction</span>
              <h3 className={styles.statValue}>
                {stats.clientSatisfaction || "0"}%
              </h3>
            </div>
          </div>
          <div className={styles.statSubtext}>Based on client ratings</div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIconContainer}>
              <FiBarChart className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Wallet Balance</span>
              <h3 className={styles.statValue}>
                ₹{walletBalance.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className={styles.statTrend}>
            <FiArrowUpRight className={styles.trendIcon} />
            <span>Available for withdrawal</span>
          </div>
        </motion.div>
      </div>

      <div className={styles.dashboardContent}>
        {/* Recent Projects */}
        <div className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <FiBriefcase className={styles.sectionTitleIcon} />
              <h2>Recent Projects</h2>
            </div>
            <button
              className={styles.viewAllBtn}
              onClick={() => setActiveSection("projects")}
            >
              View All <FiArrowUpRight />
            </button>
          </div>
          <div className={styles.projectsGrid}>
            {projects.length > 0 ? (
              projects.slice(0, 3).map((project) => (
                <motion.div
                  key={project.id}
                  className={styles.projectCard}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.projectHeader}>
                    <h4 className={styles.projectTitle}>{project.title}</h4>
                    <div
                      className={styles.statusBadge}
                      style={{ color: getStatusColor(project.status) }}
                    >
                      {getStatusIcon(project.status)}
                      <span>{project.status}</span>
                    </div>
                  </div>
                  <p className={styles.projectClient}>{project.client}</p>
                  <div className={styles.projectProgress}>
                    <div className={styles.progressInfo}>
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: getStatusColor(project.status),
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.projectFooter}>
                    <div className={styles.projectBudget}>
                      <FiDollarSign />
                      <span>₹{project.budget?.toLocaleString()}</span>
                    </div>
                    <div className={styles.projectDeadline}>
                      <FiCalendar />
                      <span>{formatDate(project.deadline)}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <FiBriefcase className={styles.emptyStateIcon} />
                <h3>No Projects Yet</h3>
                <p>Your projects will appear here once you start working</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity & Messages Sidebar */}
        <div className={styles.sidebarSections}>
          {/* Recent Activity */}
          <div className={styles.activitySection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FiActivity className={styles.sectionTitleIcon} />
                <h2>Recent Activity</h2>
              </div>
            </div>
            <div className={styles.activityList}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    className={styles.activityItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className={styles.activityIcon}>{activity.icon}</div>
                    <div className={styles.activityContent}>
                      <strong>{activity.title}</strong>
                      <p>{activity.description}</p>
                      <span className={styles.activityTime}>
                        {activity.time}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <FiClock className={styles.emptyStateIcon} />
                  <h3>No Recent Activity</h3>
                  <p>Your activity will appear here</p>
                </div>
              )}
            </div>
          </div>

      
        </div>
      </div>
    </motion.div>
  );

  const renderMessages = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.section}
    >
      <h2>Messages</h2>
      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {messages.map((message) => (
            <div key={message.id} className={styles.messageItem}>
              <div className={styles.messageHeader}>
                <strong>{message.sender}</strong>
                <span>{message.time}</span>
              </div>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <div className={styles.messageInput}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>
            <FiSend />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.section}
    >
      <h2>Payment History</h2>
      <div className={styles.transactionsList}>
        {transactions.map((transaction) => (
          <div key={transaction.id} className={styles.transactionItem}>
            <div className={styles.transactionInfo}>
              <div className={styles.transactionType}>
                {transaction.type === "credit" ? "Received" : "Withdrawn"}
              </div>
              <div className={styles.transactionDescription}>
                {transaction.description}
              </div>
              <div className={styles.transactionTime}>
                {formatTimeAgo(transaction.createdAt)}
              </div>
            </div>
            <div
              className={`${styles.transactionAmount} ${
                transaction.type === "credit" ? styles.credit : styles.debit
              }`}
            >
              {transaction.type === "credit" ? "+" : "-"}₹
              {transaction.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderProjects = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.section}
    >
      <h2>All Projects</h2>
      <div className={styles.projectsList}>
        {projects.map((project) => (
          <div key={project.id} className={styles.projectItem}>
            <div className={styles.projectHeader}>
              <h3>{project.title}</h3>
              <span
                className={styles.projectStatus}
                style={{ color: getStatusColor(project.status) }}
              >
                {project.status}
              </span>
            </div>
            <p className={styles.projectClient}>{project.client}</p>
            <div className={styles.projectDetails}>
              <span>Budget: ₹{project.budget?.toLocaleString()}</span>
              <span>Progress: {project.progress}%</span>
              <span>Deadline: {formatDate(project.deadline)}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderWallet = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.section}
    >
      <div className={styles.walletHeader}>
        <h2>Wallet Balance</h2>
        <div className={styles.walletBalance}>
          ₹{walletBalance.toLocaleString()}
        </div>
      </div>

      <div className={styles.walletActions}>
        <div className={styles.addFunds}>
          <h3>Add Funds</h3>
          <div className={styles.paymentInput}>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <button onClick={handlePayment} disabled={isLoading}>
              {isLoading ? "Processing..." : "Add Funds"}
            </button>
          </div>
        </div>

        <div className={styles.withdrawSection}>
          <h3>Quick Withdraw</h3>
          <div className={styles.withdrawButtons}>
            {[1000, 2000, 5000].map((amount) => (
              <button
                key={amount}
                onClick={() => handleWithdraw(amount)}
                disabled={amount > walletBalance || isLoading}
                className={styles.withdrawBtn}
              >
                ₹{amount.toLocaleString()}
              </button>
            ))}
          </div>
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
      {/* Navigation Sidebar */}

      {/* Main Content */}
      <main className={styles.mainContent}>
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
      </main>
    </div>
  );
}
