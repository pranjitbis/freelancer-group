"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./FreelancerHub.module.css";
import Nav from "../home/component/Nav/page";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaBriefcase,
  FaUser,
  FaMoneyBillWave,
  FaClock,
  FaStar,
  FaMapMarkerAlt,
  FaFire,
  FaRocket,
  FaRegClock,
  FaCheckCircle,
  FaRegHeart,
  FaHeart,
  FaSortAmountDown,
  FaEye,
  FaCalendarAlt,
  FaTags,
} from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

export default function FreelancerHub() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    minBudget: "",
    maxBudget: "",
    experienceLevel: "all",
    sortBy: "createdAt",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [viewedJobs, setViewedJobs] = useState(new Set());
  const [user, setUser] = useState(null);
  const router = useRouter();

  const categories = [
    { value: "all", label: "All Categories", icon: "🌐" },
    { value: "web-development", label: "Web Development", icon: "💻" },
    { value: "mobile-development", label: "Mobile Development", icon: "📱" },
    { value: "graphic-design", label: "Graphic Design", icon: "🎨" },
    { value: "digital-marketing", label: "Digital Marketing", icon: "📈" },
    {
      value: "writing-translation",
      label: "Writing & Translation",
      icon: "✍️",
    },
    { value: "video-animation", label: "Video & Animation", icon: "🎥" },
    { value: "data-science", label: "Data Science", icon: "📊" },
    { value: "ai-ml", label: "AI & ML", icon: "🤖" },
    { value: "cybersecurity", label: "Cybersecurity", icon: "🔒" },
  ];

  const experienceLevels = [
    { value: "all", label: "All Levels" },
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "budget", label: "Highest Budget" },
    { value: "deadline", label: "Urgent First" },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchJobs();
    loadSavedJobs();
  }, [filters, pagination.currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "12",
        ...filters,
      });

      const response = await fetch(`/api/jobs?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        setPagination((prev) => ({
          ...prev,
          ...data.pagination,
        }));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = () => {
    const saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    setSavedJobs(new Set(saved));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = useCallback((value) => {
    handleFilterChange("search", value);
  }, []);

  const toggleSaveJob = (jobId) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }
    setSavedJobs(newSavedJobs);
    localStorage.setItem("savedJobs", JSON.stringify([...newSavedJobs]));
  };

  const handleJobClick = (job) => {
    const username = job.user.name.toLowerCase().replace(/\s+/g, "-");
    const jobId = `JOB-${job.id.toString().padStart(6, "0")}`;
    router.push(`/find-work/${username}/${jobId}`);
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
    if (days < 30)
      return `${Math.floor(days / 7)} week${
        Math.floor(days / 7) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(days / 30)} month${
      Math.floor(days / 30) > 1 ? "s" : ""
    } ago`;
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

  const truncateDescription = (description, wordLimit = 20) => {
    const words = description.split(" ");
    if (words.length <= wordLimit) return description;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const featuredJobs = useMemo(() => {
    return jobs.filter((job) => job.budget > 1000).slice(0, 3);
  }, [jobs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className={styles.container}>
      <Nav />

      {/* Advanced Search Section */}
      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchHeader}>
            <h2>Discover Perfect Projects</h2>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search projects, technologies, or keywords..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.quickFilters}>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className={styles.sortSelect}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Carousel */}
      {featuredJobs.length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitle}>
              <FaFire className={styles.featuredIcon} />
              <h2>Featured Opportunities</h2>
            </div>
            <span className={styles.sectionBadge}>Premium</span>
          </div>

          <div className={styles.featuredGrid}>
            {featuredJobs.map((job) => (
              <motion.div
                key={job.id}
                className={styles.featuredCard}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleJobClick(job)}
              >
                <div className={styles.featuredBadge}>
                  <FaStar />
                  Featured
                </div>
                <div className={styles.cardHeader}>
                  <h3>{job.title}</h3>
                  <div className={styles.budgetHighlight}>
                    ${job.budget.toLocaleString()}
                  </div>
                </div>
                <p className={styles.featuredDescription}>
                  {truncateDescription(job.description, 25)}
                </p>
                <div className={styles.featuredSkills}>
                  {job.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className={styles.featuredSkillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className={styles.clientInfo}>
                  <div className={styles.rating}>
                    <FaStar />
                    <span>{job.user.avgRating || "New"}</span>
                  </div>
                  <span>•</span>
                  <span>{job.user.reviewCount || 0} reviews</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Main Jobs Grid */}
      <motion.section
        className={styles.jobsSection}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.sectionHeader}>
          <div className={styles.headerTitle}>
            <IoStatsChart className={styles.statsIcon} />
            <h2>All Opportunities</h2>
          </div>
          <div className={styles.resultsInfo}>
            <span className={styles.resultCount}>
              Showing {jobs.length} of {pagination.totalCount} projects
            </span>
          </div>
        </div>

        <div className={styles.jobsGrid}>
          {jobs.map((job) => {
            const urgency = getUrgencyLevel(job.deadline);
            const isSaved = savedJobs.has(job.id);
            const isViewed = viewedJobs.has(job.id);

            return (
              <motion.div
                key={job.id}
                className={`${styles.jobCard} ${isViewed ? styles.viewed : ""}`}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Card Header with Client Info */}
                <div className={styles.cardHeader}>
                  <div className={styles.clientSection}>
                    <div className={styles.avatar}>
                      {job.user.profile?.avatar ? (
                        <img
                          src={job.user.profile.avatar}
                          alt={job.user.name}
                        />
                      ) : (
                        <FaUser />
                      )}
                      {job.user.avgRating > 4.5 && (
                        <div
                          className={styles.premiumBadge}
                          title="Top Rated Client"
                        >
                          <FaStar />
                        </div>
                      )}
                    </div>
                    <div className={styles.clientDetails}>
                      <h4>{job.user.name}</h4>
                      <div className={styles.rating}>
                        <FaStar />
                        <span>{job.user.avgRating || "New"}</span>
                        <span>({job.user.reviewCount || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.saveButton} ${
                        isSaved ? styles.saved : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                    >
                      {isSaved ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <div
                      className={styles.urgency}
                      style={{ color: urgency.color }}
                    >
                      <FaClock />
                      {urgency.label}
                    </div>
                  </div>
                </div>

                {/* Job Title */}
                <h3
                  className={styles.jobTitle}
                  onClick={() => handleJobClick(job)}
                >
                  {job.title}
                  {isViewed && <FaEye className={styles.viewedIcon} />}
                </h3>

                {/* Upload Time */}
                <div className={styles.uploadTime}>
                  <FaCalendarAlt className={styles.timeIcon} />
                  <span>Posted {getTimeAgo(job.createdAt)}</span>
                </div>

                {/* Budget */}
                <div className={styles.budgetSection}>
                  <FaMoneyBillWave className={styles.budgetIcon} />
                  <span className={styles.budgetAmount}>
                    ${job.budget.toLocaleString()}
                  </span>
                  <span className={styles.budgetLabel}>Budget</span>
                </div>

                {/* Description */}
                <div className={styles.descriptionSection}>
                  <p className={styles.jobDescription}>
                    {truncateDescription(job.description, 20)}
                  </p>
                </div>

                {/* Skills */}
                <div className={styles.skillsSection}>
                  <div className={styles.skillsHeader}>
                    <FaTags className={styles.skillsIcon} />
                    <span>Required Skills</span>
                  </div>
                  <div className={styles.skills}>
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className={styles.moreSkills}>
                        +{job.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Meta Information */}
                <div className={styles.jobMeta}>
                  <div className={styles.metaItem}>
                    <FaBriefcase />
                    <span>{job.category.replace("-", " ")}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FaUser />
                    <span>{job.experienceLevel}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.proposalsInfo}>
                    <span>{job._count.proposals} proposals</span>
                  </div>
                  <button
                    className={styles.applyButton}
                    onClick={() => handleJobClick(job)}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              className={styles.paginationButton}
            >
              Previous
            </button>

            <div className={styles.pageNumbers}>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: page,
                        }))
                      }
                      className={`${styles.pageButton} ${
                        pagination.currentPage === page ? styles.active : ""
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}
      </motion.section>

      {/* Empty State */}
      {jobs.length === 0 && !loading && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.emptyIllustration}>
            <FaBriefcase size={64} />
          </div>
          <h3>No projects match your criteria</h3>
          <p>
            Try adjusting your filters or search terms to find more
            opportunities
          </p>
          <button
            className={styles.resetFilters}
            onClick={() =>
              setFilters({
                search: "",
                category: "all",
                minBudget: "",
                maxBudget: "",
                experienceLevel: "all",
                sortBy: "createdAt",
              })
            }
          >
            Reset All Filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
