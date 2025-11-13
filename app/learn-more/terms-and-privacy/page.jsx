"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineEmail } from "react-icons/md";
import Nav from "@/app/home/component/Nav/page";
import Footer from "@/app/home/footer/page";
import {
  FiShield,
  FiUser,
  FiCreditCard,
  FiGlobe,
  FiDatabase,
  FiMail,
  FiHome,
  FiBriefcase,
  FiMapPin,
  FiLock,
  FiEye,
  FiDownload,
  FiArrowRight,
  FiCheckCircle,
  FiAward,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
  const [activeCard, setActiveCard] = useState("introduction");

  const services = [
    {
      icon: <FiUsers />,
      title: "Freelance Platform",
      description: "Secure talent-client matching and project management",
      color: "#8B5CF6",
    },
    {
      icon: <FiTrendingUp />,
      title: "E-commerce Solutions",
      description: "Protected online storefronts and payment processing",
      color: "#10B981",
    },
    {
      icon: <FiAward />,
      title: "Web Development",
      description: "Secure website creation and hosting services",
      color: "#F59E0B",
    },
    {
      icon: <FiMapPin />,
      title: "Travel Booking",
      description: "Safe hotel and travel arrangements",
      color: "#EF4444",
    },
  ];

  const policyCards = [
    {
      id: "introduction",
      title: "Introduction & Scope",
      icon: <FiShield />,
      description: "Our commitment across all services",
      content: `Aroliya ("we," "our," or "us") operates a comprehensive digital platform offering freelance services, e-commerce solutions, web development, online form filing, and travel booking services. This Privacy Policy applies across all our services and explains how we protect and handle your information.`,
      features: [
        "Multi-service coverage",
        "Global compliance",
        "Transparent practices",
      ],
      color: "#3B82F6",
    },
    {
      id: "information-collection",
      title: "Information Collection",
      icon: <FiUser />,
      description: "What data we collect and why",
      content: `We collect various types of information to provide and improve our services:`,
      list: [
        {
          label: "Personal Data",
          value: "Name, email, contact details, identification documents",
        },
        {
          label: "Professional Information",
          value: "Skills, work history, portfolio, certifications",
        },
        {
          label: "Financial Data",
          value: "Payment information, billing details, transaction history",
        },
        {
          label: "Travel Information",
          value: "Booking preferences, travel documents, itinerary details",
        },
        {
          label: "Technical Data",
          value:
            "IP addresses, device information, browser type, usage patterns",
        },
      ],
      color: "#8B5CF6",
    },
    {
      id: "how-we-use",
      title: "How We Use Information",
      icon: <FiDatabase />,
      description: "Purpose of data processing",
      content: `Your information enables us to deliver seamless services across our platform:`,
      list: [
        {
          label: "Service Delivery",
          value: "Matching freelancers with clients, processing bookings",
        },
        {
          label: "Platform Optimization",
          value: "Improving user experience and service quality",
        },
        {
          label: "Communication",
          value: "Updates, support, and promotional messages (with consent)",
        },
        { label: "Security", value: "Fraud prevention and platform safety" },
        {
          label: "Legal Compliance",
          value: "Meeting regulatory requirements across jurisdictions",
        },
      ],
      color: "#10B981",
    },
    {
      id: "data-sharing",
      title: "Data Sharing",
      icon: <FiGlobe />,
      description: "When and why we share information",
      content: `We share information only when necessary and with appropriate safeguards:`,
      list: [
        {
          label: "Service Providers",
          value: "Payment processors, cloud hosting, analytics partners",
        },
        {
          label: "Business Partners",
          value: "Travel providers, certification authorities",
        },
        {
          label: "Legal Requirements",
          value: "Government authorities, law enforcement when required",
        },
        {
          label: "Corporate Transactions",
          value: "In case of mergers, acquisitions, or business transfers",
        },
      ],
      note: "We never sell your personal data to third-party marketers.",
      color: "#EF4444",
    },
    {
      id: "data-protection",
      title: "Data Protection",
      icon: <FiLock />,
      description: "Our security measures",
      content: `We implement enterprise-grade security measures:`,
      features: [
        "End-to-end encryption",
        "Regular security audits",
        "Access controls & authentication",
        "Secure data centers",
        "Employee training & compliance",
      ],
      color: "#F59E0B",
    },
    {
      id: "user-rights",
      title: "Your Rights",
      icon: <FiEye />,
      description: "Control over your data",
      content: `You have comprehensive rights regarding your personal data:`,
      features: [
        "Access and portability",
        "Correction and updates",
        "Deletion and erasure",
        "Processing objections",
        "Consent withdrawal",
      ],
      note: "Contact our Data Protection Officer at privacy@aroliya.com to exercise these rights.",
      color: "#06B6D4",
    },
  ];

  const trustMetrics = [
    { value: "10M+", label: "Users Protected" },
    { value: "150+", label: "Countries Served" },
    { value: "24/7", label: "Security Monitoring" },
    { value: "99.9%", label: "Uptime Reliability" },
  ];

  const handleCardClick = (cardId) => {
    // If clicking the same card that's already open, close it
    // Otherwise, open the clicked card
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  return (
    <>
      <Nav />
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <div className={styles.heroOrnament}></div>
          </div>
          <div className={styles.heroContainer}>
            <motion.div
              className={styles.heroContent}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className={styles.heroBadge}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <FiLock />
                Privacy First
              </motion.div>

              <h1 className={styles.heroTitle}>
                Your Privacy is Our
                <span className={styles.heroGradient}> Commitment</span>
              </h1>

              <p className={styles.heroDescription}>
                At Aroliya, we protect your data across all our services - from
                freelance matching to travel bookings. Transparent, secure, and
                always in your control.
              </p>

              <motion.div
                className={styles.trustMetrics}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {trustMetrics.map((metric, index) => (
                  <div key={metric.label} className={styles.metric}>
                    <div className={styles.metricValue}>{metric.value}</div>
                    <div className={styles.metricLabel}>{metric.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Overview */}
        <section className={styles.services}>
          <div className={styles.servicesContainer}>
            <motion.h2
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Comprehensive Privacy Across All Services
            </motion.h2>
            <div className={styles.servicesGrid}>
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  className={styles.serviceCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div
                    className={styles.serviceIcon}
                    style={{ color: service.color }}
                  >
                    {service.icon}
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Policy Cards Section */}
        <section className={styles.policyCards}>
          <div className={styles.cardsContainer}>
            <motion.div
              className={styles.cardsHeader}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>Privacy Policy Details</h2>
              <p>
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>

            <div className={styles.cardsGrid}>
              {policyCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className={`${styles.policyCard} ${
                    activeCard === card.id ? styles.active : ""
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    borderColor:
                      activeCard === card.id ? card.color : "#e2e8f0",
                    background:
                      activeCard === card.id ? `${card.color}08` : "#ffffff",
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div
                      className={styles.cardIcon}
                      style={{
                        backgroundColor: `${card.color}15`,
                        color: card.color,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div className={styles.cardTitle}>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                    <motion.div
                      className={styles.cardToggle}
                      animate={{ rotate: activeCard === card.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ color: card.color }}
                    >
                      <FiArrowRight />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {activeCard === card.id && (
                      <motion.div
                        className={styles.cardContent}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={styles.contentSection}>
                          <p>{card.content}</p>
                        </div>

                        {card.features && (
                          <div className={styles.featuresList}>
                            {card.features.map((feature, idx) => (
                              <motion.div
                                key={idx}
                                className={styles.featureItem}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                              >
                                <FiCheckCircle style={{ color: card.color }} />
                                <span>{feature}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {card.list && (
                          <div className={styles.detailedList}>
                            {card.list.map((item, idx) => (
                              <motion.div
                                key={idx}
                                className={styles.listItem}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: idx * 0.05,
                                }}
                              >
                                <div
                                  className={styles.listBullet}
                                  style={{ backgroundColor: card.color }}
                                ></div>
                                <div className={styles.listContent}>
                                  <strong>{item.label}</strong>
                                  <span>{item.value}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {card.note && (
                          <motion.div
                            className={styles.noteBox}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            style={{ borderLeftColor: card.color }}
                          >
                            <FiEye style={{ color: card.color }} />
                            <span>{card.note}</span>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <motion.div
            className={styles.ctaContainer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.ctaContent}>
              <div className={styles.ctaText}>
                <h2>Questions About Your Privacy?</h2>
                <p>
                  Our dedicated privacy team is here to help you understand and
                  control your data.
                </p>
              </div>
              <div className={styles.ctaButtons}>
                <a href="/contact-us">
                  <motion.button
                    className={styles.primaryButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiMail />
                    Contact Privacy Team
                  </motion.button>
                </a>
                <a href="mailto:info@aroliya.com">
                  <motion.button
                    className={styles.secondaryButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdOutlineEmail />
                    Send Email
                  </motion.button>
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
      <Footer />
    </>
  );
}
