"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./FreelancerHub.module.css";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBriefcase,
  FaUser,
  FaMoneyBillWave,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaRegHeart,
  FaHeart,
  FaCalendarAlt,
  FaTags,
  FaDollarSign,
  FaMapMarkerAlt,
  FaEye,
  FaPaperPlane,
} from "react-icons/fa";
import { IoStatsChart, IoBusiness } from "react-icons/io5";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { MdWork, MdTrendingUp } from "react-icons/md";

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
  const [savedJobs, setSavedJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(83);
  const [currency, setCurrency] = useState("usd");
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();

  const categories = [
    { value: "all", label: "All Categories", icon: MdWork },
    { value: "web-development", label: "Web Development", icon: FaBriefcase },
    {
      value: "mobile-development",
      label: "Mobile Development",
      icon: FaBriefcase,
    },
    { value: "graphic-design", label: "Graphic Design", icon: FaBriefcase },
    {
      value: "digital-marketing",
      label: "Digital Marketing",
      icon: MdTrendingUp,
    },
    { value: "video-animation", label: "Video & Animation", icon: FaBriefcase },
    { value: "data-science", label: "Data Science", icon: IoStatsChart },
    { value: "ai-ml", label: "AI & ML", icon: IoStatsChart },
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

  // Animation Variants
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
      y: 30,
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pagination.currentPage]);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSavedJobs(parsedUser.id);
    }
    fetchExchangeRate();
    fetchJobs();
  }, [filters, pagination.currentPage]);

  const fetchExchangeRate = async () => {
    try {
      setExchangeRate(83);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(83);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "12",
        ...filters,
        ...(user && { userId: user.id.toString() }),
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

  const fetchSavedJobs = async (userId) => {
    try {
      const response = await fetch(`/api/saved-jobs?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setSavedJobs(data.savedJobs || []);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = useCallback((value) => {
    handleFilterChange("search", value);
  }, []);

  const toggleSaveJob = async (jobId) => {
    if (!user) {
      alert("Please login to save jobs");
      return;
    }

    try {
      const isCurrentlySaved = savedJobs.some((sj) => sj.jobId === jobId);

      if (isCurrentlySaved) {
        // Remove from saved
        const savedJobToRemove = savedJobs.find((sj) => sj.jobId === jobId);
        const response = await fetch(
          `/api/saved-jobs/${savedJobToRemove.id}?userId=${user.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setSavedJobs((prev) => prev.filter((sj) => sj.jobId !== jobId));
          // Update jobs list
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId ? { ...job, isSaved: false } : job
            )
          );
        }
      } else {
        // Add to saved
        const response = await fetch("/api/saved-jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            jobId: jobId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSavedJobs((prev) => [...prev, data.savedJob]);
          // Update jobs list
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId ? { ...job, isSaved: true } : job
            )
          );
        }
      }
    } catch (error) {
      console.error("Error toggling save job:", error);
    }
  };

  const handleJobClick = (job) => {
    const username = job.user.name.toLowerCase().replace(/\s+/g, "-");
    const jobId = `JOB-${job.id.toString().padStart(6, "0")}`;
    router.push(`/freelancer-dashboard/find-work/${username}/${jobId}`);
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
        return {
          display: usdFormatted,
          tooltip: inrFormatted,
        };
      case "inr":
        return {
          display: inrFormatted,
          tooltip: usdFormatted,
        };
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

  const isJobSaved = (jobId) => {
    return savedJobs.some((sj) => sj.jobId === jobId);
  };

  return (
    <div className={styles.container}>
      {/* Professional Header Banner with Animations */}
      <motion.section
        className={styles.heroBanner}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.bannerContent}>
          <div className={styles.bannerMain}>
            <motion.div
              className={styles.bannerBadge}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <IoBusiness className={styles.badgeIcon} />
              <span>Asia's Leading Platform</span>
            </motion.div>

            <motion.h1
              className={styles.bannerTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              The #1 Freelancing Hub in Asia
            </motion.h1>

            <motion.p
              className={styles.bannerSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              Connect with premium clients and build your career on Asia's most
              trusted freelance platform
            </motion.p>

            <motion.div
              className={styles.bannerStats}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <motion.div className={styles.stat}>
                <div className={styles.statNumber}>50,000+</div>
                <div className={styles.statLabel}>Professional Freelancers</div>
              </motion.div>
              <div className={styles.statDivider}></div>
              <motion.div className={styles.stat}>
                <div className={styles.statNumber}>98%</div>
                <div className={styles.statLabel}>Success Rate</div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className={styles.bannerVisual}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <div className={styles.visualCard}>
              <FaBriefcase className={styles.visualIcon} />
              <div className={styles.visualText}>
                <span>Premium Projects</span>
                <small>High-value opportunities</small>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Advanced Filter Section */}
      <motion.section
        className={styles.filterSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className={styles.filterContainer}>
          <div className={styles.filterHeader}>
            <h2>Find Perfect Projects</h2>
            <p>Filter by your preferences and skills</p>
          </div>

          <div className={styles.searchRow}>
            <motion.div
              className={styles.searchBox}
              animate={searchFocused ? { scale: 1.02 } : { scale: 1 }}
              whileHover={{ scale: 1.01 }}
            >
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search projects, skills, or keywords..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={styles.searchInput}
              />
            </motion.div>

            <div className={styles.currencySelector}>
              <span className={styles.selectorLabel}>Currency:</span>
              <div className={styles.currencyButtons}>
                {currencyOptions.map((option, index) => {
                  const IconComponent = option.icon;
                  return (
                    <motion.button
                      key={option.value}
                      className={`${styles.currencyButton} ${
                        currency === option.value ? styles.active : ""
                      }`}
                      onClick={() => setCurrency(option.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      <IconComponent className={styles.currencyIcon} />
                      {option.value.toUpperCase()}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.div
            className={styles.filterRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className={styles.filterGroup}>
              <motion.select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className={styles.filterSelect}
                whileFocus={{ scale: 1.02 }}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </motion.select>
            </div>

            <div className={styles.filterGroup}>
              <motion.select
                value={filters.experienceLevel}
                onChange={(e) =>
                  handleFilterChange("experienceLevel", e.target.value)
                }
                className={styles.filterSelect}
                whileFocus={{ scale: 1.02 }}
              >
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </motion.select>
            </div>

            <div className={styles.filterGroup}>
              <motion.select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className={styles.filterSelect}
                whileFocus={{ scale: 1.02 }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </motion.select>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Jobs Grid */}
      <section className={styles.jobsSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className={styles.headerInfo}>
            <IoStatsChart className={styles.sectionIcon} />
            <div>
              <h2>Available Projects</h2>
              <p>Browse and apply to projects matching your expertise</p>
            </div>
          </div>
          <div className={styles.resultsInfo}>
            <span className={styles.resultCount}>
              {pagination.totalCount} projects available
            </span>
            {user && (
              <Link href="/freelancer-dashboard/save-jobs">
                <motion.button
                  className={styles.dashboardButton}
                  onClick={() =>
                    router.push("/freelancer-dashboard/save-jobs")
                  }
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <div className={styles.buttonContent}>
                    <div className={styles.buttonIcon}>
                      <FaHeart />
                    </div>
                    <div className={styles.buttonText}>
                      <span className={styles.buttonLabel}>Saved Jobs</span>
                      <span className={styles.buttonCount}>
                        {savedJobs.length}
                      </span>
                    </div>
                  </div>
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className={styles.loadingState}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                className={styles.loadingSpinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Loading professional opportunities...
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="jobs"
              className={styles.jobsGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {jobs.map((job) => {
                  const urgency = getUrgencyLevel(job.deadline);
                  const isSaved = job.isSaved || isJobSaved(job.id);
                  const budget = formatBudget(job.budget);
                  const CategoryIcon =
                    categories.find((cat) => cat.value === job.category)
                      ?.icon || FaBriefcase;

                  return (
                    <motion.div
                      key={job.id}
                      className={styles.jobCard}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileTap="tap"
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        transition: { duration: 0.3 },
                      }}
                      layout
                    >
                      {/* Card Header */}
                      <div className={styles.cardHeader}>
                        <div className={styles.clientSection}>
                          <motion.div
                            className={styles.clientAvatar}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {job.user.profile?.avatar ? (
                              <img
                                src={job.user.profile.avatar}
                                alt={job.user.name}
                              />
                            ) : (
                              <FaUser />
                            )}
                            {job.user.avgRating > 4.5 && (
                              <motion.div
                                className={styles.verifiedBadge}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                              >
                                <FaCheckCircle />
                              </motion.div>
                            )}
                          </motion.div>
                          <div className={styles.clientInfo}>
                            <h4 className={styles.clientName}>
                              {job.user.name}
                            </h4>
                            <div className={styles.clientRating}>
                              <FaStar className={styles.ratingIcon} />
                              <span>{job.user.avgRating || "New"}</span>
                              <span className={styles.reviewCount}>
                                ({job.user.reviewCount || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          className={`${styles.saveButton} ${
                            isSaved ? styles.saved : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          animate={{
                            scale: isSaved ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isSaved ? <FaHeart /> : <FaRegHeart />}
                        </motion.button>
                      </div>

                      {/* Job Content */}
                      <div className={styles.jobContent}>
                        <motion.div
                          className={styles.jobCategory}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <CategoryIcon className={styles.categoryIcon} />
                          <span>{job.category.replace("-", " ")}</span>
                        </motion.div>

                        <motion.h3
                          className={styles.jobTitle}
                          onClick={() => handleJobClick(job)}
                          whileHover={{ color: "#3b82f6" }}
                          transition={{ duration: 0.2 }}
                        >
                          {job.title}
                        </motion.h3>

                        <motion.p
                          className={styles.jobDescription}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {truncateDescription(job.description, 25)}
                        </motion.p>

                        <motion.div
                          className={styles.jobMeta}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
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
                        </motion.div>

                        <motion.div
                          className={styles.budgetSection}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className={styles.budget}>
                            <FaMoneyBillWave className={styles.budgetIcon} />
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
                        </motion.div>

                        <motion.div
                          className={styles.skillsSection}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className={styles.skillsHeader}>
                            <FaTags />
                            <span>Required Skills</span>
                          </div>
                          <div className={styles.skills}>
                            {job.skills.slice(0, 4).map((skill, index) => (
                              <motion.span
                                key={index}
                                className={styles.skillTag}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                {skill}
                              </motion.span>
                            ))}
                            {job.skills.length > 4 && (
                              <motion.span
                                className={styles.moreSkills}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                              >
                                +{job.skills.length - 4} more
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      {/* Card Footer */}
                      <motion.div
                        className={styles.cardFooter}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <div className={styles.footerMeta}>
                          <div className={styles.proposals}>
                            <FaPaperPlane />
                            <span>{job._count?.proposals || 0} proposals</span>
                          </div>
                          <div className={styles.experienceLevel}>
                            <FaUser />
                            <span>{job.experienceLevel}</span>
                          </div>
                        </div>
                        <motion.button
                          className={styles.applyButton}
                          onClick={() => handleJobClick(job)}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "#374151",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaEye />
                          View Project
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {pagination.totalPages > 1 && !loading && (
          <motion.div
            className={styles.pagination}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              className={styles.paginationButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Previous
            </motion.button>

            <div className={styles.pageNumbers}>
              {/* Always show first page */}
              <motion.button
                key={1}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }))
                }
                className={`${styles.pageButton} ${
                  pagination.currentPage === 1 ? styles.active : ""
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: pagination.currentPage === 1 ? 1.1 : 1,
                }}
              >
                1
              </motion.button>

              {/* Show ellipsis if needed */}
              {pagination.currentPage > 3 && (
                <span className={styles.pageEllipsis}>...</span>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page > 1 &&
                    page < pagination.totalPages &&
                    Math.abs(page - pagination.currentPage) <= 1
                )
                .map((page) => (
                  <motion.button
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
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: pagination.currentPage === page ? 1.1 : 1,
                    }}
                  >
                    {page}
                  </motion.button>
                ))}

              {/* Show ellipsis if needed */}
              {pagination.currentPage < pagination.totalPages - 2 && (
                <span className={styles.pageEllipsis}>...</span>
              )}

              {/* Always show last page if there's more than 1 page */}
              {pagination.totalPages > 1 && (
                <motion.button
                  key={pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: pagination.totalPages,
                    }))
                  }
                  className={`${styles.pageButton} ${
                    pagination.currentPage === pagination.totalPages
                      ? styles.active
                      : ""
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    scale:
                      pagination.currentPage === pagination.totalPages
                        ? 1.1
                        : 1,
                  }}
                >
                  {pagination.totalPages}
                </motion.button>
              )}
            </div>

            <motion.button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              className={styles.paginationButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
