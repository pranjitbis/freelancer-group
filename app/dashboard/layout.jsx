"use client";
import { useState, useEffect } from "react";
import styles from "./layout.module.css";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiMessageSquare,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiAward,
  FiBarChart2,
  FiFileText,
  FiChevronLeft,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Detect device type and handle responsiveness
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  useEffect(() => {
    fetchUserData();
    // Close mobile menu on route change
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [pathname, isMobile]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const navItems = [
    {
      id: "dashboard",
      href: "/dashboard",
      icon: <FiHome size={20} />,
      label: "Dashboard",
    },
    {
      id: "services",
      href: "/dashboard/services",
      icon: <FiGrid size={20} />,
      label: "Services",
    },
    {
      id: "orders",
      href: "/dashboard/orders",
      icon: <FiShoppingBag size={20} />,
      label: "Orders",
    },
  ];

  const secondaryItems = [
    {
      id: "profile",
      href: "/dashboard/profile",
      icon: <FiUser size={20} />,
      label: "Profile",
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const getUserInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      admin: "Administrator",
      freelancer: "Freelancer",
      client: "Client",
      user: "User",
    };
    return roleMap[role] || "User";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Get current page title for mobile header
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    const page = pathname.split("/").pop();
    return page
      ? page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " ")
      : "Page";
  };

  return (
    <div className={styles.container}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderContent}>
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <div className={styles.mobileTitle}>
            <span className={styles.mobilePageTitle}>{getPageTitle()}</span>
          </div>

          <div className={styles.mobileActions}>
            <button
              className={styles.mobileUserButton}
              onClick={toggleUserMenu}
              aria-label="User menu"
            >
              <div className={styles.userAvatarSmall}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={styles.avatarImage}
                  />
                ) : (
                  <span className={styles.avatarFallback}>
                    {getUserInitials(user?.name)}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        } ${mobileMenuOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <FiAward size={24} />
            </div>
            {sidebarOpen && (
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>Aroliya</span>
                <span className={styles.brandSubtitle}>Workspace</span>
              </div>
            )}
          </div>
          <button
            className={styles.sidebarToggle}
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <FiChevronLeft
              size={18}
              className={`${styles.toggleIcon} ${
                sidebarOpen ? "" : styles.rotated
              }`}
            />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            {sidebarOpen && (
              <span className={styles.sectionLabel}>MAIN MENU</span>
            )}
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${
                      pathname === item.href ? styles.active : ""
                    } ${!sidebarOpen ? styles.collapsed : ""}`}
                    onClick={closeMobileMenu}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        {pathname === item.href && (
                          <div className={styles.activeIndicator} />
                        )}
                      </>
                    )}
                  </Link>
                  {!sidebarOpen && (
                    <div className={styles.tooltip}>{item.label}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.navSection}>
            {sidebarOpen && (
              <span className={styles.sectionLabel}>ACCOUNT</span>
            )}
            <ul className={styles.navList}>
              {secondaryItems.map((item) => (
                <li key={item.id} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${
                      pathname === item.href ? styles.active : ""
                    } ${!sidebarOpen ? styles.collapsed : ""}`}
                    onClick={closeMobileMenu}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        {pathname === item.href && (
                          <div className={styles.activeIndicator} />
                        )}
                      </>
                    )}
                  </Link>
                  {!sidebarOpen && (
                    <div className={styles.tooltip}>{item.label}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarFallback}>
                  {getUserInitials(user?.name)}
                </span>
              )}
            </div>
            {sidebarOpen && user && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name || "User"}</span>
                <span className={styles.userRole}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            )}
          </div>
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`${styles.mainContent} ${
          !sidebarOpen ? styles.expanded : ""
        }`}
      >
        {/* Desktop Header */}
        <header className={styles.desktopHeader}>
          <div className={styles.headerLeft}>
            <button
              className={styles.desktopMenuButton}
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FiMenu size={24} />
            </button>

            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbItem}>Dashboard</span>
              {pathname !== "/dashboard" && (
                <>
                  <FiChevronRight
                    size={14}
                    className={styles.breadcrumbSeparator}
                  />
                  <span className={styles.breadcrumbItem}>
                    {pathname.split("/").pop()?.replace(/-/g, " ") || "Page"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerActions}>
              <div className={styles.userMenuContainer}>
                <button
                  className={styles.userMenuButton}
                  onClick={toggleUserMenu}
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <div className={styles.userAvatarSmall}>
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <span className={styles.avatarFallback}>
                        {getUserInitials(user?.name)}
                      </span>
                    )}
                  </div>
                  <span className={styles.userNameHeader}>
                    {user?.name || "User"}
                  </span>
                  <FiChevronDown
                    size={16}
                    className={`${styles.chevron} ${
                      userMenuOpen ? styles.rotated : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatar}>
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className={styles.avatarImage}
                          />
                        ) : (
                          <span className={styles.avatarFallback}>
                            {getUserInitials(user?.name)}
                          </span>
                        )}
                      </div>
                      <div className={styles.dropdownUserInfo}>
                        <span className={styles.dropdownUserName}>
                          {user?.name || "User"}
                        </span>
                        <span className={styles.dropdownUserEmail}>
                          {user?.email || "user@example.com"}
                        </span>
                        <span className={styles.dropdownUserRole}>
                          {getRoleDisplayName(user?.role)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.dropdownMenu}>
                      <Link
                        href="/dashboard/profile"
                        className={styles.dropdownItem}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiUser size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className={styles.dropdownItem}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiSettings size={16} />
                        <span>Settings</span>
                      </Link>
                      <div className={styles.dropdownDivider} />
                      <button
                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                        onClick={handleLogout}
                      >
                        <FiLogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div className={styles.mobileOverlay} onClick={closeMobileMenu} />
        )}

        {/* Mobile User Menu Overlay */}
        {userMenuOpen && isMobile && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setUserMenuOpen(false)}
          />
        )}

        <main className={styles.contentArea}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
