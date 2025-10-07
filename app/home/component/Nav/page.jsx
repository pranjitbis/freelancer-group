"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../../public/logo/logo.png";
import styles from "./Nav.module.css";
import Link from "next/link";
import { MdMarkEmailRead } from "react-icons/md";
import { IoMenu, IoClose, IoChevronDown } from "react-icons/io5";
import {
  FaPhoneAlt,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [freelancerOpen, setFreelancerOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleServices = () => {
    setServicesOpen(!servicesOpen);
  };

  useEffect(() => {
    // Check if user is logged in
    checkUserStatus();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  const checkUserStatus = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("user");
      setUser(null);

      // Clear the token cookie by making API call
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Close mobile menu if open
      setIsOpen(false);
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "client":
        return "/client-dashboard";
      case "freelancer":
        return "/freelancer-dashboard";
      case "admin":
        return "/wp-admin";
      default:
        return "/dashboard";
    }
  };

  return (
    <div>
      {/* Topbar (scrolls away) */}
      <div className={styles.topbar}>
        <div data-aos="fade-right" className={styles.email}>
          <span>
            <MdMarkEmailRead />
          </span>
          <p>Info@aroliya.com</p>
          <div className={styles.mainIcons}>
            <span>
              <FaPhoneAlt />
            </span>
            <p>+91-9870519002</p>
          </div>
        </div>

        <div data-aos="fade-left" className={styles.mediaIcons}>
          <Link href="https://www.instagram.com/aroliya5280/">
            <FaInstagram />
          </Link>
          <Link href="https://www.facebook.com/profile.php?id=61571008499035">
            <FaFacebook />
          </Link>
          <Link href="https://www.linkedin.com/company/aroliya-group/">
            <FaLinkedin />
          </Link>
          <Link href="https://x.com/Aroliya171825/">
            <FaXTwitter />
          </Link>
        </div>
      </div>

      {/* Nav (becomes fixed after scroll) */}
      <nav className={`${styles.nav} ${isFixed ? styles.fixed : ""}`}>
        <div data-aos="fade-right" className={styles.logo}>
          <Image src={logo} alt="Elenxia Logo" width={150} height={40} />
        </div>

        <div
          className={`${styles.navLinksOpen} ${isOpen ? styles.active : ""}`}
        >
          <ul data-aos="zoom-in">
            <li>
              <Link href="/" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setIsOpen(false)}>
                About Us
              </Link>
            </li>
            <li className={styles.servicesItem}>
              <div
                className={styles.servicesTrigger}
                onClick={toggleServices}
                onMouseEnter={() => setServicesOpen(true)}
              >
                <span>Services</span>
                <IoChevronDown
                  className={`${styles.chevron} ${
                    servicesOpen ? styles.rotated : ""
                  }`}
                />
              </div>
              {servicesOpen && (
                <div
                  className={styles.servicesDropdown}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href="/services/form-filling"
                    onClick={() => {
                      setServicesOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    Form Filling Services
                  </Link>
                  <Link
                    href="/services/virtual-assistance"
                    onClick={() => {
                      setServicesOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    Virtual Assistance
                  </Link>
                  <Link
                    href="/services/web-development"
                    onClick={() => {
                      setServicesOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    Web Development
                  </Link>

                  <Link
                    href="/services/e-eommerce-solutions"
                    onClick={() => {
                      setServicesOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    E-Commerce Solutions
                  </Link>
                  <Link
                    href="/services/travel-bookings"
                    onClick={() => {
                      setServicesOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    Travel & Hotel Booking
                  </Link>
                  <Link
                    href="/services/data-visualization"
                    onClick={() => {
                      setServicesOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    Data and AI solution
                  </Link>
                </div>
              )}
            </li>
            <li>
              <Link href="/our-team" onClick={() => setIsOpen(false)}>
                Our Team
              </Link>
            </li>
            <li>
              <Link href="/find-work" onClick={() => setIsOpen(false)}>
                Find Work
              </Link>
            </li>
            <li className={styles.servicesItem}>
              <div
                className={styles.servicesTrigger}
                onClick={() => setFreelancerOpen(!freelancerOpen)}
                onMouseEnter={() => setFreelancerOpen(true)}
              >
                <span>Freelancer Hub</span>
                <IoChevronDown
                  className={`${styles.chevron} ${
                    freelancerOpen ? styles.rotated : ""
                  }`}
                />
              </div>

              {freelancerOpen && (
                <div
                  className={styles.servicesDropdown}
                  onMouseLeave={() => setFreelancerOpen(false)}
                >
                  <Link
                    href="/services/freelancer-hub/freelancer-plan"
                    onClick={() => {
                      setFreelancerOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    Join as a Freelancer
                  </Link>
                  <Link
                    href="/services/freelancer-hub/client-plan"
                    onClick={() => {
                      setFreelancerOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    Join as a Client
                  </Link>
                </div>
              )}
            </li>

            <li>
              <Link href="/career" onClick={() => setIsOpen(false)}>
                Career
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                Contact Us
              </Link>
            </li>
          </ul>

          <div data-aos="fade-left" className={styles.buttons}>
            {user ? (
              // User is logged in - Show user info and logout
              <div className={styles.userLoggedIn}>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                >
                  <button className={styles.dashboardBtn}>
                    <FaUser className={styles.btnIcon} />
                    Dashboard
                  </button>
                </Link>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {getInitials(user.name)}
                  </div>
                  <span className={styles.userName}>{user.name}</span>
                </div>
              </div>
            ) : (
              // User is not logged in - Show login/signup buttons
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button>Login</button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button id={styles.signUp}>Sign Up</button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.menuIcons}>
          <button
            className={`${isOpen ? styles.isClose : styles.open}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
          </button>
        </div>
      </nav>
    </div>
  );
}
