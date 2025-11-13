"use client";

import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import WhatsApp from "../../whatsapp_icon/page";
import {
  FaShoppingCart,
  FaMobile,
  FaChartLine,
  FaShieldAlt,
  FaCog,
  FaHeadset,
  FaRocket,
  FaBrain,
  FaTruck,
  FaGlobe,
  FaUsers,
  FaMoneyBillAlt,
  FaHandsHelping,
  FaBox,
  FaAd,
  FaStore,
  FaBuilding,
  FaAmazon,
  FaIndustry,
  FaChartBar,
  FaCheck,
  FaStar,
  FaArrowRight,
  FaQuoteLeft,
  FaExchangeAlt,
} from "react-icons/fa";
import Link from "next/link";
import Footer from "@/app/home/footer/page";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import styles from "./EcommerceSolutions.module.css";
import Nav from "@/app/home/component/Nav/page";
import ecomarce from "../../../public/icons/ecommerce.gif";
import Image from "next/image";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
};

// Testimonials Carousel Component
const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  const testimonials = [
    {
      id: 1,
      text: "Our sales grew 40% within 3 months after adopting Aroliya's platform. The seamless integration and expert support made our transition effortless.",
      author: "Sarah Johnson",
      company: "Fashion Boutique",
      rating: 5,
      industry: "Fashion Retail",
    },
    {
      id: 2,
      text: "The analytics dashboard helped us understand our customers better and scale fast. We've seen a 60% increase in customer retention.",
      author: "Michael Chen",
      company: "Tech Gadgets Store",
      rating: 5,
      industry: "Electronics",
    },
    {
      id: 3,
      text: "Fantastic support and user-friendly tools. Highly recommend this team! They transformed our online presence completely.",
      author: "Emily Rodriguez",
      company: "Home Decor Empire",
      rating: 5,
      industry: "Home Decor",
    },
    {
      id: 4,
      text: "They streamlined our e-commerce operations, saving us 15+ hours every week. The inventory management system is exceptional.",
      author: "Rajesh Verma",
      company: "Organic Store Chain",
      rating: 4,
      industry: "Organic Products",
    },
    {
      id: 5,
      text: "Customer engagement increased significantly thanks to their tailored strategies. Our conversion rate improved by 35%.",
      author: "Priya Nair",
      company: "Beauty & Wellness",
      rating: 5,
      industry: "Beauty & Cosmetics",
    },
    {
      id: 6,
      text: "The automation features reduced our manual workload by 60%. Now we can focus on business growth instead of operations.",
      author: "James Miller",
      company: "Electronics Hub",
      rating: 5,
      industry: "Consumer Electronics",
    },
    {
      id: 7,
      text: "Professional, responsive, and results-driven service. Couldn't be happier with our partnership with Aroliya!",
      author: "Amit Shah",
      company: "Bookstore Online",
      rating: 5,
      industry: "Books & Education",
    },
    {
      id: 8,
      text: "Helped us launch our first online store smoothly and professionally. The guidance was invaluable for our startup.",
      author: "Sophia Williams",
      company: "Handcrafted Goods",
      rating: 5,
      industry: "Handmade Products",
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 3000); // Change testimonial every 3 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, testimonials.length]);

  const RatingStars = ({ rating }) => (
    <div className={styles.ratingStars}>
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={i < rating ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.sectionHeader}>
        <h2>Client Success Stories</h2>
        <p>
          See what our satisfied clients say about their experience with Aroliya
        </p>
      </div>

      {/* Single Testimonial Display */}
      <div className={styles.carouselWrapper}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={styles.testimonialCard}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
          >
            <div className={styles.testimonialContent}>
              <div className={styles.quoteIcon}>
                <FaQuoteLeft />
              </div>
              <RatingStars rating={testimonials[currentIndex].rating} />
              <p className={styles.testimonialText}>
                "{testimonials[currentIndex].text}"
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorInfo}>
                  <strong>{testimonials[currentIndex].author}</strong>
                  <span>{testimonials[currentIndex].company}</span>
                  <div className={styles.industryTag}>
                    {testimonials[currentIndex].industry}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicators */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            key={currentIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
          />
        </div>
        <div className={styles.carouselIndicators}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 5000);
              }}
              className={`${styles.indicator} ${
                index === currentIndex ? styles.indicatorActive : ""
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        <div className={styles.slideCounter}>
          {currentIndex + 1} / {testimonials.length}
        </div>
      </div>
    </div>
  );
};

const EcommerceSolutions = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState("INR"); // 'INR' or 'USD'
  const [exchangeRate, setExchangeRate] = useState(83); // Default exchange rate

  useEffect(() => {
    setIsVisible(true);
    // You can fetch real exchange rate from an API here
    // fetch('https://api.exchangerate-api.com/v4/latest/INR')
    //   .then(response => response.json())
    //   .then(data => setExchangeRate(data.rates.USD));
  }, []);

  // Currency conversion function
  const convertPrice = (inrPrice) => {
    if (currency === "USD") {
      const usdAmount = parseFloat(inrPrice.replace('₹', '').replace(',', '')) / exchangeRate;
      return `$${usdAmount.toFixed(2)}`;
    }
    return inrPrice;
  };

  const toggleCurrency = () => {
    setCurrency(currency === "INR" ? "USD" : "INR");
  };

  const features = [
    {
      icon: <FaMobile />,
      title: "Mobile Commerce",
      desc: "Optimized shopping experience for mobile users with responsive design and blazing speed.",
    },
    {
      icon: <FaChartLine />,
      title: "Analytics & Insights",
      desc: "Get deep insights into customer behavior and marketing ROI with advanced analytics.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Payments",
      desc: "PCI-compliant, fraud-protected payment gateways for safe transactions worldwide.",
    },
    {
      icon: <FaCog />,
      title: "Customization",
      desc: "Flexible themes, layouts, and store functionality tailored for your brand.",
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Support",
      desc: "Dedicated experts ready to assist you anytime, anywhere in the world.",
    },
    {
      icon: <FaRocket />,
      title: "Fast Deployment",
      desc: "Get your online store live quickly with easy setup and reliable onboarding.",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹500",
      period: "per month",
      features: [
        { text: "Unlimited Products & Categories", included: false },
        { text: "Secure SSL Certificate", included: true },
        { text: "Basic Customer Support (Email Only)", included: true },
        { text: "1 Admin Account Access", included: true },
        { text: "Pre-built Themes", included: true },
        { text: "Mobile-Responsive Design", included: true },
        { text: "Basic SEO Tools", included: false },
        { text: "Abandoned Cart Recovery", included: false },
        { text: "Inventory & Order Management", included: false },
        { text: "Automatic Backups", included: false },
      ],
      button: "Get Started",
      primary: false,
      link: "/register",
    },
    {
      name: "Business",
      price: "₹1,102",
      period: "per month",
      features: [
        { text: "Unlimited Products & Categories", included: true },
        { text: "Secure SSL Certificate", included: true },
        { text: "Priority Support (Email & Chat)", included: true },
        { text: "Premium Store Themes", included: true },
        { text: "Mobile-Responsive Design", included: true },
        { text: "Advanced SEO Tools", included: true },
        { text: "Abandoned Cart Recovery", included: true },
        { text: "Up to 3 Admin Accounts", included: false },
        { text: "Inventory & Order Management", included: false },
        { text: "Automatic Backups (Daily)", included: false },
      ],
      button: "Get Started",
      primary: true,
      link: "/register",
    },
    {
      name: "Enterprise",
      price: "₹2,300",
      period: "per month",
      features: [
        { text: "Unlimited Products & Categories", included: true },
        { text: "Secure SSL Certificate", included: true },
        { text: "24/7 Dedicated Support", included: true },
        { text: "20+ Admin Accounts", included: true },
        { text: "Custom Themes & White-label", included: true },
        { text: "Mobile-Responsive Design", included: true },
        { text: "Advanced SEO & Marketing Tools", included: true },
        { text: "Abandoned Cart Recovery", included: true },
        { text: "Inventory & Order Management", included: true },
        { text: "Automatic Backups (Hourly)", included: true },
      ],
      button: "Get Started",
      primary: false,
      link: "/register",
    },
  ];

  const benefits = [
    {
      icon: <FaHandsHelping />,
      title: "End-to-End Support",
      description:
        "From product listing to customer care, we handle everything for your e-commerce business.",
    },
    {
      icon: <FaGlobe />,
      title: "Multi-Platform Expertise",
      description:
        "Amazon, Flipkart, Shopify, WooCommerce & more - we know all the major platforms inside out.",
    },
    {
      icon: <FaRocket />,
      title: "Scalable Solutions",
      description:
        "Our services grow with your business, suitable for startups, SMEs, and enterprises.",
    },
    {
      icon: <FaMoneyBillAlt />,
      title: "Cost-Effective Plans",
      description:
        "Affordable packages without compromising quality, with transparent pricing.",
    },
    {
      icon: <FaUsers />,
      title: "Dedicated Team",
      description:
        "Experienced e-commerce professionals at your service, committed to your success.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Reliable",
      description:
        "Robust security measures and reliable infrastructure to keep your store running smoothly.",
    },
  ];

  const services = [
    {
      icon: <FaBox />,
      title: "Product Catalog Management",
      description:
        "Your products are the heart of your store. We make sure they shine.",
      features: [
        "High-quality product listing with SEO-rich descriptions",
        "Upload and management of product images and variants",
        "Category structuring for easy navigation",
        "Real-time inventory updates",
      ],
    },
    {
      icon: <FaTruck />,
      title: "Order Processing & Fulfillment",
      description:
        "Fast and error-free order processing builds trust with your customers.",
      features: [
        "Processing customer orders from multiple channels",
        "Generating invoices and shipping labels",
        "Coordinating with courier partners",
        "Managing returns and refunds professionally",
      ],
    },
    {
      icon: <FaAd />,
      title: "Marketing & Sales Optimization",
      description:
        "Bring more visitors, convert them into buyers, and increase revenue.",
      features: [
        "SEO optimization for higher marketplace rankings",
        "Google Ads & Meta Ads campaigns",
        "Social media promotions to drive traffic",
        "A/B testing to improve conversions",
      ],
    },
    {
      icon: <FaHeadset />,
      title: "Customer Support",
      description: "Delight your customers with responsive support.",
      features: [
        "24/7 email, chat, and phone support",
        "Handling queries on orders and shipping",
        "Complaint resolution and follow-ups",
        "Building loyalty with after-sales support",
      ],
    },
    {
      icon: <FaChartBar />,
      title: "Analytics & Business Insights",
      description: "Make smarter decisions with data-driven strategies.",
      features: [
        "Sales and performance dashboards",
        "Weekly and monthly reports with KPIs",
        "Customer behavior analysis",
        "Predictive insights for growth",
      ],
    },
    {
      icon: <FaBrain />,
      title: "AI Solutions",
      description: "Leverage advanced AI to scale your business smarter.",
      features: [
        "Predictive analytics for sales trends",
        "AI-powered chatbots for support",
        "Intelligent inventory management",
        "Personalized recommendations",
      ],
    },
  ];

  const targetAudience = [
    {
      title: "New Online Sellers",
      description:
        "Launch your online store quickly and professionally with expert support.",
      icon: <FaShoppingCart />,
    },
    {
      title: "Established E-Commerce",
      description:
        "Streamline and outsource operations to scale faster and save resources.",
      icon: <FaStore />,
    },
    {
      title: "Amazon/Flipkart Sellers",
      description:
        "Optimize product listings and boost visibility for faster marketplace growth.",
      icon: <FaAmazon />,
    },
    {
      title: "D2C Brands",
      description:
        "Enhance customer experience with consistent, reliable operational support.",
      icon: <FaUsers />,
    },
    {
      title: "Small Businesses",
      description:
        "Explore online marketplaces and grow your presence with ease.",
      icon: <FaIndustry />,
    },
    {
      title: "Enterprise Solutions",
      description:
        "Robust, scalable solutions for large enterprises to manage high-volume operations.",
      icon: <FaBuilding />,
    },
  ];

  const StatCard = ({ number, label }) => (
    <motion.div
      className={styles.statCard}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h3>{number}</h3>
      <p>{label}</p>
    </motion.div>
  );

  return (
    <>
      <Head>
        <title>Professional E-commerce Solutions | Aroliya</title>
        <meta
          name="description"
          content="Complete e-commerce solutions with professional features, secure payments, expert support, and flexible pricing for businesses of all sizes."
        />
      </Head>
      <Nav />
      <WhatsApp />

      {/* Currency Converter Button */}
      <motion.div
        className={styles.currencyConverter}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <button
          onClick={toggleCurrency}
          className={styles.currencyButton}
          title={`Switch to ${currency === "INR" ? "USD" : "INR"}`}
        >
          <FaExchangeAlt className={styles.currencyIcon} />
          <span>{currency === "INR" ? "₹ INR" : "$ USD"}</span>
        </button>
        <div className={styles.currencyNote}>
          Prices shown in {currency}
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroText}
              initial="initial"
              animate="animate"
              variants={slideInLeft}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroBadge}>
                Professional E-commerce Solutions
              </div>
              <h1>Transform Your Online Business with Aroliya</h1>
              <p>
                Complete e-commerce solutions to build, manage, and scale your
                online store. Professional services tailored for businesses of
                all sizes.
              </p>
              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <strong>500+</strong>
                  <span>Stores Built</span>
                </div>
                <div className={styles.stat}>
                  <strong>99.9%</strong>
                  <span>Uptime</span>
                </div>
                <div className={styles.stat}>
                  <strong>24/7</strong>
                  <span>Support</span>
                </div>
              </div>
              <div className={styles.heroButtons}>
                <Link href="/register">
                  <motion.button
                    className={styles.btnPrimary}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Your Store <FaArrowRight />
                  </motion.button>
                </Link>
                <Link href="#services">
                  <button className={styles.btnSecondary}>
                    Explore Services
                  </button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              className={styles.heroImage}
              initial="initial"
              animate="animate"
              variants={slideInRight}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image src={ecomarce} alt="E-commerce solutions" priority />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <StatCard number="500+" label="Stores Built" />
            <StatCard number="40%" label="Average Growth" />
            <StatCard number="24/7" label="Customer Support" />
            <StatCard number="99.9%" label="Platform Uptime" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={styles.services}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Comprehensive E-Commerce Services
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              End-to-end solutions to manage every aspect of your online
              business
            </motion.p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <motion.div
                key={index}
                className={styles.serviceCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={styles.serviceIcon}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {service.icon}
                </motion.div>
                <h3>{service.title}</h3>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <FaCheck className={styles.checkIcon} />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose Aroliya?</h2>
            <p>Professional solutions that drive real results</p>
          </div>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className={styles.benefitCard}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={scaleIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className={styles.benefitIcon}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {benefit.icon}
                </motion.div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className={styles.audience}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Perfect For Your Business</h2>
            <p>Tailored solutions for every type of e-commerce business</p>
          </div>
          <div className={styles.audienceGrid}>
            {targetAudience.map((aud, index) => (
              <motion.div
                key={index}
                className={styles.audienceCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={styles.audienceIcon}>{aud.icon}</div>
                <h3>{aud.title}</h3>
                <p>{aud.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Platform Features</h2>
            <p>Everything you need to succeed in e-commerce</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className={styles.featureIcon}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Transparent Pricing</h2>
            <p>Choose the perfect plan for your business needs</p>
          </div>
          <div className={styles.pricingGrid}>
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`${styles.pricingCard} ${
                  plan.primary ? styles.recommended : ""
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                {plan.primary && (
                  <div className={styles.recommendedBadge}>Most Popular</div>
                )}
                <div className={styles.pricingHeader}>
                  <h3>{plan.name}</h3>
                  <div className={styles.price}>
                    <span className={styles.priceAmount}>
                      {convertPrice(plan.price)}
                    </span>
                    <span className={styles.pricePeriod}>{plan.period}</span>
                  </div>
                </div>
                <Link href={plan.link}>
                  <motion.button
                    className={
                      plan.primary
                        ? styles.planBtnPrimary
                        : styles.planBtnSecondary
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {plan.button}
                  </motion.button>
                </Link>
                <ul className={styles.featuresList}>
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className={styles.featureItem}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      {feature.included ? (
                        <FaCheck className={styles.featureIncluded} />
                      ) : (
                        <span className={styles.featureExcluded}>×</span>
                      )}
                      <span
                        className={
                          feature.included
                            ? styles.featureText
                            : styles.featureTextExcluded
                        }
                      >
                        {feature.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Transform Your E-commerce Business?</h2>
            <p>
              Join hundreds of successful businesses using Aroliya's
              professional e-commerce solutions. Start your journey today.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/contact">
                <motion.button
                  className={styles.ctaBtnPrimary}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Today
                </motion.button>
              </Link>
              <Link href="/demo">
                <button className={styles.ctaBtnSecondary}>Request Demo</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default EcommerceSolutions;