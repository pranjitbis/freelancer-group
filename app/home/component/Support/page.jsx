"use client";
import React from "react";
import Link from "next/link";
import {
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaRocket,
} from "react-icons/fa";
import { motion } from "framer-motion";
import styles from "./EnterpriseCTA.module.css";

export default function EnterpriseCTA() {
  return (
    <section className={styles.enterpriseCTA}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingOrb1}></div>
        <div className={styles.floatingOrb2}></div>
        <div className={styles.gridPattern}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.ctaContent}>
          {/* Badge */}
          <motion.div
            className={styles.ctaBadge}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FaShieldAlt className={styles.badgeIcon} />
            <span>Enterprise Ready</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            className={styles.mainHeading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Ready to Transform Your{" "}
            <span className={styles.gradientText}>Business?</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className={styles.description}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Schedule a consultation with our experts to discuss custom solutions
            tailored to your specific requirements.
          </motion.p>

          {/* Features Grid */}
          <motion.div
            className={styles.featuresGrid}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              { icon: <FaCheckCircle />, text: "No commitment required" },
              { icon: <FaClock />, text: "30-minute free session" },
              { icon: <FaUsers />, text: "Expert consultation" },
              { icon: <FaRocket />, text: "Custom solution roadmap" },
            ].map((feature, idx) => (
              <div className={styles.featureItem} key={idx}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <span className={styles.featureText}>{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className={styles.ctaButtons}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link href="/contact-us" className={styles.ctaLink}>
              <motion.button
                className={styles.primaryCta}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Free Consultation</span>
                <FaArrowRight className={styles.arrowIcon} />
                <div className={styles.buttonHoverEffect}></div>
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className={styles.trustIndicators}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              { value: "500+", label: "Enterprises Served" },
              { value: "98%", label: "Client Satisfaction" },
              { value: "24/7", label: "Support Available" },
            ].map((item, idx) => (
              <React.Fragment key={idx}>
                <div className={styles.trustItem}>
                  <div className={styles.trustValue}>{item.value}</div>
                  <div className={styles.trustLabel}>{item.label}</div>
                </div>
                {idx < 2 && <div className={styles.trustDivider}></div>}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
