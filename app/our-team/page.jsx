"use client";
import React, { useState } from "react";
import WhatsApp from "../whatsapp_icon/page";
import {
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaBehance,
  FaDribbble,
  FaLightbulb,
  FaCode,
  FaUsers,
  FaRocket,
  FaHeart,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaShieldAlt,
  FaChartLine,
  FaHandshake,
  FaGlobeAmericas,
  FaUserTie,
  FaPalette,
  FaMobileAlt,
  FaCloud,
  FaDatabase,
  FaNetworkWired,
  FaAward,
  FaBalanceScale,
  FaEye,
  FaChevronRight,
} from "react-icons/fa";
import styles from "./Team.module.css";
import Navs from "../home/component/Nav/page";
import Footer from "../home/footer/page";

const Team = () => {
  const [activeTab, setActiveTab] = useState("team");

  const teamMembers = [
    {
      id: 1,
      name: "Neeraj Baghel",
      role: "CEO & Founder",
      image: "/about/sir-image.png",
      bio: "Visionary leader with 8+ years of experience in building successful tech ventures. Passionate about creating opportunities for global talent.",
      location: "India",
      experience: "8+ years",
      expertise: ["Strategic Planning", "Business Development", "Leadership"],
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      id: 2,
      name: "Chintan Rabadiya",
      role: "Senior Web Developer",
      image: "/team/Chintan.png",
      bio: "Full-stack developer specializing in scalable web applications and modern JavaScript frameworks.",
      location: "India",
      experience: "4+ years",
      expertise: ["React.js", "Node.js", "MongoDB"],
      social: {
        linkedin: "#",
        github: "#",
      },
    },
    {
      id: 3,
      name: "Sela Pawestri",
      role: "Social Media Strategist",
      image: "/team/Sela.png",
      bio: "Digital marketing expert focused on brand growth and engagement across social platforms.",
      location: "Indonesia",
      experience: "3+ years",
      expertise: ["Content Strategy", "Community Management", "Analytics"],
      social: {
        linkedin: "#",
        instagram: "#",
      },
    },
    {
      id: 4,
      name: "Pranjit Biswas",
      role: "Project Manager & Full Stack Developer",
      image: "/team/pranjit.jpeg",
      bio: "Experienced in leading cross-functional teams and delivering complex web solutions.",
      location: "India",
      experience: "5+ years",
      expertise: [
        "Project Management",
        "Agile Methodology",
        "System Architecture",
      ],
      social: {
        linkedin: "https://www.linkedin.com/in/pranjit-biswas-42066526b/",
        github: "https://github.com/pranjitbis/",
      },
    },
    {
      id: 5,
      name: "Nidhi Hongal",
      role: "Executive Assistant",
      image: "/team/Nidhi.png",
      bio: "Organized professional ensuring seamless operations and executive support.",
      location: "India",
      experience: "2+ years",
      expertise: ["Administrative Support", "Communication", "Organization"],
      social: {
        linkedin: "#",
      },
    },
    {
      id: 6,
      name: "Jay Sikar",
      role: "Virtual Assistant Specialist",
      image: "/team/Jay.png",
      bio: "Multifaceted virtual assistant with extensive experience supporting international clients.",
      location: "India",
      experience: "6+ years",
      expertise: ["Client Support", "Operations", "Social Media Management"],
      social: {
        linkedin: "#",
      },
    },
  ];

  const expertiseAreas = [
    {
      icon: <FaCode className={styles.expertiseIcon} />,
      title: "Technology & Development",
      description:
        "Cutting-edge solutions using modern frameworks and architectures",
      technologies: ["React", "Node.js", "Python", "Cloud Infrastructure"],
      color: "#2563eb",
    },
    {
      icon: <FaRocket className={styles.expertiseIcon} />,
      title: "Digital Marketing",
      description:
        "Data-driven strategies for brand growth and customer engagement",
      technologies: ["SEO", "Social Media", "Content Marketing", "Analytics"],
      color: "#dc2626",
    },
    {
      icon: <FaUsers className={styles.expertiseIcon} />,
      title: "Project Management",
      description: "Agile methodologies for efficient project delivery",
      technologies: ["Scrum", "Kanban", "Risk Management", "Team Leadership"],
      color: "#059669",
    },
    {
      icon: <FaPalette className={styles.expertiseIcon} />,
      title: "UI/UX Design",
      description:
        "User-centered design principles for exceptional experiences",
      technologies: ["Figma", "Adobe Suite", "Prototyping", "User Research"],
      color: "#7c3aed",
    },
  ];

  const teamStructure = [
    {
      department: "Leadership & Strategy",
      roles: ["CEO & Founder", "Project Managers"],
      count: 2,
      icon: <FaUserTie className={styles.departmentIcon} />,
      color: "#1e40af",
    },
    {
      department: "Technology & Development",
      roles: ["Full Stack Developers", "Web Developers", "Technical Leads"],
      count: 2,
      icon: <FaCode className={styles.departmentIcon} />,
      color: "#0369a1",
    },
    {
      department: "Marketing & Growth",
      roles: [
        "Social Media Managers",
        "Digital Marketers",
        "Content Strategists",
      ],
      count: 1,
      icon: <FaChartLine className={styles.departmentIcon} />,
      color: "#dc2626",
    },
    {
      department: "Operations & Support",
      roles: ["Executive Assistants", "Virtual Assistants", "Client Support"],
      count: 2,
      icon: <FaNetworkWired className={styles.departmentIcon} />,
      color: "#059669",
    },
  ];

  const values = [
    {
      icon: <FaHandshake className={styles.valueIcon} />,
      title: "Collaboration",
      description: "We believe in the power of teamwork and shared success",
      principles: ["Open Communication", "Shared Goals", "Mutual Respect"],
      color: "#2563eb",
    },
    {
      icon: <FaEye className={styles.valueIcon} />,
      title: "Transparency",
      description:
        "Honest communication builds trust with clients and team members",
      principles: ["Clear Processes", "Open Feedback", "Honest Reporting"],
      color: "#059669",
    },
    {
      icon: <FaRocket className={styles.valueIcon} />,
      title: "Innovation",
      description: "Continuous improvement through creative problem-solving",
      principles: [
        "Creative Thinking",
        "Technology Adoption",
        "Process Optimization",
      ],
      color: "#7c3aed",
    },
    {
      icon: <FaHeart className={styles.valueIcon} />,
      title: "Excellence",
      description:
        "Commitment to delivering exceptional quality in everything we do",
      principles: [
        "Quality Focus",
        "Attention to Detail",
        "Continuous Learning",
      ],
      color: "#dc2626",
    },
  ];

  const achievements = [
    { metric: "50+", label: "Projects Completed" },
    { metric: "15+", label: "Countries Served" },
    { metric: "98%", label: "Client Satisfaction" },
    { metric: "24/7", label: "Support Availability" },
  ];

  const socialIcons = {
    twitter: FaTwitter,
    linkedin: FaLinkedin,
    instagram: FaInstagram,
    github: FaGithub,
    behance: FaBehance,
    dribbble: FaDribbble,
  };

  return (
    <div className={styles.pageWrapper}>
      <Navs />
      <WhatsApp />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Meet Our <span className={styles.highlight}>Expert Team</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A collective of passionate professionals dedicated to delivering
            exceptional digital solutions. Our diverse team brings together
            expertise from across the globe to drive your success.
          </p>
        </div>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.container}>
          {/* Tabs Navigation */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "team" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("team")}
              >
                <FaUsers className={styles.tabIcon} />
                Our Team
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "expertise" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("expertise")}
              >
                <FaCode className={styles.tabIcon} />
                Our Expertise
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "values" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("values")}
              >
                <FaAward className={styles.tabIcon} />
                Our Values
              </button>
            </div>
          </div>

          {/* Team Members Section */}
          {activeTab === "team" && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h2>Our Leadership & Team</h2>
                <p>
                  Meet the talented individuals who drive innovation and
                  excellence at Aroliya
                </p>
              </div>

              <div className={styles.teamGrid}>
                {teamMembers.map((member) => (
                  <div key={member.id} className={styles.teamCard}>
                    <div className={styles.imageContainer}>
                      <img
                        src={member.image}
                        alt={member.name}
                        className={styles.memberImage}
                      />
                      <div className={styles.socialLinks}>
                        {Object.entries(member.social).map(
                          ([platform, url]) => {
                            const IconComponent = socialIcons[platform];
                            return (
                              <a
                                key={platform}
                                href={url}
                                className={styles.socialIcon}
                                aria-label={`${member.name}'s ${platform}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconComponent />
                              </a>
                            );
                          }
                        )}
                      </div>
                    </div>
                    <div className={styles.memberInfo}>
                      <h3 className={styles.memberName}>{member.name}</h3>
                      <p className={styles.memberRole}>{member.role}</p>
                      <div className={styles.memberDetails}>
                        <div className={styles.detailItem}>
                          <FaMapMarkerAlt className={styles.detailIcon} />
                          <span>{member.location}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <FaBriefcase className={styles.detailIcon} />
                          <span>{member.experience}</span>
                        </div>
                      </div>
                      <p className={styles.memberBio}>{member.bio}</p>
                      <div className={styles.expertiseTags}>
                        {member.expertise.map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Team Structure Section */}
              <div className={styles.structureSection}>
                <div className={styles.sectionHeader}>
                  <h2>Team Structure & Expertise</h2>
                  <p>
                    Organized for efficiency and collaboration across all
                    departments
                  </p>
                </div>
                <div className={styles.structureGrid}>
                  {teamStructure.map((department, index) => (
                    <div key={index} className={styles.departmentCard}>
                      <div
                        className={styles.departmentHeader}
                        style={{ borderLeftColor: department.color }}
                      >
                        <div className={styles.departmentIconWrapper}>
                          {department.icon}
                        </div>
                        <div>
                          <h3>{department.department}</h3>
                          <span className={styles.roleCount}>
                            {department.count} members
                          </span>
                        </div>
                      </div>
                      <ul className={styles.roleList}>
                        {department.roles.map((role, roleIndex) => (
                          <li key={roleIndex} className={styles.roleItem}>
                            <FaChevronRight className={styles.roleIcon} />
                            {role}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expertise Section */}
          {activeTab === "expertise" && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h2>Our Areas of Expertise</h2>
                <p>
                  Comprehensive digital solutions tailored to your business
                  needs
                </p>
              </div>

              <div className={styles.expertiseGrid}>
                {expertiseAreas.map((area, index) => (
                  <div key={index} className={styles.expertiseCard}>
                    <div
                      className={styles.expertiseHeader}
                      style={{ color: area.color }}
                    >
                      {area.icon}
                      <h3>{area.title}</h3>
                    </div>
                    <p className={styles.expertiseDescription}>
                      {area.description}
                    </p>
                    <div className={styles.technologies}>
                      <h4>Core Technologies:</h4>
                      <div className={styles.techTags}>
                        {area.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className={styles.techTag}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.capabilitiesSection}>
                <h3>Our Technical Capabilities</h3>
                <div className={styles.capabilitiesGrid}>
                  <div className={styles.capabilityItem}>
                    <FaCloud className={styles.capabilityIcon} />
                    <h4>Cloud Solutions</h4>
                    <p>Scalable infrastructure and cloud deployment</p>
                  </div>
                  <div className={styles.capabilityItem}>
                    <FaMobileAlt className={styles.capabilityIcon} />
                    <h4>Mobile Development</h4>
                    <p>Cross-platform mobile applications</p>
                  </div>
                  <div className={styles.capabilityItem}>
                    <FaDatabase className={styles.capabilityIcon} />
                    <h4>Database Management</h4>
                    <p>Optimized data storage and retrieval</p>
                  </div>
                  <div className={styles.capabilityItem}>
                    <FaShieldAlt className={styles.capabilityIcon} />
                    <h4>Security</h4>
                    <p>Enterprise-grade security protocols</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Values Section */}
          {activeTab === "values" && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h2>Our Core Values</h2>
                <p>The principles that guide our work and define our culture</p>
              </div>

              <div className={styles.valuesGrid}>
                {values.map((value, index) => (
                  <div key={index} className={styles.valueCard}>
                    <div
                      className={styles.valueIconWrapper}
                      style={{ color: value.color }}
                    >
                      {value.icon}
                    </div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                    <ul className={styles.principlesList}>
                      {value.principles.map((principle, principleIndex) => (
                        <li
                          key={principleIndex}
                          className={styles.principleItem}
                        >
                          <FaChevronRight className={styles.principleIcon} />
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className={styles.missionSection}>
                <div className={styles.missionContent}>
                  <FaGlobeAmericas className={styles.missionIcon} />
                  <h3>Our Mission</h3>
                  <p>
                    To bridge the gap between exceptional talent and businesses
                    worldwide, delivering innovative solutions that drive growth
                    and create lasting impact.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Closing Statement */}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Team;
