"use client";
import { useState, useEffect } from "react";
import styles from "./ClientServices.module.css";
import {
  FaCheck,
  FaStar,
  FaUsers,
  FaRocket,
  FaMinus,
  FaCrown,
  FaLaptop,
  FaGlobe,
  FaChartLine,
  FaLightbulb,
  FaComments,
  FaGraduationCap,
  FaSearch,
  FaShieldAlt,
  FaAward,
  FaCalendarAlt,
  FaPlus,
  FaBookOpen,
  FaArrowRight,
  FaTimesCircle,
  FaPlay,
  FaRegCheckCircle,
  FaRegGem,
  FaBriefcase,
  FaHandshake,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import Nav from "../../../home/component/Nav/page";
import Footer from "@/app/home/footer/page";

const ClientServices = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const plans = [
    {
      name: "Starter",
      price: "₹0",
      period: "forever",
      bestFor: "Perfect for small projects and one-time tasks",
      features: [
        {
          key: "postProjects",
          name: "Post unlimited projects",
          included: true,
          detail: "",
        },
        {
          key: "browseFreelancers",
          name: "Browse freelancer profiles",
          included: true,
          detail: "",
        },
        {
          key: "receiveProposals",
          name: "Receive proposals from freelancers",
          included: true,
          detail: "Up to 20 proposals per project",
        },
        {
          key: "basicMessaging",
          name: "Basic messaging system",
          included: true,
          detail: "",
        },
        {
          key: "paymentProtection",
          name: "Secure payment protection",
          included: true,
          detail: "",
        },
        {
          key: "projectManagement",
          name: "Basic project management tools",
          included: true,
          detail: "",
        },
        {
          key: "emailSupport",
          name: "Standard email support",
          included: true,
          detail: "",
        },
        {
          key: "talentMatching",
          name: "AI-powered talent matching",
          included: false,
          detail: "",
        },
        {
          key: "premiumFreelancers",
          name: "Access to premium freelancers",
          included: false,
          detail: "",
        },
        {
          key: "dedicatedManager",
          name: "Dedicated account manager",
          included: false,
          detail: "",
        },
        {
          key: "advancedAnalytics",
          name: "Advanced project analytics",
          included: false,
          detail: "",
        },
        {
          key: "prioritySupport",
          name: "Priority 24/7 support",
          included: false,
          detail: "",
        },
        {
          key: "contractManagement",
          name: "Advanced contract management",
          included: false,
          detail: "",
        },
        {
          key: "bulkHiring",
          name: "Bulk hiring capabilities",
          included: false,
          detail: "",
        },
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonType: "primary",
      badge: "Free Forever",
    },
    {
      name: "Business",
      price: "₹499",
      period: "per month",
      bestFor: "Ideal for growing businesses with ongoing project needs",
      features: [
        {
          key: "postProjects",
          name: "Post unlimited projects",
          included: true,
          detail: "",
        },
        {
          key: "browseFreelancers",
          name: "Browse freelancer profiles",
          included: true,
          detail: "",
        },
        {
          key: "receiveProposals",
          name: "Receive proposals from freelancers",
          included: true,
          detail: "Unlimited proposals",
        },
        {
          key: "basicMessaging",
          name: "Advanced messaging system",
          included: true,
          detail: "",
        },
        {
          key: "paymentProtection",
          name: "Secure payment protection",
          included: true,
          detail: "",
        },
        {
          key: "projectManagement",
          name: "Advanced project management tools",
          included: true,
          detail: "",
        },
        {
          key: "emailSupport",
          name: "Priority email support",
          included: true,
          detail: "",
        },
        {
          key: "talentMatching",
          name: "AI-powered talent matching",
          included: true,
          detail: "",
        },
        {
          key: "premiumFreelancers",
          name: "Access to premium freelancers",
          included: true,
          detail: "",
        },
        {
          key: "dedicatedManager",
          name: "Dedicated account manager",
          included: true,
          detail: "",
        },
        {
          key: "advancedAnalytics",
          name: "Advanced project analytics",
          included: true,
          detail: "",
        },
        {
          key: "prioritySupport",
          name: "Priority 24/7 support",
          included: true,
          detail: "",
        },
        {
          key: "contractManagement",
          name: "Advanced contract management",
          included: true,
          detail: "",
        },
        {
          key: "bulkHiring",
          name: "Bulk hiring capabilities",
          included: true,
          detail: "",
        },
      ],
      popular: true,
      buttonText: "Start Business Plan",
      buttonType: "premium",
      badge: "Most Popular",
    },
  ];

  const features = [
    {
      icon: <FaSearch />,
      title: "Smart Talent Matching",
      description:
        "Our AI algorithm finds the perfect freelancers for your projects based on skills, experience, and project requirements.",
      color: "#8B5CF6",
    },
    {
      icon: <FaBriefcase />,
      title: "Project Management",
      description:
        "Complete tools to manage your projects, track progress, and collaborate seamlessly with your hired talent.",
      color: "#06B6D4",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Payments",
      description:
        "Escrow protection, milestone payments, and multiple payment options to ensure complete financial security.",
      color: "#10B981",
    },
    {
      icon: <FaHandshake />,
      title: "Quality Assurance",
      description:
        "Vetted freelancers, portfolio reviews, and quality checks to ensure you get top-notch work every time.",
      color: "#F59E0B",
    },
    {
      icon: <FaChartLine />,
      title: "Performance Analytics",
      description:
        "Track project progress, freelancer performance, and budget utilization with detailed insights and reports.",
      color: "#EF4444",
    },
    {
      icon: <FaUsers />,
      title: "Team Collaboration",
      description:
        "Invite team members, set permissions, and collaborate effectively on projects with built-in communication tools.",
      color: "#EC4899",
    },
  ];

  const testimonials = [
    {
      rating: 5,
      text: "Found the perfect developer for our startup in just 2 days. The quality of talent is exceptional!",
      author: "Rajesh Kumar",
      role: "Startup Founder",
      avatar: "RK",
      projects: 12,
    },
    {
      rating: 5,
      text: "Saved 40% on development costs while getting better quality work than local agencies.",
      author: "Priya Sharma",
      role: "Product Manager",
      avatar: "PS",
      projects: 25,
    },
    {
      rating: 5,
      text: "The project management tools made it so easy to coordinate with our remote team.",
      author: "Amit Patel",
      role: "IT Director",
      avatar: "AP",
      projects: 18,
    },
    {
      rating: 5,
      text: "Outsourced our entire design department to freelancers here. Best business decision ever!",
      author: "Neha Gupta",
      role: "Marketing Head",
      avatar: "NG",
      projects: 30,
    },
    {
      rating: 5,
      text: "Payment protection gave us peace of mind while working with new freelancers.",
      author: "Vikram Singh",
      role: "Business Owner",
      avatar: "VS",
      projects: 15,
    },
    {
      rating: 5,
      text: "The talent matching algorithm found specialists we didn't even know we needed.",
      author: "Sneha Reddy",
      role: "Project Lead",
      avatar: "SR",
      projects: 22,
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Clients" },
    { number: "50K+", label: "Projects Completed" },
    { number: "4.8/5", label: "Client Satisfaction" },
    { number: "95%", label: "Project Success Rate" },
  ];

  const faqs = [
    {
      question: "How quickly can I find and hire freelancers?",
      answer:
        "Most clients find suitable freelancers within 24-48 hours. With our Business plan, you get priority matching and can often find talent within hours.",
    },
    {
      question: "What's the difference between Free and Business plans?",
      answer:
        "The Free plan gives you basic access to post projects and browse freelancers, while Business unlocks AI talent matching, premium freelancers, dedicated support, and advanced project management tools.",
    },
    {
      question: "How do you ensure the quality of freelancers?",
      answer:
        "We have a rigorous vetting process including skill assessments, portfolio reviews, and client feedback. Only the top 30% of applicants are accepted onto our platform.",
    },
    {
      question: "Can I manage multiple projects and team members?",
      answer:
        "Yes! Our platform supports multiple projects, team collaboration, and role-based permissions. Business plan includes advanced team management features.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "All plans include email support. Business plan includes priority 24/7 support with a dedicated account manager for complex projects and bulk hiring needs.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer:
        "Yes! We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied with our service, we'll refund your first payment.",
    },
  ];

  return (
    <div>
      <Nav />
      <div className={`${styles.container} ${isVisible ? styles.visible : ""}`}>
        {/* Modern Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroBadge}>
                <FaRocket className={styles.badgeIcon} />
                Trusted by 10,000+ Businesses Worldwide
              </div>
              <h1 className={styles.heroTitle}>
                Find Perfect Talent
                <span className={styles.gradientText}> for Your </span> 
                 Business Needs
              </h1>
              <p className={styles.heroDescription}>
                Access top-tier freelancers and agencies for all your project
                requirements. From quick tasks to long-term partnerships, we
                connect you with verified professionals who deliver exceptional
                results on time and within budget.
              </p>

              <div className={styles.heroStats}>
                {stats.map((stat, index) => (
                  <div key={index} className={styles.stat}>
                    <span className={styles.statNumber}>{stat.number}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className={styles.heroButtons}>
                <button className={styles.primaryButton}>
                  Post Your First Project
                  <FaArrowRight className={styles.buttonIcon} />
                </button>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.floatingCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardAvatar}>YC</div>
                  <div className={styles.cardInfo}>
                    <h4>Your Project</h4>
                    <span>Ready to start</span>
                  </div>
                  <div className={styles.verifiedBadge}>
                    <FaRegCheckCircle />
                  </div>
                </div>
                <div className={styles.cardStats}>
                  <div className={styles.statItem}>
                    <span>24h</span>
                    <span>Avg. Response</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>95%</span>
                    <span>Success Rate</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>50+</span>
                    <span>Experts Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2>Everything You Need to Manage Projects</h2>
            <p>
              Comprehensive tools and features designed to streamline your
              hiring process and project management
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div
                  className={styles.featureIcon}
                  style={{
                    backgroundColor: `${feature.color}15`,
                    borderColor: feature.color,
                  }}
                >
                  <div style={{ color: feature.color }}>{feature.icon}</div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className={styles.pricingSection}>
          <div className={styles.sectionHeader}>
            <h2>Choose Your Hiring Solution</h2>
            <p>
              Flexible plans that scale with your business. No hidden fees, no
              long-term contracts.
            </p>
          </div>

          <div className={styles.plansGrid}>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`${styles.planCard} ${
                  plan.popular ? styles.popular : ""
                }`}
              >
                {plan.badge && (
                  <div className={styles.planBadge}>{plan.badge}</div>
                )}
                <div className={styles.planHeader}>
                  <h3>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>/{plan.period}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.bestFor}</p>
                </div>

                <ul className={styles.featuresList}>
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={feature.included ? "" : styles.featureDisabled}
                    >
                      {feature.included ? (
                        <FaRegCheckCircle className={styles.featureCheck} />
                      ) : (
                        <FaTimesCircle className={styles.featureCheckas} />
                      )}
                      <span>
                        {feature.name}{" "}
                        {feature.detail && (
                          <span className={styles.featureDetail}>
                            ({feature.detail})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`${styles.planButton} ${
                    plan.buttonType === "premium"
                      ? styles.premium
                      : plan.buttonType === "secondary"
                      ? styles.secondary
                      : styles.primary
                  }`}
                >
                  {plan.buttonText}
                  <FaArrowRight className={styles.buttonIcon} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.testimonialsSection}>
          <div className={styles.sectionHeader}>
            <h2>What Our Clients Say</h2>
            <p>
              Discover how businesses like yours are achieving success with our
              platform
            </p>
          </div>

          <div className={styles.testimonialsSlider}>
            <div className={styles.sliderContainer}>
              <div className={styles.sliderTrack}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className={styles.testimonialSlide}>
                    <div className={styles.testimonialCard}>
                      <div className={styles.testimonialHeader}>
                        <div className={styles.avatar}>
                          {testimonial.avatar}
                        </div>
                        <div className={styles.authorInfo}>
                          <h4>{testimonial.author}</h4>
                          <span>{testimonial.role}</span>
                          <div className={styles.projectCount}>
                            {testimonial.projects} projects completed
                          </div>
                        </div>
                      </div>
                      <div className={styles.testimonialRating}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className={styles.starIcon} />
                        ))}
                      </div>
                      <p className={styles.testimonialText}>
                        "{testimonial.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2>Ready to Find Your Perfect Team?</h2>
              <p>
                Join thousands of businesses that have streamlined their hiring
                process and found exceptional talent through our platform.
              </p>
              <div className={styles.ctaButtons}>
                <button className={styles.ctaPrimary}>
                  Start Hiring Today
                  <FaArrowRight />
                </button>
                <button className={styles.ctaSecondary}>
                  Schedule Consultation
                </button>
              </div>
            </div>
            <div className={styles.ctaVisual}>
              <div className={styles.ctaStats}>
                <div className={styles.ctaStat}>
                  <span>48h</span>
                  <span>Average to hire</span>
                </div>
                <div className={styles.ctaStat}>
                  <span>40%</span>
                  <span>Cost savings</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <h2>Frequently Asked Questions</h2>
            <p>
              Everything you need to know about hiring and managing freelancers
            </p>
          </div>
          <div className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`${styles.faqItem} ${
                  activeIndex === index ? styles.active : ""
                }`}
              >
                <div
                  className={styles.faqQuestion}
                  onClick={() => toggleFAQ(index)}
                >
                  <h3>{faq.question}</h3>
                  <div className={styles.faqIcon}>
                    {activeIndex === index ? <FaMinus /> : <FaPlus />}
                  </div>
                </div>
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default ClientServices;