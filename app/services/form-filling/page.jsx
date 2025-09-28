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
      function runtime() {
        setSuccessful("Data will be submit"), clearTimeout();
        setError("");
      }
      runtime();
      setTimeout(() => {
        setSuccessful("");
      }, 4000);
    } else {
      setTimeout(setError("Server Error"));
    }
  };

  const serviceCategories = [
    {
      id: "exams",
      title: "Exams",
      services: [
        "SSC Exams",
        "UPSC Forms",
        "Railway Recruitment",
        "Banking Exams",
      ],
      icon: <FaUniversity />,
      color: "#e1e7f3ff",
      gradient: "linear-gradient(135deg, #3d5b9bff, #3b82f6)",
    },
    {
      id: "education",
      title: "Education",
      services: [
        "University Admissions",
        "Scholarships",
        "College Forms",
        "Exam Registrations",
      ],
      icon: <FaGraduationCap />,
      color: "#059669",
      gradient: "linear-gradient(135deg, #059669, #10b981)",
    },
    {
      id: "banking",
      title: "Banking & Finance",
      services: [
        "Bank Accounts",
        "Loan Applications",
        "Insurance",
        "Investment Forms",
      ],
      icon: <FaPiggyBank />,
      color: "#dc2626",
      gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
    },
    {
      id: "travel",
      title: "Travel & Visa",
      services: [
        "Visa Applications",
        "Passport Help",
        "Travel Insurance",
        "Hotel Bookings",
      ],
      icon: <FaPlane />,
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    },
    {
      id: "business",
      title: "Business",
      services: [
        "GST Registration",
        "Company Incorporation",
        "MSME Registration",
        "Licenses",
      ],
      icon: <FaBusinessTime />,
      color: "#ea580c",
      gradient: "linear-gradient(135deg, #ea580c, #f97316)",
    },
    {
      id: "government-schemes",
      title: "Govt Schemes",
      services: ["Ayushman Bharat", "PM Kisan", "Ujjwala", "Pension Schemes"],
      icon: <FaHandHoldingHeart />,
      color: "#db2777",
      gradient: "linear-gradient(135deg, #db2777, #ec4899)",
    },
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const pulse = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  return (
    <>
      <Head>
        <title>Professional Form Filling Services | Aroliya</title>
        <meta
          name="description"
          content="Expert form filling services for all your needs. 100% accuracy guaranteed. Affordable pricing starting at ₹99."
        />
      </Head>

      <Nav />

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}></div>
          <motion.div
            className={styles.heroContent}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className={styles.heroText}>
              <motion.span
                className={styles.badge}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <FiStar /> Most Trusted Service
              </motion.span>

              <motion.h1 variants={fadeInUp}>
                Professional{" "}
                <span className={styles.gradientText}>Form Filling</span>{" "}
                Services
              </motion.h1>

              <motion.p variants={fadeInUp}>
                Save time and avoid errors with our expert form filling
                services. From exams to business registrations, we handle it all
                with 100% accuracy.
              </motion.p>

              <motion.div variants={fadeInUp} className={styles.heroStats}>
                <div className={styles.stat}>
                  <strong>10,000+</strong>
                  <span>Forms Filled</span>
                </div>
                <div className={styles.stat}>
                  <strong>99.8%</strong>
                  <span>Success Rate</span>
                </div>
                <div className={styles.stat}>
                  <strong>24/7</strong>
                  <span>Support</span>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className={styles.ctaButtons}>
                <Link href="/login">
                  {" "}
                 <button className={styles.primaryBtn}>
                    Get Started <FiArrowRight />
                  </button>
                </Link>
                <a href="tel:9870519002">
                  {" "}
                  <button
                    id={styles.secondBtns}
                    className={styles.secondaryBtn}
                  >
                    <FiPhone /> +91-9870519002
                  </button>
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.heroVisual}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Image src={formFilling} alt="err" />
            </motion.div>
          </motion.div>
        </section>

        {/* Services Section */}
        <section className={styles.services}>
          <div className={styles.sectionHeader}>
            <motion.span
              className={styles.sectionBadge}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Our Services
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Comprehensive Form Filling Solutions
            </motion.h2>
          </div>

          <div className={styles.categoriesGrid}>
            {serviceCategories.map((category, index) => (
              <motion.div
                key={category.id}
                className={`${styles.categoryCard} ${
                  index === activeCategory ? styles.active : ""
                }`}
                onClick={() => setActiveCategory(index)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                style={{
                  background:
                    index === activeCategory ? category.gradient : undefined,
                }}
              >
                <div
                  className={styles.categoryIcon}
                  style={{ color: category.color }}
                >
                  {category.icon}
                </div>
                <h3>{category.title}</h3>
                <div className={styles.arrow}>
                  <FiArrowRight />
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className={styles.servicesDetails}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{serviceCategories[activeCategory].title}</h3>
              <div className={styles.servicesList}>
                {serviceCategories[activeCategory].services.map(
                  (service, idx) => (
                    <motion.div
                      key={idx}
                      className={styles.serviceItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <FiCheck />
                      {service}
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresBackground}></div>
          <div className={styles.sectionHeader}>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Why Choose Our Services?
            </motion.h2>
          </div>

          <div className={styles.featuresGrid}>
            {[
              {
                icon: <FiClock />,
                title: "Save Time",
                description: "Complete forms in minutes instead of hours",
              },
              {
                icon: <FiShield />,
                title: "100% Secure",
                description: "Your data is protected with bank-level security",
              },
              {
                icon: <FiCheck />,
                title: "Error-Free",
                description: "Triple-checked forms to avoid rejection",
              },
              {
                icon: <FiDollarSign />,
                title: "Affordable",
                description: "Starting at just ₹99 per form",
              },
              {
                icon: <FiUserCheck />,
                title: "Expert Help",
                description: "Experienced professionals handle your forms",
              },
              {
                icon: <FiSend />,
                title: "Fast Delivery",
                description: "Most forms completed within 24 hours",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of satisfied customers who trust us with their
              important forms
            </p>
            <div id={styles.seocondPageBtn} className={styles.ctaButtons}>
              <Link href="/contact">
                <button className={styles.secondaryBtn}>
                  <FiPhone /> Free Consultation
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section className={styles.contact}>
          <div className={styles.contactContainer}>
            <motion.div
              className={styles.contactInfo}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2>Get In Touch</h2>
              <p>We're here to help you with all your form filling needs</p>

              <div className={styles.contactItems}>
                <div className={styles.contactItem}>
                  <FiPhone />
                  <div>
                    <strong>Phone</strong>
                    <span>+91-9870519002</span>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <FiMail />
                  <div>
                    <strong>Email</strong>
                    <span>support@aroliya.com</span>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <FiClock />
                  <div>
                    <strong>Hours</strong>
                    <span>24/7 Support Available</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={styles.contactForm}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isSubmitted ? (
                <motion.div
                  className={styles.successMessage}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <FiCheck />
                  <h3>Thank You!</h3>
                  <p>We'll contact you within 30 minutes</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <select
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Service</option>
                      {serviceCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <textarea
                      name="message"
                      placeholder="Tell us about your requirements..."
                      value={formData.message}
                      onChange={handleChange}
                      rows="3"
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Request <FiSend />
                  </motion.button>
                  {successful && (
                    <div className={styles.animated}>
                      <p>
                        {" "}
                        <IoCheckmarkDone className={""} />
                      </p>
                      <p>{successful}</p>
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default ServiceDetail;
