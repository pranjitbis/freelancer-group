"use client";
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
    currency: "USD",
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, INR: 83.5 });
  const [isConverting, setIsConverting] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [converterAmount, setConverterAmount] = useState("");
  const [converterFrom, setConverterFrom] = useState("USD");
  const [converterTo, setConverterTo] = useState("INR");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState("USD"); // New state for display currency
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setDisplayCurrency(userObj.currency || "USD"); // Set display currency from user preference
      fetchDashboardData(userObj.id);
      fetchExchangeRates();
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      const response = await fetch(`/api/client/dashboard?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || {});
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();

      if (data.rates) {
        setExchangeRates({
          USD: 1,
          INR: data.rates.INR || 83.5,
        });
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      setExchangeRates({ USD: 1, INR: 83.5 });
    }
  };

  // Currency helper functions
  const getCurrencySymbol = (currencyCode) => {
    return currencyCode === "USD" ? "$" : "₹";
  };

  const getCurrencyIcon = (currencyCode) => {
    return currencyCode === "USD" ? <FaDollarSign /> : <FaRupeeSign />;
  };

  const formatCurrency = (amount, currencyCode = "USD") => {
    const formatter = new Intl.NumberFormat(
      currencyCode === "INR" ? "en-IN" : "en-US",
      {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
    return formatter.format(amount);
  };

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount || isNaN(amount)) return 0;

    const amountInUSD =
      fromCurrency === "USD"
        ? parseFloat(amount)
        : parseFloat(amount) / exchangeRates[fromCurrency];

    return toCurrency === "USD"
      ? amountInUSD
      : amountInUSD * exchangeRates[toCurrency];
  };

  // Toggle display currency between USD and INR
  const toggleDisplayCurrency = () => {
    setDisplayCurrency((prev) => (prev === "USD" ? "INR" : "USD"));
  };

  // Get display value based on selected currency
  const getDisplayValue = (amount, originalCurrency) => {
    if (displayCurrency === originalCurrency) {
      return formatCurrency(amount, originalCurrency);
    }
    const converted = convertCurrency(
      amount,
      originalCurrency,
      displayCurrency
    );
    return formatCurrency(converted, displayCurrency);
  };

  const handleCurrencyConversion = () => {
    if (!converterAmount || isNaN(converterAmount)) {
      setConvertedAmount("");
      return;
    }

    const result = convertCurrency(converterAmount, converterFrom, converterTo);
    setConvertedAmount(result.toFixed(2));
  };

  const swapCurrencies = () => {
    setConverterFrom(converterTo);
    setConverterTo(converterFrom);
    setConverterAmount(convertedAmount);
    setConvertedAmount(converterAmount);
  };

  const refreshRates = async () => {
    setIsConverting(true);
    await fetchExchangeRates();
    setTimeout(() => setIsConverting(false), 1000);
  };

  const statCards = [
    {
      id: 1,
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <FaBriefcase />,
      color: "#3b82f6",
      bgColor: "#3b82f6",
      description: "Jobs currently open",
      type: "count",
    },
    {
      id: 2,
      title: "Total Proposals",
      value: stats.totalProposals,
      icon: <FaComments />,
      color: "#8b5cf6",
      bgColor: "#8b5cf6",
      description: "Proposals received",
      type: "count",
    },
    {
      id: 3,
      title: "Completed Jobs",
      value: stats.completedJobs,
      icon: <FaCheckCircle />,
      color: "#10b981",
      bgColor: "#10b981",
      description: "Jobs finished",
      type: "count",
    },
    {
      id: 4,
      title: "Total Spent",
      value: getDisplayValue(stats.totalSpent, stats.currency),
      icon: getCurrencyIcon(displayCurrency), // Show icon of display currency
      color: "#f59e0b",
      bgColor: "#f59e0b",
      description: `Amount spent in ${displayCurrency}`,
      type: "currency",
      showToggle: true,
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Post New Job",
      description: "Create a new job posting",
      icon: <FaPlus />,
      color: "#3b82f6",
      bgColor: "#3b82f6",
      action: () => router.push("/client-dashboard/post-job"),
    },
    {
      id: 2,
      title: "View My Jobs",
      description: "Manage your job postings",
      icon: <FaList />,
      color: "#10b981",
      bgColor: "#10b981",
      action: () => router.push("/client-dashboard/my-jobs"),
    },
    {
      id: 3,
      title: "Check Proposals",
      description: "Review freelancer proposals",
      icon: <FaComments />,
      color: "#8b5cf6",
      bgColor: "#8b5cf6",
      action: () => router.push("/client-dashboard/proposals"),
    },
    {
      id: 4,
      title: "Messages",
      description: "Chat with freelancers",
      icon: <FaComments />,
      color: "#ec4899",
      bgColor: "#ec4899",
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
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div className={styles.welcomeSection} variants={itemVariants}>
        <div className={styles.welcomeContent}>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what's happening with your jobs today.</p>
          <div className={styles.welcomeStats}>
            <FaChartLine />
            <span>Your business is growing!</span>
          </div>
        </div>
        <div className={styles.currencyInfo}>
          <div className={styles.currencyControls}>
            <button
              className={styles.currencyToggle}
              onClick={toggleDisplayCurrency}
              title={`Switch to ${displayCurrency === "USD" ? "INR" : "USD"}`}
            >
              <FaExchangeAlt />
              <span>Switch to {displayCurrency === "USD" ? "INR" : "USD"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat) => (
          <motion.div
            key={stat.id}
            className={styles.statCard}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div
              className={styles.statIcon}
              style={{ backgroundColor: stat.bgColor }}
            >
              {stat.icon}
            </div>
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
              <p>{stat.title}</p>
              <small>{stat.description}</small>
              {stat.type === "currency" &&
                displayCurrency !== stats.currency && (
                  <div className={styles.originalValue}>
                    Original: {formatCurrency(stats.totalSpent, stats.currency)}
                  </div>
                )}
            </div>
            {stat.type === "currency" && (
              <div className={styles.currencyControls}>
                <button
                  className={styles.quickToggle}
                  onClick={toggleDisplayCurrency}
                  title={`Switch to ${
                    displayCurrency === "USD" ? "INR" : "USD"
                  }`}
                >
                  <FaExchangeAlt />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div className={styles.quickActions} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2>Quick Actions</h2>
          <span className={styles.viewAll}>Manage Your Work</span>
        </div>
        <div className={styles.actionGrid}>
          {quickActions.map((action) => (
            <motion.div
              key={action.id}
              className={styles.actionCard}
              whileHover={{ scale: 1.02 }}
              onClick={action.action}
            >
              <div
                className={styles.actionIcon}
                style={{ backgroundColor: action.bgColor }}
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
          <h2>Recent Activity</h2>
          <div className={styles.activityHeader}>
            <span className={styles.viewAll}>View All</span>
            <button
              className={styles.currencyToggleSmall}
              onClick={toggleDisplayCurrency}
              title={`Switch to ${displayCurrency === "USD" ? "INR" : "USD"}`}
            >
              <FaExchangeAlt />
              <span>Show in {displayCurrency === "USD" ? "INR" : "USD"}</span>
            </button>
          </div>
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
                <div className={styles.activityIcon}>
                  {activity.type === "proposal" && <FaComments />}
                  {activity.type === "job" && <FaBriefcase />}
                  {activity.type === "payment" && <FaMoneyBillWave />}
                  {activity.type === "completion" && <FaCheckCircle />}
                </div>
                <div className={styles.activityContent}>
                  <p>{activity.message}</p>
                  <small>{activity.time}</small>
                </div>
                {activity.amount && (
                  <div className={styles.activityAmount}>
                    <div className={styles.amountMain}>
                      {getDisplayValue(activity.amount, activity.currency)}
                    </div>
                    {displayCurrency !== activity.currency && (
                      <small className={styles.originalSmall}>
                        {formatCurrency(activity.amount, activity.currency)}
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
            <p>No recent activity</p>
            <span>Your recent activities will appear here</span>
            <button
              className={styles.postJobButton}
              onClick={() => router.push("/client-dashboard/post-job")}
            >
              Post Your First Job
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
