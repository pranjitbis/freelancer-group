"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./ClientServices.module.css";
import {
  FaCheck,
  FaStar,
  FaUsers,
  FaRocket,
  FaMinus,
  FaCrown,
  FaLaptop,
  FaGlobe,
  FaChartLine,
  FaLightbulb,
  FaComments,
  FaGraduationCap,
  FaSearch,
  FaShieldAlt,
  FaAward,
  FaCalendarAlt,
  FaPlus,
  FaBookOpen,
  FaArrowRight,
  FaTimesCircle,
  FaPlay,
  FaRegCheckCircle,
  FaRegGem,
  FaBriefcase,
  FaHandshake,
  FaMoneyBillWave,
  FaClock,
  FaBuilding,
  FaMobileAlt,
  FaCloud,
  FaLock,
  FaHeadset,
  FaCode,
  FaPaintBrush,
  FaChartBar,
  FaNetworkWired,
  FaUserTie,
  FaRegClock,
  FaCertificate,
  FaTools,
  FaDatabase,
  FaSync,
  FaLeaf,
  FaArrowDown,
  FaQuoteLeft,
} from "react-icons/fa";
import Nav from "../../../home/component/Nav/page";
import Footer from "@/app/home/footer/page";

const ClientServices = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const testimonialRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll testimonials
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -15,
      scale: 1.02,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const fadeInUp = {
    hidden: {
      opacity: 0,
      y: 60,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const slideInLeft = {
    hidden: {
      opacity: 0,
      x: -100,
    },
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
    hidden: {
      opacity: 0,
      x: 100,
    },
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
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const testimonialVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 10 : -10,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? -10 : 10,
      transition: {
        duration: 0.4,
      },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const testimonials = [
    {
      id: 1,
      rating: 5,
      text: "The platform's talent matching system found us a senior developer who perfectly fit our tech stack and company culture. The entire process was seamless and efficient, saving us weeks of recruitment time.",
      author: "Sarah Chen",
      role: "Chief Technology Officer",
      company: "TechInnovate Solutions",
      avatar: "SC",
      projects: 28,
      industry: "Technology",
    },
    {
      id: 2,
      rating: 5,
      text: "We reduced our hiring costs by 45% while improving the quality of our remote team. The enterprise features have been game-changing for our distributed workforce management.",
      author: "Michael Rodriguez",
      role: "VP of Engineering",
      company: "Global Enterprises Inc",
      avatar: "MR",
      projects: 42,
      industry: "Enterprise",
    },
    {
      id: 3,
      rating: 5,
      text: "The analytics and reporting tools provided unprecedented visibility into our project pipeline. We can now make data-driven decisions about resource allocation and project planning.",
      author: "Emily Watson",
      role: "Director of Product",
      company: "Innovation Labs",
      avatar: "EW",
      projects: 35,
      industry: "Product",
    },
    {
      id: 4,
      rating: 5,
      text: "Outsourcing our design needs through this platform has transformed our creative workflow. The quality of talent and project management tools exceeded our expectations.",
      author: "David Kim",
      role: "Creative Director",
      company: "Design Studio Pro",
      avatar: "DK",
      projects: 19,
      industry: "Design",
    },
    {
      id: 5,
      rating: 5,
      text: "As a growing startup, finding reliable talent quickly was crucial. This platform delivered exceptional professionals who integrated seamlessly with our team and culture.",
      author: "Lisa Thompson",
      role: "Founder & CEO",
      company: "Startup Ventures",
      avatar: "LT",
      projects: 23,
      industry: "Startup",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free Forever",
      period: "",
      bestFor: "Perfect for startups and small projects",
      features: [
        { name: "Post unlimited projects", included: true },
        { name: "Browse freelancer profiles", included: true },
        { name: "Receive up to 20 proposals", included: true },
        { name: "Basic messaging system", included: true },
        { name: "Secure payment protection", included: true },
        { name: "Basic project management", included: true },
        { name: "Standard email support", included: true },
        { name: "AI talent matching", included: false },
        { name: "Premium freelancers", included: false },
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonType: "primary",
    },
    {
      name: "Professional",
      price: "$49",
      period: "/month",
      bestFor: "Ideal for growing businesses and teams",
      features: [
        { name: "Post unlimited projects", included: true },
        { name: "Browse freelancer profiles", included: true },
        { name: "Unlimited proposals", included: true },
        { name: "Advanced messaging system", included: true },
        { name: "Secure payment protection", included: true },
        { name: "Advanced project management", included: true },
        { name: "Priority email support", included: true },
        { name: "AI talent matching", included: true },
        { name: "Premium freelancers", included: true },
      ],
      popular: true,
      buttonText: "Start Professional Plan",
      buttonType: "premium",
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      bestFor: "For large organizations with complex needs",
      features: [
        { name: "Post unlimited projects", included: true },
        { name: "Browse freelancer profiles", included: true },
        { name: "Unlimited proposals", included: true },
        { name: "Advanced messaging system", included: true },
        { name: "Secure payment protection", included: true },
        { name: "Advanced project management", included: true },
        { name: "24/7 dedicated support", included: true },
        { name: "AI talent matching", included: true },
        { name: "Premium freelancers", included: true },
        { name: "Dedicated account manager", included: true },
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonType: "enterprise",
    },
  ];

  const featureGroups = [
    {
      title: "Talent Acquisition",
      features: [
        {
          icon: <FaSearch />,
          title: "Smart Talent Matching",
          description:
            "AI-powered algorithm that matches you with pre-vetted professionals based on project requirements and company culture.",
          stats: "95% Match Accuracy",
        },
        {
          icon: <FaUsers />,
          title: "Premium Talent Pool",
          description:
            "Access to top-tier freelancers and agencies rigorously vetted through our 5-stage selection process.",
          stats: "Top 15% Talent",
        },
      ],
    },
    {
      title: "Project Management",
      features: [
        {
          icon: <FaNetworkWired />,
          title: "Collaboration Suite",
          description:
            "Comprehensive tools for real-time collaboration, file sharing, and team coordination across time zones.",
          stats: "40% Faster Completion",
        },
        {
          icon: <FaChartLine />,
          title: "Performance Analytics",
          description:
            "Advanced dashboard with real-time insights into project progress, team performance, and budget tracking.",
          stats: "Real-time Insights",
        },
      ],
    },
    {
      title: "Enterprise Security",
      features: [
        {
          icon: <FaShieldAlt />,
          title: "Bank-Level Security",
          description:
            "Enterprise-grade encryption, secure payments, and compliance with global data protection standards.",
          stats: "100% Secure",
        },
        {
          icon: <FaUserTie />,
          title: "Dedicated Support",
          description:
            "24/7 dedicated account management and technical support ensuring seamless project execution.",
          stats: "24/7 Support",
        },
      ],
    },
  ];

  const stats = [
    { number: "15K+", label: "Enterprise Clients", icon: <FaBuilding /> },
    { number: "75K+", label: "Projects Delivered", icon: <FaCheck /> },
    { number: "4.9/5", label: "Client Satisfaction", icon: <FaStar /> },
    { number: "98%", label: "Success Rate", icon: <FaRocket /> },
  ];

  const industries = [
    { name: "Technology & Engineering", icon: <FaCode />, projects: "25K+" },
    { name: "Design & Creative", icon: <FaPaintBrush />, projects: "18K+" },
    { name: "Business Consulting", icon: <FaBriefcase />, projects: "12K+" },
    { name: "Marketing Strategy", icon: <FaChartBar />, projects: "15K+" },
    { name: "Data Science & AI", icon: <FaDatabase />, projects: "8K+" },
    { name: "Mobile Development", icon: <FaMobileAlt />, projects: "14K+" },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Define Your Needs",
      description: "Outline project requirements, budget, and timeline",
      icon: <FaSearch />,
    },
    {
      step: "02",
      title: "Match with Talent",
      description: "Our AI matches you with qualified professionals",
      icon: <FaUsers />,
    },
    {
      step: "03",
      title: "Review & Select",
      description: "Interview candidates and choose the best fit",
      icon: <FaRegCheckCircle />,
    },
    {
      step: "04",
      title: "Manage & Collaborate",
      description: "Use our tools to manage projects effectively",
      icon: <FaChartLine />,
    },
    {
      step: "05",
      title: "Pay with Confidence",
      description: "Secure payments only when satisfied",
      icon: <FaLock />,
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Nav />
      <motion.div
        className={styles.container}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        ref={sectionRef}
      >
        {/* Premium Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroText}
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <motion.div
                className={styles.heroBadge}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: [-1, 1, -1] }}
                transition={{ duration: 0.2 }}
              >
                <FaAward className={styles.badgeIcon} />
                Enterprise-Grade Talent Platform
              </motion.div>

              <motion.h1 className={styles.heroTitle} variants={itemVariants}>
                Find Top Freelancers —
                <motion.span
                  className={styles.accentText}
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Affordable and Reliable
                </motion.span>
              </motion.h1>

              <motion.p
                className={styles.heroDescription}
                variants={itemVariants}
              >
                Connect with pre-vetted professionals and industry experts who
                consistently deliver outstanding results. Our platform blends
                advanced technology with human insight to match you with the
                perfect talent for every project.
              </motion.p>

              <motion.div
                className={styles.heroStats}
                variants={staggerContainer}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className={styles.stat}
                    variants={itemVariants}
                    whileHover="hover"
                    custom={index}
                  >
                    <motion.div
                      className={styles.statIcon}
                      whileHover={{
                        scale: 1.1,
                        rotate: 360,
                        transition: { duration: 0.5 },
                      }}
                    >
                      {stat.icon}
                    </motion.div>
                    <div className={styles.statContent}>
                      <motion.span
                        className={styles.statNumber}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.5 + index * 0.1,
                          type: "spring",
                        }}
                      >
                        {stat.number}
                      </motion.span>
                      <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className={styles.heroButtons}
                variants={itemVariants}
              >
                <Link href="/register">
                  <motion.button
                    className={styles.primaryButton}
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Start Hiring Today
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaArrowRight className={styles.buttonIcon} />
                    </motion.div>
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    className={styles.primaryButtonss}
                    
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Post A Project
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaArrowRight className={styles.buttonIcon} />
                    </motion.div>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div className={styles.heroVisual} variants={slideInRight}>
              <motion.div
                className={styles.floatingCard}
                initial={{ opacity: 0, y: 100, rotateY: 20 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                whileHover={{
                  y: -10,
                  rotateY: 5,
                  transition: { duration: 0.3 },
                }}
              >
                <div className={styles.cardHeader}>
                  <motion.div
                    className={styles.cardIcon}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaUserTie />
                  </motion.div>
                  <div className={styles.cardInfo}>
                    <h4>Enterprise Ready</h4>
                    <span>Trusted by Fortune 500 companies</span>
                  </div>
                  <motion.div
                    className={styles.verifiedBadge}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaAward />
                  </motion.div>
                </div>
                <div className={styles.cardStats}>
                  {[
                    { value: "24h", label: "Avg Response" },
                    { value: "95%", label: "Success Rate" },
                    { value: "50+", label: "Experts Ready" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className={styles.statItem}
                      whileHover={{ scale: 1.1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className={styles.statValue}>{stat.value}</span>
                      <span className={styles.statLabel}>{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
                <div className={styles.cardFeatures}>
                  {[
                    "Advanced Security",
                    "Dedicated Support",
                    "Custom Workflows",
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className={styles.featureItem}
                      whileHover={{ x: 10 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <FaCheck className={styles.featureCheck} />
                      </motion.div>
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className={styles.scrollIndicator}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaArrowDown />
            </motion.div>
          </motion.div>
        </section>

        {/* Process Section */}
        <section className={styles.processSection}>
          <div className={styles.sectionHeader}>
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Streamlined Hiring Process
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Simple, efficient workflow to find and manage the best talent for
              your projects
            </motion.p>
          </div>

          <motion.div
            className={styles.processSteps}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                className={styles.processStep}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <motion.div
                  className={styles.stepNumber}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.step}
                </motion.div>
                <motion.div
                  className={styles.stepIcon}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {step.icon}
                </motion.div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < processSteps.length - 1 && (
                  <motion.div
                    className={styles.stepConnector}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                    viewport={{ once: true }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Industries Section */}
        <section className={styles.industriesSection}>
          <div className={styles.sectionHeader}>
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Trusted Across Industries
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Specialized talent solutions for every sector and business need
            </motion.p>
          </div>

          <motion.div
            className={styles.industriesGrid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                className={styles.industryCard}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <motion.div
                  className={styles.industryIcon}
                  whileHover={{
                    scale: 1.2,
                    rotate: 360,
                    transition: { duration: 0.5 },
                  }}
                >
                  {industry.icon}
                </motion.div>
                <h3>{industry.name}</h3>
                <motion.span
                  className={styles.projectCount}
                  whileHover={{ scale: 1.1 }}
                >
                  {industry.projects} Projects
                </motion.span>
                <div className={styles.industryOverlay}></div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Grouped Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Comprehensive Talent Solutions
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Everything you need to build, manage, and scale your remote
              workforce
            </motion.p>
          </div>

          <motion.div
            className={styles.featureTabs}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {featureGroups.map((group, index) => (
              <motion.button
                key={index}
                className={`${styles.tabButton} ${
                  activeTab === index ? styles.active : ""
                }`}
                onClick={() => setActiveTab(index)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {group.title}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className={styles.featureGroup}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className={styles.featuresGrid}>
                {featureGroups[activeTab].features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={styles.featureCard}
                    variants={cardVariants}
                    whileHover="hover"
                    custom={index}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className={styles.featureHeader}>
                      <motion.div
                        className={styles.featureIconContainer}
                        whileHover={{
                          scale: 1.1,
                          rotate: 360,
                          transition: { duration: 0.5 },
                        }}
                      >
                        <div className={styles.featureIcon}>{feature.icon}</div>
                      </motion.div>
                      <motion.div
                        className={styles.featureStats}
                        whileHover={{ scale: 1.1 }}
                      >
                        {feature.stats}
                      </motion.div>
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Professional Testimonials Section */}
        <section
          ref={testimonialRef}
          className={styles.testimonialsSection}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={styles.sectionHeader}>
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Trusted by Industry Leaders
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Discover why forward-thinking companies choose our platform
            </motion.p>
          </div>

          <div className={styles.testimonialsContainer}>
            <div className={styles.testimonialNavigation}>
              <motion.button
                className={styles.navButton}
                onClick={prevTestimonial}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  rotate: -180,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FaArrowRight style={{ transform: "rotate(180deg)" }} />
              </motion.button>

              <div className={styles.testimonialIndicators}>
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`${styles.indicator} ${
                      index === currentTestimonial ? styles.active : ""
                    }`}
                    onClick={() => goToTestimonial(index)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <motion.div
                      className={styles.indicatorProgress}
                      animate={
                        index === currentTestimonial && !isPaused
                          ? { width: "100%" }
                          : { width: "0%" }
                      }
                      transition={{ duration: 4, ease: "linear" }}
                    />
                  </motion.button>
                ))}
              </div>

              <motion.button
                className={styles.navButton}
                onClick={nextTestimonial}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FaArrowRight />
              </motion.button>
            </div>

            <div className={styles.testimonialWrapper}>
              <AnimatePresence mode="wait" custom={1}>
                <motion.div
                  key={currentTestimonial}
                  className={styles.testimonialCard}
                  variants={testimonialVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                >
                  <div className={styles.testimonialContent}>
                    <div className={styles.quoteContainer}>
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FaQuoteLeft className={styles.quoteIcon} />
                      </motion.div>
                    </div>

                    <div className={styles.testimonialMain}>
                      <div className={styles.testimonialRating}>
                        {[
                          ...Array(testimonials[currentTestimonial].rating),
                        ].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: i * 0.1, type: "spring" }}
                            whileHover={{ scale: 1.2, rotate: 360 }}
                          >
                            <FaStar className={styles.starIcon} />
                          </motion.div>
                        ))}
                      </div>

                      <motion.p
                        className={styles.testimonialText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        "{testimonials[currentTestimonial].text}"
                      </motion.p>

                      <motion.div
                        className={styles.testimonialAuthor}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className={styles.avatarContainer}>
                          <motion.div
                            className={styles.avatar}
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            {testimonials[currentTestimonial].avatar}
                          </motion.div>
                          <motion.div
                            className={styles.verifiedBadge}
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 180, 360],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <FaCheck />
                          </motion.div>
                        </div>
                        <div className={styles.authorInfo}>
                          <h4>{testimonials[currentTestimonial].author}</h4>
                          <span>{testimonials[currentTestimonial].role}</span>
                          <div className={styles.company}>
                            {testimonials[currentTestimonial].company}
                          </div>
                          <div className={styles.testimonialMeta}>
                            <motion.span
                              className={styles.industry}
                              whileHover={{ scale: 1.05 }}
                            >
                              {testimonials[currentTestimonial].industry}
                            </motion.span>
                            <motion.span
                              className={styles.projects}
                              whileHover={{ scale: 1.05 }}
                            >
                              {testimonials[currentTestimonial].projects}{" "}
                              projects
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className={styles.testimonialScroll}>
              <div ref={scrollContainerRef} className={styles.scrollContainer}>
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    className={`${styles.scrollItem} ${
                      index === currentTestimonial ? styles.active : ""
                    }`}
                    onClick={() => goToTestimonial(index)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className={styles.scrollAvatar}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <div className={styles.scrollInfo}>
                      <span className={styles.scrollName}>
                        {testimonial.author}
                      </span>
                      <span className={styles.scrollCompany}>
                        {testimonial.company}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBackground}></div>
          <div className={styles.ctaContent}>
            <motion.div
              className={styles.ctaText}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 variants={itemVariants}>
                Ready to Transform Your Talent Strategy?
              </motion.h2>
              <motion.p variants={itemVariants}>
                Join thousands of enterprises that have revolutionized their
                hiring process and unlocked new levels of productivity and
                innovation.
              </motion.p>
              <motion.div className={styles.ctaButtons} variants={itemVariants}>
                <Link href="/register">
                  <motion.button
                    className={styles.ctaPrimary}
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Get Started Now
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaArrowRight />
                    </motion.div>
                  </motion.button>
                </Link>
                <a href="tel:9870519002">
                  <motion.button
                    className={styles.ctaSecondary}
                    whileHover={{
                      scale: 1.05,
                      y: -1,
                      borderColor: "#3b82f6",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FaHeadset />
                    </motion.div>
                    Request Demo
                  </motion.button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              Everything you need to know about our enterprise talent platform
            </motion.p>
          </div>

          <motion.div
            className={styles.faqGrid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {[
              {
                question: "How do you ensure the quality of professionals?",
                answer:
                  "We employ a rigorous 5-stage vetting process including technical assessments, portfolio reviews, reference checks, and soft skills evaluation. Only the top 15% of applicants are accepted onto our platform.",
              },
              {
                question: "Can we integrate with our existing HR systems?",
                answer:
                  "Yes, our platform offers comprehensive API integration with popular HR systems, project management tools, and communication platforms for seamless workflow integration.",
              },
              {
                question: "What level of support can we expect?",
                answer:
                  "Enterprise clients receive 24/7 dedicated support with a dedicated account manager, SLAs for response times, and quarterly business reviews to ensure optimal performance.",
              },
              {
                question: "How do you handle data security and compliance?",
                answer:
                  "We maintain SOC 2 Type II compliance, GDPR adherence, and implement bank-level encryption. All data is stored in secure, geographically redundant data centers.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className={`${styles.faqItem} ${
                  activeIndex === index ? styles.active : ""
                }`}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <motion.div
                  className={styles.faqQuestion}
                  onClick={() => toggleFAQ(index)}
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3>{faq.question}</h3>
                  <motion.div
                    className={styles.faqIcon}
                    animate={{ rotate: activeIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <FaPlus />
                  </motion.div>
                </motion.div>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      className={styles.faqAnswer}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {faq.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <Footer />
      </motion.div>
    </div>
  );
};

export default ClientServices;
