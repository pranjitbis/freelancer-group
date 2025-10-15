"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./FreelancerHub.module.css";
import Nav from "../home/component/Nav/page";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBriefcase,
  FaUser,
  FaMoneyBillWave,
  FaClock,
  FaStar,
  FaFire,
  FaCheckCircle,
  FaRegHeart,
  FaHeart,
  FaCalendarAlt,
  FaTags,
  FaDollarSign,
  FaGlobeAmericas,
} from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";

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
  const [exchangeRate, setExchangeRate] = useState(83); // Default INR rate
  const [currency, setCurrency] = useState("usd"); // "usd", "inr", or "both"
  const router = useRouter();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web-development", label: "Web Development" },
    { value: "mobile-development", label: "Mobile Development" },
    { value: "graphic-design", label: "Graphic Design" },
    { value: "digital-marketing", label: "Digital Marketing" },
    { value: "video-animation", label: "Video & Animation" },
    { value: "data-science", label: "Data Science" },
    { value: "ai-ml", label: "AI & ML" },
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

  const currencyOptions = [
    { value: "usd", label: "USD Only", icon: FaDollarSign },
    { value: "inr", label: "INR Only", icon: RiMoneyRupeeCircleFill },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchExchangeRate();
    fetchJobs();
    loadSavedJobs();
  }, [filters, pagination.currentPage]);

  // Fetch current USD to INR exchange rate
  const fetchExchangeRate = async () => {
    try {
      setExchangeRate(83); // Fixed rate for demo
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(83); // Fallback rate
    }
  };

  // Format USD with standard international formatting
  const formatUSD = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format INR with Indian numbering system (2,20,727 format)
  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  // Convert USD to INR
  const convertToINR = (usdAmount) => {
    return Math.round(usdAmount * exchangeRate);
  };

  // Format currency display based on selected currency option
  const formatBudget = (budget) => {
    const inrAmount = convertToINR(budget);
    const usdFormatted = formatUSD(budget);
    const inrFormatted = formatINR(inrAmount);

    switch (currency) {
      case "usd":
        return {
          display: usdFormatted,
          tooltip: inrFormatted,
        };
      case "inr":
        return {
          display: inrFormatted,
          tooltip: usdFormatted,
        };
      case "both":
      default:
        return {
          display: usdFormatted,
          secondary: inrFormatted,
          tooltip: null,
        };
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
            <div className={styles.headerTop}>
              <div className={styles.headerText}>
                <h1 className={styles.mainTitle}>Find Your Next Project</h1>
                <p className={styles.subtitle}>
                  Discover opportunities that match your skills and expertise
                </p>
              </div>
              <div className={styles.currencyControls}>
                <div className={styles.currencyToggle}>
                  <span className={styles.currencyLabel}>
                    Display Currency:
                  </span>
                  <div className={styles.currencyButtons}>
                    {currencyOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          className={`${styles.currencyButton} ${
                            currency === option.value ? styles.active : ""
                          }`}
                          onClick={() => setCurrency(option.value)}
                          title={option.label}
                        >
                          <IconComponent className={styles.currencyIcon} />
                          <span className={styles.currencyText}>
                            {option.value.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.exchangeRate}>
                  <small>1 USD = {formatINR(exchangeRate)}</small>
                </div>
              </div>
            </div>
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

            <div className={styles.filterControls}>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className={styles.filterSelect}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.experienceLevel}
                onChange={(e) =>
                  handleFilterChange("experienceLevel", e.target.value)
                }
                className={styles.filterSelect}
              >
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className={styles.filterSelect}
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
      {/* Main Jobs Grid */}
      <motion.section
        className={styles.jobsSection}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <IoStatsChart className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>All Projects</h2>
              <p className={styles.sectionDescription}>
                Browse all available opportunities
              </p>
            </div>
          </div>
          <div className={styles.resultsInfo}>
            <span className={styles.resultCount}>
              Showing {jobs.length} of {pagination.totalCount} projects
            </span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading projects...</p>
          </div>
        ) : (
          <div className={styles.jobsGrid}>
            {jobs.map((job) => {
              const urgency = getUrgencyLevel(job.deadline);
              const isSaved = savedJobs.has(job.id);
              const isViewed = viewedJobs.has(job.id);
              const budget = formatBudget(job.budget);

              return (
                <motion.div
                  key={job.id}
                  className={`${styles.jobCard} ${
                    isViewed ? styles.viewed : ""
                  }`}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.clientInfo}>
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
                            className={styles.verifiedBadge}
                            title="Top Rated Client"
                          >
                            <FaCheckCircle />
                          </div>
                        )}
                      </div>
                      <div className={styles.clientDetails}>
                        <h4 className={styles.clientName}>{job.user.name}</h4>
                        <div className={styles.rating}>
                          <FaStar />
                          <span>{job.user.avgRating || "New"}</span>
                          <span className={styles.reviewCount}>
                            ({job.user.reviewCount || 0})
                          </span>
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
                        title={isSaved ? "Remove from saved" : "Save job"}
                      >
                        {isSaved ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>
                  </div>

                  {/* Job Content */}
                  <div className={styles.jobContent}>
                    <h3
                      className={styles.jobTitle}
                      onClick={() => handleJobClick(job)}
                    >
                      {job.title}
                    </h3>

                    <div className={styles.jobMeta}>
                      <div className={styles.metaItem}>
                        <FaCalendarAlt />
                        <span>{getTimeAgo(job.createdAt)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FaClock />
                        <span style={{ color: urgency.color }}>
                          {urgency.label}
                        </span>
                      </div>
                    </div>

                    <div
                      className={styles.budget}
                      title={budget.tooltip || undefined}
                    >
                      <FaMoneyBillWave />
                      <div className={styles.budgetAmounts}>
                        <div className={styles.budgetPrimary}>
                          {budget.display}
                        </div>
                        {budget.secondary && (
                          <div className={styles.budgetSecondary}>
                            {budget.secondary}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className={styles.jobDescription}>
                      {truncateDescription(job.description, 20)}
                    </p>

                    <div className={styles.skillsContainer}>
                      <div className={styles.skillsHeader}>
                        <FaTags />
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

                    <div className={styles.additionalInfo}>
                      <div className={styles.infoItem}>
                        <FaBriefcase />
                        <span>{job.category.replace("-", " ")}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <FaUser />
                        <span>{job.experienceLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <div className={styles.proposals}>
                      <span>{job._count?.proposals || 0} proposals</span>
                    </div>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleJobClick(job)}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

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

        {/* Empty State */}
        {jobs.length === 0 && !loading && (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.emptyIllustration}>
              <FaBriefcase />
            </div>
            <h3>No projects found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button
              className={styles.resetButton}
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
              Clear Filters
            </button>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}
