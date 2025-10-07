// app/admin/layout.jsx
"use client";
import { useState } from "react";
import styles from "./wp-admin.module.css";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiXCircle,
  FiUser,
} from "react-icons/fi";
import { IoIosJournal, IoIosContact } from "react-icons/io";
import { FcAssistant } from "react-icons/fc";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path ? styles.active : "";
  };

  return (
    <div className={styles.adminContainer}>
      <div
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
          <button
            className={styles.sidebarToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiXCircle /> : <FiMenu />}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
            <li>
              <Link href="/wp-admin" className={isActive("/wp-admin")}>
                <FiHome />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wp-admin/orders"
                className={isActive("/wp-admin/orders")}
              >
                <FiShoppingBag />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wp-admin/users"
                className={isActive("/wp-admin/users")}
              >
                <FiUsers />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wp-admin/from-page"
                className={isActive("/wp-admin/from-page")}
              >
                <FiBarChart2 />
                <span>Form Service</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wp-admin/virtual-assistance"
                className={isActive("/wp-admin/virtual-assistance")}
              >
                <FcAssistant />
                <span>Virtual Assistance</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wp-admin/jop-application"
                className={isActive("/wp-admin/jop-application")}
              >
                <IoIosJournal />
                <span>Jop Application</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wp-admin/contact"
                className={isActive("/wp-admin/contact")}
              >
                <IoIosContact />
                <span>Contact Data</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wp-admin/payments"
                className={isActive("/wp-admin/payments")}
              >
                <span>Transaction History</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <FiUser />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Admin User</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>{children}</div>
    </div>
  );
}
