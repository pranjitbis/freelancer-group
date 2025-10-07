"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import WhatsApp from "../../whatsapp_icon/page";
import {
  FaShoppingCart,
  FaMobile,
  FaChartLine,
  FaShieldAlt,
  FaCog,
  FaHeadset,
  FaRocket,
  FaLightbulb,
  FaBrain,
  FaPencilRuler,
  FaCode,
  FaCheckCircle,
  FaTruck,
  FaGlobe,
  FaUsers,
  FaMoneyBillAlt,
  FaHandsHelping,
  FaBox,
  FaBoxOpen,
  FaAd,
  FaStore,
  FaBuilding,
  FaAmazon,
  FaIndustry,
  FaChartBar,
} from "react-icons/fa";
import Link from "next/link";
import Footer from "@/app/home/footer/page";
import AOS from "aos";
import "aos/dist/aos.css";
import tick from "../../../public/icons/Mark-Tick.png";
import styles from "./EcommerceSolutions.module.css";
import Nav from "@/app/home/component/Nav/page";
import ecomarce from "../../../public/icons/ecommerce.gif";
import Image from "next/image";

const EcommerceSolutions = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

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
      price: "₹500/mo",
      features: [
        { text: "Unlimited Products & Categories", included: false },
        { text: "Secure SSL Certificate", included: true },
        { text: "Basic Customer Support (Email Only)", included: true },
        { text: "1 Admin Account Access", included: true },
        { text: "Pre-built Themes", included: true },
        { text: "Mobile-Responsive Design", included: true },
        { text: "Basic SEO Tools", included: false },
        { text: "Abandoned Cart Recovery", included: false },

        { text: "Inventory & Order Management", included: true },
        { text: "Automatic Backups", included: false },
      ],
      button: "Get Started",
      primary: false,
      link: "/register",
    },
    {
      name: "Business",
      price: "₹1,102/mo",
      features: [
        { text: "Unlimited Products & Categories", included: true },
        { text: "Secure SSL Certificate", included: true },
        { text: "Priority Support (Email & Chat)", included: true },
        { text: "Premium Store Themes", included: true },
        { text: "Mobile-Responsive Design", included: true },
        { text: "Advanced SEO Tools", included: true },
        { text: "Abandoned Cart Recovery", included: true },
        { text: "Up to 3 Admin Accounts", included: true },

        { text: "Automatic Backups (Daily)", included: false },
      ],
      button: "Get Started",
      primary: true,
      link: "/register",
    },
    {
      name: "Enterprise",
      price: "₹2,300/mo",
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
  const testimonials = [
    {
      text: "“Our sales grew 40% within 3 months after adopting their platform.”",
      author: "Sarah Johnson – Fashion Boutique",
    },
    {
      text: "“The analytics helped us understand our customers better and scale fast.”",
      author: "Michael Chen – Tech Gadgets",
    },
    {
      text: "“Fantastic support and user-friendly tools. Highly recommend this team!”",
      author: "Emily Rodriguez – Home Decor",
    },
    {
      text: "“They streamlined our e-commerce operations, saving us hours every week.”",
      author: "Rajesh Verma – Organic Store",
    },
    {
      text: "“Customer engagement increased significantly thanks to their tailored strategies.”",
      author: "Priya Nair – Beauty & Wellness",
    },
    {
      text: "“The automation features reduced our manual workload by 60%.”",
      author: "James Miller – Electronics Hub",
    },
    {
      text: "“Professional, responsive, and results-driven service. Couldn’t be happier!”",
      author: "Amit Shah – Bookstore Online",
    },
    {
      text: "“Helped us launch our first online store smoothly and professionally.”",
      author: "Sophia Williams – Handcrafted Goods",
    },
    {
      text: "“They turned complex data into clear insights that improved our decisions.”",
      author: "Daniel Kim – Food Delivery",
    },
    {
      text: "“Our repeat customers doubled within 6 months of using their solutions.”",
      author: "Ananya Gupta – Fashion Brand",
    },
    {
      text: "“Reliable and consistent support that keeps our business running smoothly.”",
      author: "Mohammed Ali – Travel Services",
    },
    {
      text: "“Creative marketing strategies brought us thousands of new customers.”",
      author: "Olivia Brown – Jewelry Store",
    },
    {
      text: "“Seamless integration with Amazon and Flipkart boosted our sales rapidly.”",
      author: "Vikram Singh – Electronics Retailer",
    },
    {
      text: "“User-friendly dashboards made managing operations a breeze.”",
      author: "Emma Davis – Fitness Equipment",
    },
    {
      text: "“They deliver results with professionalism and dedication every time.”",
      author: "Carlos Martinez – Furniture Store",
    },
    {
      text: "“Their customer service tools improved our response time drastically.”",
      author: "Meera Krishnan – Cosmetics Brand",
    },
    {
      text: "“Our brand visibility skyrocketed after their digital campaigns.”",
      author: "David Johnson – Sports Apparel",
    },
    {
      text: "“Great value for money and unmatched expertise in e-commerce.”",
      author: "Arjun Patel – Grocery Mart",
    },
    {
      text: "“They provided personalized solutions that fit our unique business needs.”",
      author: "Sophia Lee – Pet Supplies",
    },
    {
      text: "“We now manage orders and inventory effortlessly, thanks to their system.”",
      author: "Karan Mehta – Kitchen Essentials",
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
      title: "Product Catalog & Inventory Management",
      description:
        "Your products are the heart of your store. We make sure they shine.",
      features: [
        "High-quality product listing with engaging titles & SEO-rich descriptions",
        "Upload and management of product images, variants, and attributes",
        "Category structuring for easy navigation & better customer experience",
        "Real-time inventory updates to prevent overselling or stock-outs",
      ],
      platforms:
        "Amazon, Flipkart, Meesho, Shopify, WooCommerce, Magento, Custom Stores",
    },
    {
      icon: <FaTruck />,
      title: "Order Processing & Fulfillment",
      description:
        "Fast and error-free order processing builds trust with your customers.",
      features: [
        "Processing of customer orders from multiple channels",
        "Generating invoices, packing slips, and shipping labels",
        "Coordinating with courier partners for smooth dispatch",
        "Tracking shipments and ensuring timely delivery",
        "Managing returns, replacements, and refunds professionally",
      ],
    },
    {
      icon: <FaAd />,
      title: "Marketing & Sales Optimization",
      description:
        "Bring more visitors, convert them into buyers, and increase revenue.",
      features: [
        "SEO optimization of product pages for higher marketplace rankings",
        "Running Google Ads & Meta Ads campaigns for targeted sales",
        "Social media promotions & engagement to drive traffic",
        "Marketplace-specific promotions (Amazon ads, Flipkart Boost)",
        "A/B testing to improve product page conversions",
      ],
    },
    {
      icon: <FaHeadset />,
      title: "Customer Support Outsourcing",
      description: "Delight your customers with responsive support.",
      features: [
        "24/7 email, chat, and phone support",
        "Handling queries on orders, shipping, and returns",
        "Complaint resolution and customer satisfaction follow-ups",
        "Building loyalty with excellent after-sales support",
      ],
    },
    {
      icon: <FaChartBar />,
      title: "Analytics & Business Insights",
      description: "Make smarter decisions with data-driven strategies.",
      features: [
        "Sales and performance dashboards (Power BI, Tableau, Looker Studio)",
        "Weekly and monthly reports with KPIs",
        "Customer behavior analysis for cross-selling & upselling",
        "Predictive insights for future growth",
      ],
    },
    {
      icon: <FaBrain />,
      title: "Data & AI Solutions",
      description: "Leverage advanced AI to scale your business smarter.",
      features: [
        "Predictive analytics for sales trends",
        "AI-powered chatbots for instant support",
        "Intelligent inventory management",
        "Personalized recommendations for customers",
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
      title: "Established E-Commerce Businesses",
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
        "Robust, scalable solutions tailored for large enterprises to manage high-volume operations and maximize growth.",
      icon: <FaBuilding />,
    },
  ];

  return (
    <>
      <Head>
        <title>E-commerce Solutions | Grow Your Business</title>
        <meta
          name="description"
          content="High-quality e-commerce solutions with professional features, secure payments, expert support, and flexible pricing."
        />
      </Head>
      <Nav />
      <WhatsApp />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container} data-aos="fade-up">
          <div className={styles.heroText}>
            <h1>E-Commerce Solutions by Aroliya</h1>

            <p>
              Aroliya powers seamless e-commerce: build, manage, scale with
              complete solutions.
            </p>
            <div className={styles.heroBtns}>
              <Link href="/register">
                {" "}
                <button className={styles.btnPrimary}>Start Now</button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image src={ecomarce} alt="E-commerce solutions" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.sectionHead}>
          <h2>Our Comprehensive E-Commerce Services</h2>
          <p>
            Everything you need to build, manage, and grow your online store
          </p>
        </div>

        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard} data-aos="fade-up">
              <div className={styles.iconWrapper}>{service.icon}</div>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardDesc}>{service.description}</p>
              <ul className={styles.cardFeatures}>
                {service.features.map((feature, i) => (
                  <li key={i}>
                    <div className={styles.cardContnet}>
                      <Image src={tick} alt="err" />
                      <p>{feature}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {service.platforms && (
                <div className={styles.platforms}>
                  <strong>Platforms we support:</strong> {service.platforms}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section - Professional Card Design */}
      <section className={styles.benefits}>
        <div className={styles.sectionHead}>
          <h2>Why Choose Aroliya for Your E-Commerce Business?</h2>
          <p>
            We provide comprehensive solutions that drive growth and success for
            your online store
          </p>
        </div>
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={styles.benefitCard}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className={styles.benefitIcon}>{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.audience}>
        <div className={styles.sectionHead}>
          <h2>Who Can Benefit from Our Services?</h2>
          <p>
            Our solutions are designed for a variety of e-commerce businesses
          </p>
        </div>

        <div className={styles.audienceGrid}>
          {targetAudience.map((aud, index) => (
            <div key={index} className={styles.audienceCard} data-aos="fade-up">
              <div className={styles.iconWrapper}>{aud.icon}</div>
              <h3 className={styles.audienceTitle}>{aud.title}</h3>
              <p className={styles.audienceDesc}>{aud.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHead}>
          <h2>Platform Features</h2>
          <p>
            Comprehensive tools to manage, grow, and secure your online store.
          </p>
        </div>
        <div className={styles.grid}>
          {features.map((f, index) => (
            <div key={index} data-aos="zoom-in" className={styles.card}>
              <div className={styles.icon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing}>
        <div className={styles.sectionHead}>
          <h2>Pricing Plans</h2>
          <p>Flexible packages designed for every stage of your business.</p>
        </div>
        <div className={styles.grids}>
          {pricingPlans.map((plan, index) => (
            <div
              data-aos="zoom-out-up"
              key={index}
              className={`${styles.priceCard} ${
                plan.primary ? styles.recommended : ""
              }`}
            >
              <h3>{plan.name}</h3>
              <p className={styles.price}>{plan.price}</p>
              <Link href={plan.link}>
                <button
                  className={
                    plan.primary ? styles.btnPrimary : styles.btnSecondary
                  }
                >
                  {plan.button}
                </button>
              </Link>
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i} className={styles.featureItem}>
                    {feature.included ? (
                      <Image src={tick} alt="Included" />
                    ) : (
                      <span className={styles.crossIcon}>✖</span>
                    )}
                    <p> {feature.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHead}>
          <h2>What Clients Say</h2>
        </div>
        <div className={styles.slider}>
          <div className={styles.slideTrack}>
            {testimonials.map((t, index) => (
              <div key={index} className={styles.testimonial}>
                <p>{t.text}</p>
                <h4>{t.author}</h4>
              </div>
            ))}
            {/* Duplicate for infinite scroll loop */}
            {testimonials.map((t, index) => (
              <div key={`dup-${index}`} className={styles.testimonial}>
                <p>{t.text}</p>
                <h4>{t.author}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent} data-aos="fade-up">
          <h2>Get Started with Aroliya's E-Commerce Solutions</h2>
          <p>
            Don't let e-commerce management slow you down. Focus on growing your
            brand while we handle the back-end operations.
          </p>
          <p>
            <strong>Ready to scale your online business?</strong>
          </p>
          <Link href="/contact">
            {" "}
            <button className={styles.ctaButton}>
              Contact Us Now for a free consultation
            </button>
          </Link>
          <p className={styles.ctaSubtext}>
            We'll create a custom package tailored to your needs.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default EcommerceSolutions;
