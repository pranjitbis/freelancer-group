"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare,
  FiUser,
  FiCreditCard,
  FiBriefcase,
  FiDollarSign,
  FiBarChart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";
import styles from "./DashboardLayout.module.css";
import { IoPricetags } from "react-icons/io5";

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch current user data
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  // Update active tab based on current route
  useEffect(() => {
    const routeMap = {
      "/freelancer-dashboard": "dashboard",
      "/freelancer-dashboard/messages": "messages",
      "/freelancer-dashboard/profile": "profile",
      "/freelancer-dashboard/payments": "payments",
      "/freelancer-dashboard/projects": "projects",
      "/freelancer-dashboard/wallet": "wallet",
      "/freelancer-dashboard/analytics": "analytics",
      "/freelancer-dashboard/plan": "plan",
    };

    const currentTab = Object.keys(routeMap).find((route) =>
      pathname.startsWith(route)
    );
    if (currentTab) {
      setActiveTab(routeMap[currentTab]);
    }
  }, [pathname]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      color: "#f65ce2ff",
      icon: <MdDashboard />,
      path: "/freelancer-dashboard/",
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FiMessageSquare />,
      color: "#8B5CF6",
      path: "/freelancer-dashboard/messages",
    },
    {
      id: "plan",
      label: "Plan",
      icon: <IoPricetags />,
      color: "#af7a07ff",
      path: "/freelancer-dashboard/plan",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <FiUser />,
      color: "#10B981",
      path: "/freelancer-dashboard/profile",
    },
    {
      id: "payments",
      label: "Payments",
      icon: <FiCreditCard />,
      color: "#F59E0B",
      path: "/freelancer-dashboard/payments",
    },
    {
      id: "projects",
      label: "Projects",
      icon: <FiBriefcase />,
      color: "#EF4444",
      path: "/freelancer-dashboard/projects",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: <FiDollarSign />,
      color: "#06B6D4",
      path: "/freelancer-dashboard/wallet",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <FiBarChart />,
      color: "#8B5CF6",
      path: "/freelancer-dashboard/analytics",
    },
    {
      id: "Project Management",
      label: "Project Management",
      icon: <FiBarChart />,
      color: "#8B5CF6",
      path: "/freelancer-dashboard/project-management",
    },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    setIsMobileMenuOpen(false);
    router.push(item.path);
  };

  const handleLogout = async () => {
    try {
      // Clear client-side storage
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Call logout API
      await fetch("/api/auth/logout", { method: "POST" });

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if API call fails
      router.push("/");
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Mobile Header */}
      <motion.header
        className={styles.mobileHeader}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button
          className={styles.menuToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <h1>Freelancer Pro</h1>
        <div className={styles.avatarSmall}>
          {getUserInitials(currentUser?.name)}
        </div>
      </motion.header>

      <div className={styles.container}>
        {/* Sidebar */}
        <AnimatePresence>
          {(!isMobile || isMobileMenuOpen) && (
            <motion.aside
              className={styles.sidebar}
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className={styles.sidebarHeader}>
                <motion.div
                  className={styles.logo}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  onClick={() => router.push("/freelancer-dashboard")}
                  style={{ cursor: "pointer" }}
                >
                  <FiBriefcase size={24} />
                </motion.div>
                <div>
                  <h2>Freelancer Pro</h2>
                  <p className={styles.tagline}>Your Work, Your Way</p>
                </div>
              </div>

              <nav className={styles.nav}>
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    custom={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`${styles.navItem} ${
                      activeTab === item.id ? styles.active : ""
                    }`}
                    onClick={() => handleNavigation(item)}
                    style={{
                      borderLeftColor:
                        activeTab === item.id ? item.color : "transparent",
                    }}
                  >
                    <span
                      className={styles.navIcon}
                      style={{ color: item.color }}
                    >
                      {item.icon}
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                    <motion.div
                      className={styles.activeIndicator}
                      initial={{ scale: 0 }}
                      animate={{ scale: activeTab === item.id ? 1 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </motion.button>
                ))}
              </nav>

              <motion.div
                className={styles.userInfo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className={styles.avatar}>
                  <span>{getUserInitials(currentUser?.name)}</span>
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>
                    {currentUser?.name || "User"}
                  </p>
                  <p className={styles.userRole}>
                    {currentUser?.role === "freelancer"
                      ? "Freelancer"
                      : currentUser?.role === "client"
                      ? "Client"
                      : "User"}
                  </p>
                  <div className={styles.userStats}>
                    <span>Active</span>
                    <span>Member</span>
                  </div>
                </div>
              </motion.div>

              <div className={styles.sidebarFooter}>
                <button
                  className={styles.sidebarButton}
                  onClick={() => router.push("/freelancer-dashboard/settings")}
                >
                  <FiSettings size={18} />
                  <span>Settings</span>
                </button>
                <button className={styles.sidebarButton} onClick={handleLogout}>
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
