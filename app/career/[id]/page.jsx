"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import Nav from "../../home/component/Nav/page";
import Footer from "../../home/footer/page";
import {
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaUserTie,
  FaArrowLeft,
  FaShare,
  FaCheck,
  FaUsers,
  FaLightbulb,
  FaRocket,
  FaHeart,
  FaBalanceScale,
  FaGraduationCap,
  FaAward,
  FaCoins,
  FaGlobe,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa";
import styles from "./JobDetail.module.css";
import Link from "next/link";

const jobsData = [
  {
    id: 1,
    title: "Senior Frontend Developer (React/Next.js)",
    department: "Technology",
    type: "Full-time",
    location: "Remote",
    description:
      "Join our innovative technology team as a Senior Frontend Developer and build cutting-edge web applications that serve millions of users worldwide. We're looking for passionate developers who thrive in collaborative environments.",
    category: "technology",
    experience: "3+ years",
    salary: "$80,000 - $120,000",
    requirements: [
      "Bachelor's degree in Computer Science or equivalent experience",
      "3+ years of professional experience with React.js and Next.js",
      "Strong proficiency in TypeScript and modern JavaScript (ES6+)",
      "Experience with state management libraries (Redux, Zustand, or Context API)",
      "Knowledge of CSS frameworks like Tailwind CSS or Styled Components",
      "Experience with testing frameworks (Jest, React Testing Library, Cypress)",
      "Understanding of web performance optimization techniques",
      "Familiarity with CI/CD pipelines and modern development workflows",
    ],
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Redux",
      "Jest",
      "Git",
      "REST APIs",
      "Web Performance",
    ],
    about:
      "At Aroliya, we believe in creating digital experiences that make a difference. As a Senior Frontend Developer, you'll work on projects that impact real users across the globe. Our team values innovation, collaboration, and continuous learning. You'll have the opportunity to mentor junior developers, contribute to architectural decisions, and see your work make a tangible impact.",
    responsibilities: [
      "Develop and maintain high-performance, scalable web applications using React and Next.js",
      "Collaborate with UX/UI designers to transform designs into responsive, accessible interfaces",
      "Write clean, maintainable, and well-documented code following best practices",
      "Participate in code reviews to maintain code quality and share knowledge",
      "Optimize applications for maximum speed and scalability across devices",
      "Mentor junior developers and conduct technical interviews",
      "Collaborate with backend developers to integrate RESTful APIs",
      "Stay updated with emerging frontend technologies and industry trends",
    ],
    benefits: [
      "Competitive salary with annual performance bonuses",
      "Full remote work flexibility with coworking space allowances",
      "Comprehensive health, dental, and vision insurance",
      "Flexible working hours and unlimited PTO",
      "Quarterly team retreats and annual company events",
      "Latest MacBook Pro and home office setup stipend",
      "Stock options and equity participation",
    ],
    companyCulture: [
      "Innovation-driven environment with hackathons and tech talks",
      "Flat hierarchy where every voice is heard",
      "Diverse and inclusive workplace with team members from 15+ countries",
      "Strong focus on work-life balance and mental health",
    ],
  },
  {
    id: 2,
    title: "AI/ML Engineer – Data & Predictive Analytics",
    department: "Data & AI Solutions",
    type: "Full-time",
    location: "Remote",
    description:
      "Shape the future of artificial intelligence at Aroliya. We're seeking an AI/ML Engineer to develop innovative machine learning solutions that solve complex business challenges and drive meaningful impact.",
    category: "technology",
    experience: "2+ years",
    salary: "$90,000 - $130,000",
    requirements: [
      "Master's or PhD in Computer Science, AI, or related field preferred",
      "2+ years of experience in machine learning and data science",
      "Strong programming skills in Python and experience with ML frameworks",
      "Experience with deep learning frameworks (TensorFlow, PyTorch, or Keras)",
      "Knowledge of data preprocessing, feature engineering, and model evaluation",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
      "Understanding of MLOps practices and model deployment",
      "Strong mathematical foundation in statistics and linear algebra",
    ],
    skills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "Machine Learning",
      "Deep Learning",
      "Data Analysis",
      "AWS SageMaker",
      "SQL",
      "Pandas",
      "Scikit-learn",
    ],
    about:
      "Join our AI innovation lab where you'll work on cutting-edge projects ranging from natural language processing to computer vision. You'll collaborate with a team of passionate data scientists and engineers to build solutions that transform industries. Our AI team enjoys autonomy, challenging problems, and the resources to bring ambitious ideas to life.",
    responsibilities: [
      "Design, develop, and deploy machine learning models for various business applications",
      "Process and analyze large datasets to extract meaningful insights",
      "Collaborate with product teams to understand requirements and deliver AI solutions",
      "Implement MLOps practices for model training, versioning, and deployment",
      "Research and experiment with new algorithms and techniques",
      "Optimize models for performance, scalability, and accuracy",
      "Create documentation and present findings to technical and non-technical stakeholders",
    ],
    benefits: [
      "Competitive salary with performance-based bonuses",
      "Remote-first culture with flexible scheduling",
      "Comprehensive health benefits and wellness programs",
      "Access to high-performance computing resources",
      "Publication opportunities and patent support",
      "Collaboration with leading AI research institutions",
    ],
    companyCulture: [
      "Research-oriented environment with academic collaborations",
      "Regular knowledge sharing sessions and paper discussions",
      "Opportunities to contribute to open-source AI projects",
      "Support for publishing research and attending conferences",
    ],
  },
  {
    id: 3,
    title: "Senior Travel Consultant – Global Bookings",
    department: "Travel & Hospitality",
    type: "Full-time",
    location: "Remote",
    description:
      "Create unforgettable travel experiences for our global clientele. As a Senior Travel Consultant, you'll craft personalized itineraries and provide expert guidance that turns travel dreams into reality.",
    category: "travel",
    experience: "2+ years",
    salary: "$45,000 - $65,000",
    requirements: [
      "2+ years of experience in travel consulting or hospitality",
      "IATA/UFTAA certification or equivalent qualification",
      "Expert knowledge of GDS systems (Amadeus, Sabre, or Galileo)",
      "Excellent customer service and communication skills",
      "Multilingual abilities preferred (Spanish, French, or Mandarin)",
      "Strong knowledge of global destinations and travel trends",
      "Experience with corporate travel management",
      "Ability to handle complex itineraries and last-minute changes",
    ],
    skills: [
      "Travel Planning",
      "Customer Service",
      "GDS Systems",
      "Itinerary Management",
      "Multilingual",
      "Problem Solving",
      "Sales",
      "Cultural Awareness",
    ],
    about:
      "Join our elite travel team and help clients discover the world. We specialize in creating bespoke travel experiences that go beyond ordinary tourism. From luxury getaways to adventure expeditions, you'll have the opportunity to design journeys that create lifelong memories.",
    responsibilities: [
      "Design customized travel itineraries based on client preferences and budgets",
      "Manage bookings for flights, accommodations, tours, and transportation",
      "Provide expert advice on destinations, visas, and travel requirements",
      "Build and maintain relationships with hotels and travel partners",
      "Handle customer inquiries and resolve issues promptly",
      "Stay updated on travel regulations, safety protocols, and industry trends",
      "Coordinate with local guides and service providers worldwide",
    ],
    benefits: [
      "Competitive salary with commission and performance bonuses",
      "Fam trips and familiarization tours to global destinations",
      "Travel industry discounts and perks",
      "Flexible remote work with client-facing meeting opportunities",
      "Continuous training on new destinations and travel products",
      "Career progression opportunities to team lead and management roles",
    ],
    companyCulture: [
      "Passionate team of travel enthusiasts and destination experts",
      "Regular destination training and product workshops",
      "Opportunities to specialize in specific travel niches",
      "Collaborative environment with shared knowledge base",
    ],
  },
  {
    id: 4,
    title: "Virtual Executive Assistant",
    department: "Virtual Assistant Services",
    type: "Contract",
    location: "Remote",
    description:
      "Provide top-tier administrative and executive support to global clients. As a Virtual Executive Assistant, you'll manage schedules, handle communication, and keep operations running smoothly for executives worldwide.",
    category: "virtual-assistant",
    experience: "1+ year",
    salary: "$35,000 - $50,000",
    requirements: [
      "1+ year of experience as an executive assistant, virtual assistant, or similar role",
      "Excellent written and verbal communication skills",
      "Strong organizational and time management abilities",
      "Proficiency with productivity tools (Google Workspace, Microsoft Office)",
      "Experience with task/project management tools (Trello, Asana, or Monday.com)",
      "Ability to maintain confidentiality and handle sensitive information",
      "Comfortable working across different time zones",
      "Tech-savvy with ability to learn new tools quickly",
    ],
    skills: [
      "Administrative Support",
      "Scheduling",
      "Communication",
      "Time Management",
      "Organization",
      "Problem Solving",
      "Confidentiality",
      "Productivity Tools",
    ],
    about:
      "As a Virtual Executive Assistant at Aroliya, you'll play a crucial role in helping executives stay productive and focused on what matters most. You'll be the backbone of operations—handling calendars, coordinating meetings, and ensuring seamless communication across teams and clients.",
    responsibilities: [
      "Manage executives’ calendars, appointments, and travel arrangements",
      "Screen and respond to emails, messages, and phone calls professionally",
      "Coordinate meetings, prepare agendas, and record minutes",
      "Handle document preparation, reports, and presentations",
      "Assist with project management and task tracking",
      "Provide customer support and manage client communications",
      "Maintain confidentiality and safeguard sensitive information",
      "Adapt quickly to changing priorities and multitask effectively",
    ],
    benefits: [
      "Competitive contract-based compensation",
      "Remote work flexibility with global exposure",
      "Opportunity to work with international executives and teams",
      "Skill development through real-world executive management experience",
      "Flexible working hours across multiple time zones",
      "Access to productivity and project management training",
    ],
    companyCulture: [
      "Supportive and collaborative remote-first environment",
      "Focus on personal growth and professional development",
      "Work-life balance and flexible scheduling",
      "Inclusive and diverse team culture",
    ],
  },
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const foundJob = jobsData.find(
        (j) => generateSlug(j.title) === params.id
      );
      setJob(foundJob || null);
      setIsLoading(false);
    }
  }, [params?.id]);

  const handleApply = () => {
    router.push(`/job-apply?position=${encodeURIComponent(job.title)}`);
  };

  const shareJob = async () => {
    const shareData = {
      title: `${job.title} - Aroliya Careers`,
      text: job.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <h2>Job Opportunity Not Found</h2>
          <p>
            The position you're looking for may have been filled or is no longer
            available.
          </p>
          <button
            className={styles.backButton}
            onClick={() => router.push("/career")}
          >
            <FaArrowLeft /> View All Open Positions
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{job.title} - Aroliya Careers</title>
        <meta name="description" content={job.description} />
        <meta property="og:title" content={`${job.title} - Aroliya Careers`} />
        <meta property="og:description" content={job.description} />
      </Head>
      <Nav />

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Back Button */}
          <div className={styles.navigation}>
            <button
              className={styles.backButton}
              onClick={() => router.push("/career")}
            >
              <FaArrowLeft /> Back to Careers
            </button>
          </div>

          {/* Job Header */}
          <div className={styles.jobHeader}>
            <div className={styles.jobTitleSection}>
              <div className={styles.jobBadge}>{job.department}</div>
              <h1>{job.title}</h1>
              <p className={styles.jobSummary}>{job.description}</p>

              <div className={styles.jobMeta}>
                <div className={styles.metaItem}>
                  <FaMapMarkerAlt className={styles.metaIcon} />
                  <span>{job.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <FaClock className={styles.metaIcon} />
                  <span>{job.type}</span>
                </div>

                <div className={styles.metaItem}>
                  <FaUserTie className={styles.metaIcon} />
                  <span>{job.experience}</span>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={`${styles.shareButton} ${
                  copied ? styles.copied : ""
                }`}
                onClick={shareJob}
              >
                <FaShare /> {copied ? "Copied!" : "Share"}
              </button>
              <button className={styles.applyButton} onClick={handleApply}>
                Apply for this Position
              </button>
            </div>
          </div>

          {/* Job Content */}
          <div className={styles.jobContent}>
            <div className={styles.mainContent}>
              {/* About the Role */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FaRocket className={styles.sectionIcon} />
                  <h2>About This Role</h2>
                </div>
                <p className={styles.sectionText}>{job.about}</p>

                <div className={styles.cultureHighlights}>
                  <h3>What Makes This Role Special</h3>
                  <div className={styles.cultureGrid}>
                    {job.companyCulture?.map((item, index) => (
                      <div key={index} className={styles.cultureItem}>
                        <FaHeart className={styles.cultureIcon} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Responsibilities */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FaCheck className={styles.sectionIcon} />
                  <h2>Key Responsibilities</h2>
                </div>
                <div className={styles.responsibilities}>
                  {job.responsibilities.map((resp, index) => (
                    <div key={index} className={styles.responsibilityItem}>
                      <div className={styles.checkmark}>
                        <FaCheck />
                      </div>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Requirements */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FaGraduationCap className={styles.sectionIcon} />
                  <h2>Qualifications & Requirements</h2>
                </div>
                <div className={styles.requirements}>
                  {job.requirements.map((req, index) => (
                    <div key={index} className={styles.requirementItem}>
                      <div className={styles.checkmark}>
                        <FaCheck />
                      </div>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Skills */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FaAward className={styles.sectionIcon} />
                  <h2>Technical Skills</h2>
                </div>
                <div className={styles.skillsGrid}>
                  {job.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <div className={styles.cardHeader}>
                  <FaBuilding className={styles.cardIcon} />
                  <h3>Position Details</h3>
                </div>
                <div className={styles.detailList}>
                  <div className={styles.detailItem}>
                    <strong>Department:</strong>
                    <span>{job.department}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Location:</strong>
                    <span>{job.location}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Employment Type:</strong>
                    <span>{job.type}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Experience Level:</strong>
                    <span>{job.experience}</span>
                  </div>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <div className={styles.cardHeader}>
                  <FaCoins className={styles.cardIcon} />
                  <h3>Benefits & Perks</h3>
                </div>
                <div className={styles.benefitsList}>
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className={styles.benefitItem}>
                      <FaCheck className={styles.benefitIcon} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <div className={styles.cardHeader}>
                  <FaUsers className={styles.cardIcon} />
                  <h3>Ready to Join Us?</h3>
                </div>
                <p>
                  We're excited to learn about your skills and experience. Our
                  hiring process is designed to be transparent and respectful of
                  your time.
                </p>
                <button
                  className={styles.sidebarApplyButton}
                  onClick={handleApply}
                >
                  Apply Now
                </button>
                <div className={styles.applicationInfo}>
                  <div className={styles.infoItem}>
                    <FaCalendarAlt />
                    <span>Applications reviewed within 48 hours</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaGlobe />
                    <span>Remote-friendly process</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={styles.bottomCTA}>
            <div className={styles.ctaContent}>
              <h2>Ready to Start Your Journey with Aroliya?</h2>
              <p>
                Join our team of innovators and help us build the future of
                technology and services.
              </p>
              <div className={styles.ctaButtons}>
                <button className={styles.ctaApplyButton} onClick={handleApply}>
                  Apply for This Position
                </button>
                <button
                  className={styles.ctaBackButton}
                  onClick={() => router.push("/career")}
                >
                  View Other Opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
