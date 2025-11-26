"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./About.module.css";
import Nav from "../home/component/Nav/page";
import Footer from "../home/footer/page";
import founderImage from "../../public/about/sir-image.png";
import teamImage from "../../public/about/team2.jpeg";
import teamTow from "../../public/about/tem3.jpg";
import Whasapp from "../whatsapp_icon/page";
import Image from "next/image";
import {
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaCheckCircle,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaTrophy,
  FaAward,
  FaQuoteLeft,
  FaGlobeAmericas,
  FaLightbulb,
  FaHandshake,
  FaStar,
  FaHeart,
  FaCode,
  FaChartLine,
} from "react-icons/fa";
import Link from "next/link";
export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeValue, setActiveValue] = useState(0);
  const statsRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Animated counter
  const [animatedStats, setAnimatedStats] = useState({
    projects: 0,
    satisfaction: 0,
    support: 0,
    clients: 0,
    delivered: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate stats
          const animateValue = (start, end, duration, key) => {
            let startTime = null;
            const step = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              setAnimatedStats((prev) => ({
                ...prev,
                [key]: Math.floor(progress * (end - start) + start),
              }));
              if (progress < 1) {
                requestAnimationFrame(step);
              }
            };
            requestAnimationFrame(step);
          };

          animateValue(0, 50, 2000, "projects");
          animateValue(0, 100, 2000, "satisfaction");
          animateValue(0, 24, 2000, "support");
          animateValue(0, 50, 2000, "clients");
          animateValue(0, 100, 2000, "delivered");
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <Nav />
      <Whasapp />
      <motion.div
        className={styles.aboutContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Professional Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}>
            <motion.div
              className={styles.floatingOrb1}
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className={styles.floatingOrb2}
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <motion.div
                className={styles.heroContent}
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
              >
                <motion.div className={styles.heroBadge} variants={fadeInUp}>
                  <FaGlobeAmericas className={styles.badgeIcon} />
                  <span>About Aroliya</span>
                </motion.div>

                <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
                  Crafting Digital Excellence{" "}
                  <motion.span
                    className={styles.gradientText}
                    animate={{
                      backgroundPosition: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    Since 2023
                  </motion.span>
                </motion.h1>

                <motion.p className={styles.heroSubtitle} variants={fadeInUp}>
                  We are a passionate team of developers, designers, and
                  innovators dedicated to transforming your ideas into
                  exceptional digital solutions. With expertise across
                  cutting-edge technologies, we deliver results that drive
                  growth and success.
                </motion.p>

                {/* Animated Stats */}
                <motion.div
                  className={styles.heroStats}
                  variants={fadeInUp}
                  ref={statsRef}
                >
                  {[
                    {
                      number: animatedStats.projects,
                      label: "Projects Completed",
                      suffix: "+",
                      icon: FaCheckCircle,
                    },
                    {
                      number: animatedStats.clients,
                      label: "Happy Clients",
                      suffix: "+",
                      icon: FaHeart,
                    },
                    {
                      number: animatedStats.satisfaction,
                      label: "Client Satisfaction",
                      suffix: "%",
                      icon: FaStar,
                    },
                  ].map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <motion.div
                        key={index}
                        className={styles.statItem}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={styles.statIcon}>
                          <IconComponent />
                        </div>
                        <motion.span
                          className={styles.statNumber}
                          key={
                            animatedStats[
                              stat.label.toLowerCase().split(" ")[0]
                            ]
                          }
                        >
                          {stat.number}
                          {stat.suffix}
                        </motion.span>
                        <span className={styles.statLabel}>{stat.label}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div className={styles.heroButtons} variants={fadeInUp}>
                  <Link href="/">
                    <motion.button
                      className={styles.primaryButton}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Our Services
                    </motion.button>
                  </Link>
                  <Link href="/our-team">
                    <motion.button
                      className={styles.secondaryButton}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Meet Our Team
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className={styles.heroImage}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={teamImage}
                    alt="Aroliya Team"
                    className={styles.teamPhoto}
                    priority
                  />
                  <div className={styles.imageOverlay}></div>

                  {/* Floating elements around the image */}
                  <motion.div
                    className={styles.floatingElement1}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FaCode />
                  </motion.div>

                  <motion.div
                    className={styles.floatingElement2}
                    animate={{
                      y: [0, 15, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FaChartLine />
                  </motion.div>

                  <motion.div
                    className={styles.floatingElement3}
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FaRocket />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className={`${styles.section} ${styles.FounderSection}`}>
          <div className={styles.container}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className={styles.sectionLabel}>Leadership</span>
              <h2 className={styles.sectionTitle}>
                Meet Our Visionary Founder
              </h2>
            </motion.div>

            <div className={styles.founderGrid}>
              <motion.div
                className={styles.founderImageWrapper}
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className={styles.founderImageContainer}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src={founderImage}
                    alt="Neeraj Baghel - Founder & CEO"
                    className={styles.founderImage}
                    priority
                  />
                  <div className={styles.imageOverlay}></div>
                </motion.div>
                <motion.div
                  className={styles.founderAchievements}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={styles.achievementItem}>
                    <FaAward className={styles.achievementIcon} />
                    <span>5+ Years Experience</span>
                  </div>
                  <div className={styles.achievementItem}>
                    <FaRocket className={styles.achievementIcon} />
                    <span>50+ Projects</span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className={styles.founderContent}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className={styles.founderHeader}>
                  <h3 className={styles.founderName}>Neeraj Baghel</h3>
                  <span className={styles.founderTitle}>Founder & CEO</span>
                  <div className={styles.founderSocial}>
                    <motion.a
                      href="#"
                      className={styles.socialLink}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaLinkedin />
                    </motion.a>
                    <motion.a
                      href="#"
                      className={styles.socialLink}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTwitter />
                    </motion.a>
                    <motion.a
                      href="#"
                      className={styles.socialLink}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaGithub />
                    </motion.a>
                  </div>
                </div>

                <div className={styles.founderDescription}>
                  <p>
                    Neeraj Baghel, the visionary Founder of Aroliya, is
                    passionate about leveraging technology to solve real-world
                    challenges. With extensive expertise in data science,
                    artificial intelligence, and digital innovation.
                  </p>
                  <p>
                    His leadership philosophy centers on creating a platform
                    where businesses discover transformative solutions while
                    freelancers unlock meaningful opportunities.
                  </p>
                </div>

                <motion.blockquote
                  className={styles.quote}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <FaQuoteLeft className={styles.quoteIcon} />
                  "Work should be smarter, not harder—and technology should make
                  life easier for everyone."
                </motion.blockquote>

                <div className={styles.founderExpertise}>
                  <h4>Areas of Expertise</h4>
                  <div className={styles.expertiseTags}>
                    {[
                      "Data Science",
                      "AI & ML",
                      "Digital Strategy",
                      "Innovation",
                      "Web Development",
                      "Cloud Computing",
                    ].map((tag, index) => (
                      <motion.span
                        key={index}
                        className={styles.expertiseTag}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Company Story Section */}
        <section className={`${styles.section} ${styles.storySection}`}>
          <div className={styles.container}>
            <div className={styles.storyGrid}>
              <motion.div
                className={styles.storyContent}
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionLabel}>Our Journey</span>
                  <h2 className={styles.sectionTitle}>
                    Building the Future Together
                  </h2>
                </div>

                <div className={styles.timeline}>
                  {[
                    {
                      year: "2023",
                      title: "Company Founded",
                      description:
                        "Aroliya was born with a vision to democratize digital solutions",
                      icon: <FaTrophy />,
                    },
                    {
                      year: "2024",
                      title: "First Milestone",
                      description:
                        "Successfully delivered 50+ projects with 100% client satisfaction",
                      icon: <FaAward />,
                    },
                    {
                      year: "2025",
                      title: "Future Vision",
                      description:
                        "Expanding globally with innovative AI-driven solutions",
                      icon: <FaRocket />,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className={styles.timelineItem}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <div className={styles.timelineMarker}>{item.icon}</div>
                      <div className={styles.timelineContent}>
                        <span className={styles.timelineYear}>{item.year}</span>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className={styles.storyVisual}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className={styles.visualContainer}>
                  <motion.div
                    className={styles.floatingCard}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <span className={styles.cardStat}>
                      {animatedStats.clients}+
                    </span>
                    <span className={styles.cardLabel}>Happy Clients</span>
                  </motion.div>
                  <motion.div
                    className={styles.floatingCard}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <span className={styles.cardStat}>
                      {animatedStats.delivered}+
                    </span>
                    <span className={styles.cardLabel}>Projects Delivered</span>
                  </motion.div>
                  <div className={styles.teamImageWrapper}>
                    <Image
                      src={teamTow}
                      alt="Aroliya Team Collaboration"
                      className={styles.teamImage}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className={`${styles.section} ${styles.visionMissionSection}`}>
          <div className={styles.container}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className={styles.sectionLabel}>Our Purpose</span>
              <h2 className={styles.sectionTitle}>Vision & Mission</h2>
            </motion.div>

            <div className={styles.visionMissionGrid}>
              <motion.div
                className={styles.purposeCard}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{
                  y: -10,
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                <div className={styles.cardVisual}>
                  <FaLightbulb className={styles.cardIcon} />
                </div>
                <div className={styles.cardContent}>
                  <h3>Our Vision</h3>
                  <p>
                    To emerge as a global leader in delivering innovative,
                    reliable, and cost-effective digital solutions that empower
                    individuals and organizations to achieve extraordinary
                    outcomes.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className={styles.purposeCard}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{
                  y: -10,
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                <div className={styles.cardVisual}>
                  <FaRocket className={styles.cardIcon} />
                </div>
                <div className={styles.cardContent}>
                  <h3>Our Mission</h3>
                  <p>
                    To create unprecedented opportunities, simplify complex
                    challenges, and bridge the gap between businesses and
                    digital transformation through efficient, impactful, and
                    future-ready services.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={`${styles.section} ${styles.valuesSection}`}>
          <div className={styles.container}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className={styles.sectionLabel}>Our Foundation</span>
              <h2 className={styles.sectionTitle}>Core Values</h2>
              <p className={styles.sectionSubtitle}>
                The principles that guide everything we do and define who we are
              </p>
            </motion.div>

            <div className={styles.valuesGrid}>
              {[
                {
                  icon: <FaShieldAlt />,
                  title: "Trust & Integrity",
                  description:
                    "Building lasting relationships through transparency, honesty, and unwavering reliability.",
                  color: "#10B981",
                },
                {
                  icon: <FaLightbulb />,
                  title: "Innovation",
                  description:
                    "Pushing boundaries and embracing cutting-edge technologies for forward-thinking solutions.",
                  color: "#3B82F6",
                },
                {
                  icon: <FaHandshake />,
                  title: "Collaboration",
                  description:
                    "Fostering synergy where diverse talents unite for extraordinary results.",
                  color: "#8B5CF6",
                },
                {
                  icon: <FaStar />,
                  title: "Excellence",
                  description:
                    "Committing to highest standards of quality and continuous improvement.",
                  color: "#F59E0B",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className={styles.valueCard}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  onHoverStart={() => setActiveValue(index)}
                >
                  <div
                    className={styles.valueIcon}
                    style={{ "--value-color": value.color }}
                  >
                    {value.icon}
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          className={styles.ctaSection}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className={styles.ctaContent}
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <h2>Ready to Start Your Project?</h2>
            <p>Let's discuss how we can help you achieve your digital goals</p>
            <div className={styles.ctaButtons}>
              <Link href="/register">
                {" "}
                <motion.button
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  className={styles.secondaryButton}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Us
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.section>

        <Footer />
      </motion.div>
    </div>
  );
}
