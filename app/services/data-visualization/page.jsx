"use client";
import Head from "next/head";
import {
  FaChartBar,
  FaProjectDiagram,
  FaUsers,
  FaCloud,
  FaLaptopCode,
  FaLock,
  FaDatabase,
  FaChartPie,
} from "react-icons/fa";
import Footer from "@/app/home/footer/page";
import styles from "./DataVisualization.module.css";
import Image from "next/image";
import Nav from "@/app/home/component/Nav/page";
import WhatsApp from "../../whatsapp_icon/page";
import {
  FaChartLine,
  FaShoppingCart,
  FaHospital,
  FaBullhorn,
  FaTruck,
  FaGraduationCap,
  FaArrowRight,
  FaCheck,
  FaStar,
  FaRocket,
  FaMoneyBillWave,
} from "react-icons/fa";
import data from "../../../public/icons/data-visualization.png";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const DataVisualization = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(83); // Default INR to USD rate
  const [isConverting, setIsConverting] = useState(false);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setIsConverting(true);
        // Using a free exchange rate API
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/INR"
        );
        const data = await response.json();
        setExchangeRate(data.rates.USD || 0.012); // Fallback rate
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setExchangeRate(0.012); // Fallback rate
      } finally {
        setIsConverting(false);
      }
    };

    fetchExchangeRate();
  }, []);

  const features = [
    {
      icon: <FaChartBar />,
      title: "Interactive Dashboards",
      desc: "Transform complex data into interactive dashboards with real-time filtering and drill-down capabilities.",
      color: "#2563eb",
    },
    {
      icon: <FaProjectDiagram />,
      title: "Predictive Analytics",
      desc: "Leverage AI-driven insights to forecast business trends and improve decision-making accuracy.",
      color: "#059669",
    },
    {
      icon: <FaUsers />,
      title: "User-Centric Reports",
      desc: "Generate easy-to-understand visual reports tailored for executives, managers, and teams.",
      color: "#dc2626",
    },
    {
      icon: <FaCloud />,
      title: "Cloud Integration",
      desc: "Connect directly with cloud platforms like AWS, Azure, and Google Cloud for real-time data.",
      color: "#7c3aed",
    },
    {
      icon: <FaLaptopCode />,
      title: "Customizable Solutions",
      desc: "Tailor visualizations to your industry needs with flexible, modular components.",
      color: "#ea580c",
    },
    {
      icon: <FaLock />,
      title: "Enterprise Security",
      desc: "Protect sensitive information with encryption, compliance, and role-based access.",
      color: "#db2777",
    },
  ];

  const industries = [
    {
      icon: <FaChartLine />,
      title: "Finance & Investment",
      features: [
        "Real-time portfolio tracking",
        "Risk & compliance monitoring",
        "Predictive investment insights",
      ],
      color: "#2563eb",
    },
    {
      icon: <FaShoppingCart />,
      title: "E-commerce & Retail",
      features: [
        "Sales & revenue dashboards",
        "Customer behavior analytics",
        "Inventory & demand forecasting",
      ],
      color: "#059669",
    },
    {
      icon: <FaHospital />,
      title: "Healthcare",
      features: [
        "Patient health analytics",
        "Clinical data dashboards",
        "Compliance & secure access",
      ],
      color: "#dc2626",
    },
    {
      icon: <FaBullhorn />,
      title: "Marketing & Media",
      features: [
        "Campaign performance tracking",
        "Customer engagement insights",
        "ROI-driven reporting",
      ],
      color: "#7c3aed",
    },
    {
      icon: <FaTruck />,
      title: "Logistics & Supply Chain",
      features: [
        "Real-time shipment tracking",
        "Supplier performance dashboards",
        "Route optimization analytics",
      ],
      color: "#ea580c",
    },
    {
      icon: <FaGraduationCap />,
      title: "Education & E-Learning",
      features: [
        "Student performance analytics",
        "Course engagement dashboards",
        "Institutional data insights",
      ],
      color: "#db2777",
    },
  ];

  const pricingPlansINR = [
    {
      name: "Starter",
      price: "₹599",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 3 Interactive Dashboards",
        "20+ Chart Types Available",
        "CSV & Excel Data Import",
        "Basic Email Support",
        "Real-time Data Updates",
        "Export to PDF/PNG",
        "Basic Analytics",
      ],
      recommended: false,
    },
    {
      name: "Professional",
      price: "₹1500",
      period: "/month",
      description: "Ideal for growing teams and businesses",
      features: [
        "Unlimited Dashboards",
        "50+ Advanced Chart Types",
        "Database & API Integration",
        "Team Collaboration Tools",
        "Priority Support",
        "Custom Visualization Types",
        "Advanced Analytics",
      ],
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      features: [
        "Custom Development",
        "Dedicated Account Manager",
        "On-premise Deployment",
        "Advanced Security Compliance",
        "24/7 Premium Support",
        "White-label Solutions",
        "Training & Onboarding",
      ],
      recommended: false,
    },
  ];

  const pricingPlansUSD = [
    {
      name: "Starter",
      price: "$7.99",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 3 Interactive Dashboards",
        "20+ Chart Types Available",
        "CSV & Excel Data Import",
        "Basic Email Support",
        "Real-time Data Updates",
        "Export to PDF/PNG",
        "Basic Analytics",
      ],
      recommended: false,
    },
    {
      name: "Professional",
      price: "$19.99",
      period: "/month",
      description: "Ideal for growing teams and businesses",
      features: [
        "Unlimited Dashboards",
        "50+ Advanced Chart Types",
        "Database & API Integration",
        "Team Collaboration Tools",
        "Priority Support",
        "Custom Visualization Types",
        "Advanced Analytics",
      ],
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      features: [
        "Custom Development",
        "Dedicated Account Manager",
        "On-premise Deployment",
        "Advanced Security Compliance",
        "24/7 Premium Support",
        "White-label Solutions",
        "Training & Onboarding",
      ],
      recommended: false,
    },
  ];

  const testimonials = [
    {
      text: "This platform transformed how we understand customer behavior. Our decision-making is now truly data-driven.",
      author: "Amit Gupta",
      role: "Retail Analytics Head",
      rating: 5,
    },
    {
      text: "Real-time dashboards helped us cut reporting time by 70% and focus more on strategic initiatives.",
      author: "Lisa Wong",
      role: "Marketing Director",
      rating: 5,
    },
    {
      text: "Their enterprise-grade solution integrated seamlessly with our existing ERP system and infrastructure.",
      author: "David Miller",
      role: "CIO, Logistics Corp",
      rating: 5,
    },
    {
      text: "Predictive analytics allowed us to forecast sales accurately and optimize inventory management.",
      author: "Priya Sharma",
      role: "Supply Chain Manager",
      rating: 4,
    },
    {
      text: "Visual dashboards made it incredibly easy for executives to understand complex KPIs at a glance.",
      author: "Rohan Verma",
      role: "CEO, FinTech Solutions",
      rating: 5,
    },
  ];

  // Get current pricing plans based on currency
  const pricingPlans = currency === "INR" ? pricingPlansINR : pricingPlansUSD;

  // Toggle currency
  const toggleCurrency = () => {
    setCurrency(currency === "INR" ? "USD" : "INR");
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      <Head>
        <title>
          Data Visualization Solutions | Transform Data into Actionable Insights
        </title>
        <meta
          name="description"
          content="Professional data visualization solutions with interactive dashboards, predictive analytics, and enterprise-grade security for data-driven decision making."
        />
      </Head>
      <Nav />
      <WhatsApp />

      <div className={styles.container}>
        {/* Currency Converter Button - Fixed Position */}
        <motion.button
          className={styles.currencyConverter}
          onClick={toggleCurrency}
          disabled={isConverting}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaMoneyBillWave className={styles.currencyIcon} />
          {isConverting ? (
            "Converting..."
          ) : (
            <>
              Show in {currency === "INR" ? "USD" : "INR"}
              <span className={styles.currencyBadge}>{currency}</span>
            </>
          )}
        </motion.button>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContainer}>
            <motion.div
              className={styles.heroContent}
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className={styles.heroText}>
                <motion.div
                  className={styles.heroBadge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FaChartPie className={styles.badgeIcon} />
                  Data-Driven Decisions
                </motion.div>

                <motion.h1 variants={fadeInUp}>
                  Transform Data Into{" "}
                  <span className={styles.gradientText}>
                    Actionable Insights
                  </span>
                </motion.h1>

                <motion.p variants={fadeInUp}>
                  Explore trends, track performance, and unlock hidden patterns
                  with our professional data visualization solutions. Make
                  smarter decisions with interactive dashboards and predictive
                  analytics.
                </motion.p>

                <motion.div variants={fadeInUp} className={styles.heroStats}>
                  <div className={styles.stat}>
                    <strong>95%</strong>
                    <span>Faster Insights</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>50+</strong>
                    <span>Chart Types</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>24/7</strong>
                    <span>Real-time Data</span>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className={styles.heroActions}>
                  <Link href="/register?userType=user">
                    <motion.button
                      className={styles.primaryButton}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Visualizing <FaArrowRight />
                    </motion.button>
                  </Link>
                  <Link href="#features">
                    <motion.button
                      className={styles.secondaryButton}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Explore Features
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className={styles.heroVisual}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className={styles.visualizationPreview}>
                  <Image
                    src={data}
                    alt="Advanced Data Visualization Dashboard"
                    className={styles.heroImage}
                    priority
                  />
                  <div className={styles.floatingElements}>
                    <div
                      className={styles.floatingChart}
                      style={{ top: "20%", left: "10%" }}
                    >
                      <FaChartBar />
                    </div>
                    <div
                      className={styles.floatingChart}
                      style={{ top: "60%", right: "15%" }}
                    >
                      <FaChartPie />
                    </div>
                    <div
                      className={styles.floatingChart}
                      style={{ bottom: "30%", left: "20%" }}
                    >
                      <FaChartLine />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.features}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Key Features</span>
              <h2>Powerful Visualization Capabilities</h2>
              <p>
                From interactive dashboards to predictive analytics, we provide
                the tools to visualize and act on insights.
              </p>
            </motion.div>

            <motion.div
              className={styles.featuresGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={styles.featureCard}
                  variants={scaleIn}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div
                    className={styles.featureIcon}
                    style={{
                      backgroundColor: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <motion.div
                    className={styles.featureLine}
                    style={{ backgroundColor: feature.color }}
                    whileHover={{ width: "100%" }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Industries Section */}
        <section className={styles.industries}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>
                Industries We Serve
              </span>
              <h2>Tailored Solutions for Every Sector</h2>
              <p>
                Our data visualization solutions empower diverse industries with
                insights that drive growth and efficiency.
              </p>
            </motion.div>

            <motion.div
              className={styles.industriesGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {industries.map((industry, index) => (
                <motion.div
                  key={index}
                  className={styles.industryCard}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div
                    className={styles.industryHeader}
                    style={{ borderColor: industry.color }}
                  >
                    <div
                      className={styles.industryIcon}
                      style={{
                        backgroundColor: `${industry.color}15`,
                        color: industry.color,
                      }}
                    >
                      {industry.icon}
                    </div>
                    <h3>{industry.title}</h3>
                  </div>
                  <ul className={styles.industryFeatures}>
                    {industry.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <FaCheck className={styles.checkIcon} />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className={styles.pricing}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Pricing</span>
              <h2>Flexible Plans for Every Need</h2>
              <p>
                Choose the perfect plan that grows with your business and data
                requirements.
              </p>
            </motion.div>

            {/* Currency Display */}
            <motion.div
              className={styles.currencyDisplay}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className={styles.currentCurrency}>
                Displaying prices in: <strong>{currency}</strong>
              </span>
            </motion.div>

            <motion.div
              className={styles.pricingGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  className={`${styles.pricingCard} ${
                    plan.recommended ? styles.recommended : ""
                  }`}
                  variants={scaleIn}
                  whileHover={{ y: -10 }}
                >
                  {plan.recommended && (
                    <div className={styles.recommendedBadge}>
                      <FaStar className={styles.badgeStar} />
                      Most Popular
                    </div>
                  )}

                  <div className={styles.planHeader}>
                    <h3>{plan.name}</h3>
                    <div className={styles.planPrice}>
                      <span className={styles.price}>{plan.price}</span>
                      <span className={styles.period}>{plan.period}</span>
                    </div>
                    <p className={styles.planDescription}>{plan.description}</p>
                  </div>

                  <ul className={styles.planFeatures}>
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <FaCheck className={styles.featureCheck} />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/register?userType=user" className={styles.planButton}>
                      Get Started
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section with Auto Slider */}
        <section className={styles.testimonials}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Testimonials</span>
              <h2>Trusted by Data-Driven Teams</h2>
              <p>
                See how organizations are transforming their decision-making
                with our visualization solutions.
              </p>
            </motion.div>

            <div className={styles.testimonialSlider}>
              <div className={styles.sliderContainer}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    className={styles.testimonialSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <div className={styles.testimonialCard}>
                      <div className={styles.testimonialRating}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < testimonials[currentTestimonial].rating
                                ? styles.starFilled
                                : styles.starEmpty
                            }
                          />
                        ))}
                      </div>
                      <div className={styles.testimonialContent}>
                        <p>"{testimonials[currentTestimonial].text}"</p>
                      </div>
                      <div className={styles.testimonialAuthor}>
                        <div className={styles.authorInfo}>
                          <h4>{testimonials[currentTestimonial].author}</h4>
                          <p>{testimonials[currentTestimonial].role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress Indicators */}
              <div className={styles.sliderIndicators}>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.indicator} ${
                      index === currentTestimonial ? styles.active : ""
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContainer}>
            <motion.div
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Ready to Transform Your Data?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Start visualizing your data today and unlock insights that drive
                business growth.
              </motion.p>
              <motion.div
                className={styles.ctaButtons}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/register?userType=user">
                  <motion.button
                    className={styles.primaryButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaRocket /> Start Free Trial
                  </motion.button>
                </Link>
                <Link href="/contact-us">
                  <motion.button
                    className={styles.secondaryButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Schedule Demo
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default DataVisualization;
