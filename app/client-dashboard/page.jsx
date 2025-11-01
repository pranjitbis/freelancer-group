"use client";
import Banner from "./components/page";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Dashboard.module.css";
import {
  FaBriefcase,
  FaComments,
  FaMoneyBillWave,
  FaCheckCircle,
  FaPlus,
  FaList,
  FaChartLine,
  FaArrowRight,
  FaDollarSign,
  FaRupeeSign,
  FaExchangeAlt,
  FaSync,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function ClientDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalProposals: 0,
    completedJobs: 0,
    totalSpent: 0,
    currency: "INR",
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: 0.012, INR: 1 });
  const [displayCurrency, setDisplayCurrency] = useState("INR");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchDashboardData(userObj.id);
      fetchExchangeRates();
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/client/dashboard?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setStats({
          activeJobs: data.stats?.activeJobs || 0,
          totalProposals: data.stats?.totalProposals || 0,
          completedJobs: data.stats?.completedJobs || 0,
          totalSpent: data.stats?.totalSpent || 0,
          currency: "INR",
        });
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      const data = await response.json();

      if (data.rates) {
        setExchangeRates({
          USD: data.rates.USD || 0.012,
          INR: 1,
        });
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      setExchangeRates({ USD: 0.012, INR: 1 });
    }
  };

  const formatCurrency = (amount, currencyCode = "INR") => {
    if (!amount) amount = 0;

    const formatter = new Intl.NumberFormat(
      currencyCode === "INR" ? "en-IN" : "en-US",
      {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: currencyCode === "INR" ? 0 : 2,
        maximumFractionDigits: currencyCode === "INR" ? 0 : 2,
      }
    );
    return formatter.format(amount);
  };

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount || isNaN(amount)) return 0;

    const amountInINR =
      fromCurrency === "INR"
        ? parseFloat(amount)
        : parseFloat(amount) / exchangeRates[fromCurrency];

    return toCurrency === "INR"
      ? amountInINR
      : amountInINR * exchangeRates[toCurrency];
  };

  const updateDisplayCurrency = (newCurrency) => {
    setDisplayCurrency(newCurrency);
  };

  const getDisplayValue = (amount) => {
    if (displayCurrency === "INR") {
      return formatCurrency(amount, "INR");
    } else {
      const converted = convertCurrency(amount, "INR", "USD");
      return formatCurrency(converted, "USD");
    }
  };

  // Currency Toggle Component
  const CurrencyToggle = () => (
    <div className={styles.currencyToggle}>
      <span className={styles.currencyLabel}>Display Currency:</span>
      <div className={styles.toggleContainer}>
        <button
          className={`${styles.toggleOption} ${
            displayCurrency === "INR" ? styles.active : ""
          }`}
          onClick={() => updateDisplayCurrency("INR")}
        >
          <FaRupeeSign className={styles.currencyIcon} />
          INR
        </button>
        <button
          className={`${styles.toggleOption} ${
            displayCurrency === "USD" ? styles.active : ""
          }`}
          onClick={() => updateDisplayCurrency("USD")}
        >
          <FaDollarSign className={styles.currencyIcon} />
          USD
        </button>
      </div>
    </div>
  );

  const statCards = [
    {
      id: 1,
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <FaBriefcase />,
      color: "#2563eb",
      description: "Jobs currently open",
      type: "count",
    },
    {
      id: 2,
      title: "Total Proposals",
      value: stats.totalProposals,
      icon: <FaComments />,
      color: "#7c3aed",
      description: "Proposals received",
      type: "count",
    },
    {
      id: 3,
      title: "Completed Jobs",
      value: stats.completedJobs,
      icon: <FaCheckCircle />,
      color: "#059669",
      description: "Jobs finished",
      type: "count",
    },
    {
      id: 4,
      title: "Total Spent",
      value: getDisplayValue(stats.totalSpent),
      icon: displayCurrency === "USD" ? <FaDollarSign /> : <FaRupeeSign />,
      color: "#ea580c",
      description: `Total amount spent`,
      type: "currency",
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Post New Job",
      description: "Create a new job posting",
      icon: <FaPlus />,
      color: "#2563eb",
      action: () => router.push("/client-dashboard/post-job"),
    },
    {
      id: 2,
      title: "View My Jobs",
      description: "Manage your job postings",
      icon: <FaList />,
      color: "#059669",
      action: () => router.push("/client-dashboard/my-jobs"),
    },
    {
      id: 3,
      title: "Check Proposals",
      description: "Review freelancer proposals",
      icon: <FaComments />,
      color: "#7c3aed",
      action: () => router.push("/client-dashboard/proposals"),
    },
    {
      id: 4,
      title: "Messages",
      description: "Chat with freelancers",
      icon: <FaComments />,
      color: "#dc2626",
      action: () => router.push("/client-dashboard/messages"),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <>
      <Banner />
      <motion.div
        className={styles.dashboard}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div className={styles.headerContent}>
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's your project summary</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.refreshButton} ${
                isRefreshing ? styles.refreshing : ""
              }`}
              onClick={() => user && fetchDashboardData(user.id)}
              disabled={isRefreshing}
            >
              <FaSync />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <CurrencyToggle />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {statCards.map((stat) => (
            <motion.div
              key={stat.id}
              className={styles.statCard}
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              <div className={styles.statContent}>
                <h3
                  className={
                    stat.type === "currency"
                      ? styles.currencyValue
                      : styles.countValue
                  }
                >
                  {stat.value}
                </h3>
                <p className={styles.statTitle}>{stat.title}</p>
                <span className={styles.statDescription}>
                  {stat.description}
                </span>
              </div>
              {stat.type === "currency" && displayCurrency === "USD" && (
                <div className={styles.originalValue}>
                  Original: {formatCurrency(stats.totalSpent, "INR")}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Quick Actions */}
          <motion.div className={styles.quickActions} variants={itemVariants}>
            <div className={styles.sectionHeader}>
              <h2>Quick Actions</h2>
              <span className={styles.sectionSubtitle}>
                Manage your projects
              </span>
            </div>
            <div className={styles.actionGrid}>
              {quickActions.map((action) => (
                <motion.div
                  key={action.id}
                  className={styles.actionCard}
                  whileHover={{ y: -2 }}
                  onClick={action.action}
                >
                  <div
                    className={styles.actionIcon}
                    style={{ color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <div className={styles.actionContent}>
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <FaArrowRight className={styles.arrowIcon} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div className={styles.recentActivity} variants={itemVariants}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Recent Activity</h2>
                <span className={styles.sectionSubtitle}>Latest updates</span>
              </div>
              <button className={styles.viewAllButton}>View All</button>
            </div>
            {recentActivity.length > 0 ? (
              <div className={styles.activityList}>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className={styles.activityItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={styles.activityIcon}
                      style={{
                        backgroundColor:
                          activity.type === "proposal"
                            ? "#e0e7ff"
                            : activity.type === "job"
                            ? "#f0fdf4"
                            : activity.type === "payment"
                            ? "#fef3c7"
                            : activity.type === "completion"
                            ? "#f0fdf4"
                            : "#f3f4f6",
                        color:
                          activity.type === "proposal"
                            ? "#4f46e5"
                            : activity.type === "job"
                            ? "#059669"
                            : activity.type === "payment"
                            ? "#d97706"
                            : activity.type === "completion"
                            ? "#059669"
                            : "#6b7280",
                      }}
                    >
                      {activity.type === "proposal" && <FaComments />}
                      {activity.type === "job" && <FaBriefcase />}
                      {activity.type === "payment" && <FaMoneyBillWave />}
                      {activity.type === "completion" && <FaCheckCircle />}
                    </div>
                    <div className={styles.activityContent}>
                      <p>{activity.message}</p>
                      <span>{activity.time}</span>
                    </div>
                    {activity.amount && (
                      <div className={styles.activityAmount}>
                        <div className={styles.amountMain}>
                          {displayCurrency === "INR"
                            ? formatCurrency(activity.amount, "INR")
                            : formatCurrency(
                                convertCurrency(activity.amount, "INR", "USD"),
                                "USD"
                              )}
                        </div>
                        {displayCurrency === "USD" && (
                          <small className={styles.originalSmall}>
                            {formatCurrency(activity.amount, "INR")}
                          </small>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={styles.noActivity}>
                <div className={styles.noActivityIcon}>
                  <FaBriefcase />
                </div>
                <h3>No recent activity</h3>
                <p>Your recent activities will appear here</p>
                <button
                  className={styles.primaryButton}
                  onClick={() => router.push("/client-dashboard/post-job")}
                >
                  Post Your First Job
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
