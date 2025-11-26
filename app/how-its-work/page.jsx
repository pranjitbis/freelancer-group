"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Nav from "@/app/home/component/Nav/page";
import Footer from "@/app/home/footer/page";
import Link from "next/link";
import {
  FaUserPlus,
  FaSearch,
  FaFileAlt,
  FaComments,
  FaTasks,
  FaMoneyCheckAlt,
  FaStar,
  FaArrowRight,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaFilter,
  FaCheckCircle,
  FaRocket,
  FaChartLine,
} from "react-icons/fa";
import styles from "./HowItWorks.module.css";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("freelancers");

  const freelancerSteps = [
    {
      icon: FaUserPlus,
      step: "01",
      title: "Profile Setup",
      description:
        "Create a compelling profile that showcases your expertise and attracts clients.",
      details: [
        "Create an account on Aroliya",
        "Complete your profile thoroughly with professional photo",
        "Add skills, expertise, work experience and portfolio",
        "Set hourly rate or project rate",
        "Add certifications or projects to strengthen credibility",
      ],
    },
    {
      icon: FaSearch,
      step: "02",
      title: "Find Projects",
      description:
        "Discover opportunities that match your skills and preferences.",
      details: [
        "Browse the 'Find Work' or 'Projects' section",
        "Use filters: Category, Budget, Duration, Client ratings",
        "Shortlist projects that match your skill set",
      ],
    },
    {
      icon: FaFileAlt,
      step: "03",
      title: "Submit Proposals",
      description:
        "Craft winning proposals that stand out to potential clients.",
      details: [
        "Click Apply or Send Proposal",
        "Include personalized message to the client",
        "Provide estimated timeline and cost",
        "Add portfolio links or sample work",
        "Keep it concise and professional",
      ],
    },
    {
      icon: FaComments,
      step: "04",
      title: "Client Communication",
      description:
        "Establish clear communication and set project expectations.",
      details: [
        "Discuss scope, deadlines, and deliverables",
        "Clarify payment terms and milestones if applicable",
        "Use Aroliya's messaging system for transparency",
      ],
    },
    {
      icon: FaTasks,
      step: "05",
      title: "Project Execution",
      description:
        "Deliver quality work efficiently and maintain client satisfaction.",
      details: [
        "Deliver work as per agreed terms",
        "Use milestone-based delivery for large projects",
        "Break project into smaller tasks",
        "Get client approval per milestone",
      ],
    },
    {
      icon: FaMoneyCheckAlt,
      step: "06",
      title: "Payment Processing",
      description: "Get paid securely and reliably for your completed work.",
      details: [
        "Submit work for client approval upon completion",
        "Once approved, payment is released to your Aroliya account",
        "Withdraw money to bank, PayPal, or other supported methods",
      ],
    },
    {
      icon: FaStar,
      step: "07",
      title: "Feedback & Ratings",
      description: "Build your reputation and grow your freelancing career.",
      details: [
        "Request the client to leave a review",
        "Give feedback to the client if desired",
        "Build reputation to get more projects",
      ],
    },
  ];

  const clientSteps = [
    {
      icon: FaSearch,
      step: "01",
      title: "Post Project",
      description:
        "Create detailed project requirements to attract the right talent.",
      details: [
        "Define project scope and requirements",
        "Set budget and timeline expectations",
        "Choose required skills and expertise",
      ],
    },
    {
      icon: FaFilter,
      step: "02",
      title: "Review Proposals",
      description: "Evaluate freelancer proposals and select the best match.",
      details: [
        "Browse through submitted proposals",
        "Compare freelancer profiles and portfolios",
        "Shortlist candidates for interviews",
      ],
    },
    {
      icon: FaCheckCircle,
      step: "03",
      title: "Hire & Collaborate",
      description: "Start working with your chosen freelancer seamlessly.",
      details: [
        "Finalize contract terms",
        "Set up project milestones",
        "Establish communication channels",
      ],
    },
  ];

  const tips = [
    {
      icon: FaChartLine,
      title: "High Response Rate",
      description:
        "Keep your response rate high for better visibility and more opportunities.",
    },
    {
      icon: FaUsers,
      title: "Portfolio Updates",
      description:
        "Update your portfolio regularly with your latest and best work samples.",
    },
    {
      icon: FaRocket,
      title: "Start Small",
      description:
        "Begin with smaller projects to build ratings and credibility quickly.",
    },
    {
      icon: FaComments,
      title: "Professional Communication",
      description:
        "Be professional and communicative; your reputation matters most.",
    },
  ];

  const features = [
    {
      icon: FaShieldAlt,
      title: "Secure Payments",
      description:
        "Protected transactions with escrow protection and secure payment processing",
    },
    {
      icon: FaClock,
      title: "24/7 Support",
      description:
        "Round-the-clock customer support for all your platform needs",
    },
    {
      icon: FaUsers,
      title: "Global Community",
      description: "Join thousands of professionals and clients worldwide",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const stepVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Safe icon renderer component
  const IconRenderer = ({ icon: IconComponent, className }) => {
    if (!IconComponent || typeof IconComponent === "undefined") {
      return <FaUsers className={className} />; // Fallback icon
    }
    return <IconComponent className={className} />;
  };

  const currentSteps =
    activeTab === "freelancers" ? freelancerSteps : clientSteps;

  return (
    <>
      <div className={styles.container}>
        <Nav />
        {/* Header Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={styles.heroTitle}
            >
              How Aroliya Works
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={styles.heroSubtitle}
            >
              Your complete guide to succeeding as a freelancer on our platform.
              Follow these proven steps to build your career and grow your
              business.
            </motion.p>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className={styles.tabSection}>
          <div className={styles.tabContainer}>
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "freelancers" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("freelancers")}
              >
                For Freelancers
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "clients" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("clients")}
              >
                For Clients
              </button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className={styles.stepsSection}>
          <div className={styles.stepsContainer}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={
                activeTab === "clients"
                  ? styles.stepsGridBhai
                  : styles.stepsGrid
              }
              data-item-count={currentSteps.length}
            >
              {currentSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  variants={stepVariants}
                  className={styles.stepCard}
                >
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIconContainer}>
                      <IconRenderer
                        icon={step.icon}
                        className={styles.stepIcon}
                      />
                      <span className={styles.stepNumber}>{step.step}</span>
                    </div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>

                  <ul className={styles.featuresList}>
                    {step.details.map((detail, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1 }}
                        className={styles.featureItem}
                      >
                        <FaArrowRight className={styles.featureIcon} />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>

                  <div className={styles.connector}>
                    {index < currentSteps.length - 1 && (
                      <motion.div
                        className={styles.connectorLine}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Tips Section for Freelancers */}
        {activeTab === "freelancers" && (
          <section className={styles.tipsSection}>
            <div className={styles.tipsContainer}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={styles.tipsHeader}
              >
                <h2 className={styles.tipsTitle}>Pro Tips for Success</h2>
                <p className={styles.tipsSubtitle}>
                  Maximize your success on Aroliya with these expert
                  recommendations
                </p>
              </motion.div>

              <div className={styles.tipsGrid}>
                {tips.map((tip, index) => (
                  <motion.div
                    key={tip.title}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className={styles.tipCard}
                  >
                    <div className={styles.tipIconWrapper}>
                      <IconRenderer
                        icon={tip.icon}
                        className={styles.tipIcon}
                      />
                    </div>
                    <h3 className={styles.tipTitle}>{tip.title}</h3>
                    <p className={styles.tipDescription}>{tip.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresContainer}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={styles.featuresHeader}
            >
              <h2 className={styles.featuresTitle}>Why Choose Aroliya</h2>
              <p className={styles.featuresSubtitle}>
                Experience the difference with our comprehensive freelancing
                solution
              </p>
            </motion.div>

            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={styles.featureCard}
                >
                  <div className={styles.featureIconWrapper}>
                    <IconRenderer
                      icon={feature.icon}
                      className={styles.featureMainIcon}
                    />
                  </div>
                  <h3 className={styles.featureCardTitle}>{feature.title}</h3>
                  <p className={styles.featureCardDescription}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={styles.ctaContainer}
          >
            <h2 className={styles.ctaTitle}>
              {activeTab === "freelancers"
                ? "Ready to Start Your Freelance Journey?"
                : "Ready to Find Perfect Talent?"}
            </h2>
            <p className={styles.ctaDescription}>
              {activeTab === "freelancers"
                ? "Join thousands of successful freelancers on Aroliya and take control of your career today."
                : "Connect with top freelancers and get your projects completed efficiently and professionally."}
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register?userType=user">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles.ctaButtonPrimary}
                >
                  Register Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HowItWorks;
