"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./FreelancerHub.module.css";
import Link from "next/link";
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
  FaCode,
  FaPaintBrush,
  FaMobile,
  FaCloud,
} from "react-icons/fa";
import Nav from "../../../home/component/Nav/page.jsx";
import Footer from "@/app/home/footer/page";

const FreelancerHub = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // 3D floating elements data
  const floatingElements = [
    { icon: <FaCode />, top: "20%", left: "10%", delay: 0 },
    { icon: <FaPaintBrush />, top: "60%", left: "85%", delay: 0.2 },
    { icon: <FaCloud />, top: "30%", left: "90%", delay: 0.6 },
    { icon: <FaChartLine />, top: "70%", left: "5%", delay: 0.8 },
    { icon: <FaGlobe />, top: "40%", left: "80%", delay: 1.0 },
  ];

  const plans = [
    {
      name: "Starter",
      price: "₹0",
      period: "forever",
      bestFor: "Ideal for beginners starting their freelance career",
      features: [
        {
          key: "profileCreation",
          name: "Create a professional freelancer profile",
          included: true,
          detail: "",
        },
        {
          key: "browseProjects",
          name: "Explore and browse available projects",
          included: true,
          detail: "",
        },
        {
          key: "proposals",
          name: "Submit proposals",
          included: true,
          detail: "Up to 5 proposals / month",
        },
        {
          key: "portfolio",
          name: "Showcase your work with a basic portfolio",
          included: true,
          detail: "",
        },
        {
          key: "communityAccess",
          name: "Access the Freelancer Hub community",
          included: true,
          detail: "",
        },
        {
          key: "emailSupport",
          name: "Standard email support",
          included: true,
          detail: "",
        },
        {
          key: "searchVisibility",
          name: "Appear in basic client search results",
          included: true,
          detail: "",
        },
        {
          key: "directMessaging",
          name: "Direct client messaging",
          included: false,
          detail: "",
        },
        {
          key: "verifiedBadge",
          name: "Verified freelancer badge",
          included: false,
          detail: "",
        },
        {
          key: "prioritySearch",
          name: "Priority placement in client search results",
          included: false,
          detail: "",
        },
        {
          key: "advancedAnalytics",
          name: "Advanced analytics & performance insights",
          included: false,
          detail: "",
        },
        {
          key: "proposalTemplates",
          name: "Access to proposal templates",
          included: false,
          detail: "",
        },
        {
          key: "prioritySupport",
          name: "Priority support (faster response)",
          included: false,
          detail: "",
        },
        {
          key: "earlyAccess",
          name: "Early access to premium projects",
          included: false,
          detail: "",
        },
      ],
      connectsPerMonth: 20,
      link: "/register",
      contractTypes: ["Fixed-price", "Hourly"],
      canApplyPremiumJobs: false,
      popular: false,
      buttonText: "Start Free Journey",
      buttonType: "primary",
      badge: "Free Forever",
    },
    {
      name: "Pro",
      price: "₹999",
      period: "per month",
      link: "/register",
      bestFor: "Perfect for freelancers ready to grow and get noticed",
      features: [
        {
          key: "profileCreation",
          name: "Create a professional freelancer profile",
          included: true,
          detail: "",
        },
        {
          key: "browseProjects",
          name: "Explore and browse available projects",
          included: true,
          detail: "",
        },
        {
          key: "proposals",
          name: "Submit proposals",
          included: true,
          detail: "Unlimited proposals",
        },
        {
          key: "portfolio",
          name: "Showcase your work with an advanced portfolio",
          included: true,
          detail: "",
        },
        {
          key: "communityAccess",
          name: "Access the Freelancer Hub community",
          included: true,
          detail: "",
        },
        {
          key: "emailSupport",
          name: "Standard email support",
          included: true,
          detail: "",
        },
        {
          key: "searchVisibility",
          name: "Appear in basic client search results",
          included: true,
          detail: "",
        },
        {
          key: "directMessaging",
          name: "Direct client messaging",
          included: true,
          detail: "",
        },
        {
          key: "verifiedBadge",
          name: "Verified freelancer badge",
          included: true,
          detail: "",
        },
        {
          key: "prioritySearch",
          name: "Priority placement in client search results",
          included: true,
          detail: "",
        },
        {
          key: "advancedAnalytics",
          name: "Advanced analytics & performance insights",
          included: true,
          detail: "",
        },
        {
          key: "proposalTemplates",
          name: "Access to proposal templates",
          included: true,
          detail: "",
        },
        {
          key: "prioritySupport",
          name: "Priority support (faster response)",
          included: true,
          detail: "",
        },
        {
          key: "earlyAccess",
          name: "Early access to premium projects",
          included: true,
          detail: "",
        },
      ],
      canApplyPremiumJobs: true,
      popular: true,
      buttonText: "Upgrade to Pro",
      buttonType: "premium",
      badge: "Most Popular",
    },
  ];

  const features = [
    {
      icon: <FaSearch />,
      title: "Smart Project Matching",
      description:
        "AI-powered algorithm matches you with perfect projects based on your skills and preferences.",
      color: "#2563eb",
    },
    {
      icon: <FaChartLine />,
      title: "Growth Analytics",
      description:
        "Track your performance, earnings, and client satisfaction with detailed insights.",
      color: "#059669",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Payments",
      description:
        "Escrow protection and multiple payment options ensure you get paid on time.",
      color: "#dc2626",
    },
    {
      icon: <FaGlobe />,
      title: "Global Reach",
      description:
        "Connect with clients worldwide and expand your professional network globally.",
      color: "#7c3aed",
    },
    {
      icon: <FaUsers />,
      title: "Community Support",
      description:
        "Join thousands of freelancers in our active community forums and groups.",
      color: "#ea580c",
    },
    {
      icon: <FaAward />,
      title: "Skill Certification",
      description:
        "Get certified in your skills and stand out from the competition.",
      color: "#c026d3",
    },
  ];

  const testimonials = [
    {
      rating: 5,
      text: "Switching to the Professional plan skyrocketed my freelance career. Got multiple projects in the first month!",
      author: "Aarav Sharma",
      role: "Full-Stack Developer",
      avatar: "AS",
      projects: 50,
    },
    {
      rating: 5,
      text: "The analytics dashboard helped me identify high-paying clients. My income grew by 35%!",
      author: "Riya Kapoor",
      role: "UI/UX Designer",
      avatar: "RK",
      projects: 38,
    },
    {
      rating: 5,
      text: "Direct client access through Pro plan allowed me to build steady work relationships.",
      author: "Kabir Singh",
      role: "Content Strategist",
      avatar: "KS",
      projects: 30,
    },
    {
      rating: 5,
      text: "I love how easy it is to showcase my portfolio. Clients reach out proactively!",
      author: "Ananya Mehta",
      role: "Graphic Designer",
      avatar: "AM",
      projects: 22,
    },
    {
      rating: 5,
      text: "Freelancer Hub gave me exposure to premium projects I couldn't get elsewhere.",
      author: "Vikram Reddy",
      role: "Web Developer",
      avatar: "VR",
      projects: 41,
    },
    {
      rating: 5,
      text: "Proposal templates saved me hours every week. Highly recommend!",
      author: "Sneha Joshi",
      role: "Digital Marketer",
      avatar: "SJ",
      projects: 35,
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Freelancers" },
    { number: "4.9/5", label: "Client Satisfaction" },
    { number: "120+", label: "Countries" },
  ];

  const faqs = [
    {
      question: "How quickly can I start getting projects?",
      answer:
        "Most freelancers start receiving project invitations within 24-48 hours of completing their profile. Professional plan members typically see faster matching due to priority placement.",
    },
    {
      question: "What's the difference between Free and Professional plans?",
      answer:
        "The Free plan gives you basic access to browse and apply for projects, while Professional unlocks unlimited applications, direct client messaging, advanced analytics, and premium visibility in search results.",
    },
    {
      question: "Do you take any commission from my earnings?",
      answer:
        "No commission! We charge a flat monthly subscription fee. You keep 100% of what you earn from clients. Our goal is your success.",
    },
    {
      question: "Can I switch between plans easily?",
      answer:
        "Yes, you can upgrade, downgrade, or cancel anytime. All your data, portfolio, and client connections remain intact when changing plans.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "All plans include email support with 24-hour response time. Professional and Agency plans include priority support with faster response times and dedicated help for complex issues.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer:
        "Yes! We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund your first payment.",
    },
  ];

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

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2,
      },
    },
  };

  const floatingVariants = {
    floating: {
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div>
      <Nav />
      <motion.div
        className={`${styles.container} ${isVisible ? styles.visible : ""}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Professional Hero Section with 3D Elements */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroBackground}>
            {/* Animated gradient orbs */}
            <div className={styles.gradientOrb1}></div>
            <div className={styles.gradientOrb2}></div>
            <div className={styles.gradientOrb3}></div>

            {/* Floating 3D elements */}
            {floatingElements.map((element, index) => (
              <motion.div
                key={index}
                className={styles.floatingElement}
                style={{
                  top: element.top,
                  left: element.left,
                }}
                variants={floatingVariants}
                animate="floating"
                transition={{ delay: element.delay }}
              >
                <div className={styles.floatingIcon}>{element.icon}</div>
              </motion.div>
            ))}
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <motion.div
                className={styles.heroBadge}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <FaRocket className={styles.badgeIcon} />
                <span>Trusted by 50,000+ Freelancers Worldwide</span>
              </motion.div>

              <motion.h1
                className={styles.heroTitle}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Transform Your{" "}
                <span className={styles.gradientText}>Skills</span> Into
                <br />
                <span className={styles.accentText}>Professional Success</span>
              </motion.h1>

              <motion.p
                className={styles.heroDescription}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Join India's premier freelance platform where talent meets
                opportunity. From your first project to building a global brand,
                we provide the tools, network, and support to elevate your
                freelance career to new heights.
              </motion.p>

              <motion.div
                className={styles.heroStats}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                {stats.map((stat, index) => (
                  <div key={index} className={styles.statItem}>
                    <div className={styles.statNumber}>{stat.number}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                className={styles.heroButtons}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <motion.button
                  className={styles.primaryButton}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(37, 99, 235, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/register">
                    <span>Start Your Journey Free</span>
                  </Link>
                  <FaArrowRight className={styles.buttonIcon} />
                </motion.button>
              </motion.div>
            </div>

            <div className={styles.heroVisual}>
              {/* Main 3D Card */}
              <motion.div
                className={styles.heroCard3d}
                initial={{ opacity: 0, x: 100, rotateY: 45 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                whileHover={{
                  y: -10,
                  rotateY: 5,
                  transition: { duration: 0.3 },
                }}
              >
                <div className={styles.card3dInner}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardProfile}>
                      <div className={styles.avatarWrapper}>
                        <div className={styles.avatar}>JD</div>
                        <div className={styles.statusIndicator}></div>
                      </div>
                      <div className={styles.profileInfo}>
                        <h4>John Designer</h4>
                        <p>UI/UX Specialist</p>
                      </div>
                    </div>
                    <div className={styles.verifiedBadge}>
                      <FaRegCheckCircle />
                      <span>Verified Pro</span>
                    </div>
                  </div>

                  <div className={styles.cardStats}>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>$45k</div>
                      <div className={styles.statLabel}>Earned</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>98%</div>
                      <div className={styles.statLabel}>Success</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>24</div>
                      <div className={styles.statLabel}>Projects</div>
                    </div>
                  </div>

                  <div className={styles.skillTags}>
                    <span className={styles.skillTag}>UI Design</span>
                    <span className={styles.skillTag}>UX Research</span>
                    <span className={styles.skillTag}>Figma</span>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.availability}>
                      <div className={styles.availabilityDot}></div>
                      <span>Available for new projects</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating mini cards */}
              <motion.div
                className={styles.floatingMiniCard1}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ y: -5 }}
              >
                <FaChartLine />
                <span>+200% Earnings</span>
              </motion.div>

              <motion.div
                className={styles.floatingMiniCard2}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                whileHover={{ y: -5 }}
              >
                <FaUsers />
                <span>50+ Clients</span>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className={styles.scrollIndicator}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className={styles.scrollText}>Scroll to explore</div>
            <div className={styles.scrollLine}></div>
          </motion.div>
        </section>

        {/* Rest of your existing sections remain the same */}
        <motion.section
          className={styles.featuresSection}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={itemVariants}>
            <h2>Everything You Need to Succeed</h2>
            <p>
              Powerful tools and features designed to help you grow your
              freelance business
            </p>
          </motion.div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                variants={cardVariants}
                whileHover="hover"
              >
                <div
                  className={styles.featureIcon}
                  style={{
                    backgroundColor: `${feature.color}15`,
                    borderColor: feature.color,
                  }}
                >
                  <div style={{ color: feature.color }}>{feature.icon}</div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          className={styles.pricingSection}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={itemVariants}>
            <h2>Choose Your Success Path</h2>
            <p>
              Flexible plans that grow with your business. No hidden fees, no
              surprises.
            </p>
          </motion.div>

          <div className={styles.plansGrid}>
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`${styles.planCard} ${
                  plan.popular ? styles.popular : ""
                }`}
                variants={cardVariants}
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                {plan.badge && (
                  <div className={styles.planBadge}>{plan.badge}</div>
                )}
                <div className={styles.planHeader}>
                  <h3>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>/{plan.period}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.bestFor}</p>
                </div>

                <ul className={styles.featuresList}>
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className={feature.included ? "" : styles.featureDisabled}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + featureIndex * 0.05 }}
                    >
                      {feature.included ? (
                        <FaRegCheckCircle className={styles.featureCheck} />
                      ) : (
                        <FaTimesCircle className={styles.featureCross} />
                      )}
                      <span>
                        {feature.name}{" "}
                        {feature.detail && (
                          <span className={styles.featureDetail}>
                            ({feature.detail})
                          </span>
                        )}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <Link href={plan.link}>
                  <motion.button
                    className={`${styles.planButton} ${
                      plan.buttonType === "premium"
                        ? styles.premium
                        : styles.primary
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.buttonText}
                    <FaArrowRight className={styles.buttonIcon} />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          className={styles.testimonialsSection}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={itemVariants}>
            <h2>Success Stories from Our Community</h2>
            <p>
              See how freelancers are transforming their careers with our
              platform
            </p>
          </motion.div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={styles.testimonialCard}
                variants={cardVariants}
                whileHover="hover"
              >
                <div className={styles.testimonialHeader}>
                  <div className={styles.avatar}>{testimonial.avatar}</div>
                  <div className={styles.authorInfo}>
                    <h4>{testimonial.author}</h4>
                    <span>{testimonial.role}</span>
                    <div className={styles.projectCount}>
                      {testimonial.projects} projects completed
                    </div>
                  </div>
                </div>
                <div className={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className={styles.starIcon} />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className={styles.ctaSection}
          variants={containerVariants}
        >
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.ctaText}>
              <h2>Ready to Start Your Freelance Journey?</h2>
              <p>
                Join thousands of successful freelancers who've found their
                perfect workflow with our platform.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/register">
                  {" "}
                  <motion.button
                    className={styles.ctaPrimary}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Free Today
                    <FaArrowRight />
                  </motion.button>
                </Link>
              </div>
            </div>
            <div className={styles.ctaVisual}>
              <div className={styles.ctaStats}>
                <div className={styles.ctaStat}>
                  <span>7 days</span>
                  <span>Average to first project</span>
                </div>
                <div className={styles.ctaStat}>
                  <span>85%</span>
                  <span>Increase in earnings</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className={styles.faqSection}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHeader} variants={itemVariants}>
            <h2>Frequently Asked Questions</h2>
            <p>
              Everything you need to know about getting started and growing with
              us
            </p>
          </motion.div>
          <div className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className={`${styles.faqItem} ${
                  activeIndex === index ? styles.active : ""
                }`}
                variants={itemVariants}
              >
                <div
                  className={styles.faqQuestion}
                  onClick={() => toggleFAQ(index)}
                >
                  <h3>{faq.question}</h3>
                  <div className={styles.faqIcon}>
                    {activeIndex === index ? <FaMinus /> : <FaPlus />}
                  </div>
                </div>
                <motion.div
                  className={styles.faqAnswer}
                  initial={false}
                  animate={{
                    height: activeIndex === index ? "auto" : 0,
                    opacity: activeIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>
        <Footer />
      </motion.div>
    </div>
  );
};

export default FreelancerHub;
