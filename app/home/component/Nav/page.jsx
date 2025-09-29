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
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleServices = () => {
    setServicesOpen(!servicesOpen);
  };

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
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
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
                    href="/services/freelancer-hub"
                    onClick={() => setServicesOpen(false)}
                  >
                    Freelancer Hub
                  </Link>
                  <Link
                    href="/services/form-filling"
                    onClick={() => setServicesOpen(false)}
                  >
                    Form Filling Services
                  </Link>
                  <Link
                    href="/services/virtual-assistance"
                    onClick={() => setServicesOpen(false)}
                  >
                    Virtual Assistance
                  </Link>
                  <Link
                    href="/services/web-development"
                    onClick={() => setServicesOpen(false)}
                  >
                    Web Development
                  </Link>

                  <Link
                    href="/services/e-eommerce-solutions"
                    onClick={() => setServicesOpen(false)}
                  >
                    E-Commerce Solutions
                  </Link>
                  <Link
                    href="/services/travel-bookings"
                    onClick={() => setServicesOpen(false)}
                  >
                    Travel & Hotel Booking
                  </Link>
                  <Link
                    href="/services/data-visualization"
                    onClick={() => setServicesOpen(false)}
                  >
                    Data and AI solution
                  </Link>
                </div>
              )}
            </li>
            <li>
              <Link href="/our-team">Our Team</Link>
            </li>
            <li>
              <Link href="/career">Career</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>

          <div data-aos="fade-left" className={styles.buttons}>
            <Link href="/login">
              <button>Login</button>
            </Link>
            <Link href="/register">
              <button id={styles.signUp}>Sign Up</button>
            </Link>
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
