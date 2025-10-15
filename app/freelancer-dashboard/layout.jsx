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
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
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

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      color: "#f65ce2ff",
      icon: <MdDashboard />,
      path: "/freelancer-dashboard",
      bgColor: "#f0f9ff"
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FiMessageSquare />,
      color: "#8B5CF6",
      path: "/freelancer-dashboard/messages",
      bgColor: "#faf5ff"
    },
    {
      id: "plan",
      label: "Plan",
      icon: <IoPricetags />,
      color: "#af7a07ff",
      path: "/freelancer-dashboard/plan",
      bgColor: "#fffbeb"
    },
    {
      id: "profile",
      label: "Profile",
      icon: <FiUser />,
      color: "#10B981",
      path: "/freelancer-dashboard/profile",
      bgColor: "#f0fdf4"
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: <FiDollarSign />,
      color: "#06B6D4",
      path: "/freelancer-dashboard/wallet",
      bgColor: "#ecfeff"
    },
    {
      id: "project-management",
      label: "Project Management",
      icon: <FiBarChart />,
      color: "#8B5CF6",
      path: "/freelancer-dashboard/project-management",
      bgColor: "#faf5ff"
    },
  ];

  // Update active tab, background color and breadcrumbs based on current route
  useEffect(() => {
    const routeMap = {
      "/freelancer-dashboard": {
        tab: "dashboard",
        color: "#f0f9ff",
        breadcrumbs: ["Dashboard"]
      },
      "/freelancer-dashboard/messages": {
        tab: "messages", 
        color: "#faf5ff",
        breadcrumbs: ["Dashboard", "Messages"]
      },
      "/freelancer-dashboard/plan": {
        tab: "plan",
        color: "#fffbeb",
        breadcrumbs: ["Dashboard", "Plan"]
      },
      "/freelancer-dashboard/profile": {
        tab: "profile",
        color: "#f0fdf4",
        breadcrumbs: ["Dashboard", "Profile"]
      },
      "/freelancer-dashboard/wallet": {
        tab: "wallet",
        color: "#ecfeff",
        breadcrumbs: ["Dashboard", "Wallet"]
      },
      "/freelancer-dashboard/project-management": {
        tab: "project-management",
        color: "#faf5ff",
        breadcrumbs: ["Dashboard", "Project Management"]
      },
      "/freelancer-dashboard/settings": {
        tab: "settings",
        color: "#f8fafc",
        breadcrumbs: ["Dashboard", "Settings"]
      }
    };

    const currentRoute = Object.keys(routeMap).find((route) =>
      pathname.startsWith(route)
    );
    
    if (currentRoute) {
      setActiveTab(routeMap[currentRoute].tab);
      setBackgroundColor(routeMap[currentRoute].color);
      setBreadcrumbs(routeMap[currentRoute].breadcrumbs);
    } else {
      // Default values
      setBackgroundColor("#ffffff");
      setBreadcrumbs(["Dashboard"]);
    }
  }, [pathname]);

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
    setBackgroundColor(item.bgColor);
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

  // Function to get active dots based on current path
  const getActiveDots = () => {
    const activeItem = menuItems.find(item => item.path === pathname || pathname.startsWith(item.path));
    if (activeItem) {
      return (
        <div className={styles.activeDots}>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`${styles.dot} ${
                item.path === pathname || pathname.startsWith(item.path) 
                  ? styles.activeDot 
                  : styles.inactiveDot
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: item.path === pathname || pathname.startsWith(item.path) 
                  ? item.color 
                  : "#e5e7eb"
              }}
            />
          ))}
        </div>
      );
    }
    return null;
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
    <div 
      className={styles.dashboard}
      style={{ backgroundColor }}
    >
      {/* Mobile Header */}
      <motion.header
        className={styles.mobileHeader}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor }}
      >
        <button
          className={styles.menuToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <div className={styles.mobileHeaderContent}>
          <h1>Freelancer Pro</h1>
          {/* Active dots for mobile */}
          <div className={styles.mobileDots}>
            {getActiveDots()}
          </div>
        </div>
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

              {/* Active dots for desktop sidebar */}
              <div className={styles.sidebarDots}>
                {getActiveDots()}
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
                      backgroundColor: activeTab === item.id ? `${item.color}15` : "transparent",
                    }}
                  >
                    <span
                      className={styles.navIcon}
                      style={{ color: item.color }}
                    >
                      {item.icon}
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                    
                    {/* Active indicator dot */}
                    <motion.div
                      className={styles.activeDotIndicator}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: (item.path === pathname || pathname.startsWith(item.path)) ? 1 : 0,
                        backgroundColor: item.color
                      }}
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
        <main 
          className={styles.main}
          style={{ backgroundColor }}
        >
          {/* Breadcrumbs */}
          <div className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className={styles.breadcrumbItem}>
                {crumb}
                {index < breadcrumbs.length - 1 && (
                  <span className={styles.breadcrumbSeparator}>/</span>
                )}
              </span>
            ))}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}