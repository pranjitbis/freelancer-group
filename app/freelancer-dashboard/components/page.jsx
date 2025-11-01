"use client";
import { motion } from "framer-motion";
import { FiAward, FiUsers, FiGlobe, FiBriefcase } from "react-icons/fi";
import styles from "./FreelanceBanner.module.css";
import logo from "@/public/logo/Aroliya.png";
import Image from "next/image";
import { useEffect, useState } from "react";

const FreelancerDashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userResponse = await fetch("/api/auth/verify");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("✅ User data loaded:", userData);
        setUser(userData.user);
      } else {
        console.log("bhai problem hai");
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadDashboardData();
  }, []);
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.professionalBanner}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <div className={styles.logo}>
              <Image src={logo} alt="err" />
            </div>
            <div className={styles.bannerBadge}>
              <FiAward className={styles.badgeIcon} />
              <span>The #1 Freelancing Hub in Asia</span>
            </div>
          </div>
          <div className={styles.bannerStats}>
            <div className={styles.bannerStat}>
              <FiUsers className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statNumber}>50K+</span>
                <span className={styles.statLabel}>Active Freelancers</span>
              </div>
            </div>
            <div className={styles.bannerStat}>
              <FiGlobe className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statNumber}>120+</span>
                <span className={styles.statLabel}>Countries</span>
              </div>
            </div>
            <div className={styles.bannerStat}>
              <FiBriefcase className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statNumber}>25K+</span>
                <span className={styles.statLabel}>Projects Completed</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FreelancerDashboard;
