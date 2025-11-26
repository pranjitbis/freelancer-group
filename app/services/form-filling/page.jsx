"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "./ServiceDetail.module.css";
import Nav from "../../home/component/Nav/page";
import Footer from "../../home/footer/page";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { IoCheckmarkDone } from "react-icons/io5";
import formFilling from "@/public/icons/form-illustration-free.png";
import Link from "next/link";

// React Icons
import {
  FiCheck,
  FiClock,
  FiShield,
  FiDollarSign,
  FiFileText,
  FiUserCheck,
  FiSend,
  FiArrowRight,
  FiPhone,
  FiMail,
  FiMapPin,
  FiStar,
  FiUsers,
  FiAward,
  FiHeart,
} from "react-icons/fi";
import {
  FaGraduationCap,
  FaUniversity,
  FaPiggyBank,
  FaPlane,
  FaBusinessTime,
  FaRegSmile,
  FaRocket,
  FaLightbulb,
  FaHandHoldingHeart,
} from "react-icons/fa";
import WhatsApp from "../../whatsapp_icon/page";

const ServiceDetail = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceCategory: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/formSubmit", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) {
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceCategory: "",
        message: "",
      });
    } else {
      setError("Server Error. Please try again.");
    }
  };

  const serviceCategories = [
    {
      id: "startup-msme",
      title: "Startup & MSME",
      services: [
        "Business Registration",
        "Udyam Aadhaar",
        "Startup India",
        "Subsidy Programs",
        "Compliance Filing",
        "Tax Registrations",
      ],
      icon: <FaLightbulb />,
      color: "#2563eb",
    },
    {
      id: "education",
      title: "Education",
      services: [
        "University Admissions",
        "Scholarships Applications",
        "College Forms",
        "Exam Registrations",
        "Document Verification",
        "Education Loan Forms",
      ],
      icon: <FaGraduationCap />,
      color: "#059669",
    },
    {
      id: "banking",
      title: "Banking & Finance",
      services: [
        "Bank Account Opening",
        "Loan Applications",
        "Insurance Policies",
        "Investment Forms",
        "Credit Card Applications",
        "KYC Updates",
      ],
      icon: <FaPiggyBank />,
      color: "#dc2626",
    },
    {
      id: "travel",
      title: "Travel & Visa",
      services: [
        "Visa Applications",
        "Passport Services",
        "Travel Insurance",
        "Hotel Bookings",
        "Flight Reservations",
        "Tourist Visa Extensions",
      ],
      icon: <FaPlane />,
      color: "#7c3aed",
    },
    {
      id: "business",
      title: "Business Compliance",
      services: [
        "GST Registration",
        "Company Incorporation",
        "MSME Registration",
        "Trade Licenses",
        "Import-Export Codes",
        "Professional Tax",
      ],
      icon: <FaBusinessTime />,
      color: "#ea580c",
    },
    {
      id: "government-schemes",
      title: "Government Schemes",
      services: [
        "Ayushman Bharat",
        "PM Kisan",
        "Ujjwala Yojana",
        "Pension Schemes",
        "Housing Schemes",
        "Skill Development",
      ],
      icon: <FaHandHoldingHeart />,
      color: "#db2777",
    },
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardHover = {
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  };

  return (
    <>
      <Head>
        <title>Professional Form Filling Services | Aroliya Consultants</title>
        <meta
          name="description"
          content="Expert form filling services with 100% accuracy guarantee. Business registrations, education forms, visa applications, and government schemes. Starting at ₹99."
        />
        <meta
          name="keywords"
          content="form filling services, business registration, GST filing, visa applications, education forms"
        />
      </Head>

      <Nav />
      <WhatsApp />

      <div className={styles.container}>
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
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <FiStar className={styles.badgeIcon} />
                  Most Trusted Form Filling Service
                </motion.div>

                <motion.h1 variants={fadeInUp}>
                  Professional{" "}
                  <span className={styles.primaryText}>Form Filling</span>{" "}
                  Services
                </motion.h1>

                <motion.p variants={fadeInUp}>
                  Expert form filling services for businesses, education,
                  government schemes, and personal documentation. Save time,
                  avoid errors, and ensure 100% accuracy with our professional
                  team.
                </motion.p>

                <motion.div variants={fadeInUp} className={styles.heroStats}>
                  <div className={styles.statItem}>
                    <strong>10,000+</strong>
                    <span>Forms Processed</span>
                  </div>
                  <div className={styles.statItem}>
                    <strong>99.8%</strong>
                    <span>Success Rate</span>
                  </div>
                  <div className={styles.statItem}>
                    <strong>24/7</strong>
                    <span>Expert Support</span>
                  </div>
                  <div className={styles.statItem}>
                    <strong>50+</strong>
                    <span>Service Categories</span>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className={styles.heroActions}>
                  <Link href="/register?userType=user">
                    <motion.button
                      className={styles.primaryButton}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Started Today <FiArrowRight />
                    </motion.button>
                  </Link>
                  <div className={styles.contactInfo}>
                    <a href="tel:9870519002" className={styles.phoneLink}>
                      <FiPhone className={styles.phoneIcon} />
                      +91-9870519002
                    </a>
                    <span className={styles.availability}>Available 24/7</span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className={styles.heroVisual}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={formFilling}
                    alt="Professional Form Filling Services"
                    priority
                    className={styles.heroImage}
                  />
                </div>
                <div className={styles.floatingBadges}>
                  <div className={styles.floatingBadge}>
                    <FiCheck className={styles.badgeCheck} />
                    <span>100% Accuracy</span>
                  </div>
                  <div className={styles.floatingBadge}>
                    <FiClock className={styles.badgeCheck} />
                    <span>24h Delivery</span>
                  </div>
                  <div className={styles.floatingBadge}>
                    <FiShield className={styles.badgeCheck} />
                    <span>Secure & Confidential</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Categories */}
        <section className={styles.categories}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <motion.span
                className={styles.sectionSubtitle}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Our Services
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Comprehensive Form Filling Solutions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Professional assistance for all your documentation needs across
                various sectors
              </motion.p>
            </div>

            <div className={styles.categoriesGrid}>
              {serviceCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  className={`${styles.categoryCard} ${
                    index === activeCategory ? styles.activeCategory : ""
                  }`}
                  onClick={() => setActiveCategory(index)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  variants={cardHover}
                  whileHover="hover"
                >
                  <div
                    className={styles.categoryIcon}
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    {category.icon}
                  </div>
                  <h3>{category.title}</h3>
                  <p>Expert form filling services</p>
                  <motion.div
                    className={styles.arrowIndicator}
                    whileHover={{ x: 5 }}
                  >
                    <FiArrowRight />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className={styles.servicesPanel}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.panelHeader}>
                  <h3>{serviceCategories[activeCategory].title} Services</h3>
                  <span className={styles.servicesCount}>
                    {serviceCategories[activeCategory].services.length} services
                    available
                  </span>
                </div>
                <div className={styles.servicesGrid}>
                  {serviceCategories[activeCategory].services.map(
                    (service, idx) => (
                      <motion.div
                        key={idx}
                        className={styles.serviceItem}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className={styles.serviceIcon}>
                          <FiCheck />
                        </div>
                        <span>{service}</span>
                      </motion.div>
                    )
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Why Choose Our Professional Services?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Experience unmatched quality and reliability with our expert
                form filling services
              </motion.p>
            </div>

            <div className={styles.featuresGrid}>
              {[
                {
                  icon: <FiClock />,
                  title: "Time Saving",
                  description:
                    "Complete complex forms in minutes instead of hours with our streamlined process",
                },
                {
                  icon: <FiShield />,
                  title: "100% Secure",
                  description:
                    "Bank-level security with encrypted data storage and strict confidentiality",
                },
                {
                  icon: <FiCheck />,
                  title: "Error-Free Submission",
                  description:
                    "Triple verification process ensures zero rejection and maximum accuracy",
                },
                {
                  icon: <FiDollarSign />,
                  title: "Cost Effective",
                  description:
                    "Professional services starting at just ₹99 with transparent pricing",
                },
                {
                  icon: <FiUserCheck />,
                  title: "Expert Assistance",
                  description:
                    "Certified professionals with domain-specific expertise and experience",
                },
                {
                  icon: <FiSend />,
                  title: "Quick Turnaround",
                  description:
                    "Most forms completed and delivered within 24 hours of submission",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  variants={cardHover}
                  whileHover="hover"
                >
                  <motion.div
                    className={styles.featureIcon}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className={styles.process}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Our Simple 4-Step Process
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Get your forms filled accurately and efficiently
              </motion.p>
            </div>

            <div className={styles.processSteps}>
              {[
                {
                  step: 1,
                  title: "Submit Requirements",
                  description:
                    "Share your form details and documents through our secure portal",
                  icon: <FiSend />,
                },
                {
                  step: 2,
                  title: "Expert Assignment",
                  description:
                    "We assign a specialized professional for your specific form type",
                  icon: <FiUserCheck />,
                },
                {
                  step: 3,
                  title: "Quality Review",
                  description:
                    "Triple-check process to ensure 100% accuracy and compliance",
                  icon: <FiCheck />,
                },
                {
                  step: 4,
                  title: "Secure Delivery",
                  description:
                    "Receive your completed form with detailed instructions for submission",
                  icon: <FiShield />,
                },
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  className={styles.processStep}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <motion.div
                    className={styles.stepNumber}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.icon}
                  </motion.div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className={styles.stepIndicator}>{step.step}</div>
                </motion.div>
              ))}
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
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Ready to Simplify Your Documentation?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Join thousands of satisfied clients who trust us with their
                important forms and applications
              </motion.p>
              <motion.div
                className={styles.ctaButtons}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Link href="#contact">
                  <motion.button
                    className={styles.primaryButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPhone /> Start Your Project
                  </motion.button>
                </Link>
             
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className={styles.contact} id="contact">
          <div className={styles.sectionContainer}>
            <div className={styles.contactGrid}>
              <motion.div
                className={styles.contactInfo}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.contactHeader}>
                  <h2>Get Professional Assistance</h2>
                  <p>
                    Our experts are ready to help you with all your form filling
                    needs
                  </p>
                </div>

                <div className={styles.contactDetails}>
                  <motion.div
                    className={styles.contactItem}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.contactIcon}>
                      <FiPhone />
                    </div>
                    <div className={styles.contactText}>
                      <strong>Call Us</strong>
                      <span>+91-9870519002</span>
                      <small>24/7 Customer Support</small>
                    </div>
                  </motion.div>
                  <motion.div
                    className={styles.contactItem}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.contactIcon}>
                      <FiMail />
                    </div>
                    <div className={styles.contactText}>
                      <strong>Email Us</strong>
                      <span>support@aroliya.com</span>
                      <small>Quick Response Guaranteed</small>
                    </div>
                  </motion.div>
                  <motion.div
                    className={styles.contactItem}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.contactIcon}>
                      <FiClock />
                    </div>
                    <div className={styles.contactText}>
                      <strong>Business Hours</strong>
                      <span>Monday - Sunday: 24/7</span>
                      <small>Emergency Support Available</small>
                    </div>
                  </motion.div>
                </div>

                <div className={styles.trustIndicators}>
                  <div className={styles.trustItem}>
                    <FiAward className={styles.trustIcon} />
                    <span>Certified Professionals</span>
                  </div>
                  <div className={styles.trustItem}>
                    <FiShield className={styles.trustIcon} />
                    <span>Data Security Guaranteed</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={styles.contactForm}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className={styles.formHeader}>
                  <h3>Start Your Project</h3>
                  <p>
                    Fill out the form and we'll get back to you within 30
                    minutes
                  </p>
                </div>

                {isSubmitted ? (
                  <motion.div
                    className={styles.successMessage}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className={styles.successIcon}>
                      <FiCheck />
                    </div>
                    <h3>Thank You!</h3>
                    <p>
                      We've received your request and will contact you within 30
                      minutes
                    </p>
                    <motion.button
                      className={styles.successButton}
                      onClick={() => setIsSubmitted(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Submit Another Request
                    </motion.button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                      >
                        <input
                          type="text"
                          name="name"
                          placeholder="Your Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className={styles.formInput}
                        />
                      </motion.div>
                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                      >
                        <input
                          type="email"
                          name="email"
                          placeholder="Your Email Address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={styles.formInput}
                        />
                      </motion.div>
                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className={styles.formInput}
                        />
                      </motion.div>
                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                      >
                        <select
                          name="serviceCategory"
                          value={formData.serviceCategory}
                          onChange={handleChange}
                          required
                          className={styles.formInput}
                        >
                          <option value="">Select Service Category</option>
                          {serviceCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.title}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    </div>
                    <motion.div
                      className={styles.formGroup}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 }}
                    >
                      <textarea
                        name="message"
                        placeholder="Tell us about your specific requirements..."
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        className={styles.formTextarea}
                      ></textarea>
                    </motion.div>
                    <motion.button
                      type="submit"
                      className={styles.submitButton}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiSend className={styles.buttonIcon} />
                      Submit Request
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default ServiceDetail;
