import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaAward,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          {/* Company Info with MSME Badge */}
          <div className={styles.companyInfo}>
            <div className={styles.logoSection}>
              <h3 className={styles.logo}>Aroliya</h3>
            </div>
            <p className={styles.description}>
              Providing exceptional services and solutions to businesses
              worldwide. We help you achieve your goals with innovation and
              excellence.
            </p>
            <div className={styles.socialLinks}>
              <a
                href="https://www.facebook.com/profile.php?id=61571008499035"
                aria-label="Facebook"
                className={styles.socialLink}
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="https://x.com/Aroliya171825"
                aria-label="Twitter"
                className={styles.socialLink}
              >
                <FaTwitter size={16} />
              </a>
              <a
                href="https://www.instagram.com/aroliya5280/"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <FaInstagram size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/aroliya-group/"
                aria-label="LinkedIn"
                className={styles.socialLink}
              >
                <FaLinkedinIn size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/" className={styles.link}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.link}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/our-team" className={styles.link}>
                  Team
                </Link>
              </li>
              <li>
                <Link href="/career" className={styles.link}>
                  Career
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className={styles.link}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/how-its-work" className={styles.link}>
                  How Its Work
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Our Services</h4>
            <ul className={styles.linksList}>
              <li>
                <Link
                  href="/services/virtual-assistant"
                  className={styles.link}
                >
                  Virtual Assistant
                </Link>
              </li>
              <li>
                <Link
                  href="/services/e-commerce-solutions"
                  className={styles.link}
                >
                  E-Commerce Solutions
                </Link>
              </li>
              <li>
                <Link href="/services/travel-bookings" className={styles.link}>
                  Travel & Hotel Booking
                </Link>
              </li>
              <li>
                <Link
                  href="/services/data-visualization"
                  className={styles.link}
                >
                  Data & AI Solutions
                </Link>
              </li>
              <li>
                <Link href="/register" className={styles.link}>
                  Freelancer Services
                </Link>
              </li>
              <li>
                <Link href="/services/form-filling" className={styles.link}>
                  Online Form Filling
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.contactInfo}>
            <h4 className={styles.sectionTitle}>Get In Touch</h4>
            <div className={styles.contactItem}>
              <FaPhone size={16} className={styles.contactIcon} />
              <a href="tel:+919870519002" className={styles.contactLink}>
                +91 9870519002
              </a>
            </div>
            <div className={styles.contactItem}>
              <FaEnvelope size={16} className={styles.contactIcon} />
              <a href="mailto:info@aroliya.com" className={styles.contactLink}>
                info@aroliya.com
              </a>
            </div>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt size={16} className={styles.contactIcon} />
              <span className={styles.address}>
                49 Qutuab Vihar, Dwarka Sec 19
                <br />
                110071, New Delhi
              </span>
            </div>
            <div className={styles.trustBadge}>
              <FaShieldAlt className={styles.trustIcon} />
              <span>Trusted Business Partner</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className={styles.bottomFooter}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © {currentYear} Aroliya. All rights reserved.
            </p>
            <div className={styles.legalLinks}>
              <Link href="/terms-and-conditions" className={styles.legalLink}>
                Terms & Conditions
              </Link>
              <Link href="/terms-and-privacy" className={styles.legalLink}>
                Terms & Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
