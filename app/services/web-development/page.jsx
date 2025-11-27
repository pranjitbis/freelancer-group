"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FiCode,
  FiCloud,
  FiGitBranch,
  FiUsers,
  FiBarChart,
  FiBook,
  FiDownload,
  FiStar,
  FiCheck,
  FiTerminal,
  FiDatabase,
  FiServer,
  FiShield,
  FiZap,
  FiMail,
  FiMessageSquare,
} from "react-icons/fi";

import { DiPhp } from "react-icons/di";
import Nav from "../../home/component/Nav/page";
import Footer from "../../home/footer/page";
import WhatsApp from "../../whatsapp_icon/page";
import {
  SiNextdotjs,
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiMysql,
  SiGit,
  SiDocker,
  SiAmazon, // ✅ correct one
} from "react-icons/si";
import { SiFigma } from "react-icons/si";
import styles from "./WebDeve.module.css";
import Link from "next/link";
const Services = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/webdev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      alert("Your request was submitted successfully! 🚀");
      setFormData({ name: "", email: "", message: "" });
    } else {
      alert("Submission failed ❌");
    }
  };

  const TypeWriter = ({ text, speed }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, index));
        index++;
        if (index > text.length) clearInterval(interval);
      }, speed);

      return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
  };

  const TypeWriterTerminal = ({ lines, speed = 60, delay = 600 }) => {
    const [display, setDisplay] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
      if (index >= lines.length) return;

      let [command, output] = lines[index].split("|");
      let typed = "";
      let i = 0;

      const typing = setInterval(() => {
        typed = command.slice(0, i);
        setDisplay((prev) => [...prev.slice(0, index), typed]);
        i++;

        if (i > command.length) {
          clearInterval(typing);
          if (output) {
            setTimeout(() => {
              setDisplay((prev) => [...prev.slice(0, index), command, output]);
              setIndex(index + 1);
            }, delay);
          } else {
            setTimeout(() => setIndex(index + 1), delay / 2);
          }
        }
      }, speed);

      return () => clearInterval(typing);
    }, [index]);

    return (
      <pre>
        {display.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </pre>
    );
  };
  const features = [
    {
      icon: <FiCode />,
      title: "Code",
      description:
        "Write, edit, and manage your code with intelligent syntax highlighting and auto-completion.",
      highlights: [
        "Smart Code Completion",
        "Syntax Highlighting",
        "Code Formatting",
        "Error Detection",
      ],
    },
    {
      icon: <FiCloud />,
      title: "Build & Deploy",
      description:
        "Automate your build process and deploy seamlessly to any cloud platform.",
      highlights: [
        "CI/CD Pipelines",
        "Auto Scaling",
        "Zero Downtime",
        "Multi-cloud Support",
      ],
    },
    {
      icon: <FiGitBranch />,
      title: "Built-in Git",
      description:
        "Integrated Git support for version control and collaboration.",
      highlights: [
        "Git Integration",
        "Branch Management",
        "Pull Requests",
        "Code Review",
      ],
    },
    {
      icon: <FiUsers />,
      title: "Collaborate",
      description:
        "Real-time collaboration with team members and code sharing.",
      highlights: [
        "Live Sharing",
        "Team Workspaces",
        "Comment System",
        "Access Control",
      ],
    },
    {
      icon: <FiBarChart />,
      title: "Analyze",
      description:
        "Advanced analytics and insights into your code and deployment performance.",
      highlights: [
        "Performance Metrics",
        "Error Tracking",
        "User Analytics",
        "Custom Reports",
      ],
    },
  ];

  const technologies = [
    { name: "Next.js", icon: <SiNextdotjs />, color: "#000000" },
    { name: "React", icon: <SiReact />, color: "#61DAFB" },
    { name: "Node.js", icon: <SiNodedotjs />, color: "#339933" },
    { name: "MongoDB", icon: <SiMongodb />, color: "#47A248" },
    { name: "MySQL", icon: <SiMysql />, color: "#4479A1" },
    { name: "Git", icon: <SiGit />, color: "#F05032" },
    { name: "Docker", icon: <SiDocker />, color: "#2496ED" },
    { name: "AWS", icon: <SiAmazon />, color: "#FF9900" },
    { name: "PHP", icon: <DiPhp />, color: "#777BB4" },
    { name: "Figma", icon: <SiFigma />, color: "#F24E1E" },
  ];

  const projects = [
    {
      title: "Learning Management System",
      description:
        "Complete e-learning platform with course management and student tracking",
      status: "Live",
      link: "https://elenxia.com/",
      technologies: ["Next.js", "MongoDB", "Stripe", "AWS"],
    },
    {
      link: "https://text-writerr.netlify.app/",
      title: "Text-to-Handwriting",
      description:
        "AI-powered handwriting conversion with multiple font styles",
      status: "Live",
      technologies: ["React", "Canvas"],
    },
    {
      link: "https://groupsop.com/",
      title: "WhatsApp Group Manager",
      description: "Platform for managing and sharing WhatsApp groups securely",
      status: "Live",
      technologies: ["PHP", "MYSQL", "AWS"],
    },
    {
      link: "https://weather-web-app-mu-sepia.vercel.app/",
      title: "Real-time Weather App",
      description: "Weather application with dynamic backgrounds and live data",
      status: "Live",
      technologies: ["React", "Weather API", "Chart.js", "Netlify"],
    },

    {
      link: "https://image-downloaderr.netlify.app/",
      title: "Image Downloader",
      description: "Download high quickly images  and effortlessly",
      status: "Live",
      technologies: ["Next JS", "Weather API", "Netlify"],
    },
    {
      link: "https://telegragrouplink.com/",
      title: "Telegram Group Share",
      description: "Easily share and discover Telegram groups in one place",
      status: "Live",
      technologies: ["PHP", "Wordpress", "MYSQL", "Hosinger"],
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at TechStart",
      content:
        "The development service exceeded our expectations. Professional, fast, and delivered exactly what we needed.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Product Manager at ScaleUp",
      content:
        "Outstanding work on our LMS platform. The attention to detail and performance optimization was impressive.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Founder at EduTech",
      content:
        "Transformed our idea into a profitable product. Great communication and technical expertise.",
      rating: 5,
    },
    // 20 Indian names
    {
      name: "Aarav Sharma",
      role: "CEO at Innovatech",
      content:
        "Their web solutions helped us scale quickly. Highly professional and reliable team.",
      rating: 5,
    },
    {
      name: "Ananya Patel",
      role: "Product Lead at NexaSoft",
      content:
        "Amazing experience! Delivered high-quality work on time and exceeded our expectations.",
      rating: 5,
    },
    {
      name: "Rohan Gupta",
      role: "Founder at TechBridge",
      content:
        "The team understood our requirements perfectly and implemented them flawlessly.",
      rating: 5,
    },
    {
      name: "Priya Reddy",
      role: "CTO at SmartApps",
      content:
        "Excellent communication and highly skilled developers. Our project was completed smoothly.",
      rating: 5,
    },
    {
      name: "Vikram Singh",
      role: "Product Manager at CloudWorks",
      content:
        "Professional, responsive, and technically sound. Highly recommended for web development.",
      rating: 5,
    },
    {
      name: "Ishita Mehra",
      role: "CEO at EduSolutions",
      content:
        "They transformed our vision into a functional product quickly and efficiently.",
      rating: 5,
    },
    {
      name: "Aditya Joshi",
      role: "Founder at CodeCraft",
      content:
        "High-quality work with attention to detail. Delivered everything on time and beyond expectations.",
      rating: 5,
    },
    {
      name: "Sneha Kapoor",
      role: "Lead Designer at PixelWorks",
      content:
        "Creative, professional, and reliable. Loved working with this team.",
      rating: 5,
    },
    {
      name: "Kartik Verma",
      role: "CTO at AppVentures",
      content:
        "Exceptional development skills and great communication. Our website looks amazing.",
      rating: 5,
    },
    {
      name: "Shreya Nair",
      role: "Product Manager at TechNova",
      content:
        "Delivered a robust and scalable solution. Very happy with their professionalism.",
      rating: 5,
    },
    {
      name: "Arjun Kapoor",
      role: "Founder at CloudSync",
      content:
        "The project was completed flawlessly and ahead of schedule. Highly recommend.",
      rating: 5,
    },
    {
      name: "Riya Malhotra",
      role: "CEO at SmartTech",
      content:
        "Talented and dependable team. They really understood our vision and delivered.",
      rating: 5,
    },
    {
      name: "Siddharth Chawla",
      role: "Lead Developer at Webify",
      content:
        "Professional, skilled, and communicative. Our app’s performance has improved greatly.",
      rating: 5,
    },
    {
      name: "Anika Sharma",
      role: "Founder at DigiWorks",
      content:
        "Excellent experience. The team delivered beyond expectations and maintained quality.",
      rating: 5,
    },
    {
      name: "Manish Jain",
      role: "Product Lead at Cloudware",
      content:
        "Reliable, professional, and highly skilled. Our website development was seamless.",
      rating: 5,
    },
    {
      name: "Pooja Desai",
      role: "CTO at TechFusion",
      content:
        "Outstanding execution and great communication. Highly recommended for any project.",
      rating: 5,
    },
    {
      name: "Raghav Nair",
      role: "Founder at AppSphere",
      content:
        "Delivered a polished product on time. Very happy with the quality and service.",
      rating: 5,
    },
    {
      name: "Tanya Kapoor",
      role: "Product Manager at Innovix",
      content:
        "Extremely professional team. Our project was completed efficiently and beautifully.",
      rating: 5,
    },
    {
      name: "Devansh Mehta",
      role: "CEO at WebWorks",
      content:
        "They handled our requirements perfectly and delivered a flawless website.",
      rating: 5,
    },
    {
      name: "Aisha Reddy",
      role: "Lead Designer at PixelCraft",
      content:
        "Very skilled team with excellent communication. Loved the final output.",
      rating: 5,
    },
  ];

  return (
    <>
      <Nav />
      <div className={styles.container}>
        <WhatsApp />
        <section className={styles.hero}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroText}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={styles.heroTitle}>
                It's time to make your
                <span className={styles.gradientText}> software</span>
              </h2>
              <p className={styles.heroSubtitle}>
                What do you want to{" "}
                <span className={styles.highlight}>
                  [code, build, debug, deploy, collaborate on, analyze]
                </span>{" "}
                today?
              </p>

              <motion.div
                className={styles.downloadSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className={styles.downloadCard}>
                  <Link href="/register?userType=user">
                    <button>
                      <h3>Start Building</h3>
                    </button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.heroVisual}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className={styles.codeWindow}>
                <div className={styles.windowHeader}>
                  <div className={styles.windowControls}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className={styles.fileName}>service-controller.js</span>
                </div>

                <div className={styles.codeContent}>
                  <motion.pre
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TypeWriter
                      text={`import { motion } from 'framer-motion';
import { useState } from 'react';

const ServiceController = () => {
  const [features, setFeatures] = useState([
    'Code', 'Build', 'Debug', 'Deploy',
    'Collaborate', 'Analyze', 'Learn'
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <YourInterface />
    </motion.div>
  );
};

export default ServiceController;`}
                      speed={25}
                    />
                  </motion.pre>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2>Our Features</h2>
            <p>
              Everything you need to build, deploy, and scale your applications
            </p>
          </div>

          <div className={styles.featuresContainer}>
            <div className={styles.featuresNav}>
              {features.map((feature, index) => (
                <motion.button
                  key={index}
                  className={`${styles.featureTab} ${
                    activeFeature === index ? styles.active : ""
                  }`}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <span>{feature.title}</span>
                </motion.button>
              ))}
            </div>

            <div className={styles.featureContent}>
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={styles.featureDetail}
              >
                <h3>{features[activeFeature].title}</h3>
                <p>{features[activeFeature].description}</p>
                <div className={styles.highlights}>
                  {features[activeFeature].highlights.map(
                    (highlight, index) => (
                      <div key={index} className={styles.highlightItem}>
                        <FiCheck className={styles.checkIcon} />
                        <span>{highlight}</span>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Built-in Git Section */}
        <section className={styles.gitSection}>
          <div className={styles.gitContainer}>
            <motion.div
              className={styles.gitContent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <FiGitBranch className={styles.gitIcon} />
              <h2>Built-in Git</h2>
              <p>
                Working with Git and other SCM providers, targeting the
                application from new installs or API service. Seamless
                integration with your existing workflow.
              </p>
              <div className={styles.gitFeatures}>
                <div className={styles.gitFeature}>
                  <FiCheck />
                  <span>Version Control Integration</span>
                </div>
                <div className={styles.gitFeature}>
                  <FiCheck />
                  <span>Pull Request Management</span>
                </div>
                <div className={styles.gitFeature}>
                  <FiCheck />
                  <span>Code Review Tools</span>
                </div>
                <div className={styles.gitFeature}>
                  <FiCheck />
                  <span>Branch Protection</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={styles.terminal}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className={styles.terminalHeader}>
                <div className={styles.terminalControls}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>terminal — bash</span>
              </div>
              <div className={styles.terminalContent}>
                <TypeWriterTerminal
                  lines={[
                    "$ git init|Initialized empty Git repository",
                    "$ git add .",
                    `$ git commit -m "Initial commit"|[main (root-commit) abc1234] Initial commit`,
                    "$ git push origin main|Everything up-to-date",
                    "$ git branch feature/new-ui",
                    "$ git checkout feature/new-ui|Switched to branch 'feature/new-ui'",
                  ]}
                  speed={70}
                  delay={700}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Technologies Section */}
        <section className={styles.technologiesSection}>
          <div className={styles.sectionHeader}>
            <h2>Supported Technologies</h2>
            <p>Comprehensive support for modern development stacks and tools</p>
          </div>

          <div className={styles.techGrid}>
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                className={styles.techCard}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={styles.techIcon} style={{ color: tech.color }}>
                  {tech.icon}
                </div>
                <span>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Showcase */}
        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <h2>Successful Projects</h2>
            <p>
              Real projects generating revenue and solving business problems
            </p>
          </div>

          <div className={styles.projectsGrid}>
            {projects.map((project, index) => (
              <Link href={project.link} key={index}>
                <motion.div
                  key={index}
                  className={styles.projectCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className={styles.projectHeader}>
                    <h3>{project.title}</h3>
                    <div className={styles.projectStatus}>
                      <span className={styles.status}>{project.status}</span>
                    </div>
                  </div>
                  <p>{project.description}</p>
                  <div className={styles.projectTech}>
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className={styles.testimonials}>
          <div className={styles.sectionHeader}></div>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialsTrack}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className={styles.testimonialCard}>
                  <div className={styles.rating}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className={styles.star} />
                    ))}
                  </div>
                  <p>"{testimonial.content}"</p>
                  <div className={styles.author}>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form CTA  */}
        {/* Contact Form CTA  */}
        <section className={styles.finalCTA}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <FiZap className={styles.ctaIcon} />

            <h2>Let's Build Something Great</h2>
            <p>
              Share your project details — our team will get back within 24
              hours.
            </p>

            <form onSubmit={handleSubmit} className={styles.proForm}>
              {/* NAME FIELD */}
              <div className={styles.formRow}>
                <FiUsers className={styles.fieldIcon} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* EMAIL FIELD */}
              <div className={styles.formRow}>
                <FiMail className={styles.fieldIcon} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PROJECT MESSAGE */}
              <div className={styles.formRowText}>
                <FiMessageSquare className={styles.fieldIconText} />
                <textarea
                  name="message"
                  placeholder="Describe your project..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <motion.button
                type="submit"
                className={styles.proSubmitBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                🚀 Submit & Get Quote
              </motion.button>
            </form>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Services;
