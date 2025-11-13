// app/admin/layout.jsx
"use client";
import { useState, useEffect } from "react";
import styles from "./style/layout.module.css";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiCreditCard,
  FiFileText,
  FiPocket,
} from "react-icons/fi";
import { IoIosJournal, IoIosContact } from "react-icons/io";
import { FcAssistant } from "react-icons/fc";
import { MdDashboard } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const isActive = (path) => {
    return pathname === path ? styles.active : "";
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    { path: "/wp-admin", icon: <FiHome />, label: "Dashboard" },
    { path: "/wp-admin/orders", icon: <FiShoppingBag />, label: "Orders" },
    { path: "/wp-admin/users", icon: <FiUsers />, label: "Users" },
    {
      path: "/wp-admin/from-page",
      icon: <FiBarChart2 />,
      label: "Form Service",
    },
    {
      path: "/wp-admin/virtual-assistance",
      icon: <FcAssistant />,
      label: "Virtual Assistance",
    },
    {
      path: "/wp-admin/jop-application",
      icon: <IoIosJournal />,
      label: "Job Application",
    },
    {
      path: "/wp-admin/contact",
      icon: <IoIosContact />,
      label: "Contact Data",
    },
    {
      path: "/wp-admin/payments",
      icon: <FiCreditCard />,
      label: "Transaction History",
    },
    {
      path: "/wp-admin/wallet-management",
      icon: <FiPocket />,
      label: "Wallet Management",
    },
    { path: "/wp-admin/proposals", icon: <FiFileText />, label: "Proposals" },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.menuToggle} onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <div className={styles.mobileTitle}>
          <h1>Admin Panel</h1>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        } ${isMobile ? styles.mobileSidebar : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <MdDashboard className={styles.logoIcon} />
            <h2
              className={
                sidebarOpen ? styles.logoTextVisible : styles.logoTextHidden
              }
            >
              Admin Panel
            </h2>
          </div>
          <button
            className={styles.sidebarToggle}
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`${styles.navLink} ${isActive(item.path)}`}
                  onClick={handleNavClick}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span
                    className={
                      sidebarOpen
                        ? styles.navLabelVisible
                        : styles.navLabelHidden
                    }
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <FiUser />
            </div>
            <div
              className={
                sidebarOpen ? styles.userInfoVisible : styles.userInfoHidden
              }
            >
              <span className={styles.userName}>Admin User</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <FiLogOut />
            <span
              className={
                sidebarOpen ? styles.logoutTextVisible : styles.logoutTextHidden
              }
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`${styles.mainContent} ${
          !sidebarOpen ? styles.contentExpanded : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
