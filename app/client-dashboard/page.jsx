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
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function ClientDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalProposals: 0,
    completedJobs: 0,
    totalSpent: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchDashboardData(userObj.id);
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

  const statCards = [
    {
      id: 1,
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: <FaBriefcase />,
      color: "#3b82f6", // Blue
      bgColor: "#3b82f6",
      description: "Jobs currently open",
    },
    {
      id: 2,
      title: "Total Proposals",
      value: stats.totalProposals,
      icon: <FaComments />,
      color: "#8b5cf6", // Purple
      bgColor: "#8b5cf6",
      description: "Proposals received",
    },
    {
      id: 3,
      title: "Completed Jobs",
      value: stats.completedJobs,
      icon: <FaCheckCircle />,
      color: "#10b981", // Green
      bgColor: "#10b981",
      description: "Jobs finished",
    },
    {
      id: 4,
      title: "Total Spent",
      value: `$${stats.totalSpent}`,
      icon: <FaMoneyBillWave />,
      color: "#f59e0b", // Amber
      bgColor: "#f59e0b",
      description: "Amount spent",
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
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <small>{stat.description}</small>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div className={styles.quickActions} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2>Quick Actions</h2>
          <span className={styles.viewAll}>View All</span>
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
          <span className={styles.viewAll}>View All</span>
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
                </div>
                <div className={styles.activityContent}>
                  <p>{activity.message}</p>
                  <small>{activity.time}</small>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.noActivity}>
            <p>No recent activity</p>
            <span>Your recent activities will appear here</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
