"use client";
import { useState, useEffect } from "react";
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
import WhatsApp from '../../whatsapp_icon/page'
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
  const [error, setError] = useState("");
  const [successful, setSuccessful] = useState("");

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
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  };

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(`.${styles.fadeInUp}`);
      elements.forEach((el) => {
        const position = el.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.85) {
          el.classList.add(styles.visible);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessful("");
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
      setError("Failed to submit form. Please try again.");
    }
  };

  const services = [
    {
      id: "administrative",
      title: "Administrative Support",
      icon: WebOne,
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
      icon: CreativeServices,
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
      icon: technical,
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
    {
      id: "marketing",
      title: "Marketing Assistance",
      icon: Marketing,
      description: "Strategic marketing support to grow your business",
      features: [
        "Market Research",
        "Campaign Management",
        "Email Marketing",
        "CRM Management",
        "Analytics Reporting",
        "Lead Generation",
      ],
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$299",
      period: "month",
      description: "Perfect for small businesses and startups",
      features: [
        "10 hours of support per month",
        "Email & calendar management",
        "Basic data entry tasks",
        "Up to 3 social media posts weekly",
        "Email support",
        "Priority email & chat support",
        "24/7 priority support",
      ],
      recommended: false,
    },
    {
      name: "Professional",
      price: "$599",
      period: "month",
      description: "Ideal for growing businesses",
      features: [
        "20 hours of support per month",
        "All Starter features",
        "Content creation",
        "Social media management",
        "Basic graphic design",
        "Priority email & chat support",
        "24/7 priority support",
      ],
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "$999",
      period: "month",
      description: "For businesses needing comprehensive support",
      features: [
        "40 hours of support per month",
        "All Professional features",
        "Website maintenance",
        "SEO optimization",
        "Market research",
        "Dedicated account manager",
        "24/7 priority support",
      ],
      recommended: false,
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Consultation",
      description: "We discuss your needs and requirements",
    },
    {
      step: 2,
      title: "Matching",
      description: "We match you with the perfect virtual assistant",
    },
    {
      step: 3,
      title: "Onboarding",
      description: "We set up systems and processes for collaboration",
    },
    {
      step: 4,
      title: "Execution",
      description: "Your virtual assistant starts delivering value",
    },
  ];

  return (
    <>
      <Head>
        <title>
          Professional Virtual Assistance Services | Your Business Support
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
            <motion.h1
              className={styles.heroTitle}
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
            >
              Professional Virtual Assistance Services
            </motion.h1>
            <motion.p
              className={styles.heroDescription}
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Scale your business with expert virtual assistants handling
              administrative, creative, technical, and marketing tasks.
            </motion.p>
            <motion.div
              className={styles.heroCta}
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/register" className={styles.ctaButton}>
                Get Started Today
              </Link>
              <a href="#service">
                <button className={styles.secondaryButton}>
                  View Services
                </button>
              </a>
            </motion.div>
          </div>
          <motion.div
            className={styles.graphicElement}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Image src={Assistance} alt="Virtual Assistance" priority />
          </motion.div>
        </section>

        {/* Services Section */}
        <section className={styles.services}>
          <div className={styles.sectionHeader}>
            <motion.h2
              className={styles.sectionTitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              id="service"
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
              Comprehensive support for all your business needs
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
                className={`${styles.serviceCard} ${styles.fadeInUp}`}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                onMouseEnter={() => setActiveService(index)}
              >
                <div className={styles.serviceIcon}>
                  <Image src={service.icon} alt={service.title} />
                </div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
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
                    >
                      <div className={styles.TickMark}>
                        <Image src={TickMark} alt="✓" />
                        <p>{feature}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <Link href="/register" className={styles.serviceButton}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How It Works */}
        <section className={styles.process}>
          <div className={styles.sectionHeader}>
            <motion.h2
              className={styles.sectionTitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              How Our Service Works
            </motion.h2>
            <motion.p
              className={styles.sectionSubtitle}
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Simple process to get you started with your virtual assistant
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
                className={`${styles.processStep} ${styles.fadeInUp}`}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className={styles.stepNumber}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
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
              Choose the plan that works best for your business needs
            </motion.p>
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
                className={`${styles.planCard} ${styles.fadeInUp} ${
                  plan.recommended ? styles.recommended : ""
                }`}
                variants={scaleIn}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {plan.recommended && (
                  <motion.div
                    className={styles.recommendedBadge}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Most Popular
                  </motion.div>
                )}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.price}>{plan.price}</span>
                  <span className={styles.period}>/{plan.period}</span>
                </div>
                <p className={styles.planDescription}>{plan.description}</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className={styles.planFeature}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className={styles.TickMark}>
                        <Image src={TickMark} alt="✓" />
                        {feature}
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={
                    plan.recommended
                      ? styles.primaryButton
                      : styles.secondaryButton
                  }
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Contact Form */}
        <section className={styles.contact}>
          <div className={styles.contactContainer}>
            <div className={styles.contactContent}>
              <motion.h2
                className={styles.contactTitle}
                initial="initial"
                whileInView="animate"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p
                className={styles.contactDescription}
                initial="initial"
                whileInView="animate"
                variants={fadeInUp}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Fill out the form and our team will contact you to discuss your
                virtual assistance needs
              </motion.p>

              {isSubmitted ? (
                <motion.div
                  className={styles.successMessage}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3>Thank You!</h3>
                  <p>
                    Your inquiry has been received. We'll contact you shortly to
                    discuss your virtual assistance needs.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  className={styles.contactForm}
                  onSubmit={handleSubmit}
                  initial="initial"
                  whileInView="animate"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                >
                  <div className={styles.formRow}>
                    <motion.div
                      className={styles.formGroup}
                      variants={fadeInUp}
                    >
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>
                    <motion.div
                      className={styles.formGroup}
                      variants={fadeInUp}
                      transition={{ delay: 0.1 }}
                    >
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>
                  </div>

                  <div className={styles.formRow}>
                    <motion.div
                      className={styles.formGroup}
                      variants={fadeInUp}
                      transition={{ delay: 0.2 }}
                    >
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </motion.div>
                    <motion.div
                      className={styles.formGroup}
                      variants={fadeInUp}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="service">Service Interest *</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a service</option>
                        <option value="administrative">
                          Administrative Support
                        </option>
                        <option value="creative">Creative Services</option>
                        <option value="technical">Technical Support</option>
                        <option value="marketing">Marketing Assistance</option>
                      </select>
                    </motion.div>
                  </div>

                  <motion.div
                    className={styles.formGroup}
                    variants={fadeInUp}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="message">Your Requirements *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className={styles.submitButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Now
                  </motion.button>
                </motion.form>
              )}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default VirtualAssistance;
