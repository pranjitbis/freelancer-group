"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Nav from "../home/component/Nav/page";
import cerrer from "../../public/icons/career.png";
import Image from "next/image";
import {
  FaBriefcase,
  FaTasks,
  FaDatabase,
  FaBullhorn,
  FaPlane,
  FaChartLine,
  FaAssistiveListeningSystems,
  FaPenNib,
  FaCheckCircle,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaCogs,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserTie,
  FaLaptopCode,
  FaRobot,
  FaHeadset,
  FaGlobe,
  FaUsers,
  FaProjectDiagram,
  FaUserGraduate,
  FaFileAlt,
  FaPhoneAlt,
  FaStar,
  FaCheck,
  FaSearch,
  FaBrain,
  FaServer,
  FaMobileAlt,
  FaShare,
} from "react-icons/fa";
import WhatsApp from "../whatsapp_icon/page";
import {
  MdTravelExplore,
  MdOutlineDesignServices,
  MdSecurity,
} from "react-icons/md";
import { GiArtificialIntelligence, GiTeacher, GiFactory } from "react-icons/gi";
import { SiCloudflare } from "react-icons/si";
import Footer from "../home/footer/page";
import { FaEarthAmericas } from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Careers.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function Careers() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const router = useRouter();

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer (React/Next.js)",
      department: "Technology",
      type: "Full-time",
      location: "Remote",
      description: "Lead the development of high-performance, scalable web applications using React and Next.js, ensuring responsive design and optimal user experience.",
      category: "technology",
      experience: "3+ years",
      salary: "$80,000 - $120,000",
      requirements: [
        "Proficient in React.js and Next.js with hands-on project experience",
        "Strong knowledge of TypeScript and modern JavaScript",
        "Experience with CSS frameworks like Tailwind or Styled Components",
        "Familiarity with REST APIs and frontend-backend integration",
      ],
      skills: ["React", "Next.js", "TypeScript", "CSS", "JavaScript", "Tailwind"],
      about: "Join our core technology team to build innovative web solutions that serve thousands of users worldwide.",
    },
    {
      id: 2,
      title: "AI/ML Engineer – Data & Predictive Analytics",
      department: "Data & AI Solutions",
      type: "Full-time",
      location: "Remote",
      description: "Design, implement, and optimize AI and machine learning models to provide actionable insights and innovative solutions.",
      category: "technology",
      experience: "2+ years",
      salary: "$90,000 - $130,000",
      requirements: [
        "Proficient in Python and ML frameworks like TensorFlow or PyTorch",
        "Hands-on experience in data modeling, analysis, and visualization",
        "Ability to deploy ML models on cloud platforms like AWS or Azure",
        "Strong understanding of AI algorithms and statistical modeling",
      ],
      skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Data Analysis", "AI"],
      about: "Be part of our AI innovation team, working on challenging problems and deploying machine learning solutions.",
    },
    {
      id: 3,
      title: "Senior Travel Consultant – Global Bookings",
      department: "Travel & Hotel Booking",
      type: "Full-time",
      location: "Remote",
      description: "Provide expert guidance on travel itineraries, hotel accommodations, and booking management for clients worldwide.",
      category: "travel",
      experience: "2+ years",
      salary: "$45,000 - $65,000",
      requirements: [
        "Proven experience in travel planning and consulting",
        "Excellent customer service and communication skills",
        "Proficiency in travel booking and reservation systems",
        "Ability to work with multilingual clients and global travel providers",
      ],
      skills: ["Travel Planning", "Customer Service", "Booking Systems", "Multilingual", "Itinerary Design"],
      about: "Join our travel division and help create unforgettable experiences for clients around the globe.",
    },
    {
      id: 4,
      title: "Virtual Executive Assistant",
      department: "Virtual Assistant Services",
      type: "Contract",
      location: "Remote",
      description: "Provide global executive support, managing schedules, correspondence, projects, and operations with professionalism.",
      category: "virtual-assistant",
      experience: "1+ year",
      salary: "$35,000 - $50,000",
      requirements: [
        "Experience in executive or administrative support roles",
        "Excellent communication and organizational skills",
        "Ability to manage multiple tasks and priorities effectively",
        "Proficiency with digital tools, calendars, and project management software",
      ],
      skills: ["Administrative Support", "Communication", "Time Management", "Organization", "Project Coordination"],
      about: "Support executives and business leaders in a dynamic, fast-paced environment.",
    },
  ];

  const steps = [
    {
      id: 1,
      title: "Choose a Job",
      description: "Browse through our available job openings and select the one that fits your skills.",
      icon: <FaUserGraduate className={styles.stepIcon} />,
      color: "#2563eb",
    },
    {
      id: 2,
      title: "Fill the Application",
      description: "Click 'Apply Now' and complete the application form with your details and resume.",
      icon: <FaFileAlt className={styles.stepIcon} />,
      color: "#059669",
    },
    {
      id: 3,
      title: "HR Call",
      description: "Our HR team will review your application and call you within 24 hours for further discussion.",
      icon: <FaPhoneAlt className={styles.stepIcon} />,
      color: "#dc2626",
    },
    {
      id: 4,
      title: "Get Hired",
      description: "If selected, join our team and start your journey with us!",
      icon: <FaCheck className={styles.stepIcon} />,
      color: "#7c3aed",
    },
  ];

  const jobReviews = [
    {
      name: "Chintan Sharma",
      role: "Frontend Developer",
      review: "Working here has been a fantastic experience! The projects are challenging and rewarding, and the team is supportive.",
      rating: 5,
      icon: <FaLaptopCode />,
      color: "#2563eb",
    },
    {
      name: "Jay Verma",
      role: "AI/ML Engineer",
      review: "Amazing work culture and learning opportunities. Mentorship here helped me grow professionally.",
      rating: 4.5,
      icon: <GiArtificialIntelligence />,
      color: "#7c3aed",
    },
    {
      name: "Ankit Singh",
      role: "Travel Consultant",
      review: "Great environment for travel professionals. The company encourages innovation and client satisfaction.",
      rating: 5,
      icon: <MdTravelExplore />,
      color: "#059669",
    },
    {
      name: "Riya Kapoor",
      role: "UI/UX Designer",
      review: "The design culture here is inspiring. Collaboration across teams has helped me grow creatively.",
      rating: 4.8,
      icon: <MdOutlineDesignServices />,
      color: "#db2777",
    },
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

  // Auto-slide reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % jobReviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [jobReviews.length]);

  const filteredJobs = jobs.filter((job) => {
    const matchesTab = activeTab === "all" || job.category === activeTab;
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const scrollToOpportunities = () => {
    document.getElementById("opportunities").scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleJobClick = (job) => {
    const jobSlug = job.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    router.push(`/career/${jobSlug}`);
  };

  return (
    <>
      <Head>
        <title>Careers at Aroliya | Join Our Innovative Team</title>
        <meta name="description" content="Build your career with Aroliya. We offer opportunities in freelancing, e-commerce, AI solutions, and more." />
      </Head>
      <Nav />
      <WhatsApp />
      
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
                  <FaBriefcase className={styles.badgeIcon} />
                  We're Hiring
                </motion.div>

                <motion.h1 variants={fadeInUp}>
                  Build Your Future With{" "}
                  <span className={styles.gradientText}>Aroliya</span>
                </motion.h1>

                <motion.p variants={fadeInUp}>
                  Join our team of experts delivering innovative solutions across multiple industries worldwide. 
                  Grow your career in a dynamic, remote-first environment that values innovation and collaboration.
                </motion.p>

                <motion.div variants={fadeInUp} className={styles.heroStats}>
                  <div className={styles.statItem}>
                    <strong>50+</strong>
                    <span>Team Members</span>
                  </div>
                  <div className={styles.statItem}>
                    <strong>15+</strong>
                    <span>Countries</span>
                  </div>
                  <div className={styles.statItem}>
                    <strong>24/7</strong>
                    <span>Remote Work</span>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className={styles.heroActions}>
                  <button
                    className={styles.primaryButton}
                    onClick={scrollToOpportunities}
                  >
                    View Open Positions <FaArrowRight />
                  </button>
                  <Link href="#culture">
                    <button className={styles.secondaryButton}>
                      Our Culture
                    </button>
                  </Link>
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
                    src={cerrer} 
                    alt="Aroliya Careers - Join Our Team"
                    className={styles.heroImage}
                    priority
                  />
                </div>
                <div className={styles.floatingElements}>
                  <div className={styles.floatingCard}>
                    <FaGlobe className={styles.floatingIcon} />
                    <span>Remote First</span>
                  </div>
                  <div className={styles.floatingCard}>
                    <FaUserTie className={styles.floatingIcon} />
                    <span>Career Growth</span>
                  </div>
                  <div className={styles.floatingCard}>
                    <FaChartLine className={styles.floatingIcon} />
                    <span>Impactful Work</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Culture Section */}
        <section id="culture" className={styles.culture}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Our Culture</span>
              <h2>Work With Purpose & Passion</h2>
              <p>Why Aroliya is the perfect place to grow your career and make a real impact</p>
            </motion.div>

            <motion.div
              className={styles.cultureGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: <FaGlobe />,
                  title: "Remote First",
                  description: "Work from anywhere in the world with our flexible remote work policy and async communication.",
                  color: "#2563eb",
                },
                {
                  icon: <FaUserTie />,
                  title: "Professional Growth",
                  description: "Continuous learning opportunities, mentorship programs, and clear career advancement paths.",
                  color: "#059669",
                },
                {
                  icon: <FaChartLine />,
                  title: "Impactful Work",
                  description: "Work on projects that make a real difference for clients across global industries.",
                  color: "#dc2626",
                },
                {
                  icon: <FaHeadset />,
                  title: "Collaborative Environment",
                  description: "Join a supportive team that values collaboration, innovation, and work-life balance.",
                  color: "#7c3aed",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={styles.cultureCard}
                  variants={scaleIn}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div 
                    className={styles.cultureIcon}
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <motion.div 
                    className={styles.cultureLine}
                    style={{ backgroundColor: item.color }}
                    whileHover={{ width: "100%" }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Opportunities Section */}
        <section id="opportunities" className={styles.opportunities}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Opportunities</span>
              <h2>Career Opportunities</h2>
              <p>Discover your next career move with our growing team of innovators</p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className={styles.searchContainer}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search jobs by title or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </motion.div>

            {/* Category Tabs */}
            <motion.div
              className={styles.tabs}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {[
                { key: "all", label: "All Positions", count: jobs.length },
                { key: "technology", label: "Technology", count: jobs.filter(job => job.category === "technology").length },
                { key: "travel", label: "Travel", count: jobs.filter(job => job.category === "travel").length },
                { key: "virtual-assistant", label: "Virtual Assistance", count: jobs.filter(job => job.category === "virtual-assistant").length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </motion.div>

            {/* Jobs Grid */}
            <motion.div
              className={styles.jobsGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className={styles.jobCard}
                  variants={scaleIn}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.jobHeader}>
                    <div className={styles.jobBadges}>
                      <span className={`${styles.jobBadge} ${styles[job.category]}`}>
                        {job.department}
                      </span>
                      <span className={styles.jobType}>{job.type}</span>
                    </div>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <div className={styles.jobMeta}>
                      <span className={styles.jobLocation}>
                        <FaMapMarkerAlt /> {job.location}
                      </span>
                      <span className={styles.jobExperience}>
                        {job.experience}
                      </span>
                    </div>
                  </div>
                  
                  <p className={styles.jobDescription}>{job.description}</p>

                  <div className={styles.jobSkills}>
                    <h4>Key Skills:</h4>
                    <div className={styles.skillsList}>
                      {job.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.jobFooter}>
                    <div className={styles.salary}>{job.salary}</div>
                    <motion.button
                      className={styles.applyBtn}
                      onClick={() => handleJobClick(job)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details <FaArrowRight />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {filteredJobs.length === 0 && (
              <motion.div
                className={styles.noJobs}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FaBriefcase className={styles.noJobsIcon} />
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Process Section */}
        <section className={styles.process}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Process</span>
              <h2>How to Join Our Team</h2>
              <p>Simple 4-step process to apply and get hired</p>
            </motion.div>

            <motion.div
              className={styles.processSteps}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={styles.processStep}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className={styles.stepNumber}
                    style={{ backgroundColor: step.color }}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.icon}
                  </motion.div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className={styles.stepIndicator}>{step.id}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.testimonials}>
          <div className={styles.sectionContainer}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionSubtitle}>Testimonials</span>
              <h2>What Our Team Members Say</h2>
              <p>Hear from our talented professionals across different domains</p>
            </motion.div>

            <div className={styles.testimonialSlider}>
              <div className={styles.sliderContainer}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentReviewIndex}
                    className={styles.testimonialSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <div className={styles.testimonialCard}>
                      <div className={styles.testimonialRating}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < jobReviews[currentReviewIndex].rating ? styles.starFilled : styles.starEmpty}
                          />
                        ))}
                        <span className={styles.ratingValue}>{jobReviews[currentReviewIndex].rating}</span>
                      </div>
                      <div className={styles.testimonialContent}>
                        <p>"{jobReviews[currentReviewIndex].review}"</p>
                      </div>
                      <div className={styles.testimonialAuthor}>
                        <div 
                          className={styles.authorIcon}
                          style={{ backgroundColor: `${jobReviews[currentReviewIndex].color}15`, color: jobReviews[currentReviewIndex].color }}
                        >
                          {jobReviews[currentReviewIndex].icon}
                        </div>
                        <div className={styles.authorInfo}>
                          <h4>{jobReviews[currentReviewIndex].name}</h4>
                          <p>{jobReviews[currentReviewIndex].role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={styles.sliderIndicators}>
                {jobReviews.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.indicator} ${index === currentReviewIndex ? styles.active : ''}`}
                    onClick={() => setCurrentReviewIndex(index)}
                  />
                ))}
              </div>
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
                Ready to Start Your Journey?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Join Aroliya and be part of a team that's shaping the future of digital solutions across the globe.
              </motion.p>
              <motion.div
                className={styles.ctaButtons}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <button
                  className={styles.primaryButton}
                  onClick={scrollToOpportunities}
                >
                  Explore Open Positions <FaArrowRight />
                </button>
                <Link href="/contact">
                  <button className={styles.secondaryButton}>
                    Contact HR
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}