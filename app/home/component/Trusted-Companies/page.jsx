"use client";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import styles from "./TrustedCompanies.module.css";
import { FaCrown, FaAward, FaRocket, FaRegStar, FaStar } from "react-icons/fa";

const companies = [

  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    tier: "premium",
  },


  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    tier: "premium",
  },
  {
    name: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    tier: "enterprise",
  },

  {
    name: "Instagram",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    tier: "enterprise",
  },
  {
    name: "Twitter",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
    tier: "enterprise",
  },
  {
    name: "LinkedIn",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg",
    tier: "premium",
  },

  {
    name: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
    tier: "premium",
  },
  {
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    tier: "enterprise",
  },

];

export default function TrustedCompanies() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawX = useTransform(scrollYProgress, [0, 2], ["0%", "-85%"]);
  const x = useSpring(rawX, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  // Fade in animation
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.9]
  );

  return (
    <section ref={ref} className={styles.trustedSection}>
      <motion.div
        className={styles.trustedContainer}
        style={{ opacity, scale }}
      >
        {/* Header with professional badge */}
        <div className={styles.sectionHeader}>
          <div className={styles.premiumBadge}>
            <FaCrown className={styles.badgeIcon} />
            Enterprise Partners
          </div>

          <h2 className={styles.trustedTitle}>
            Trusted by Industry{" "}
            <span className={styles.titleHighlight}>Leaders</span>
          </h2>

          <p className={styles.trustedSubtitle}>
            Our freelancers have contributed to projects for the world's most
            innovative companies
          </p>

          {/* Trust Indicators */}
          <div className={styles.trustIndicators}>
            <div className={styles.trustIndicator}>
              <FaAward className={styles.indicatorIcon} />
              <span>500+ Projects Delivered</span>
            </div>
            <div className={styles.trustIndicator}>
              <FaStar className={styles.indicatorIcon} />
              <span>4.9/5 Client Rating</span>
            </div>
            <div className={styles.trustIndicator}>
              <FaRocket className={styles.indicatorIcon} />
              <span>Global Reach</span>
            </div>
          </div>
        </div>

        {/* Enhanced Slider */}
        <div className={styles.trustedSliderContainer}>
          <div className={styles.sliderOverlayLeft}></div>
          <div className={styles.sliderOverlayRight}></div>

          <motion.div style={{ x }} className={styles.trustedSlider}>
            {[...companies, ...companies].map((company, index) => (
              <motion.div
                key={`${company.name}-${index}`}
                className={`${styles.trustedLogoWrapper} ${
                  styles[company.tier]
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.logoContainer}>
                  <img
                    src={company.logo}
                    alt={company.name}
                    className={styles.trustedLogo}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
