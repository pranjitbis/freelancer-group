"use client";
import { useState, useEffect } from "react";
import styles from "./FreelancerHub.module.css";
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
} from "react-icons/fa";
import Nav from "../../../home/component/Nav/page.jsx";
import Footer from "@/app/home/footer/page";
const FreelancerHub = () => {
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
      bestFor: "Ideal for beginners starting their freelance career",
      features: [
        {
          key: "profileCreation",
          name: "Create a professional freelancer profile",
          included: true,
          detail: "",
        },
        {
          key: "browseProjects",
          name: "Explore and browse available projects",
          included: true,
          detail: "",
        },
        {
          key: "proposals",
          name: "Submit proposals",
          included: true,
          detail: "Up to 5 proposals / month",
        },
        {
          key: "portfolio",
          name: "Showcase your work with a basic portfolio",
          included: true,
          detail: "",
        },
        {
          key: "communityAccess",
          name: "Access the Freelancer Hub community",
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
          key: "searchVisibility",
          name: "Appear in basic client search results",
          included: true,
          detail: "",
        },
        {
          key: "directMessaging",
          name: "Direct client messaging",
          included: false,
          detail: "",
        },
        {
          key: "verifiedBadge",
          name: "Verified freelancer badge",
          included: false,
          detail: "",
        },
        {
          key: "prioritySearch",
          name: "Priority placement in client search results",
          included: false,
          detail: "",
        },
        {
          key: "advancedAnalytics",
          name: "Advanced analytics & performance insights",
          included: false,
          detail: "",
        },
        {
          key: "proposalTemplates",
          name: "Access to proposal templates",
          included: false,
          detail: "",
        },
        {
          key: "prioritySupport",
          name: "Priority support (faster response)",
          included: false,
          detail: "",
        },
        {
          key: "earlyAccess",
          name: "Early access to premium projects",
          included: false,
          detail: "",
        },
      ],
      connectsPerMonth: 20,
      contractTypes: ["Fixed-price", "Hourly"],
      canApplyPremiumJobs: false,
      popular: false,
      buttonText: "Start Free Journey",
      buttonType: "primary",
      badge: "Free Forever",
    },
    {
      name: "Pro",
      price: "₹199",
      period: "per month",
      bestFor: "Perfect for freelancers ready to grow and get noticed",
      features: [
        {
          key: "profileCreation",
          name: "Create a professional freelancer profile",
          included: true,
          detail: "",
        },
        {
          key: "browseProjects",
          name: "Explore and browse available projects",
          included: true,
          detail: "",
        },
        {
          key: "proposals",
          name: "Submit proposals",
          included: true,
          detail: "Unlimited proposals",
        },
        {
          key: "portfolio",
          name: "Showcase your work with an advanced portfolio",
          included: true,
          detail: "",
        },
        {
          key: "communityAccess",
          name: "Access the Freelancer Hub community",
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
          key: "searchVisibility",
          name: "Appear in basic client search results",
          included: true,
          detail: "",
        },
        {
          key: "directMessaging",
          name: "Direct client messaging",
          included: true,
          detail: "",
        },
        {
          key: "verifiedBadge",
          name: "Verified freelancer badge",
          included: true,
          detail: "",
        },
        {
          key: "prioritySearch",
          name: "Priority placement in client search results",
          included: true,
          detail: "",
        },
        {
          key: "advancedAnalytics",
          name: "Advanced analytics & performance insights",
          included: true,
          detail: "",
        },
        {
          key: "proposalTemplates",
          name: "Access to proposal templates",
          included: true,
          detail: "",
        },
        {
          key: "prioritySupport",
          name: "Priority support (faster response)",
          included: true,
          detail: "",
        },
        {
          key: "earlyAccess",
          name: "Early access to premium projects",
          included: true,
          detail: "",
        },
      ],
      canApplyPremiumJobs: true,
      popular: true,
      buttonText: "Upgrade to Pro",
      buttonType: "premium",
      badge: "Most Popular",
    },
  ];

  const features = [
    {
      icon: <FaSearch />,
      title: "Smart Project Matching",
      description:
        "AI-powered algorithm matches you with perfect projects based on your skills and preferences.",
      color: "#8B5CF6",
    },
    {
      icon: <FaChartLine />,
      title: "Growth Analytics",
      description:
        "Track your performance, earnings, and client satisfaction with detailed insights.",
      color: "#06B6D4",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Payments",
      description:
        "Escrow protection and multiple payment options ensure you get paid on time.",
      color: "#10B981",
    },
    {
      icon: <FaGlobe />,
      title: "Global Reach",
      description:
        "Connect with clients worldwide and expand your professional network globally.",
      color: "#F59E0B",
    },
    {
      icon: <FaUsers />,
      title: "Community Support",
      description:
        "Join thousands of freelancers in our active community forums and groups.",
      color: "#EF4444",
    },
    {
      icon: <FaAward />,
      title: "Skill Certification",
      description:
        "Get certified in your skills and stand out from the competition.",
      color: "#EC4899",
    },
  ];

  const testimonials = [
    {
      rating: 5,
      text: "Switching to the Professional plan skyrocketed my freelance career. Got multiple projects in the first month!",
      author: "Aarav Sharma",
      role: "Full-Stack Developer",
      avatar: "AS",
      projects: 50,
    },
    {
      rating: 5,
      text: "The analytics dashboard helped me identify high-paying clients. My income grew by 35%!",
      author: "Riya Kapoor",
      role: "UI/UX Designer",
      avatar: "RK",
      projects: 38,
    },
    {
      rating: 5,
      text: "Direct client access through Pro plan allowed me to build steady work relationships.",
      author: "Kabir Singh",
      role: "Content Strategist",
      avatar: "KS",
      projects: 30,
    },
    {
      rating: 5,
      text: "I love how easy it is to showcase my portfolio. Clients reach out proactively!",
      author: "Ananya Mehta",
      role: "Graphic Designer",
      avatar: "AM",
      projects: 22,
    },
    {
      rating: 5,
      text: "Freelancer Hub gave me exposure to premium projects I couldn’t get elsewhere.",
      author: "Vikram Reddy",
      role: "Web Developer",
      avatar: "VR",
      projects: 41,
    },
    {
      rating: 5,
      text: "Proposal templates saved me hours every week. Highly recommend!",
      author: "Sneha Joshi",
      role: "Digital Marketer",
      avatar: "SJ",
      projects: 35,
    },
    {
      rating: 5,
      text: "Verified freelancer badge increased client trust and helped me land bigger contracts.",
      author: "Aditya Kumar",
      role: "Software Engineer",
      avatar: "AK",
      projects: 28,
    },
    {
      rating: 5,
      text: "Unlimited proposals in Pro plan allowed me to apply for every project I liked.",
      author: "Pooja Nair",
      role: "UI/UX Designer",
      avatar: "PN",
      projects: 33,
    },
    {
      rating: 5,
      text: "The community support helped me learn new skills and grow my network.",
      author: "Rohan Gupta",
      role: "Full-Stack Developer",
      avatar: "RG",
      projects: 40,
    },
    {
      rating: 5,
      text: "Priority placement in search results got me noticed by top clients.",
      author: "Isha Sharma",
      role: "Illustrator",
      avatar: "IS",
      projects: 20,
    },
    {
      rating: 5,
      text: "Early access to premium projects helped me secure high-paying work.",
      author: "Manish Patel",
      role: "Front-End Developer",
      avatar: "MP",
      projects: 27,
    },
    {
      rating: 5,
      text: "Advanced analytics dashboard helped me track client engagement and improve proposals.",
      author: "Diya Singh",
      role: "Graphic Designer",
      avatar: "DS",
      projects: 31,
    },
    {
      rating: 5,
      text: "I gained confidence to increase my rates thanks to Freelancer Hub’s insights.",
      author: "Karan Mehta",
      role: "Full-Stack Developer",
      avatar: "KM",
      projects: 36,
    },
    {
      rating: 5,
      text: "The platform is intuitive and easy to use, even for beginners.",
      author: "Sanya Reddy",
      role: "Content Writer",
      avatar: "SR",
      projects: 18,
    },
    {
      rating: 5,
      text: "I managed to get consistent projects within two weeks of joining Pro plan.",
      author: "Rahul Verma",
      role: "Web Developer",
      avatar: "RV",
      projects: 29,
    },
    {
      rating: 5,
      text: "Freelancer Hub’s direct messaging saved me time negotiating with clients.",
      author: "Neha Kapoor",
      role: "UI/UX Designer",
      avatar: "NK",
      projects: 23,
    },
    {
      rating: 5,
      text: "The verified badge increased my project approvals significantly.",
      author: "Ankit Jain",
      role: "Front-End Developer",
      avatar: "AJ",
      projects: 32,
    },
    {
      rating: 5,
      text: "I love showcasing my portfolio through Freelancer Hub. It looks professional.",
      author: "Ayesha Khan",
      role: "Graphic Designer",
      avatar: "AK",
      projects: 25,
    },
    {
      rating: 5,
      text: "Support team responded quickly whenever I had questions. Excellent service.",
      author: "Vivek Singh",
      role: "Software Engineer",
      avatar: "VS",
      projects: 30,
    },
    {
      rating: 5,
      text: "Unlimited project applications helped me explore different domains and skills.",
      author: "Mira Shah",
      role: "Content Writer",
      avatar: "MS",
      projects: 26,
    },
    {
      rating: 5,
      text: "Client satisfaction improved thanks to proposal templates and portfolio display.",
      author: "Devansh Gupta",
      role: "Full-Stack Developer",
      avatar: "DG",
      projects: 35,
    },
    {
      rating: 5,
      text: "I feel more confident negotiating rates and deadlines.",
      author: "Tanvi Reddy",
      role: "UI/UX Designer",
      avatar: "TR",
      projects: 28,
    },
    {
      rating: 5,
      text: "Freelancer Hub helped me establish a strong online presence as a freelancer.",
      author: "Siddharth Sharma",
      role: "Front-End Developer",
      avatar: "SS",
      projects: 33,
    },
    {
      rating: 5,
      text: "I’m able to manage multiple projects efficiently using the platform.",
      author: "Priya Nair",
      role: "Graphic Designer",
      avatar: "PN",
      projects: 22,
    },
    {
      rating: 5,
      text: "Early access to featured projects boosted my earnings in the first month.",
      author: "Raghav Kapoor",
      role: "Software Engineer",
      avatar: "RK",
      projects: 30,
    },
    {
      rating: 5,
      text: "I highly recommend Freelancer Hub to anyone starting a freelance career.",
      author: "Shreya Mehta",
      role: "Content Writer",
      avatar: "SM",
      projects: 20,
    },
    {
      rating: 5,
      text: "Priority support helped me solve issues instantly and focus on work.",
      author: "Harsh Verma",
      role: "Web Developer",
      avatar: "HV",
      projects: 27,
    },
    {
      rating: 5,
      text: "Verified badge gives me credibility with high-paying clients.",
      author: "Anjali Singh",
      role: "UI/UX Designer",
      avatar: "AS",
      projects: 24,
    },
    {
      rating: 5,
      text: "The platform is extremely user-friendly and visually appealing.",
      author: "Kunal Sharma",
      role: "Full-Stack Developer",
      avatar: "KS",
      projects: 31,
    },
    {
      rating: 5,
      text: "I got more consistent projects after upgrading to Pro plan.",
      author: "Ritika Patel",
      role: "Graphic Designer",
      avatar: "RP",
      projects: 29,
    },
    {
      rating: 5,
      text: "Freelancer Hub truly helped me scale my freelance business effectively.",
      author: "Sahil Kapoor",
      role: "Software Engineer",
      avatar: "SK",
      projects: 36,
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Freelancers" },
    { number: "$25M+", label: "Earned This Year" },
    { number: "4.9/5", label: "Client Satisfaction" },
    { number: "120+", label: "Countries" },
  ];

  const faqs = [
    {
      question: "How quickly can I start getting projects?",
      answer:
        "Most freelancers start receiving project invitations within 24-48 hours of completing their profile. Professional plan members typically see faster matching due to priority placement.",
    },
    {
      question: "What's the difference between Free and Professional plans?",
      answer:
        "The Free plan gives you basic access to browse and apply for projects, while Professional unlocks unlimited applications, direct client messaging, advanced analytics, and premium visibility in search results.",
    },
    {
      question: "Do you take any commission from my earnings?",
      answer:
        "No commission! We charge a flat monthly subscription fee. You keep 100% of what you earn from clients. Our goal is your success.",
    },
    {
      question: "Can I switch between plans easily?",
      answer:
        "Yes, you can upgrade, downgrade, or cancel anytime. All your data, portfolio, and client connections remain intact when changing plans.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "All plans include email support with 24-hour response time. Professional and Agency plans include priority support with faster response times and dedicated help for complex issues.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer:
        "Yes! We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund your first payment.",
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
                Trusted by 50,000+ Freelancers Worldwide
              </div>
              <h1 className={styles.heroTitle}>
                Turn Your <span className={styles.gradientText}>Skills</span> Into Freedom
              </h1>
              <p className={styles.heroDescription}>
                Join the platform where top freelancers thrive. From your first
                project to building a sustainable business, we provide the
                tools, community, and opportunities you need to succeed in the
                modern workforce.
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
                  Start Free Today
                  <FaArrowRight className={styles.buttonIcon} />
                </button>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.floatingCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardAvatar}>YP</div>
                  <div className={styles.cardInfo}>
                    <h4>Your Profile</h4>
                    <span>Ready for projects</span>
                  </div>
                  <div className={styles.verifiedBadge}>
                    <FaRegCheckCircle />
                  </div>
                </div>
                <div className={styles.cardStats}>
                  <div className={styles.statItem}>
                    <span>24</span>
                    <span>Projects</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>98%</span>
                    <span>Success</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>$45k</span>
                    <span>Earned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2>Everything You Need to Succeed</h2>
            <p>
              Powerful tools and features designed to help you grow your
              freelance business
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
            <h2>Choose Your Success Path</h2>
            <p>
              Flexible plans that grow with your business. No hidden fees, no
              surprises.
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

        {/* Testimonials Section with CSS Auto-Slider */}
        <section className={styles.testimonialsSection}>
          <div className={styles.sectionHeader}>
            <h2>Success Stories from Our Community</h2>
            <p>
              See how freelancers are transforming their careers with our
              platform
            </p>
          </div>

          <div className={styles.testimonialsSlider}>
            <div className={styles.sliderContainer}>
              <div className={styles.sliderTrack}>
                {/* First set of testimonials */}
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
              <h2>Ready to Start Your Freelance Journey?</h2>
              <p>
                Join thousands of successful freelancers who've found their
                perfect workflow with our platform.
              </p>
              <div className={styles.ctaButtons}>
                <button className={styles.ctaPrimary}>
                  Start Free Today
                  <FaArrowRight />
                </button>
                <button className={styles.ctaSecondary}>Schedule a Demo</button>
              </div>
            </div>
            <div className={styles.ctaVisual}>
              <div className={styles.ctaStats}>
                <div className={styles.ctaStat}>
                  <span>7 days</span>
                  <span>Average to first project</span>
                </div>
                <div className={styles.ctaStat}>
                  <span>85%</span>
                  <span>Increase in earnings</span>
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
              Everything you need to know about getting started and growing with
              us
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

export default FreelancerHub;
