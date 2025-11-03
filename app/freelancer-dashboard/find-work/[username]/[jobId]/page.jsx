"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./JobDetail.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaClock,
  FaUser,
  FaBriefcase,
  FaStar,
  FaRegHeart,
  FaHeart,
  FaShare,
  FaEye,
  FaCalendar,
  FaCheckCircle,
  FaPaperPlane,
  FaRegClock,
  FaHashtag,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaRocket,
  FaShieldAlt,
  FaChartBar,
  FaAward,
  FaDollarSign,
  FaCalendarAlt,
  FaTasks,
} from "react-icons/fa";
import { IoStatsChart, IoTime } from "react-icons/io5";
import { MdWork, MdDescription, MdBusinessCenter } from "react-icons/md";

export default function JobDetailPage() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(83);
  const [currency, setCurrency] = useState("usd");
  const params = useParams();
  const router = useRouter();

  const currencyOptions = [
    { value: "usd", label: "USD Only", icon: FaDollarSign },
    { value: "inr", label: "INR Only", icon: FaMoneyBillWave },
  ];

  useEffect(() => {
    if (params.jobId) {
      fetchJob();
      checkSavedStatus();
      fetchExchangeRate();
    }
  }, [params.jobId]);

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

  const extractJobId = (formattedJobId) => {
    const match = formattedJobId.match(/-(\d+)$/);
    return match ? parseInt(match[1]) : parseInt(formattedJobId);
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      const actualJobId = extractJobId(params.jobId);

      const response = await fetch(`/api/jobs/${actualJobId}`);
      const data = await response.json();

      if (response.ok) {
        setJob(data.job);

        const expectedUsername = data.job.user.name
          .toLowerCase()
          .replace(/\s+/g, "-");
        const expectedJobId = `JOB-${data.job.id.toString().padStart(6, "0")}`;

        if (
          params.username !== expectedUsername ||
          params.jobId !== expectedJobId
        ) {
          router.replace(
            `/freelancer-hub/${expectedUsername}/${expectedJobId}`
          );
        }
      } else {
        setError(data.error || "Failed to fetch job");
      }
    } catch (err) {
      setError("Failed to load job details");
      console.error("Error fetching job:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkSavedStatus = () => {
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    const actualJobId = extractJobId(params.jobId);
    setIsSaved(savedJobs.includes(actualJobId));
  };

  const toggleSaveJob = () => {
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    const actualJobId = extractJobId(params.jobId);

    let newSavedJobs;
    if (isSaved) {
      newSavedJobs = savedJobs.filter((id) => id !== actualJobId);
    } else {
      newSavedJobs = [...savedJobs, actualJobId];
    }

    localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
    setIsSaved(!isSaved);
  };

  const formatJobId = (id) => {
    return `JOB-${id.toString().padStart(6, "0")}`;
  };

  // Format client join date properly
  const formatJoinDate = (dateString) => {
    if (!dateString) {
      return "Recently joined";
    }

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        console.warn("Invalid date received:", dateString);
        return "Recently joined";
      }

      // Format: "January 15, 2024"
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error(
        "Error formatting join date:",
        error,
        "Date string:",
        dateString
      );
      return "Recently joined";
    }
  };

  // Format relative time (e.g., "2 months ago")
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMonths =
        (now.getFullYear() - date.getFullYear()) * 12 +
        (now.getMonth() - date.getMonth());

      if (diffInMonths === 0) {
        return "This month";
      } else if (diffInMonths === 1) {
        return "1 month ago";
      } else if (diffInMonths < 12) {
        return `${diffInMonths} months ago`;
      } else {
        const years = Math.floor(diffInMonths / 12);
        return years === 1 ? "1 year ago" : `${years} years ago`;
      }
    } catch (error) {
      return "Recently";
    }
  };

  // Convert USD to INR
  const convertToINR = (usdAmount) => {
    return Math.round(usdAmount * exchangeRate);
  };

  // Format currency display
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
    if (!date) return "Recently";

    try {
      const now = new Date();
      const posted = new Date(date);

      if (isNaN(posted.getTime())) {
        return "Recently";
      }

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
    } catch (error) {
      console.error("Error calculating time ago:", error);
      return "Recently";
    }
  };

  const getUrgencyLevel = (deadline) => {
    if (!deadline) {
      return { level: "low", label: "Flexible", color: "#059669" };
    }

    try {
      const now = new Date();
      const deadlineDate = new Date(deadline);

      if (isNaN(deadlineDate.getTime())) {
        return { level: "low", label: "Flexible", color: "#059669" };
      }

      const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1)
        return { level: "critical", label: "Urgent", color: "#dc2626" };
      if (diffDays <= 3)
        return { level: "high", label: "Soon", color: "#ea580c" };
      if (diffDays <= 7)
        return { level: "medium", label: "This week", color: "#d97706" };
      return { level: "low", label: "Flexible", color: "#059669" };
    } catch (error) {
      console.error("Error calculating urgency level:", error);
      return { level: "low", label: "Flexible", color: "#059669" };
    }
  };

  const shareJob = (platform) => {
    const url = window.location.href;
    const title = job?.title;

    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.professionalSpinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading job details...
        </motion.p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.errorContainer}>
        <motion.div
          className={styles.errorContent}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Job Not Found</h2>
          <p>{error || "The job you're looking for doesn't exist."}</p>
          <motion.button
            onClick={() => router.push("/freelancer-dashboard/find-work")}
            className={styles.backButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Back to Jobs
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const urgency = getUrgencyLevel(job.deadline);
  const isFeatured = job.budget > 1000;
  const isVerifiedClient = job.user.avgRating > 4.0;
  const budget = formatBudget(job.budget);

  return (
    <div className={styles.container}>
      {/* Header Navigation */}
      <motion.nav
        className={styles.nav}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.navContent}>
          <motion.button
            onClick={() => router.push("/freelancer-dashboard/find-work")}
            className={styles.backButton}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Back to Jobs
          </motion.button>

          <div className={styles.navActions}>
            {/* Currency Toggle */}
            <div className={styles.currencyToggle}>
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

            <motion.button
              onClick={() => setShowShareModal(true)}
              className={styles.shareButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShare /> Share
            </motion.button>
            <motion.button
              onClick={toggleSaveJob}
              className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSaved ? <FaHeart /> : <FaRegHeart />}
              {isSaved ? " Saved" : " Save Job"}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Column - Job Details */}
        <div className={styles.mainContent}>
          {/* Job Header Card */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.jobHeader}>
              <div className={styles.titleSection}>
                <div className={styles.titleRow}>
                  <h1>{job.title}</h1>
                  <div className={styles.badgeGroup}>
                    {isFeatured && (
                      <motion.div
                        className={styles.featuredBadge}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <FaRocket />
                        <span>Featured</span>
                      </motion.div>
                    )}
                    <div className={styles.jobIdBadge}>
                      <FaHashtag />
                      <span>{formatJobId(job.id)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.jobMeta}>
                  <div className={styles.metaItem}>
                    <FaRegClock />
                    <span>Posted {getTimeAgo(job.createdAt)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FaEye />
                    <span>{job._count?.proposals || 0} proposals</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Project Overview Card */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className={styles.cardHeader}>
              <h2>
                <MdBusinessCenter /> Project Overview
              </h2>
            </div>
            <div className={styles.overviewGrid}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <FaDollarSign />
                </div>
                <div className={styles.overviewContent}>
                  <span className={styles.overviewLabel}>Budget</span>
                  <div className={styles.budgetDisplay}>
                    <strong className={styles.budgetPrimary}>
                      {budget.display}
                    </strong>
                    {budget.secondary && (
                      <span className={styles.budgetSecondary}>
                        {budget.secondary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <FaClock />
                </div>
                <div className={styles.overviewContent}>
                  <span className={styles.overviewLabel}>Deadline</span>
                  <strong className={styles.overviewValue}>
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString()
                      : "Flexible"}
                  </strong>
                </div>
              </div>

              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <IoTime />
                </div>
                <div className={styles.overviewContent}>
                  <span className={styles.overviewLabel}>Timeframe</span>
                  <strong className={styles.overviewValue}>
                    {urgency.label}
                  </strong>
                </div>
              </div>

              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <FaTasks />
                </div>
                <div className={styles.overviewContent}>
                  <span className={styles.overviewLabel}>Experience Level</span>
                  <strong className={styles.overviewValue}>
                    {job.experienceLevel || "Intermediate"}
                  </strong>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Project Description Card */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <h2>
                <MdDescription /> Project Description
              </h2>
            </div>
            <div className={styles.descriptionContent}>
              {job.description &&
                job.description.split("\n").map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
            </div>
          </motion.div>

          {/* Skills & Technologies Card */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={styles.cardHeader}>
              <h2>
                <FaAward /> Required Skills & Technologies
              </h2>
            </div>
            <div className={styles.skillsGrid}>
              {job.skills &&
                job.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    className={styles.skillsTag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {skill}
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Client Information Card */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className={styles.cardHeader}>
              <h2>
                <FaUser /> About the Client
              </h2>
            </div>

            <div className={styles.clientProfile}>
              <div className={styles.clientAvatar}>
                {job.user.profile?.avatar ? (
                  <img src={job.user.profile.avatar} alt={job.user.name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <FaUser />
                  </div>
                )}
                {isVerifiedClient && (
                  <motion.div
                    className={styles.verifiedBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FaCheckCircle />
                  </motion.div>
                )}
              </div>

              <div className={styles.clientInfo}>
                <div className={styles.clientName}>
                  <h3>{job.user.name}</h3>
                  {isVerifiedClient && (
                    <span className={styles.verifiedText}>
                      <FaCheckCircle /> Verified Client
                    </span>
                  )}
                </div>

                <div className={styles.clientStats}>
                  <div className={styles.rating}>
                    <FaStar />
                    <span>{job.user.avgRating || "New"}</span>
                    <span className={styles.reviewCount}>
                      ({job.user.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <div className={styles.memberSince}>
                    <FaCalendarAlt />
                    <span>
                      Member since {formatJoinDate(job.user.createdAt)}
                    </span>
                    <span className={styles.relativeTime}>
                      ({formatRelativeTime(job.user.createdAt)})
                    </span>
                  </div>
                </div>

                {job.user.profile?.bio && (
                  <p className={styles.clientBio}>{job.user.profile.bio}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Action Panel */}
        <div className={styles.sidebar}>
          <motion.div
            className={styles.actionPanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={styles.panelHeader}>
              <h3>Submit Proposal</h3>
              <div className={styles.jobReference}>
                <small>Reference: {formatJobId(job.id)}</small>
              </div>
            </div>

            <motion.div
              className={styles.urgencyAlert}
              style={{ borderLeftColor: urgency.color }}
              whileHover={{ scale: 1.02 }}
            >
              <FaClock style={{ color: urgency.color }} />
              <div>
                <strong>{urgency.label} Deadline</strong>
                <span>
                  Apply before{" "}
                  {job.deadline
                    ? new Date(job.deadline).toLocaleDateString()
                    : "Open"}
                </span>
              </div>
            </motion.div>

            <motion.button
              onClick={() => router.push(`/proposals/submit?jobId=${job.id}`)}
              className={styles.submitProposalBtn}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 25px rgba(37, 99, 235, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPaperPlane />
              Submit Proposal
            </motion.button>

            <div className={styles.panelSection}>
              <h4>
                <FaChartBar /> Project Stats
              </h4>
              <div className={styles.stats}>
                {[
                  { label: "Job ID", value: formatJobId(job.id) },
                  { label: "Client", value: job.user.name },
                  { label: "Proposals", value: job._count?.proposals || 0 },
                  { label: "Budget", value: budget.display },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className={styles.statItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={styles.panelSection}>
              <h4>
                <FaShieldAlt /> Safety Tips
              </h4>
              <ul className={styles.safetyTips}>
                {[
                  "Never pay to apply for a job",
                  "Communicate through the platform",
                  "Use secure payment methods",
                  "Report suspicious activity",
                ].map((tip, index) => (
                  <motion.li
                    key={tip}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {tip}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Share This Job</h3>
              <div className={styles.shareUrl}>
                <code>{window.location.href}</code>
              </div>
              <div className={styles.shareOptions}>
                {[
                  { platform: "linkedin", icon: FaLinkedin, label: "LinkedIn" },
                  { platform: "twitter", icon: FaTwitter, label: "Twitter" },
                  { platform: "facebook", icon: FaFacebook, label: "Facebook" },
                ].map((social) => (
                  <motion.button
                    key={social.platform}
                    onClick={() => shareJob(social.platform)}
                    className={styles.shareOption}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon />
                    {social.label}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={() => setShowShareModal(false)}
                className={styles.closeModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
