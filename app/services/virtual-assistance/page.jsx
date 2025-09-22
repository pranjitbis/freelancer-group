"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
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

  useEffect(() => {
    // Scroll animation effect
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
    handleScroll(); // Initial check

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
    const res = await fetch("/api/VirtualAssistance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( formData ),
    });

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
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={`${styles.heroTitle} ${styles.fadeInUp}`}>
              Professional Virtual Assistance Services
            </h1>
            <p className={`${styles.heroDescription} ${styles.fadeInUp}`}>
              Scale your business with expert virtual assistants handling
              administrative, creative, technical, and marketing tasks.
            </p>
            <div className={`${styles.heroCta} ${styles.fadeInUp}`}>
              <button className={styles.ctaButton}>Get Started</button>
              <button className={styles.secondaryButton}>View Services</button>
            </div>
          </div>
          <div className={styles.graphicElement}>
            <Image src={Assistance} alt="err" />
          </div>
        </section>

        {/* Services Section */}
        <section className={styles.services}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Our Virtual Assistance Services
            </h2>
            <p className={styles.sectionSubtitle}>
              Comprehensive support for all your business needs
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`${styles.serviceCard} ${styles.fadeInUp}`}
                onMouseEnter={() => setActiveService(index)}
              >
                <div className={styles.serviceIcon}>
                  <Image src={service.icon} alt="err" />
                </div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, i) => (
                    <li key={i} className={styles.serviceFeature}>
                      <div className={styles.TickMark}>
                        <Image src={TickMark} alt="err" />
                        <p>{feature}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className={styles.serviceButton}>See Price</button>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.process}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How Our Service Works</h2>
            <p className={styles.sectionSubtitle}>
              Simple process to get you started with your virtual assistant
            </p>
          </div>

          <div className={styles.processSteps}>
            {processSteps.map((step, index) => (
              <div
                key={index}
                className={`${styles.processStep} ${styles.fadeInUp}`}
              >
                <div className={styles.stepNumber}>{step.step}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className={styles.pricing}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Flexible Pricing Plans</h2>
            <p className={styles.sectionSubtitle}>
              Choose the plan that works best for your business needs
            </p>
          </div>

          <div className={styles.pricingPlans}>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`${styles.planCard} ${styles.fadeInUp} ${
                  plan.recommended ? styles.recommended : ""
                }`}
              >
                {plan.recommended && (
                  <div className={styles.recommendedBadge}>Most Popular</div>
                )}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.price}>{plan.price}</span>
                  <span className={styles.period}>/{plan.period}</span>
                </div>
                <p className={styles.planDescription}>{plan.description}</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className={styles.planFeature}>
                      <div className={styles.TickMark}>
                        <Image src={TickMark} alt="err" />
                        {feature}
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  className={
                    plan.recommended
                      ? styles.primaryButton
                      : styles.secondaryButton
                  }
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className={styles.contact}>
          <div className={styles.contactContainer}>
            <div className={styles.contactContent}>
              <h2 className={styles.contactTitle}>Ready to Get Started?</h2>
              <p className={styles.contactDescription}>
                Fill out the form and our team will contact you to discuss your
                virtual assistance needs
              </p>

              {isSubmitted ? (
                <div className={styles.successMessage}>
                  <h3>Thank You!</h3>
                  <p>
                    Your inquiry has been received. We'll contact you shortly to
                    discuss your virtual assistance needs.
                  </p>
                </div>
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
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="service">Service Interest *</label>
                      <select
                        id="service"
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
                    ></textarea>
                  </div>

                  <button type="submit" className={styles.submitButton}>
                    Get Started
                  </button>
                </form>
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
