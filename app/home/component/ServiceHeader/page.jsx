"use client";
import React from "react";
import {
  FaRocket,
  FaCheckCircle,
  FaClock,
  FaProjectDiagram,
} from "react-icons/fa";
import { motion } from "framer-motion";
import styles from "./ServicesHeader.module.css";
import Link from "next/link";
export default function ServicesHeader() {
  return (
    <div className={styles.heroSection}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingOrb1}></div>
        <div className={styles.floatingOrb2}></div>
        <div className={styles.gridPattern}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Badge */}
          <motion.div
            className={styles.sectionBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FaRocket className={styles.badgeIcon} />
            <span>Premium Solutions</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className={styles.mainTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Enterprise-Grade{" "}
            <span className={styles.titleHighlight}>
              Services
              <div className={styles.titleUnderline}></div>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Professional solutions designed to optimize operations, enhance
            productivity, and drive measurable business growth through expert
            service delivery.
          </motion.p>

          {/* Performance Metrics */}
          <motion.div
            className={styles.performanceMetrics}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              {
                icon: <FaCheckCircle />,
                value: "99.8%",
                label: "Success Rate",
                trend: "↑ 2.5%",
              },
              {
                icon: <FaClock />,
                value: "24-48h",
                label: "Avg. Delivery",
                trend: "↓ 15% faster",
              },
              {
                icon: <FaProjectDiagram />,
                value: "10K+",
                label: "Projects Done",
                trend: "+500 this month",
              },
            ].map((metric, idx) => (
              <div className={styles.metricCard} key={idx}>
                <div className={styles.metricIcon}>{metric.icon}</div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>{metric.value}</div>
                  <div className={styles.metricLabel}>{metric.label}</div>
                </div>
                <div className={styles.metricTrend}>{metric.trend}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className={styles.ctaButtons}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link href="/register">
              {" "}
              <button className={styles.primaryButton}>Get Started</button>
            </Link>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            className={styles.trustBadge}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          ></motion.div>
        </div>
      </div>
    </div>
  );
}
