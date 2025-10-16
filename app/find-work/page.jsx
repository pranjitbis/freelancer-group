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
  const [savedJobs, setSavedJobs] = useState(new Set());
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

  const bannerVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const badgeVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  const statsVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
        delay: 0.5,
      },
    },
  };

  const statItemVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
      },
    },
  };

  const searchVariants = {
    focused: {
      scale: 1.02,
      boxShadow: "0 10px 40px rgba(59, 130, 246, 0.15)",
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
    unfocused: {
      scale: 1,
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  };

  const filterVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delay: 0.8,
      },
    },
  };

  const loadingVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  const emptyStateVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const paginationVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchExchangeRate();
    fetchJobs();
    loadSavedJobs();
  }, [filters, pagination.currentPage]);

  const fetchExchangeRate = async () => {
    try {
      setExchangeRate(83);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(83);
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

  return (
    <div className={styles.container}>
      <Nav />

      {/* Professional Header Banner with Animations */}
      <motion.section
        className={styles.heroBanner}
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.bannerContent}>
          <div className={styles.bannerMain}>
            <motion.div
              className={styles.bannerBadge}
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
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
              variants={statsVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className={styles.stat} variants={statItemVariants}>
                <div className={styles.statNumber}>50,000+</div>
                <div className={styles.statLabel}>Professional Freelancers</div>
              </motion.div>
              <div className={styles.statDivider}></div>
              <motion.div className={styles.stat} variants={statItemVariants}>
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
        variants={filterVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.filterContainer}>
          <motion.div
            className={styles.filterHeader}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2>Find Perfect Projects</h2>
            <p>Filter by your preferences and skills</p>
          </motion.div>

          <div className={styles.searchRow}>
            <motion.div
              className={styles.searchBox}
              variants={searchVariants}
              animate={searchFocused ? "focused" : "unfocused"}
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

            <motion.div
              className={styles.currencySelector}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
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
            </motion.div>
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
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className={styles.loadingState}
              variants={loadingVariants}
              initial="initial"
              animate="animate"
              exit="exit"
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
                  const isSaved = savedJobs.has(job.id);
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

        {/* Pagination */}
        {pagination.totalPages > 1 && !loading && (
          <motion.div
            className={styles.pagination}
            variants={paginationVariants}
            initial="hidden"
            animate="visible"
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
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
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
                  );
                }
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

        {/* Empty State */}
        {jobs.length === 0 && !loading && (
          <motion.div
            className={styles.emptyState}
            variants={emptyStateVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className={styles.emptyIllustration}
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <FaBriefcase />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              No projects matching your criteria
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Try adjusting your filters or search terms
            </motion.p>
            <motion.button
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Reset Filters
            </motion.button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
