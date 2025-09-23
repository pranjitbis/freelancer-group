"use client";
import React from "react";
import styles from "./WhyChooseAroliya.module.css";
import {
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaAward,
  FaClock,
  FaHeadset,
  FaCheckCircle,
  FaChartLine,
  FaLock,
  FaGlobe,
  FaHandHoldingUsd,
  FaStar,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";

const WhyChooseAroliya = () => {
  const features = [
    {
      icon: <FaShieldAlt />,
      title: "100% Secure & Confidential",
      description:
        "Enterprise-grade security with end-to-end encryption and strict confidentiality agreements",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <FaRocket />,
      title: "Lightning Fast Delivery",
      description:
        "24-48 hour turnaround times without compromising on quality or accuracy",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <FaAward />,
      title: "99.8% Accuracy Rate",
      description:
        "Industry-leading accuracy with multiple quality checks and verification processes",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <FaUsers />,
      title: "Expert Professionals",
      description:
        "Hand-picked specialists with 5+ years of experience in their respective domains",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Dedicated Support",
      description:
        "Round-the-clock customer support with dedicated account managers",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      icon: <FaHandHoldingUsd />,
      title: "Cost-Effective Solutions",
      description:
        "Premium services at competitive prices with transparent pricing models",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Forms Processed", icon: <FaCheckCircle /> },
    { number: "5,000+", label: "Happy Clients", icon: <FaUsers /> },
    { number: "99.8%", label: "Success Rate", icon: <FaAward /> },
    { number: "24/7", label: "Support Available", icon: <FaHeadset /> },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Requirement Analysis",
      description:
        "Detailed consultation to understand your specific needs and objectives",
    },
    {
      step: "02",
      title: "Expert Assignment",
      description:
        "Matching you with the most suitable professional for your project",
    },
    {
      step: "03",
      title: "Quality Execution",
      description: "Meticulous work with multiple quality checkpoints",
    },
    {
      step: "04",
      title: "Delivery & Support",
      description:
        "Timely delivery followed by comprehensive after-service support",
    },
  ];

  return (
    <section className={styles.whyChooseSection}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.heroBadge}>
              <FaStar className={styles.badgeIcon} />
              Industry Leader Since 2023
            </div>
            <h1 className={styles.heroTitle}>
              Why <span className={styles.highlight}>Thousands Trust</span>{" "}
              Aroliya
            </h1>
            <p className={styles.heroDescription}>
              Discover the Aroliya advantage - where precision meets efficiency.
              We're not just a service provider; we're your strategic partner in
              success, delivering exceptional results that drive measurable
              business growth.
            </p>

            <div className={styles.heroStats}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.heroStat}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div className={styles.statContent}>
                    <div className={styles.statNumber}>{stat.number}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Aroliya Difference</h2>
            <p className={styles.sectionSubtitle}>
              Experience service excellence that sets new industry standards
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={styles.featureIcon}
                  style={{ background: feature.gradient }}
                >
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
                <div
                  className={styles.featureOverlay}
                  style={{ background: feature.gradient }}
                ></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className={styles.processSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Proven Process</h2>
            <p className={styles.sectionSubtitle}>
              A systematic approach that guarantees success every time
            </p>
          </div>

          <div className={styles.processTimeline}>
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                className={styles.processStep}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className={styles.stepIndicator}>
                  <span className={styles.stepNumber}>{step.step}</span>
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseAroliya;
