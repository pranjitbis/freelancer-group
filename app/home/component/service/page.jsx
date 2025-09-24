import React from "react";
import styles from "./Services.module.css";
import Image from "next/image";
import { FaCheck, FaArrowRight, FaRocket, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";

const Services = () => {
  const services = [
    {
      image: "/icons/freelancer-3d.png",
      title: "Freelancer Services",
      features: [
        "Access verified client projects",
        "Work across diverse categories",
        "Build long-term client relationships",
        "Secure, on-time payments",
      ],
      buttonText: "Join Platform",
      color: "#2c3e50",
      link: "/services/freelancer",
      stat: "5K+ Freelancers",
    },
    {
      image: "/icons/online-form-filling.png",
      title: "Online Form Filling",
      features: [
        "Government Exam & Job Applications",
        "Education & Admission Forms",
        "Banking & Financial Forms",
        "Travel & Visa Applications",
      ],
      link: "/services/form-filling",
      buttonText: "Start Submission",
      color: "#8e44ad",
      stat: "10K+ Forms",
    },
    {
      image: "/icons/virtual-assistant.png",
      title: "Virtual Assistant",
      features: [
        "Calendar management & scheduling",
        "Email management & correspondence",
        "Document preparation & formatting",
        "Data organization & entry",
      ],
      link: "/services/virtual-assistance",
      buttonText: "Hire Assistant",
      color: "#16a085",
      stat: "24/7 Support",
    },
    {
      image: "/icons/Ecommerce.png",
      title: "E-Commerce Solutions",
      features: [
        "Product catalog management",
        "Inventory & order processing",
        "Digital marketing strategies",
        "Customer support solutions",
      ],
      link: "/services/e-commerce-solutions",
      buttonText: "Boost Sales",
      color: "#e74c3c",
      stat: "500+ Stores",
    },
    {
      image: "/icons/travel-bookings1.jpg",
      title: "Travel & Hotel Booking",
      features: [
        "Domestic & international flights",
        "Train tickets with real-time updates",
        "Verified transportation partners",
        "Premium accommodation options",
      ],
      link: "/services/travel-bookings",
      buttonText: "Plan Journey",
      color: "#2980b9",
      stat: "5K+ Travelers",
    },
    {
      image: "/icons/data-visualization.png",
      title: "Data & AI Solutions",
      features: [
        "Interactive dashboard development",
        "Custom data visualization",
        "AI-powered analytics",
        "Business intelligence reporting",
      ],
      link: "/services/data-visualization",
      buttonText: "Get Insights",
      color: "#34495e",
      stat: "AI Powered",
    },
  ];

  return (
    <section className={styles.services} id="services">
      <div className={styles.backgroundPattern}></div>

      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.sectionBadge}>
            <FaRocket className={styles.badgeIcon} />
            Premium Solutions
          </div>

          <h1 className={styles.mainTitle}>
            Enterprise-Grade{" "}
            <span className={styles.titleHighlight}>Services</span>
          </h1>

          <p className={styles.subtitle}>
            Professional solutions designed to optimize operations, enhance
            productivity, and drive measurable business growth through expert
            service delivery.
          </p>
        </div>

        {/* Services Grid */}
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div
              key={index}
              className={styles.serviceCard}
              style={{ "--card-color": service.color }}
            >
              {/* Card Header with Image */}
              <div className={styles.cardHeader}>
                <div className={styles.imageContainer}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={120}
                    height={120}
                    className={styles.serviceImage}
                  />
                </div>
                <div className={styles.serviceStat}>{service.stat}</div>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>

                <div className={styles.featuresSection}>
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
