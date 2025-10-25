"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./SavedJobs.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBriefcase,
  FaHeart,
  FaUser,
  FaMoneyBillWave,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaTrash,
  FaEye,
  FaPaperPlane,
  FaCalendarAlt,
  FaTags,
  FaDollarSign,
  FaRegHeart,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaBookmark,
  FaLayerGroup,
} from "react-icons/fa";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(83);
  const [currency, setCurrency] = useState("usd");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const router = useRouter();

  const categories = [
    "all",
    "web-development",
    "mobile-development",
    "graphic-design",
    "digital-marketing",
    "video-animation",
    "data-science",
    "ai-ml",
  ];

  const categoryLabels = {
    all: "All Categories",
    "web-development": "Web Development",
    "mobile-development": "Mobile Development",
    "graphic-design": "Graphic Design",
    "digital-marketing": "Digital Marketing",
    "video-animation": "Video & Animation",
    "data-science": "Data Science",
    "ai-ml": "AI & ML",
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSavedJobs(parsedUser.id);
    }
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      setExchangeRate(83);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(83);
    }
  };

  const fetchSavedJobs = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/saved-jobs?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setSavedJobs(data.savedJobs || []);
      } else {
        console.error("Error fetching saved jobs:", data.error);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (savedJobId) => {
    try {
      const response = await fetch(
        `/api/saved-jobs/${savedJobId}?userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
      } else {
        console.error("Error removing saved job");
      }
    } catch (error) {
      console.error("Error removing saved job:", error);
    }
  };

  const formatUSD = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const convertToINR = (usdAmount) => {
    return Math.round(usdAmount * exchangeRate);
  };

  const formatBudget = (budget) => {
    const inrAmount = convertToINR(budget);
    const usdFormatted = formatUSD(budget);
    const inrFormatted = formatINR(inrAmount);

    switch (currency) {
      case "usd":
        return usdFormatted;
      case "inr":
        return inrFormatted;
      default:
        return usdFormatted;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = now - posted;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} week${
      Math.floor(days / 7) > 1 ? "s" : ""
    } ago`;
  };

  const handleJobClick = (job) => {
    const username = job.job.user.name.toLowerCase().replace(/\s+/g, "-");
    const jobId = `JOB-${job.job.id.toString().padStart(6, "0")}`;
    router.push(`/find-work/${username}/${jobId}`);
  };

  const getUrgencyLevel = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1)
      return { level: "critical", label: "Urgent", color: "#dc2626" };
    if (diffDays <= 3)
      return { level: "high", label: "Soon", color: "#ea580c" };
    if (diffDays <= 7)
      return { level: "medium", label: "This week", color: "#d97706" };
    return { level: "low", label: "Flexible", color: "#059669" };
  };

  // Filter and sort saved jobs
  const filteredAndSortedJobs = savedJobs
    .filter((savedJob) => {
      const matchesSearch =
        savedJob.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        savedJob.job.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        savedJob.job.skills.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || savedJob.job.category === filterCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "budget-high":
          return b.job.budget - a.job.budget;
        case "budget-low":
          return a.job.budget - b.job.budget;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
      },
    },
    hover: {
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2>Authentication Required</h2>
          <p>Please log in to view your saved jobs</p>
          <button
            className={styles.loginButton}
            onClick={() => router.push("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.headerMain}>
            <div className={styles.headerTitle}>
              <div className={styles.titleBadge}>
                <FaBookmark className={styles.badgeIcon} />
                <span>Saved Jobs</span>
              </div>
              <h1>Your Job Collection</h1>
              <p>Manage and organize jobs you're interested in applying to</p>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaLayerGroup />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{savedJobs.length}</div>
                  <div className={styles.statLabel}>Total Saved</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaFilter />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {filteredAndSortedJobs.length}
                  </div>
                  <div className={styles.statLabel}>Filtered</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaBriefcase />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {
                      savedJobs.filter(
                        (sj) => new Date(sj.job.deadline) > new Date()
                      ).length
                    }
                  </div>
                  <div className={styles.statLabel}>Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <section className={styles.controlsSection}>
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search saved jobs by title, description, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.filterSelect}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Currency</label>
              <div className={styles.currencyToggle}>
                <button
                  className={`${styles.currencyButton} ${
                    currency === "usd" ? styles.active : ""
                  }`}
                  onClick={() => setCurrency("usd")}
                >
                  <FaDollarSign />
                  USD
                </button>
                <button
                  className={`${styles.currencyButton} ${
                    currency === "inr" ? styles.active : ""
                  }`}
                  onClick={() => setCurrency("inr")}
                >
                  <RiMoneyRupeeCircleFill />
                  INR
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.contentSection}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className={styles.loadingState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={styles.loadingSpinner}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <p>Loading your saved jobs...</p>
            </motion.div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <motion.div
              key="empty"
              className={styles.emptyState}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className={styles.emptyIllustration}>
                {searchTerm || filterCategory !== "all" ? (
                  <FaSearch />
                ) : (
                  <FaRegHeart />
                )}
              </div>
              <h3>
                {searchTerm || filterCategory !== "all"
                  ? "No matching saved jobs found"
                  : "No saved jobs yet"}
              </h3>
              <p>
                {searchTerm || filterCategory !== "all"
                  ? "Try adjusting your search criteria or filters to find what you're looking for."
                  : "Start browsing available projects and save the ones that match your skills and interests."}
              </p>
              <motion.button
                className={styles.browseButton}
                onClick={() => router.push("/find-work")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaBriefcase />
                Browse Available Jobs
              </motion.button>
            </motion.div>
          ) : (
            <div className={styles.contentArea}>
              <div className={styles.resultsHeader}>
                <h2>Saved Jobs ({filteredAndSortedJobs.length})</h2>
                <p>Jobs you've bookmarked for future reference</p>
              </div>

              <motion.div
                className={styles.jobsGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredAndSortedJobs.map((savedJob) => {
                    const urgency = getUrgencyLevel(savedJob.job.deadline);

                    return (
                      <motion.div
                        key={savedJob.id}
                        className={styles.jobCard}
                        variants={itemVariants}
                        whileHover="hover"
                        layout
                      >
                        {/* Card Header */}
                        <div className={styles.cardHeader}>
                          <div className={styles.clientInfo}>
                            <div className={styles.clientAvatar}>
                              {savedJob.job.user.profile?.avatar ? (
                                <img
                                  src={savedJob.job.user.profile.avatar}
                                  alt={savedJob.job.user.name}
                                />
                              ) : (
                                <FaUser />
                              )}
                            </div>
                            <div className={styles.clientDetails}>
                              <h4 className={styles.clientName}>
                                {savedJob.job.user.name}
                              </h4>
                              <div className={styles.savedInfo}>
                                <FaCalendarAlt />
                                <span>
                                  Saved {getTimeAgo(savedJob.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <motion.button
                            className={styles.removeButton}
                            onClick={() => removeSavedJob(savedJob.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Remove from saved"
                          >
                            <FaTrash />
                          </motion.button>
                        </div>

                        {/* Job Content */}
                        <div className={styles.jobContent}>
                          <div className={styles.jobMeta}>
                            <span className={styles.category}>
                              {savedJob.job.category.replace("-", " ")}
                            </span>
                            <span
                              className={styles.urgency}
                              style={{ color: urgency.color }}
                            >
                              {urgency.label}
                            </span>
                          </div>

                          <h3
                            className={styles.jobTitle}
                            onClick={() => handleJobClick(savedJob)}
                          >
                            {savedJob.job.title}
                          </h3>

                          <p className={styles.jobDescription}>
                            {savedJob.job.description.length > 120
                              ? `${savedJob.job.description.substring(
                                  0,
                                  120
                                )}...`
                              : savedJob.job.description}
                          </p>

                          <div className={styles.jobDetails}>
                            <div className={styles.detailItem}>
                              <FaMoneyBillWave />
                              <span>{formatBudget(savedJob.job.budget)}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <FaClock />
                              <span>
                                Posted {getTimeAgo(savedJob.job.createdAt)}
                              </span>
                            </div>
                            <div className={styles.detailItem}>
                              <FaPaperPlane />
                              <span>
                                {savedJob.job._count?.proposals || 0} proposals
                              </span>
                            </div>
                          </div>

                          <div className={styles.skillsSection}>
                            <div className={styles.skills}>
                              {savedJob.job.skills
                                .split(",")
                                .slice(0, 4)
                                .map((skill, index) => (
                                  <span key={index} className={styles.skillTag}>
                                    {skill.trim()}
                                  </span>
                                ))}
                              {savedJob.job.skills.split(",").length > 4 && (
                                <span className={styles.moreSkills}>
                                  +{savedJob.job.skills.split(",").length - 4}{" "}
                                  more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className={styles.cardFooter}>
                          <div className={styles.experienceLevel}>
                            <span>{savedJob.job.experienceLevel} Level</span>
                          </div>
                          <div className={styles.actionButtons}>
                            <motion.button
                              className={styles.viewButton}
                              onClick={() => handleJobClick(savedJob)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <FaEye />
                              View Details
                            </motion.button>
                            <motion.button
                              className={styles.applyButton}
                              onClick={() => handleJobClick(savedJob)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <FaPaperPlane />
                              Apply Now
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
