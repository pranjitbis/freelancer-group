"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoMenu, IoClose, IoChevronDown } from "react-icons/io5";
import { FaInstagram, FaFacebook, FaLinkedin, FaUser } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdMarkEmailRead } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import logo from "../../../../public/logo/logo.png";
import styles from "./Nav.module.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [dropdown, setDropdown] = useState({
    services: false,
    freelancer: false,
  });
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    checkAuthStatus();

    const handleScroll = () => setIsFixed(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserName(data.user.name);
          setUser(data.user);
          setUserRole(data.user.role);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setUserRole(null);
      localStorage.removeItem("user");
    }
  };

  const toggleDropdown = (name) =>
    setDropdown((prev) => ({ ...prev, [name]: !prev[name] }));

  const getDashboardLink = () => {
    if (!userRole) return "/login";

    switch (userRole.toLowerCase()) {
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
    <header className={`${styles.header} ${isFixed ? styles.fixed : ""}`}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <MdMarkEmailRead /> <span>Info@aroliya.com</span>
          <FaPhoneAlt style={{ marginLeft: "1rem" }} />{" "}
          <span>+91-9870519002</span>
        </div>
        <div className={styles.topRight}>
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

      {/* Navbar */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Image src={logo} alt="Aroliya Logo" width={150} height={50} />
        </Link>

        <ul className={`${styles.navLinks} ${isOpen ? styles.active : ""}`}>
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
          <li>
            <Link href="/our-team" onClick={() => setIsOpen(false)}>
              Our Team
            </Link>
          </li>
          {/* 💼 Services Dropdown */}
          <li className={styles.dropdown}>
            <button onClick={() => toggleDropdown("services")}>
              Services <IoChevronDown />
            </button>
            {dropdown.services && (
              <div className={styles.dropdownMenu}>
                <Link href="/services/virtual-assistance">
                  Virtual Assistance
                </Link>
                <Link href="/services/form-filling">Online Form Filling</Link>
                <Link href="/services/web-development">Web Development</Link>
                <Link href="/services/e-commerce-solutions">
                  E-Commerce Solution
                </Link>
                <Link href="/services/travel-bookings">
                  Travel & Hotel booking
                </Link>
                <Link href="/services/data-visualization">
                  Data & AI Solution
                </Link>
              </div>
            )}
          </li>
          <li>
            <Link href="/find-work" onClick={() => setIsOpen(false)}>
              Find Work
            </Link>
          </li>
          <li className={styles.dropdown}>
            <button onClick={() => toggleDropdown("freelancer")}>
              Freelancer Hub <IoChevronDown />
            </button>
            {dropdown.freelancer && (
              <div className={styles.dropdownMenu}>
                <Link href="/services/freelancer-hub/freelancer-plan">
                  Join as Freelancer
                </Link>
                <Link href="/services/freelancer-hub/client-plan">
                  Join as Client
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
            <Link href="/contact-us" onClick={() => setIsOpen(false)}>
              Contact Us
            </Link>
          </li>
        </ul>

        <div className={styles.actions}>
          {user ? (
            <Link href={getDashboardLink()} className={styles.dashboardBtn}>
              <FaUser /> {userName}
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className={styles.loginBtn}>Login</button>
              </Link>
              <Link href="/register">
                <button className={styles.signUpBtn}>Register</button>
              </Link>
            </>
          )}
        </div>

        <button
          className={styles.menuToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IoClose size={26} /> : <IoMenu size={26} />}
        </button>
      </nav>
    </header>
  );
}
