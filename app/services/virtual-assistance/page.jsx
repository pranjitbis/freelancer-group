"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./VirtualAssistance.module.css";
import Nav from "@/app/home/component/Nav/page";
import Assistance from "../../../public/icons/virtual-assistance.gif";
import Image from "next/image";
import Footer from "@/app/home/footer/page";
import WebOne from "../../../public/icons/AdministrativeSupport.png";
import CreativeServices from "../../../public/icons/CreativeServices.png";
import Marketing from "../../../public/icons/Marketing.png";
import technical from "../../../public/icons/technical-support.png";
import TickMark from "../../../public/icons/Mark-Tick.png";
import WhatsApp from "../../whatsapp_icon/page";

// Icons (you can replace these with your actual icons)
const AdminIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
  >
    <path d="M12 16s-6-5.686-6-10A6 6 0 0 1 12 2a6 6 0 0 1 6 6c0 4.314-6 10-6 10z" />
    <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);

const CreativeIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TechIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

const MarketingIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "#fbbf24" : "#e5e7eb"}
    stroke="#f59e0b"
    strokeWidth="1"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const VirtualAssistance = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(0.012); // Approximate INR to USD rate
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const reviewsContainerRef = useRef(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/VirtualAssistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === "INR" ? "USD" : "INR");
  };

  const convertPrice = (inrPrice) => {
    if (currency === "USD") {
      const usdAmount = parseFloat(inrPrice.replace("₹", "")) * exchangeRate;
      return `$${usdAmount.toFixed(2)}`;
    }
    return inrPrice;
  };

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      id: "administrative",
      title: "Administrative Support",
      icon: <AdminIcon />,
      description:
        "Comprehensive administrative assistance to keep your business running smoothly",
      features: [
        "Email Management",
        "Calendar Management",
        "Data Entry",
        "Document Preparation",
        "Travel Arrangements",
        "Customer Support",
      ],
    },
    {
      id: "creative",
      title: "Creative Services",
      icon: <CreativeIcon />,
      description:
        "Creative solutions to enhance your brand and marketing efforts",
      features: [
        "Graphic Design",
        "Content Writing",
        "Social Media Management",
        "Presentation Design",
        "Video Editing",
        "Brand Identity",
      ],
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: <TechIcon />,
      description: "Expert technical assistance for your digital needs",
      features: [
        "Website Maintenance",
        "WordPress Support",
        "E-commerce Management",
        "SEO Optimization",
        "Data Analysis",
        "Software Support",
      ],
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "₹299",
      period: "month",
      description: "Perfect for small businesses and startups",
      features: [
        "10 hours of support per month",
        "Email & calendar management",
        "Basic data entry tasks",
        "Up to 3 social media posts weekly",
        "Email support",
        "Basic reporting",
        "Weekly check-ins",
      ],
      recommended: false,
    },
    {
      name: "Professional",
      price: "₹599",
      period: "month",
      description: "Ideal for growing businesses",
      features: [
        "20 hours of support per month",
        "All Starter features",
        "Content creation",
        "Social media management",
        "Basic graphic design",
        "Priority support",
        "Detailed analytics",
      ],
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "₹999",
      period: "month",
      description: "For businesses needing comprehensive support",
      features: [
        "40 hours of support per month",
        "All Professional features",
        "Website maintenance",
        "SEO optimization",
        "Market research",
        "Dedicated account manager",
        "Custom solutions",
      ],
      recommended: false,
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Consultation",
      description: "We discuss your needs and requirements in detail",
    },
    {
      step: 2,
      title: "Matching",
      description: "We match you with the perfect virtual assistant specialist",
    },
    {
      step: 3,
      title: "Onboarding",
      description: "We set up systems and processes for seamless collaboration",
    },
    {
      step: 4,
      title: "Execution",
      description: "Your virtual assistant starts delivering immediate value",
    },
  ];

  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      company: "TechStart Inc",
      rating: 5,
      comment: "The administrative support has been exceptional. My virtual assistant handles everything from email management to scheduling, allowing me to focus on business growth.",
      service: "Administrative Support",
      avatar: "PS"
    },
    {
      id: 2,
      name: "Raj Patel",
      company: "DesignStudio",
      rating: 5,
      comment: "Creative services team delivered outstanding graphics and content for our social media. Engagement has increased by 200% since we started working with them.",
      service: "Creative Services",
      avatar: "RP"
    },
    {
      id: 3,
      name: "Anita Desai",
      company: "E-Commerce Pro",
      rating: 4,
      comment: "Technical support has been reliable and efficient. They handle our WordPress maintenance and SEO, which has significantly improved our website performance.",
      service: "Technical Support",
      avatar: "AD"
    },
    {
      id: 4,
      name: "Michael Chen",
      company: "Global Solutions",
      rating: 5,
      comment: "The marketing assistance transformed our lead generation process. Professional plan gives us everything we need at an affordable price.",
      service: "Marketing Assistance",
      avatar: "MC"
    },
    {
      id: 5,
      name: "Sarah Johnson",
      company: "StartUp Ventures",
      rating: 5,
      comment: "As a startup, the Starter plan was perfect for our budget. The support team is responsive and the quality of work exceeds expectations.",
      service: "Administrative Support",
      avatar: "SJ"
    },
    {
      id: 6,
      name: "David Wilson",
      company: "Enterprise Corp",
      rating: 4,
      comment: "Comprehensive enterprise solution that handles all our virtual assistance needs. The dedicated account manager makes coordination seamless.",
      service: "Multiple Services",
      avatar: "DW"
    }
  ];

  const StarRating = ({ rating }) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= rating} />
        ))}
      </div>
    );
  };

  const nextReview = () => {
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevReview = () => {
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      <Head>
        <title>
          Professional Virtual Assistance Services | Scale Your Business
        </title>
        <meta
          name="description"
          content="Expert virtual assistance services for administrative, creative, technical, and marketing support. Scale your business with our professional virtual assistants."
        />
      </Head>
      <Nav />
      <WhatsApp />

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroText}
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
                Professional Virtual Assistance Services
              </motion.h1>
              <motion.p
                className={styles.heroDescription}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                Scale your business with expert virtual assistants handling
                administrative, creative, technical, and marketing tasks. Focus
                on growth while we handle the rest.
              </motion.p>
              <motion.div
                className={styles.heroCta}
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                <Link href="/register?userType=user" className={styles.ctaButton}>
                  Get Started Today
                </Link>
                <Link href="#services" className={styles.secondaryButton}>
                  View Services
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.heroGraphics}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className={styles.graphicCard}>
                <div className={styles.graphicIcon}>
                  <AdminIcon />
                </div>
                <h4>Administrative</h4>
              </div>
              <div className={styles.graphicCard}>
                <div className={styles.graphicIcon}>
                  <CreativeIcon />
                </div>
                <h4>Creative</h4>
              </div>
              <div className={styles.graphicCard}>
                <div className={styles.graphicIcon}>
                  <TechIcon />
                </div>
                <h4>Technical</h4>
              </div>
              <div className={styles.graphicCard}>
                <div className={styles.graphicIcon}>
                  <MarketingIcon />
                </div>
                <h4>Marketing</h4>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className={styles.services} id="services">
          <div className={styles.sectionHeader}>
            <motion.h2
              className={styles.sectionTitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              Our Virtual Assistance Services
            </motion.h2>
            <motion.p
              className={styles.sectionSubtitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Comprehensive support solutions tailored to your business needs
            </motion.p>
          </div>

          <motion.div
            className={styles.servicesGrid}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className={styles.serviceCard}
                variants={scaleIn}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                </div>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className={styles.serviceFeature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className={styles.featureItem}>
                        <div className={styles.tickMark}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span>{feature}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/register?userType=user" className={styles.serviceButton}>
                    Start This Service
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Process Section */}
        <section className={styles.process}>
          <div className={styles.sectionHeader}>
            <motion.h2
              className={styles.sectionTitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            <motion.p
              className={styles.sectionSubtitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Get started with your dedicated virtual assistant in 4 simple
              steps
            </motion.p>
          </div>

          <motion.div
            className={styles.processSteps}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                className={styles.processStep}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className={styles.stepNumber}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.step}
                </motion.div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Pricing Section */}
        <section className={styles.pricing}>
          <div className={styles.sectionHeader}>
            <motion.h2
              className={styles.sectionTitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              Flexible Pricing Plans
            </motion.h2>
            <motion.p
              className={styles.sectionSubtitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Choose the perfect plan for your business needs
            </motion.p>
            
            {/* Currency Toggle Button */}
            <motion.div
              className={styles.currencyToggle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={toggleCurrency}
                className={styles.currencyButton}
              >
                Show Prices in {currency === "INR" ? "USD" : "INR"}
              </button>
              <span className={styles.currencyNote}>
                Currently showing prices in {currency}
              </span>
            </motion.div>
          </div>

          <motion.div
            className={styles.pricingPlans}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`${styles.planCard} ${
                  plan.recommended ? styles.recommended : ""
                }`}
                variants={scaleIn}
                whileHover={{ y: -5 }}
              >
                {plan.recommended && (
                  <div className={styles.recommendedBadge}>Most Popular</div>
                )}
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.price}>
                      {convertPrice(plan.price)}
                    </span>
                    <span className={styles.period}>/{plan.period}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className={styles.planFeature}>
                      <div className={styles.featureItem}>
                        <div className={styles.tickMark}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span>{feature}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register?userType=user"
                    className={
                      plan.recommended
                        ? styles.primaryButton
                        : styles.secondaryButton
                    }
                  >
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Reviews Section */}
        <section className={styles.reviews}>
          <div className={styles.sectionHeader}>
            <motion.h2
              className={styles.sectionTitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              What Our Clients Say
            </motion.h2>
            <motion.p
              className={styles.sectionSubtitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Discover how our virtual assistance services have helped businesses grow
            </motion.p>
          </div>

          <div className={styles.reviewsContainer}>
            <button 
              className={styles.navButton} 
              onClick={prevReview}
              aria-label="Previous review"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <div className={styles.reviewsFlexContainer}>
              <motion.div
                className={styles.reviewsFlex}
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                {reviews.slice(currentReviewIndex, currentReviewIndex + 3).map((review, index) => (
                  <motion.div
                    key={review.id}
                    className={styles.reviewCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className={styles.reviewHeader}>
                      <div className={styles.avatar}>
                        {review.avatar}
                      </div>
                      <div className={styles.reviewerInfo}>
                        <h4 className={styles.reviewerName}>{review.name}</h4>
                        <p className={styles.reviewerCompany}>{review.company}</p>
                        <p className={styles.reviewService}>{review.service}</p>
                      </div>
                    </div>
                    <div className={styles.reviewContent}>
                      <StarRating rating={review.rating} />
                      <p className={styles.reviewComment}>"{review.comment}"</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <button 
              className={styles.navButton} 
              onClick={nextReview}
              aria-label="Next review"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          {/* Review Indicators */}
          <div className={styles.reviewIndicators}>
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${
                  index === currentReviewIndex ? styles.active : ""
                }`}
                onClick={() => setCurrentReviewIndex(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className={styles.contact}>
          <div className={styles.contactContainer}>
            <motion.div
              className={styles.contactContent}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <h2 className={styles.contactTitle}>
                Ready to Scale Your Business?
              </h2>
              <p className={styles.contactDescription}>
                Let us handle the tasks so you can focus on growth. Get started
                with a professional virtual assistant today.
              </p>
              <div className={styles.contactBenefits}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>✓</div>
                  <span>No setup fees or long-term contracts</span>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>✓</div>
                  <span>Dedicated account manager</span>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>✓</div>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={styles.contactFormContainer}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {isSubmitted ? (
                <motion.div
                  className={styles.successMessage}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.successIcon}>✓</div>
                  <h3>Thank You!</h3>
                  <p>
                    We've received your inquiry and will contact you within 24
                    hours.
                  </p>
                </motion.div>
              ) : (
                <form className={styles.contactForm} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="service">Service Interest *</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        className={styles.formInput}
                      >
                        <option value="">Select a service</option>
                        <option value="administrative">
                          Administrative Support
                        </option>
                        <option value="creative">Creative Services</option>
                        <option value="technical">Technical Support</option>
                        <option value="marketing">Marketing Assistance</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">Your Requirements *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className={styles.formTextarea}
                      placeholder="Tell us about your business needs..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className={styles.submitButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Now
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default VirtualAssistance;