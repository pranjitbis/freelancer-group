"use client";
import { useState } from "react";
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

export default function Careers() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer (React/Next.js)",
      department: "Technology",
      type: "Full-time",
      location: "Remote",
      description:
        "Lead the development of high-performance, scalable web applications using React and Next.js, ensuring responsive design, optimal user experience, and adherence to best coding practices.",
      category: "technology",
      experience: "3+ years",
      salary: "$80,000 - $120,000",
      requirements: [
        "Proficient in React.js and Next.js with hands-on project experience",
        "Strong knowledge of TypeScript and modern JavaScript",
        "Experience with CSS frameworks like Tailwind or Styled Components",
        "Familiarity with REST APIs and frontend-backend integration",
      ],
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "CSS",
        "JavaScript",
        "Tailwind",
      ],
      about:
        "Join our core technology team to build innovative web solutions that serve thousands of users worldwide. Work on cutting-edge projects, collaborate with cross-functional teams, and deliver scalable applications using modern technologies.",
    },
    {
      id: 2,
      title: "AI/ML Engineer – Data & Predictive Analytics",
      department: "Data & AI Solutions",
      type: "Full-time",
      location: "Remote",
      description:
        "Design, implement, and optimize AI and machine learning models to provide actionable insights, predictive analytics, and innovative solutions that address complex business challenges.",
      category: "technology",
      experience: "2+ years",
      salary: "$90,000 - $130,000",
      requirements: [
        "Proficient in Python and ML frameworks like TensorFlow or PyTorch",
        "Hands-on experience in data modeling, analysis, and visualization",
        "Ability to deploy ML models on cloud platforms like AWS or Azure",
        "Strong understanding of AI algorithms and statistical modeling",
      ],
      skills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "Machine Learning",
        "Data Analysis",
        "AI",
      ],
      about:
        "Be part of our AI innovation team, working on challenging problems and deploying machine learning solutions that drive real business impact. Collaborate with data scientists, engineers, and product teams to create scalable, intelligent systems.",
    },
    {
      id: 3,
      title: "Senior Travel Consultant – Global Bookings",
      department: "Travel & Hotel Booking",
      type: "Full-time",
      location: "Remote",
      description:
        "Provide expert guidance on travel itineraries, hotel accommodations, and booking management, ensuring seamless, personalized, and memorable experiences for clients worldwide.",
      category: "travel",
      experience: "2+ years",
      salary: "$45,000 - $65,000",
      requirements: [
        "Proven experience in travel planning and consulting",
        "Excellent customer service and communication skills",
        "Proficiency in travel booking and reservation systems",
        "Ability to work with multilingual clients and global travel providers",
      ],
      skills: [
        "Travel Planning",
        "Customer Service",
        "Booking Systems",
        "Multilingual",
        "Itinerary Design",
      ],
      about:
        "Join our travel division and help create unforgettable experiences for clients around the globe. Work closely with international partners, provide expert recommendations, and ensure each journey is meticulously planned and executed.",
    },
    {
      id: 4,
      title: "Virtual Executive Assistant",
      department: "Virtual Assistant Services",
      type: "Contract",
      location: "Remote",
      description:
        "Provide global executive support, managing schedules, correspondence, projects, and operations with professionalism, efficiency, organization, and strong communication skills.",
      category: "virtual-assistant",
      experience: "1+ year",
      salary: "$35,000 - $50,000",
      requirements: [
        "Experience in executive or administrative support roles",
        "Excellent communication and organizational skills",
        "Ability to manage multiple tasks and priorities effectively",
        "Proficiency with digital tools, calendars, and project management software",
      ],
      skills: [
        "Administrative Support",
        "Communication",
        "Time Management",
        "Organization",
        "Project Coordination",
      ],
      about:
        "Support executives and business leaders in a dynamic, fast-paced environment. Manage scheduling, handle correspondence, coordinate projects, and ensure smooth day-to-day operations while maintaining confidentiality and professionalism.",
    },
  ];

  const steps = [
    {
      id: 1,
      title: "Choose a Job",
      description:
        "Browse through our available job openings and select the one that fits your skills.",
      icon: <FaUserGraduate className={styles.stepIcon} />,
    },
    {
      id: 2,
      title: "Fill the Application",
      description:
        "Click 'Apply Now' and complete the application form with your details and resume.",
      icon: <FaFileAlt className={styles.stepIcon} />,
    },
    {
      id: 3,
      title: "HR Call",
      description:
        "Our HR team will review your application and call you within 24 hours for further discussion.",
      icon: <FaPhoneAlt className={styles.stepIcon} />,
    },
    {
      id: 4,
      title: "Get Hired",
      description: "If selected, join our team and start your journey with us!",
      icon: <FaCheck className={styles.stepIcon} />,
    },
  ];

  const jobReviews = [
    {
      name: "Chintan Sharma",
      role: "Frontend Developer",
      review:
        "Working here has been a fantastic experience! The projects are challenging and rewarding, and the team is supportive.",
      rating: 5,
      icon: <FaLaptopCode style={{ fontSize: "40px", color: "#1D4ED8" }} />, // dev
    },
    {
      name: "Jay Verma",
      role: "AI/ML Engineer",
      review:
        "Amazing work culture and learning opportunities. Mentorship here helped me grow professionally.",
      rating: 4.5,
      icon: (
        <GiArtificialIntelligence
          style={{ fontSize: "40px", color: "#7C3AED" }}
        />
      ), // AI
    },
    {
      name: "Ankit Singh",
      role: "Travel Consultant",
      review:
        "Great environment for travel professionals. The company encourages innovation and client satisfaction.",
      rating: 5,
      icon: <MdTravelExplore style={{ fontSize: "40px", color: "#10B981" }} />, // travel
    },
    {
      name: "Riya Kapoor",
      role: "UI/UX Designer",
      review:
        "The design culture here is inspiring. Collaboration across teams has helped me grow creatively.",
      rating: 4.8,
      icon: (
        <MdOutlineDesignServices
          style={{ fontSize: "40px", color: "#EC4899" }}
        />
      ), // design
    },
    {
      name: "Arjun Mehta",
      role: "Business Analyst",
      review:
        "The management encourages data-driven decisions. It’s a great place for analytical minds.",
      rating: 4.7,
      icon: <FaChartLine style={{ fontSize: "40px", color: "#F59E0B" }} />, // analyst
    },
    {
      name: "Sneha Iyer",
      role: "Language Trainer",
      review:
        "A very supportive environment for trainers. The company invests in employee learning.",
      rating: 4.9,
      icon: <GiTeacher style={{ fontSize: "40px", color: "#14B8A6" }} />, // trainer
    },
    {
      name: "Rahul Desai",
      role: "Backend Engineer",
      review:
        "The backend systems here are cutting-edge. I’ve had the chance to work on large-scale distributed systems.",
      rating: 4.6,
      icon: <FaServer style={{ fontSize: "40px", color: "#374151" }} />, // backend
    },
    {
      name: "Meera Nair",
      role: "Cybersecurity Specialist",
      review:
        "Security is taken very seriously. I enjoy the proactive approach and the constant learning.",
      rating: 5,
      icon: <MdSecurity style={{ fontSize: "40px", color: "#DC2626" }} />, // security
    },
    {
      name: "Karan Gupta",
      role: "Cloud Engineer",
      review:
        "I get to work on modern cloud infrastructure with a team that loves solving problems at scale.",
      rating: 4.7,
      icon: <SiCloudflare style={{ fontSize: "40px", color: "#FACC15" }} />, // cloud
    },
    {
      name: "Ayesha Khan",
      role: "Mobile App Developer",
      review:
        "Building mobile-first solutions has been very exciting. I’ve learned a lot about cross-platform apps.",
      rating: 4.8,
      icon: <FaMobileAlt style={{ fontSize: "40px", color: "#4F46E5" }} />, // mobile
    },
    {
      name: "Vikram Patel",
      role: "Operations Manager",
      review:
        "Managing teams here is smooth thanks to the collaborative culture. Every idea is heard and valued.",
      rating: 5,
      icon: <GiFactory style={{ fontSize: "40px", color: "#15803D" }} />, // ops
    },
    {
      name: "Neha Joshi",
      role: "HR Manager",
      review:
        "The company puts people first. From onboarding to career growth, HR is fully empowered to help employees.",
      rating: 4.9,
      icon: <FaUserTie style={{ fontSize: "40px", color: "#BE123C" }} />, // HR
    },
    // Additional reviews
    {
      name: "Siddharth Rao",
      role: "DevOps Engineer",
      review:
        "The DevOps processes here are very streamlined. Automation and CI/CD pipelines make deployment effortless.",
      rating: 4.8,
      icon: <FaCogs style={{ fontSize: "40px", color: "#0EA5E9" }} />, // DevOps
    },
    {
      name: "Priya Singh",
      role: "Product Manager",
      review:
        "Product planning and execution are very well-managed. Cross-team collaboration is encouraged at every step.",
      rating: 4.7,
      icon: <FaTasks style={{ fontSize: "40px", color: "#F97316" }} />, // PM
    },
    {
      name: "Rohit Malhotra",
      role: "Data Scientist",
      review:
        "Working with large datasets and ML models is exciting here. The support for research and innovation is excellent.",
      rating: 4.9,
      icon: <FaDatabase style={{ fontSize: "40px", color: "#8B5CF6" }} />, // data
    },
    {
      name: "Ananya Verma",
      role: "Marketing Specialist",
      review:
        "Creative campaigns and innovative strategies make marketing here very dynamic and rewarding.",
      rating: 4.8,
      icon: <FaBullhorn style={{ fontSize: "40px", color: "#F43F5E" }} />, // marketing
    },
    {
      name: "Aditya Joshi",
      role: "QA Engineer",
      review:
        "Testing processes are thorough and structured. The focus on quality ensures robust products for clients.",
      rating: 4.7,
      icon: <FaCheckCircle style={{ fontSize: "40px", color: "#22C55E" }} />, // QA
    },
    {
      name: "Isha Kapoor",
      role: "Content Writer",
      review:
        "Writing for various campaigns is both fun and challenging. The creative freedom given is highly motivating.",
      rating: 4.8,
      icon: <FaPenNib style={{ fontSize: "40px", color: "#F59E0B" }} />, // writer
    },
  ];

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
    // Create URL-friendly slug from job title
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
        <meta
          name="description"
          content="Build your career with Aroliya. We offer opportunities in freelancing, e-commerce, AI solutions, and more."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <WhatsApp />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Build Your Future With Aroliya</h1>
            <p className={styles.heroSubtitle}>
              Join our team of experts delivering innovative solutions across
              multiple industries worldwide. Grow your career in a dynamic,
              remote-first environment.
            </p>

            <button
              className={styles.ctaButton}
              onClick={scrollToOpportunities}
            >
              View Open Positions <FaArrowRight />
            </button>
          </div>
          <div className={styles.heroImage}>
            <Image src={cerrer} alt="err" />
          </div>
        </section>

        {/* Culture Section */}
        <section id="culture" className={styles.culture}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Our Culture & Values</h2>
            <p className={styles.sectionSubtitle}>
              Why Aroliya is the perfect place to grow your career
            </p>

            <div className={styles.cultureGrid}>
              <div className={styles.cultureItem}>
                <div className={styles.cultureIcon}>
                  <FaGlobe />
                </div>
                <h3>Remote First</h3>
                <p>
                  Work from anywhere in the world with our flexible remote work
                  policy and async communication.
                </p>
              </div>

              <div className={styles.cultureItem}>
                <div className={styles.cultureIcon}>
                  <FaUserTie />
                </div>
                <h3>Professional Growth</h3>
                <p>
                  Continuous learning opportunities, mentorship programs, and
                  clear career advancement paths.
                </p>
              </div>

              <div className={styles.cultureItem}>
                <div className={styles.cultureIcon}>
                  <FaChartLine />
                </div>
                <h3>Impactful Work</h3>
                <p>
                  Work on projects that make a real difference for clients
                  across global industries.
                </p>
              </div>

              <div className={styles.cultureItem}>
                <div className={styles.cultureIcon}>
                  <FaHeadset />
                </div>
                <h3>Collaborative Environment</h3>
                <p>
                  Join a supportive team that values collaboration, innovation,
                  and work-life balance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="opportunities" className={styles.opportunities}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Career Opportunities</h2>
            <p className={styles.sectionSubtitle}>
              Discover your next career move with our growing team
            </p>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
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
            </div>

            {/* Category Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "all" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("all")}
              >
                All Positions ({jobs.length})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "technology" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("technology")}
              >
                Technology (
                {jobs.filter((job) => job.category === "technology").length})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "travel" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("travel")}
              >
                Travel ({jobs.filter((job) => job.category === "travel").length}
                )
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "virtual-assistant" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("virtual-assistant")}
              >
                Virtual Assistance (
                {
                  jobs.filter((job) => job.category === "virtual-assistant")
                    .length
                }
                )
              </button>
            </div>

            {/* Jobs Grid */}
            <div className={styles.jobsGrid}>
              {filteredJobs.map((job) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <div className={styles.jobBadges}>
                      <span
                        className={`${styles.jobBadge} ${styles[job.category]}`}
                      >
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
                    <button
                      className={styles.applyBtn}
                      onClick={() => handleJobClick(job)}
                    >
                      View Details & Apply{" "}
                      <FaArrowRight className={styles.arrowIcon} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className={styles.noJobs}>
                <FaBriefcase className={styles.noJobsIcon} />
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="howItWorks" className={styles.howItWorksSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>How to Join Our Team</h2>
              <p>Simple 4-step process to apply and get hired</p>
            </div>

            <div className={styles.stepsGrid}>
              {steps.map((step) => (
                <div key={step.id} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.id}</div>
                  <div className={styles.iconContainer}>{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Employee Reviews Section */}
        <section className={styles.jobReviewsSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>What Our Team Members Say</h2>
              <p>
                Hear from our talented professionals across different domains
              </p>
            </div>

            <div className={styles.reviewsGridWrapper}>
              <div className={styles.reviewsGrid}>
                {jobReviews.concat(jobReviews).map((review, index) => (
                  <div key={index} className={styles.reviewCard}>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(review.rating)
                              ? styles.starFilled
                              : styles.starEmpty
                          }
                        />
                      ))}
                      <span>{review.rating}</span>
                    </div>
                    <p className={styles.reviewText}>"{review.review}"</p>
                    <div className={styles.reviewAuthor}>
                      <div className={styles.authorImage}>
                        {review.icon ? (
                          <span>{review.icon}</span>
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        )}
                      </div>
                      <div className={styles.authorInfo}>
                        <h4>{review.name}</h4>
                        <p>{review.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2>Ready to Start Your Journey?</h2>
              <p>
                Join Aroliya and be part of a team that's shaping the future of
                digital solutions across the globe.
              </p>
              <button
                className={styles.ctaButton}
                onClick={scrollToOpportunities}
              >
                Explore Open Positions <FaArrowRight />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
