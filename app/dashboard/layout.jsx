"use client";
import { useState } from "react";
import styles from "./dashboard.module.css";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      id: "dashboard",
      href: "/dashboard",
      icon: <FiHome size={20} />,
      label: "Dashboard",
    },
    {
      id: "orders",
      href: "/dashboard/orders",
      icon: <FiShoppingBag size={20} />,
      label: "Orders",
    },
    {
      id: "services",
      href: "/dashboard/services",
      icon: <FiGrid size={20} />,
      label: "Services",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FiMenu size={24} />
            </button>
            <h1>Dashboard</h1>
          </div>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <nav
          className={`${styles.sidebar} ${
            mobileMenuOpen ? styles.sidebarOpen : ""
          }`}
        >
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${
                    pathname === item.href ? styles.active : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.sidebarFooter}>
            <div className={styles.navItem}>
              <FiLogOut size={20} />
            </div>
          </div>
        </nav>

        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
