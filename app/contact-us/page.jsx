"use client";
import { useState } from "react";
import styles from "./Contact.module.css";
import Head from "next/head";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaCheck,
  FaWhatsapp,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdEmail, MdSupportAgent, MdBusinessCenter } from "react-icons/md";
import { FcServices, FcBusinessContact } from "react-icons/fc";
import Image from "next/image";
import contactImage from "../../public/icons/contact.gif";
import Nav from "../home/component/Nav/page";
import Footer from "../home/footer/page";
import { motion } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          message: formData.message,
          type: "website_contact", // To distinguish from freelancer contact requests
          source: "website_contact_page",
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.success) {
        setIsSubmitted(true);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: "",
        });

        // Optional: Send to analytics or CRM
        console.log("Contact form submitted successfully:", data);
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    "Freelancing Services",
    "Travel Bookings",
    "AI Solutions",
    "Virtual Assistant",
    "Form Filling",
    "Data Visualization",
    "Other Services",
  ];

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

  return (
    <>
      <Head>
        <title>Contact Aroliya | Get Professional Solutions & Support</title>
        <meta
          name="description"
          content="Contact Aroliya for expert freelancing, travel booking, AI solutions, virtual assistant services, and professional form filling. Get in touch today!"
        />
        <meta
          name="keywords"
          content="contact Aroliya, freelancing services, travel booking, AI solutions, virtual assistant, form filling"
        />
      </Head>
      <Nav />

      <main className={styles.main}>
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
                  <FcBusinessContact className={styles.badgeIcon} />
                  Get In Touch
                </motion.div>

                <motion.h1 variants={fadeInUp}>
                  Let's Start Your{" "}
                  <span className={styles.gradientText}>Project</span> Together
                </motion.h1>

                <motion.p variants={fadeInUp}>
                  Ready to transform your ideas into reality? Contact our expert
                  team for professional freelancing services, travel solutions,
                  AI implementations, and comprehensive business support.
                </motion.p>

                <motion.div variants={fadeInUp} className={styles.heroStats}>
                  <div className={styles.statItem}>
                    <strong>24/7</strong>
                    <span>Support Available</span>
                  </div>
                  <div className={styles.statItem}>
                    <strong>1H</strong>
                    <span>Response Time</span>
                  </div>
                  <div className={styles.statItem}>
                    <strong>100%</strong>
                    <span>Client Satisfaction</span>
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
                    src={contactImage}
                    alt="Professional Contact - Aroliya Solutions"
                    className={styles.heroImage}
                    priority
                  />
                </div>
                <div className={styles.floatingElements}>
                  <div className={styles.floatingCard}>
                    <FaPhoneAlt className={styles.floatingIcon} />
                    <span>Instant Support</span>
                  </div>
                  <div className={styles.floatingCard}>
                    <MdSupportAgent className={styles.floatingIcon} />
                    <span>Expert Team</span>
                  </div>
                  <div className={styles.floatingCard}>
                    <FaCheck className={styles.floatingIcon} />
                    <span>Quality Guaranteed</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className={styles.contact}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Contact Us</span>
              <h2>Get Professional Solutions</h2>
              <p>
                Reach out to our expert team for comprehensive business
                solutions and support
              </p>
            </motion.div>

            <div className={styles.contactGrid}>
              {/* Contact Form */}
              <motion.div
                className={styles.contactForm}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.formHeader}>
                  <h3>Send us a Message</h3>
                  <p>
                    Fill out the form below and we'll get back to you within 1
                    hour
                  </p>
                </div>

                {error && (
                  <motion.div
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FaExclamationTriangle className={styles.errorIcon} />
                    <span>{error}</span>
                    <button
                      onClick={() => setError("")}
                      className={styles.errorClose}
                    >
                      ×
                    </button>
                  </motion.div>
                )}

                {isSubmitted ? (
                  <motion.div
                    className={styles.successMessage}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className={styles.successIcon}>
                      <FaCheck />
                    </div>
                    <h3>Thank You for Contacting Us!</h3>
                    <p>
                      We've received your message and will get back to you
                      within 1 hour.
                    </p>
                    <motion.button
                      className={styles.successButton}
                      onClick={() => setIsSubmitted(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                      >
                        <label htmlFor="name">
                          Full Name <span className={styles.required}>*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className={styles.formInput}
                          placeholder="Enter your full name"
                          disabled={isLoading}
                        />
                      </motion.div>

                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                      >
                        <label htmlFor="email">
                          Email Address{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={styles.formInput}
                          placeholder="Enter your email address"
                          disabled={isLoading}
                        />
                      </motion.div>
                    </div>

                    <div className={styles.formRow}>
                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                      >
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={styles.formInput}
                          placeholder="Enter your phone number"
                          disabled={isLoading}
                        />
                      </motion.div>

                      <motion.div
                        className={styles.formGroup}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                      >
                        <label htmlFor="service">
                          Service Interest{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          required
                          className={styles.formInput}
                          disabled={isLoading}
                        >
                          <option value="">Select a service</option>
                          {services.map((service, index) => (
                            <option key={index} value={service}>
                              {service}
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
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="message">
                        Project Details{" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className={styles.formTextarea}
                        placeholder="Tell us about your project requirements, timeline, and any specific needs..."
                        disabled={isLoading}
                      ></textarea>
                    </motion.div>

                    <motion.button
                      type="submit"
                      className={`${styles.submitButton} ${
                        isLoading ? styles.loading : ""
                      }`}
                      disabled={isLoading}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: isLoading ? 1 : 1.05 }}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    >
                      {isLoading ? (
                        <>
                          <div className={styles.loadingSpinner}></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message <FaArrowRight />
                        </>
                      )}
                    </motion.button>

                    <div className={styles.formFooter}>
                      <p>
                        <span className={styles.required}>*</span> Required
                        fields
                      </p>
                      <p>We respect your privacy and protect your data</p>
                    </div>
                  </form>
                )}
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className={styles.contactInfo}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className={styles.infoHeader}>
                  <h3>Contact Information</h3>
                  <p>Get in touch with our team through multiple channels</p>
                </div>

                <div className={styles.contactDetails}>
                  <motion.div
                    className={styles.contactItem}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.contactIcon}>
                      <FaPhoneAlt />
                    </div>
                    <div className={styles.contactText}>
                      <h4>Phone & WhatsApp</h4>
                      <p>+91 9870519002</p>
                      <span>Available 24/7 for urgent inquiries</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.contactItem}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.contactIcon}>
                      <MdEmail />
                    </div>
                    <div className={styles.contactText}>
                      <h4>Email Address</h4>
                      <p>info@aroliya.com</p>
                      <span>We respond within 1 hour</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.contactItem}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.contactIcon}>
                      <FaMapMarkerAlt />
                    </div>
                    <div className={styles.contactText}>
                      <h4>Office Location</h4>
                      <p>49 Qutuab Vihar, Dwarka Sec 19</p>
                      <p>110071, New Delhi, India</p>
                      <span>Visit us for face-to-face consultation</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.contactItem}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.contactIcon}>
                      <FaClock />
                    </div>
                    <div className={styles.contactText}>
                      <h4>Business Hours</h4>
                      <p>Monday - Sunday: 24/7</p>
                      <span>Emergency support available</span>
                    </div>
                  </motion.div>
                </div>

                {/* Social Links */}
                <div className={styles.socialSection}>
                  <h4>Follow Us</h4>
                  <div className={styles.socialLinks}>
                    <motion.a
                      href="https://wa.me/919870519002"
                      className={styles.socialLink}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp />
                    </motion.a>
                    <motion.a
                      href="https://linkedin.com/company/aroliya"
                      className={styles.socialLink}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaLinkedin />
                    </motion.a>
                    <motion.a
                      href="https://twitter.com/aroliya"
                      className={styles.socialLink}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTwitter />
                    </motion.a>
                    <motion.a
                      href="https://facebook.com/aroliya"
                      className={styles.socialLink}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFacebook />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
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
                Ready to Start Your Project?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Contact us today and let's discuss how we can help you achieve
                your business goals
              </motion.p>
              <motion.div
                className={styles.ctaButtons}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <a href="tel:+919870519002">
                  <motion.button
                    className={styles.primaryButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPhoneAlt /> Call Now
                  </motion.button>
                </a>
                <a href="mailto:info@aroliya.com">
                  <motion.button
                    className={styles.secondaryButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdEmail /> Send Email
                  </motion.button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
