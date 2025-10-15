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
  FaCheckCircle,
  FaPaperPlane,
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
  FaMapMarkerAlt,
  FaGlobe,
  FaFileAlt,
} from "react-icons/fa";
import { IoTime, IoBusiness } from "react-icons/io5";
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
    { value: "usd", label: "USD", icon: FaDollarSign },
    { value: "inr", label: "INR", icon: FaMoneyBillWave },
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
      } else {
        setError(data.error || "Failed to fetch job");
      }
    } catch (err) {
      setError("Failed to load job details");
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

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Recently joined";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
      }).format(date);
    } catch (error) {
      return "Recently joined";
    }
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
        return { display: usdFormatted, tooltip: inrFormatted };
      case "inr":
        return { display: inrFormatted, tooltip: usdFormatted };
      default:
        return { display: usdFormatted, secondary: inrFormatted };
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "Recently";
    try {
      const now = new Date();
      const posted = new Date(date);
      const diff = now - posted;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
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
      return "Recently";
    }
  };

  const getUrgencyLevel = (deadline) => {
    if (!deadline) return { level: "low", label: "Flexible", color: "#14a800" };
    try {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1)
        return { level: "critical", label: "Urgent", color: "#ff5630" };
      if (diffDays <= 3)
        return { level: "high", label: "Soon", color: "#ff7452" };
      if (diffDays <= 7)
        return { level: "medium", label: "This week", color: "#ffab00" };
      return { level: "low", label: "Flexible", color: "#14a800" };
    } catch (error) {
      return { level: "low", label: "Flexible", color: "#14a800" };
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
        />
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
            onClick={() => router.push("/freelancer-hub")}
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
      {/* Header */}
      <motion.nav
        className={styles.nav}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.navContent}>
          <motion.button
            onClick={() => router.push("/freelancer-hub")}
            className={styles.backButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Back to Jobs
          </motion.button>

          <div className={styles.navActions}>
            <div className={styles.currencyToggle}>
              {currencyOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    className={`${styles.currencyButton} ${
                      currency === option.value ? styles.active : ""
                    }`}
                    onClick={() => setCurrency(option.value)}
                  >
                    <IconComponent className={styles.currencyIcon} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <motion.button
              onClick={() => setShowShareModal(true)}
              className={styles.shareButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShare />
            </motion.button>

            <motion.button
              onClick={toggleSaveJob}
              className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSaved ? <FaHeart /> : <FaRegHeart />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <div className={styles.content}>
        {/* Left Column - Job Details */}
        <div className={styles.mainContent}>
          {/* Job Header */}
          <motion.div
            className={styles.jobHeaderCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.headerTop}>
              <div className={styles.titleSection}>
                <h1>{job.title}</h1>
                <div className={styles.jobMeta}>
                  <span className={styles.postedTime}>
                    <FaClock /> Posted {getTimeAgo(job.createdAt)}
                  </span>
                  <span className={styles.proposalsCount}>
                    <FaEye /> {job._count?.proposals || 0} proposals
                  </span>
                  {isFeatured && (
                    <span className={styles.featuredBadge}>
                      <FaRocket /> Featured
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.budgetSection}>
                <div className={styles.budgetDisplay} title={budget.tooltip}>
                  <span className={styles.budgetAmount}>{budget.display}</span>
                  {budget.secondary && (
                    <span className={styles.budgetSecondary}>
                      {budget.secondary}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Job Details Sections */}
          <div className={styles.detailsGrid}>
            {/* Description */}
            <motion.div
              className={styles.detailCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className={styles.cardHeader}>
                <MdDescription className={styles.cardIcon} />
                <h3>Job Description</h3>
              </div>
              <div className={styles.cardContent}>
                {job.description &&
                  job.description
                    .split("\n")
                    .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              className={styles.detailCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.cardHeader}>
                <FaAward className={styles.cardIcon} />
                <h3>Skills & Expertise</h3>
              </div>
              <div className={styles.skillsContainer}>
                {job.skills &&
                  job.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
              </div>
            </motion.div>

            {/* Project Details */}
            <motion.div
              className={styles.detailCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={styles.cardHeader}>
                <MdBusinessCenter className={styles.cardIcon} />
                <h3>Project Details</h3>
              </div>
              <div className={styles.detailsGridSmall}>
                <div className={styles.detailItem}>
                  <FaClock className={styles.detailIcon} />
                  <div>
                    <label>Deadline</label>
                    <span>
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : "Flexible"}
                    </span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <IoTime className={styles.detailIcon} />
                  <div>
                    <label>Urgency</label>
                    <span style={{ color: urgency.color }}>
                      {urgency.label}
                    </span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FaTasks className={styles.detailIcon} />
                  <div>
                    <label>Experience Level</label>
                    <span>{job.experienceLevel || "Intermediate"}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FaBriefcase className={styles.detailIcon} />
                  <div>
                    <label>Category</label>
                    <span>{job.category?.replace("-", " ") || "General"}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Client Information */}
            <motion.div
              className={styles.detailCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className={styles.cardHeader}>
                <IoBusiness className={styles.cardIcon} />
                <h3>About the Client</h3>
              </div>
              <div className={styles.clientProfile}>
                <div className={styles.clientHeader}>
                  <div className={styles.clientAvatar}>
                    {job.user.profile?.avatar ? (
                      <img src={job.user.profile.avatar} alt={job.user.name} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <FaUser />
                      </div>
                    )}
                    {isVerifiedClient && (
                      <div
                        className={styles.verifiedBadge}
                        title="Verified Client"
                      >
                        <FaCheckCircle />
                      </div>
                    )}
                  </div>
                  <div className={styles.clientInfo}>
                    <h4>{job.user.name}</h4>
                    <div className={styles.clientStats}>
                      <div className={styles.rating}>
                        <FaStar />
                        <span>{job.user.avgRating || "New"}</span>
                        <span>({job.user.reviewCount || 0} reviews)</span>
                      </div>
                      <div className={styles.memberSince}>
                        <FaCalendarAlt />
                        <span>
                          Member since {formatJoinDate(job.user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {job.user.profile?.bio && (
                  <div className={styles.clientBio}>
                    <p>{job.user.profile.bio}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Action Panel */}
        <div className={styles.sidebar}>
          <motion.div
            className={styles.actionPanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={() => router.push(`/proposals/submit?jobId=${job.id}`)}
              className={styles.submitProposalBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPaperPlane />
              Submit Proposal
            </motion.button>

            <div
              className={styles.urgencyAlert}
              style={{ borderColor: urgency.color }}
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
            </div>

            <div className={styles.panelSection}>
              <h4>
                <FaChartBar /> Job Overview
              </h4>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Job ID</span>
                  <span className={styles.statValue}>
                    {formatJobId(job.id)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Proposals</span>
                  <span className={styles.statValue}>
                    {job._count?.proposals || 0}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Budget</span>
                  <span className={styles.statValue}>{budget.display}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Client Location</span>
                  <span className={styles.statValue}>Worldwide</span>
                </div>
              </div>
            </div>

            <div className={styles.panelSection}>
              <h4>
                <FaShieldAlt /> Safety Tips
              </h4>
              <ul className={styles.safetyTips}>
                <li>Never pay to apply for a job</li>
                <li>Communicate through the platform</li>
                <li>Use secure payment methods</li>
                <li>Report suspicious activity</li>
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
              <div className={styles.shareOptions}>
                {[
                  {
                    platform: "linkedin",
                    icon: FaLinkedin,
                    label: "LinkedIn",
                    color: "#0077b5",
                  },
                  {
                    platform: "twitter",
                    icon: FaTwitter,
                    label: "Twitter",
                    color: "#1da1f2",
                  },
                  {
                    platform: "facebook",
                    icon: FaFacebook,
                    label: "Facebook",
                    color: "#1877f2",
                  },
                ].map((social) => (
                  <motion.button
                    key={social.platform}
                    onClick={() => shareJob(social.platform)}
                    className={styles.shareOption}
                    style={{ backgroundColor: social.color }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon />
                    {social.label}
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className={styles.closeModal}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
