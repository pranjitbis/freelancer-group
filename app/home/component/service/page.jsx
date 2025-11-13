import React from "react";
import styles from "./Services.module.css";
import Image from "next/image";
import { FaCheck, FaArrowRight } from "react-icons/fa";
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
      stat: "5K+ Freelancers",
      link: "/register?userType=freelancer",
    },
    {
      image: "/icons/online-form-filling.png",
      title: "Online Form Filling",
      features: [
        "Exam & Job Applications",
        "Education & Admission Forms",
        "Banking & Financial Forms",
        "Travel & Visa Applications",
      ],
      buttonText: "Start Submission",
      stat: "10K+ Forms",
      link: "/services/form-filling",
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
      buttonText: "Hire Assistant",
      stat: "24/7 Support",
      link: "/services/virtual-assistance",
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
      buttonText: "Boost Sales",
      stat: "500+ Stores",
      link: "/services/e-eommerce-solutions",
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
      buttonText: "Plan Journey",
      stat: "5K+ Travelers",
      link: "/services/travel-bookings",
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
      buttonText: "Get Insights",
      stat: "AI Powered",
      link: "/services/data-visualization",
    },
  ];

  return (
    <section className={styles.services} id="services">
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <h2 className={styles.title}>Our Services</h2>
          <p className={styles.subtitle}>
            Professional solutions designed to optimize operations and drive
            business growth
          </p>
        </div>

        {/* Services Grid */}
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              {/* Service Image - Larger size with high quality */}
              <div className={styles.imageContainer}>
                <Image
                  src={service.image}
                  alt={service.title}
                  width={140}
                  height={140}
                  className={styles.serviceImage}
                  quality={100}
                  priority={index < 3}
                  unoptimized={true} // Bypass Next.js optimization for original quality
                />
              </div>

              {/* Service Content */}
              <div className={styles.content}>
                <div className={styles.headerSection}>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <span className={styles.serviceStat}>{service.stat}</span>
                </div>

                <ul className={styles.featuresList}>
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={styles.featureItem}>
                      <FaCheck className={styles.checkIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={service.link || "#"} className={styles.serviceLink}>
                  <button className={styles.ctaButton}>
                    {service.buttonText}
                    <FaArrowRight className={styles.arrowIcon} />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
