import React from "react";
import styles from "./Services.module.css";
import Image from "next/image";
import {
  FaCheck,
  FaArrowRight,
  FaUserTie,
  FaFileAlt,
  FaHeadset,
  FaShoppingCart,
  FaPlane,
  FaChartLine,
  FaStar,
  FaClock,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";
import { MdDataExploration } from "react-icons/md";
import Link from "next/link";
const Services = () => {
  const services = [
    {
      icon: <FaUserTie />,
      title: "Freelancer Services",
      description:
        "Premium platform connecting skilled professionals with quality projects",
      features: [
        "Access verified client projects",
        "Work across diverse categories",
        "Build long-term client relationships",
        "Secure, on-time payments",
      ],
      buttonText: "Join Platform",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      link: "/services/freelancer",
      stat: "5K+ Freelancers",
    },
    {
      icon: <FaFileAlt />,
      title: "Online Form Filling",
      description: "Precision form submission with 99.8% accuracy guarantee",
      features: [
        "Government Exam & Job Applications",
        "Education & Admission Forms",
        "Banking & Financial Forms",
        "Travel & Visa Applications",
      ],
      link: "/services/form-filling",
      buttonText: "Start Submission",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      stat: "10K+ Forms",
    },
    {
      icon: <FaHeadset />,
      title: "Virtual Assistant",
      description:
        "Dedicated professional support for administrative excellence",
      features: [
        "Calendar management & scheduling",
        "Email management & correspondence",
        "Document preparation & formatting",
        "Data organization & entry",
      ],
      link: "/services/virtual-assistance",
      buttonText: "Hire Assistant",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      stat: "24/7 Support",
    },
    {
      icon: <FaShoppingCart />,
      title: "E-Commerce Solutions",
      description: "End-to-end e-commerce management for business growth",
      features: [
        "Product catalog management",
        "Inventory & order processing",
        "Digital marketing strategies",
        "Customer support solutions",
      ],
      link: "/services/e-commerce-solutions",
      buttonText: "Boost Sales",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      stat: "500+ Stores",
    },
    {
      icon: <FaPlane />,
      title: "Travel & Hotel Booking",
      description: "Seamless travel experiences with exclusive deals",
      features: [
        "Domestic & international flights",
        "Train tickets with real-time updates",
        "Verified transportation partners",
        "Premium accommodation options",
      ],
      link: "/services/travel-bookings",
      buttonText: "Plan Journey",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      stat: "5K+ Travelers",
    },
    {
      icon: <MdDataExploration />,
      title: "Data & AI Solutions",
      description: "Transform data into strategic business intelligence",
      features: [
        "Interactive dashboard development",
        "Custom data visualization",
        "AI-powered analytics",
        "Business intelligence reporting",
      ],
      link: "/services/data-visualization",
      buttonText: "Get Insights",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      stat: "AI Powered",
    },
  ];

  return (
    <section className={styles.services} id="services">
      <div className={styles.backgroundPattern}></div>

      <div className={styles.container}>
        <h2 className={styles.sectionHeading}>Our Services</h2>
        <p className={styles.sectionDescription}>
          We provide tailored solutions designed to help businesses grow
          efficiently. From innovative web development to enterprise-grade
          solutions, our services are crafted to optimize your operations,
          enhance productivity, and deliver measurable results.
        </p>

        {/* Services Grid */}
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div
              key={index}
              className={styles.serviceCard}
              style={{ "--card-gradient": service.gradient }}
            >
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div
                  className={styles.serviceIcon}
                  style={{ background: service.gradient }}
                >
                  {service.icon}
                </div>
                <div className={styles.serviceStat}>{service.stat}</div>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>

                <div className={styles.featuresSection}>
                  <h4 className={styles.featuresTitle}>Key Features</h4>
                  <ul className={styles.featuresList}>
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className={styles.featureItem}>
                        <span className={styles.featureCheck}>
                          <FaCheck />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.cardFooter}>
                  <Link
                    href={service.link || "#"}
                    className={styles.serviceLink}
                  >
                    <button className={styles.ctaButton}>
                      <span>{service.buttonText}</span>
                      <FaArrowRight className={styles.ctaIcon} />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Hover Effect */}
              <div className={styles.cardHoverEffect}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
