"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiSimpleanalytics } from "react-icons/si";
import {
  FiMessageSquare,
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiStar,
} from "react-icons/fi";
import { FaRegSave } from "react-icons/fa";

import { MdDashboard, MdWork } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./DashboardLayout.module.css";
import { IoPricetags, IoSend } from "react-icons/io5";
import { RiRefund2Line } from "react-icons/ri";
import { MdOutlineContactSupport } from "react-icons/md";

// Social Media Icons
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("Free");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [pageStyle, setPageStyle] = useState({});
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1200);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch current user data
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard size={20} />,
      path: "/freelancer-dashboard",
      bgColor: "#f0f9ff",
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FiMessageSquare size={20} />,
      path: "/freelancer-dashboard/messages",
      bgColor: "#faf5ff",
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: <IoSend size={18} />,
      path: "/freelancer-dashboard/proposals",
      bgColor: "#f0fdf4",
    },
    {
      id: "project-management",
      label: "Projects",
      icon: <MdWork size={20} />,
      path: "/freelancer-dashboard/project-management",
      bgColor: "#fef7ff",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: <FiDollarSign size={20} />,
      path: "/freelancer-dashboard/wallet",
      bgColor: "#ecfeff",
    },
    {
      id: "plan",
      label: "Plan & Billing",
      icon: <IoPricetags size={18} />,
      path: "/freelancer-dashboard/plan",
      bgColor: "#fffbeb",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <FiUser size={20} />,
      path: "/freelancer-dashboard/profile",
      bgColor: "#f0fdf4",
    },
    {
      id: "find-work",
      label: "Find Work",
      icon: <FiUser size={20} />,
      path: "/freelancer-dashboard/find-work",
      bgColor: "#f0fdf4",
    },
    {
      id: "Refunds",
      label: "Refunds",
      icon: <RiRefund2Line size={20} />,
      path: "/freelancer-dashboard/refunds",
      bgColor: "#f0fdf4",
    },
    {
      id: "Analytics",
      label: "Analytics",
      icon: <SiSimpleanalytics size={20} />,
      path: "/freelancer-dashboard/analytics",
      bgColor: "#f0fdf4",
    },
    {
      id: "Save-Jobs",
      label: "Save Jobs",
      icon: <FaRegSave size={20} />,
      path: "/freelancer-dashboard/save-jobs",
      bgColor: "#f0fdf4",
    },
    {
      id: "Support",
      label: "Support",
      icon: <MdOutlineContactSupport size={20} />,
      path: "/freelancer-dashboard/support",
      bgColor: "#f0fdf4",
    },
  ];

  // Social Media Links
  const socialMediaLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF size={14} />,
      url: "https://facebook.com",
      color: "#1877F2",
    },
    {
      name: "Twitter",
      icon: <FaTwitter size={14} />,
      url: "https://twitter.com",
      color: "#1DA1F2",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn size={14} />,
      url: "https://linkedin.com",
      color: "#0A66C2",
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={14} />,
      url: "https://instagram.com",
      color: "#E4405F",
    },
    {
      name: "YouTube",
      icon: <FaYoutube size={14} />,
      url: "https://youtube.com",
      color: "#FF0000",
    },
  ];

  // Update background color and breadcrumbs based on current route
  useEffect(() => {
    const routeMap = {
      "/freelancer-dashboard": {
        breadcrumbs: ["Dashboard"],
        bgColor: "#f0f9ff",
      },
      "/freelancer-dashboard/messages": {
        breadcrumbs: ["Dashboard", "Messages"],
        bgColor: "#faf5ff",
      },
      "/freelancer-dashboard/plan": {
        breadcrumbs: ["Dashboard", "Plan & Billing"],
        bgColor: "#fffbeb",
      },
      "/freelancer-dashboard/profile": {
        breadcrumbs: ["Dashboard", "Profile"],
        bgColor: "#f0fdf4",
      },
      "/freelancer-dashboard/wallet": {
        breadcrumbs: ["Dashboard", "Wallet"],
        bgColor: "#ecfeff",
      },
      "/freelancer-dashboard/project-management": {
        breadcrumbs: ["Dashboard", "Projects"],
        bgColor: "#fef7ff",
      },
      "/freelancer-dashboard/proposals": {
        breadcrumbs: ["Dashboard", "Proposals"],
        bgColor: "#f0fdf4",
      },
      "/freelancer-dashboard/settings": {
        breadcrumbs: ["Dashboard", "Settings"],
        bgColor: "#ffffffff",
      },
    };

    const currentRoute = Object.keys(routeMap).find((route) =>
      pathname.startsWith(route)
    );

    if (currentRoute) {
      setBreadcrumbs(routeMap[currentRoute].breadcrumbs);
      setPageStyle({
        backgroundColor: routeMap[currentRoute].bgColor,
        minHeight: "100vh",
      });
    } else {
      setBreadcrumbs(["Dashboard"]);
      setPageStyle({
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      });
    }
  }, [pathname]);

  // Check if a nav item is active
  const isActive = (itemPath) => {
    return pathname === itemPath || pathname.startsWith(itemPath + "/");
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          fetchUserPlan(data.user.id);
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

  const fetchUserPlan = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/plan`);
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.plan || "Free");
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  const getPlanBadgeClass = (plan) => {
    switch (plan?.toLowerCase()) {
      case "premium":
        return styles.premiumBadge;
      case "pro":
        return styles.proBadge;
      case "business":
        return styles.businessBadge;
      default:
        return styles.freeBadge;
    }
  };

  const isFreePlan = () => {
    return userPlan?.toLowerCase() === "free";
  };

  const handleUpgradePlan = () => {
    router.push("/freelancer-dashboard/plan");
    setIsMobileMenuOpen(false);
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const handleNavigation = (item) => {
    setPageStyle({
      backgroundColor: item.bgColor,
      minHeight: "100vh",
    });
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
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

  const handleSocialMediaClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard} style={pageStyle}>
      {/* Mobile Header - Always visible on mobile */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          <button
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <Link
            href="/freelancer-dashboard"
            className={styles.logo}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiBriefcase size={24} />
            {!isTablet && <span>Freelancer</span>}
          </Link>
        </div>

        <div className={styles.mobileHeaderRight}>
          <div className={styles.planDisplayMobile}>
            <span className={getPlanBadgeClass(userPlan)}>
              {isMobile ? userPlan : `${userPlan} Plan`}
            </span>
          </div>
          {isFreePlan() && (
            <motion.button
              className={styles.upgradeBtnMobile}
              onClick={handleUpgradePlan}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiStar size={14} />
              {!isMobile && "Upgrade"}
            </motion.button>
          )}
          <div className={styles.avatarSmall}>
            {getUserInitials(currentUser?.name)}
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Sidebar - Different rendering logic for mobile vs desktop/tablet */}
        <AnimatePresence>
          {/* Mobile: Only show when menu is open */}
          {isMobile && isMobileMenuOpen && (
            <>
              <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.aside
                className={styles.sidebar}
                variants={sidebarVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {/* User Profile Section */}
                <div className={styles.userSection}>
                  <div className={styles.avatar}>
                    {getUserInitials(currentUser?.name)}
                  </div>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>
                      {currentUser?.name || "User"}
                    </h3>
                    <p className={styles.userRole}>
                      {currentUser?.role === "freelancer"
                        ? "Freelancer"
                        : "User"}
                    </p>
                    <div className={styles.planDisplay}>
                      <span className={getPlanBadgeClass(userPlan)}>
                        {userPlan} Plan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className={styles.nav}>
                  {menuItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`${styles.navItem} ${
                        isActive(item.path) ? styles.active : ""
                      }`}
                      onClick={() => handleNavigation(item)}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      {isActive(item.path) && (
                        <div className={styles.activeIndicator} />
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Sidebar Footer */}
                <div className={styles.sidebarFooter}>
                  {/* Social Media Links */}
                  <div className={styles.socialMediaSection}>
                    <p className={styles.socialMediaTitle}>Follow Us</p>
                    <div className={styles.socialMediaIcons}>
                      {socialMediaLinks.map((social) => (
                        <motion.button
                          key={social.name}
                          className={styles.socialMediaIcon}
                          onClick={() => handleSocialMediaClick(social.url)}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ "--social-color": social.color }}
                          title={social.name}
                        >
                          {social.icon}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/freelancer-dashboard/settings"
                    className={styles.sidebarButton}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiSettings size={18} />
                    <span>Settings</span>
                  </Link>
                  <button
                    className={`${styles.sidebarButton} ${styles.logoutButton}`}
                    onClick={handleLogout}
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}

          {/* Desktop/Tablet: Always show sidebar */}
          {!isMobile && (
            <aside
              className={`${styles.sidebar} ${
                isTablet ? styles.sidebarTablet : ""
              }`}
            >
              {/* User Profile Section */}
              <div className={styles.userSection}>
                <div className={styles.avatar}>
                  {getUserInitials(currentUser?.name)}
                </div>
                {!isTablet && (
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>
                      {currentUser?.name || "User"}
                    </h3>
                    <p className={styles.userRole}>
                      {currentUser?.role === "freelancer"
                        ? "Freelancer"
                        : "User"}
                    </p>
                    <div className={styles.planDisplay}>
                      <span className={getPlanBadgeClass(userPlan)}>
                        {userPlan} Plan
                      </span>
                    </div>
                    {isFreePlan() && (
                      <motion.button
                        className={styles.upgradeBtn}
                        onClick={handleUpgradePlan}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiStar size={16} />
                        Upgrade Plan
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Menu */}
              <nav className={styles.nav}>
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`${styles.navItem} ${
                      isActive(item.path) ? styles.active : ""
                    } ${isTablet ? styles.navItemTablet : ""}`}
                    onClick={() => handleNavigation(item)}
                    title={isTablet ? item.label : ""}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!isTablet && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {isActive(item.path) && !isTablet && (
                      <div className={styles.activeIndicator} />
                    )}
                    {isTablet && isActive(item.path) && (
                      <div className={styles.activeIndicatorTablet} />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Sidebar Footer */}
              <div className={styles.sidebarFooter}>
                {/* Social Media Links - Only show on desktop */}
                {!isTablet && (
                  <div className={styles.socialMediaSection}>
                    <p className={styles.socialMediaTitle}>Follow Us</p>
                    <div className={styles.socialMediaIcons}>
                      {socialMediaLinks.map((social) => (
                        <motion.button
                          key={social.name}
                          className={styles.socialMediaIcon}
                          onClick={() => handleSocialMediaClick(social.url)}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ "--social-color": social.color }}
                          title={social.name}
                        >
                          {social.icon}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/freelancer-dashboard/settings"
                  className={`${styles.sidebarButton} ${
                    isTablet ? styles.sidebarButtonTablet : ""
                  }`}
                  title={isTablet ? "Settings" : ""}
                >
                  <FiSettings size={18} />
                  {!isTablet && <span>Settings</span>}
                </Link>
                <button
                  className={`${styles.sidebarButton} ${styles.logoutButton} ${
                    isTablet ? styles.sidebarButtonTablet : ""
                  }`}
                  onClick={handleLogout}
                  title={isTablet ? "Logout" : ""}
                >
                  <FiLogOut size={18} />
                  {!isTablet && <span>Logout</span>}
                </button>
              </div>
            </aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={`${styles.main} ${isTablet ? styles.mainTablet : ""} ${
            isMobile ? styles.mainMobile : ""
          }`}
          style={pageStyle}
        >
          <div className={styles.content}>
            {/* Custom Scrollbar Container */}
            <div className={styles.scrollContainer}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
