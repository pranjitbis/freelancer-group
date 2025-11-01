"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./ClientDashboard.module.css";
import { HiReceiptRefund } from "react-icons/hi";
import { MdOutlineContactSupport } from "react-icons/md";
import { SiSimpleanalytics } from "react-icons/si";
import {
  FaHome,
  FaPlus,
  FaList,
  FaComments,
  FaMoneyBillWave,
  FaUserCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdMessage } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { RiRefund2Line } from "react-icons/ri";
import Link from "next/link";
export default function ClientDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaHome />,
      path: "/client-dashboard",
    },
    {
      id: "post-job",
      label: "Post a Job",
      icon: <FaPlus />,
      path: "/client-dashboard/post-job",
    },
    {
      id: "my-jobs",
      label: "My Jobs",
      icon: <FaList />,
      path: "/client-dashboard/my-jobs",
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: <FaComments />,
      path: "/client-dashboard/proposals",
    },
    {
      id: "Hire-freelancer",
      label: "Hire freelancer",
      icon: <HiReceiptRefund />,
      path: "/client-dashboard/hire-freelancer",
    },

    {
      id: "Message",
      label: "Message",
      icon: <MdMessage />,
      path: "/client-dashboard/messages",
    },

    {
      id: "payments",
      label: "Payment",
      icon: <FaMoneyBillWave />,
      path: "/client-dashboard/payments",
    },
    {
      id: "Refunds",
      label: "Refund",
      icon: <RiRefund2Line size={20} />,
      path: "/client-dashboard/refunds",
      bgColor: "#f0fdf4",
    },

    {
      id: "profile",
      label: "Profile",
      icon: <FaUserCog />,
      path: "/client-dashboard/profile",
    },
    {
      id: "Analytics",
      label: "Analytics",
      icon: <SiSimpleanalytics />,
      path: "/client-dashboard/analytics",
    },
    {
      id: "Support",
      label: "Support",
      icon: <MdOutlineContactSupport />,
      path: "/client-dashboard/profile",
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      if (userObj.role !== "client") {
        router.push("/freelancer-dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // Check if mobile and set initial sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // Open on desktop, closed on mobile by default
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("user");
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const getActiveTab = () => {
    return menuItems.find((item) => pathname === item.path)?.id || "dashboard";
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const desktopSidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: 0 }, // Always visible on desktop
  };

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <motion.div
        className={styles.sidebar}
        variants={isMobile ? sidebarVariants : desktopSidebarVariants}
        initial="closed"
        animate={isMobile ? (isSidebarOpen ? "open" : "closed") : "open"}
      >
        <div className={styles.sidebarHeader}>
          {isMobile && (
            <button
              className={styles.closeBtn}
              onClick={() => setIsSidebarOpen(false)}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className={styles.avatarImage}
              />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className={styles.userDetails}>
            <h4>{user.name}</h4>
            <span>Client</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${
                getActiveTab() === item.id ? styles.active : ""
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <Link href="/client-dashboard/settings">
          <button className={styles.settings}>
            <IoMdSettings /> settings
          </button>
        </Link>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <FaSignOutAlt /> Logout
        </button>
      </motion.div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <div
        className={`${styles.mainContent} ${
          isSidebarOpen && isMobile ? styles.shifted : ""
        }`}
      >
        <header className={styles.header}>
          <button
            className={styles.menuToggle}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
