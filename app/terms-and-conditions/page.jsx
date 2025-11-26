"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../home/component/Nav/page";
import Footer from "../home/footer/page";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBalanceScale,
  FaShieldAlt,
  FaUserCheck,
  FaCogs,
  FaExclamationTriangle,
  FaBan,
  FaGavel,
  FaSync,
  FaEnvelope,
  FaHome,
  FaFileContract,
  FaPhone,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaPlane,
  FaHotel,
  FaShoppingCart,
  FaFileAlt,
  FaUsers,
  FaCreditCard,
  FaLock,
  FaGlobe,
  FaUserShield,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import styles from "./Terms.module.css";

export default function TermsAndConditions() {
  const [isClient, setIsClient] = useState(false);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    setIsClient(true);
    // Initialize all sections as open
    setOpenSections({
      introduction: true,
      serviceTerms: true,
      userAccounts: true,
      payments: true,
      intellectualProperty: true,
      liability: true,
      contact: true,
    });
  }, []);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const services = [
    { icon: FaFileAlt, name: "Online Form Filling" },
    { icon: FaPlane, name: "Travel Booking" },
    { icon: FaHotel, name: "Hotel Reservations" },
    { icon: FaShoppingCart, name: "E-commerce Solutions" },
    { icon: FaUsers, name: "Freelancer Platform" },
    { icon: FaUserShield, name: "Client Services" },
  ];

  if (!isClient) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.contentCard}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Head>
        <title>
          Terms and Conditions | Aroliya - Complete Digital Solutions
        </title>
        <meta
          name="description"
          content="Aroliya Terms and Conditions for online form filling, travel booking, hotel reservations, e-commerce solutions, and freelancer-client platform services."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Nav />

      {/* Main Content */}
      <main className={styles.main}>
        {/* Hero Section */}
        <motion.section
          className={styles.heroSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Terms and Conditions
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.p>

          {/* Services Grid */}
          <motion.div
            className={styles.servicesGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                className={styles.serviceItem}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <service.icon className={styles.serviceIcon} />
                <span>{service.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Content Card */}
        <div className={styles.contentWrapper}>
          <motion.div
            className={styles.contentCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {/* Introduction */}
            <motion.section className={styles.section} variants={itemVariants}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("introduction")}
                style={{ cursor: "pointer" }}
              >
                <FaBalanceScale className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Introduction</h2>
                <motion.div
                  animate={{ rotate: openSections.introduction ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openSections.introduction ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openSections.introduction && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.paragraph}>
                      Welcome to <strong>Aroliya</strong> - Your comprehensive
                      digital solution platform. These terms and conditions
                      govern your use of our services including online form
                      filling, travel and hotel bookings, e-commerce solutions,
                      and our freelancer-client platform. By accessing or using
                      any of our services, you agree to be bound by these terms.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Service-Specific Terms */}
            <motion.section className={styles.section} variants={itemVariants}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("serviceTerms")}
                style={{ cursor: "pointer" }}
              >
                <FaCogs className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Service-Specific Terms</h2>
                <motion.div
                  animate={{ rotate: openSections.serviceTerms ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openSections.serviceTerms ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openSections.serviceTerms && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 style={{ color: "#1f2937", marginBottom: "16px" }}>
                      Online Form Filling Services
                    </h3>
                    <p className={styles.paragraph}>
                      Our form filling services are provided for assistance
                      purposes only. You are responsible for:
                    </p>
                    <ul className={styles.list}>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Providing accurate and complete information for form
                          submissions
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Verifying all information before final submission
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Understanding that we are not responsible for
                          government or institutional decisions
                        </span>
                      </motion.li>
                    </ul>

                    <h3
                      style={{
                        color: "#1f2937",
                        marginBottom: "16px",
                        marginTop: "30px",
                      }}
                    >
                      Travel & Hotel Booking
                    </h3>
                    <p className={styles.paragraph}>
                      For travel and accommodation services, the following terms
                      apply:
                    </p>
                    <ul className={styles.list}>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          All bookings are subject to availability and provider
                          terms
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Cancellation and refund policies vary by service
                          provider
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Travel restrictions and requirements are your
                          responsibility
                        </span>
                      </motion.li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* User Accounts and Responsibilities */}
            <motion.section className={styles.section} variants={itemVariants}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("userAccounts")}
                style={{ cursor: "pointer" }}
              >
                <FaUserCheck className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>
                  User Accounts and Responsibilities
                </h2>
                <motion.div
                  animate={{ rotate: openSections.userAccounts ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openSections.userAccounts ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openSections.userAccounts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.paragraph}>
                      When using Aroliya services, you agree to:
                    </p>
                    <ul className={styles.list}>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Maintain the security and confidentiality of your
                          account credentials
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Provide accurate and current information for all
                          services
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Notify us immediately of any unauthorized account
                          activity
                        </span>
                      </motion.li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Payments and Financial Terms */}
            <motion.section className={styles.section} variants={itemVariants}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("payments")}
                style={{ cursor: "pointer" }}
              >
                <FaCreditCard className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>
                  Payments and Financial Terms
                </h2>
                <motion.div
                  animate={{ rotate: openSections.payments ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openSections.payments ? <FaChevronUp /> : <FaChevronDown />}
                </motion.div>
              </div>
              <AnimatePresence>
                {openSections.payments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.paragraph}>
                      All financial transactions through Aroliya are governed
                      by:
                    </p>
                    <ul className={styles.list}>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Service fees are clearly displayed before transaction
                          completion
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Refund policies vary by service type and are specified
                          during purchase
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaCheck className={styles.listIcon} />
                        <span className={styles.listText}>
                          Currency conversion rates apply for international
                          transactions
                        </span>
                      </motion.li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Limitation of Liability */}
            <motion.section className={styles.section} variants={itemVariants}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("liability")}
                style={{ cursor: "pointer" }}
              >
                <FaExclamationTriangle className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
                <motion.div
                  animate={{ rotate: openSections.liability ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openSections.liability ? <FaChevronUp /> : <FaChevronDown />}
                </motion.div>
              </div>
              <AnimatePresence>
                {openSections.liability && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.paragraph}>
                      Aroliya provides services as a platform and intermediary.
                      We are not liable for:
                    </p>
                    <ul className={styles.list}>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaTimes className={styles.listIcon} />
                        <span className={styles.listText}>
                          Decisions made by government agencies on form
                          submissions
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaTimes className={styles.listIcon} />
                        <span className={styles.listText}>
                          Service quality or issues with third-party travel
                          providers
                        </span>
                      </motion.li>
                      <motion.li
                        className={styles.listItem}
                        whileHover={{ x: 5 }}
                      >
                        <FaTimes className={styles.listIcon} />
                        <span className={styles.listText}>
                          Disputes between freelancers and clients on our
                          platform
                        </span>
                      </motion.li>
                    </ul>

                    <div className={styles.warningBox}>
                      <p>
                        <strong>Important:</strong> Aroliya acts as a service
                        platform and intermediary. We facilitate connections and
                        services but are not responsible for the outcomes of
                        third-party services or government decisions.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Contact Information */}
            <motion.section className={styles.section} variants={itemVariants}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("contact")}
                style={{ cursor: "pointer" }}
              >
                <FaEnvelope className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Contact Information</h2>
                <motion.div
                  animate={{ rotate: openSections.contact ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openSections.contact ? <FaChevronUp /> : <FaChevronDown />}
                </motion.div>
              </div>
              <AnimatePresence>
                {openSections.contact && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.paragraph}>
                      For questions about these Terms and Conditions or our
                      services, contact us:
                    </p>
                    <div className={styles.contactSection}>
                      <div className={styles.contactItem}>
                        <FaEnvelope className={styles.contactIcon} />
                        <span>info@aroliya.com</span>
                      </div>
                      <div className={styles.contactItem}>
                        <FaPhone className={styles.contactIcon} />
                        <span>+91-9870519002</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
