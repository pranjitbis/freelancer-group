"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "./TrustedCompanies.module.css";
import { FaAward, FaStar, FaRocket } from "react-icons/fa";

const companies = [
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  },
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    name: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
  },
  {
    name: "Instagram",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
  },
  {
    name: "Twitter",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
  },
  {
    name: "LinkedIn",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg",
  },
  {
    name: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
  },
  {
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  },
];

export default function TrustedCompanies() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className={styles.trustedSection}>
      <motion.div className={styles.trustedContainer} style={{ opacity }}>
        {/* Header Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.trustedTitle}>
            Brands Our Freelancers Get Inspired By{" "}
          </h2>

          <p className={styles.trustedSubtitle}>
            Our freelancers have delivered exceptional work for world-renowned
            companies
          </p>
        </div>

        {/* Logo Slider */}
        <div className={styles.logoSliderContainer}>
          <motion.div style={{ x }} className={styles.logoSlider}>
            {[...companies, ...companies].map((company, index) => (
              <div key={`${company.name}-${index}`} className={styles.logoItem}>
                <img
                  src={company.logo}
                  alt={company.name}
                  className={styles.companyLogo}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
