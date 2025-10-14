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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    // Simulate API calls
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: "Tech Corp Inc",
          content: "We loved your proposal! When can you start the project?",
          time: "2 hours ago",
          unread: true,
          avatar: "TC",
        },
        {
          id: 2,
          sender: "Startup XYZ",
          content: "Great work on the last milestone! Payment has been sent.",
          time: "1 day ago",
          unread: false,
          avatar: "SX",
        },
        {
          id: 3,
          sender: "Design Studio",
          content:
            "Can we schedule a call tomorrow to discuss the new features?",
          time: "3 days ago",
          unread: true,
          avatar: "DS",
        },
      ]);

      setProjects([
        {
          id: 1,
          title: "E-commerce Website Development",
          status: "In Progress",
          client: "Tech Corp Inc",
          budget: 2500,
          progress: 75,
          deadline: "2024-02-15",
          type: "Development",
        },
        {
          id: 2,
          title: "Mobile App UI/UX Design",
          status: "Completed",
          client: "Startup XYZ",
          budget: 1800,
          progress: 100,
          deadline: "2024-01-20",
          type: "Design",
        },
        {
          id: 3,
          title: "API Integration & Development",
          status: "Pending",
          client: "Data Systems",
          budget: 3200,
          progress: 0,
          deadline: "2024-03-01",
          type: "Development",
        },
      ]);

      setWalletBalance(4250.5);

      setStats({
        totalEarnings: 12500,
        completedProjects: 24,
        activeProjects: 3,
        clientSatisfaction: 98,
        responseRate: 95,
      });

      setIsLoading(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: "You",
        content: newMessage,
        time: "Just now",
        unread: false,
        avatar: "JD",
      };
      setMessages([message, ...messages]);
      setNewMessage("");
    }
  };

  const handlePayment = async () => {
    if (paymentAmount && !isNaN(paymentAmount) && paymentAmount > 0) {
      setIsLoading(true);
      try {
        // Create Razorpay order
        const orderResponse = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(paymentAmount),
            userId: 1, // Replace with actual user ID from auth
          }),
        });

        const orderData = await orderResponse.json();

        if (orderData.success) {
          // Initialize Razorpay checkout
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
                body: JSON.stringify(response),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                setWalletBalance(verifyData.walletBalance);
                alert(`Payment of ₹${paymentAmount} successful!`);
                setPaymentAmount("");
              } else {
                alert("Payment verification failed");
              }
            },
            prefill: {
              name: "John Doe",
              email: "john@example.com",
              contact: "+919876543210",
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
    alert(`Withdrawal request for ₹${amount} submitted!`);
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
          Welcome back, John! Here's your freelance overview.
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
            <h3>₹{stats.totalEarnings?.toLocaleString()}</h3>
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
            <h3>{stats.completedProjects}</h3>
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
            <h3>{stats.activeProjects}</h3>
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
            <h3>{stats.clientSatisfaction}%</h3>
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
          <h3>Recent Projects</h3>
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
                  <p>{project.client}</p>
                </div>
                <div className={styles.projectStatus}>
                  <span
                    className={`${styles.status} ${
                      styles[project.status.toLowerCase().replace(" ", "")]
                    }`}
                  >
                    {project.status}
                  </span>
                  <span className={styles.budget}>₹{project.budget}</span>
                </div>
              </motion.div>
            ))}
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
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${styles.messageCard} ${
                message.unread ? styles.unread : ""
              }`}
            >
              <div className={styles.messageAvatar}>{message.avatar}</div>
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <div className={styles.messageSender}>
                    <strong>{message.sender}</strong>
                    {message.unread && <span className={styles.unreadDot} />}
                  </div>
                  <span className={styles.messageTime}>{message.time}</span>
                </div>
                <p className={styles.messageText}>{message.content}</p>
                <div className={styles.messageActions}>
                  <button className={styles.messageButton}>Reply</button>
                  <button className={styles.messageButton}>View Project</button>
                </div>
              </div>
            </motion.div>
          ))}
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
        {[
          {
            id: 1,
            description: "Website Project Payment",
            amount: 1500,
            type: "credit",
            date: "2 days ago",
            status: "completed",
          },
          {
            id: 2,
            description: "Mobile App Milestone",
            amount: 2000,
            type: "credit",
            date: "1 week ago",
            status: "completed",
          },
          {
            id: 3,
            description: "Withdrawal to Bank",
            amount: 1000,
            type: "debit",
            date: "2 weeks ago",
            status: "completed",
          },
          {
            id: 4,
            description: "UI/UX Design Project",
            amount: 1200,
            type: "credit",
            date: "3 weeks ago",
            status: "completed",
          },
        ].map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: transaction.id * 0.1 }}
            className={styles.transaction}
          >
            <div className={styles.transactionInfo}>
              <div>
                <strong>{transaction.description}</strong>
                <span>{transaction.date}</span>
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
        ))}
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
        <h2>My Projects</h2>
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
        {projects.map((project, index) => (
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
            <p className={styles.projectClient}>{project.client}</p>

            <div className={styles.projectDetails}>
              <div className={styles.detailItem}>
                <span>Budget:</span>
                <strong>₹{project.budget}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Deadline:</span>
                <strong>
                  {new Date(project.deadline).toLocaleDateString()}
                </strong>
              </div>
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
                />
              </div>
            </div>

            <div className={styles.projectFooter}>
              <span
                className={`${styles.status} ${
                  styles[project.status.toLowerCase().replace(" ", "")]
                }`}
              >
                {project.status}
              </span>
              <div className={styles.projectActions}>
                <button className={styles.actionBtn}>View</button>
                <button className={styles.actionBtn}>Message</button>
              </div>
            </div>
          </motion.div>
        ))}
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
