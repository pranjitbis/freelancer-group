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
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaGlobe,
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
      path: "/client-dashboard/support",
    },
  ];

  // Social media links
  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook />,
      url: "https://facebook.com",
      color: "#1877F2",
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      url: "https://twitter.com",
      color: "#1DA1F2",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin />,
      url: "https://linkedin.com",
      color: "#0077B5",
    },
    {
      name: "Instagram",
      icon: <FaInstagram />,
      url: "https://instagram.com",
      color: "#E4405F",
    },
    {
      name: "YouTube",
      icon: <FaYoutube />,
      url: "https://youtube.com",
      color: "#FF0000",
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
      setIsSidebarOpen(!mobile);
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
    closed: { x: 0 },
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
          <h2>Client Dashboard</h2>
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

        {/* Social Media Section */}
        <div className={styles.socialSection}>
          <h4 className={styles.socialTitle}>Follow Us</h4>
          <div className={styles.socialIcons}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                style={{ "--social-color": social.color }}
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Settings and Logout */}
        <div className={styles.bottomActions}>
          <Link href="/client-dashboard/settings">
            <button className={styles.settings}>
              <IoMdSettings /> Settings
            </button>
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
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
