// app/client-dashboard/analytics/page.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaChartLine,
  FaDollarSign,
  FaStar,
  FaUser,
  FaBriefcase,
  FaCalendar,
  FaMoneyBillWave,
  FaProjectDiagram,
  FaExchangeAlt,
  FaGlobeAmericas,
  FaRocket,
  FaRupeeSign,
  FaUsers,
  FaTimes,
  FaCheck,
  FaSmile,
  FaFrown,
  FaMeh,
  FaHandshake,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaRegClock,
  FaChartBar,
  FaEdit,
  FaEye,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaDownload,
  FaFileExport,
  FaWallet,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import styles from "./ClientAnalytics.module.css";

// Enhanced Chart Components with Error Handling
const BarChart = ({ data, title, height = 200, currency, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.chartContainer}>
        {title && <h4 className={styles.chartTitle}>{title}</h4>}
        <div className={styles.chartSkeleton} style={{ height }}>
          <div className={styles.skeletonBars}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonBar} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        {title && <h4 className={styles.chartTitle}>{title}</h4>}
        <div className={styles.chartPlaceholder} style={{ height }}>
          <FaChartBar className={styles.placeholderIcon} />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Filter out invalid data and ensure values are numbers
  const validData = data.filter(
    (item) => item && typeof item.value === "number" && !isNaN(item.value)
  );

  if (validData.length === 0) {
    return (
      <div className={styles.chartContainer}>
        {title && <h4 className={styles.chartTitle}>{title}</h4>}
        <div className={styles.chartPlaceholder} style={{ height }}>
          <FaChartBar className={styles.placeholderIcon} />
          <p>No valid data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...validData.map((item) => item.value));

  return (
    <div className={styles.chartContainer}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <div className={styles.barChart} style={{ height }}>
        {validData.map((item, index) => (
          <div key={item.label || index} className={styles.barWrapper}>
            <motion.div
              className={styles.bar}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              style={{ backgroundColor: item.color || "#3b82f6" }}
            >
              <span className={styles.barValue}>
                {currency === "USD" ? "$" : "₹"}
                {item.value?.toLocaleString() || "0"}
              </span>
            </motion.div>
            <span className={styles.barLabel}>
              {item.label || `Item ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PieChart = ({ data, title, size = 120, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.chartContainer}>
        {title && <h4 className={styles.chartTitle}>{title}</h4>}
        <div
          className={styles.pieSkeleton}
          style={{ width: size, height: size }}
        >
          <div className={styles.skeletonPie} />
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        {title && <h4 className={styles.chartTitle}>{title}</h4>}
        <div className={styles.chartPlaceholder}>
          <FaChartPie className={styles.placeholderIcon} />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Filter valid data and ensure values are numbers
  const validData = data.filter(
    (item) => item && typeof item.value === "number" && !isNaN(item.value)
  );

  if (validData.length === 0 || validData.every((item) => item.value === 0)) {
    return (
      <div className={styles.chartContainer}>
        {title && <h4 className={styles.chartTitle}>{title}</h4>}
        <div className={styles.chartPlaceholder}>
          <FaChartPie className={styles.placeholderIcon} />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const total = validData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.chartContainer}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <div className={styles.pieWrapper} style={{ width: size, height: size }}>
        <div className={styles.pieChart}>
          {validData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const rotation = validData
              .slice(0, index)
              .reduce(
                (sum, prevItem) => sum + (prevItem.value / total) * 360,
                0
              );

            return (
              <div
                key={item.label || index}
                className={styles.pieSegment}
                style={{
                  backgroundColor: item.color || "#3b82f6",
                  transform: `rotate(${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${
                    50 + 50 * Math.cos((percentage * 2 * Math.PI) / 360)
                  }% ${50 + 50 * Math.sin((percentage * 2 * Math.PI) / 360)}%)`,
                }}
              />
            );
          })}
        </div>
        <div className={styles.pieCenter}>
          <span className={styles.pieTotal}>{total}</span>
          <span className={styles.pieLabel}>Total</span>
        </div>
      </div>
      <div className={styles.pieLegend}>
        {validData.map((item, index) => (
          <div key={item.label || index} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: item.color || "#3b82f6" }}
            />
            <span className={styles.legendText}>
              {item.label || `Item ${index + 1}`}
            </span>
            <span className={styles.legendValue}>({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced StatCard Component with Safe Value Handling
const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  color,
  delay = 0,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <div className={`${styles.statIcon} ${styles.skeleton}`} />
          <div className={`${styles.trend} ${styles.skeleton}`} />
        </div>
        <div className={styles.statContent}>
          <div className={`${styles.statTitle} ${styles.skeleton}`} />
          <div className={`${styles.statValue} ${styles.skeleton}`} />
          <div className={`${styles.statSubtitle} ${styles.skeleton}`} />
        </div>
      </div>
    );
  }

  // Safe value handling
  const displayValue = value || "0";
  const displayTrend = trend || 0;

  return (
    <motion.div
      className={styles.statCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className={styles.statHeader}>
        <div className={styles.statIcon} style={{ backgroundColor: color }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={`${styles.trend} ${
              displayTrend > 0
                ? styles.trendUp
                : displayTrend < 0
                ? styles.trendDown
                : styles.trendNeutral
            }`}
          >
            {displayTrend > 0 ? (
              <FaArrowUp />
            ) : displayTrend < 0 ? (
              <FaArrowDown />
            ) : (
              <span>•</span>
            )}
            {displayTrend !== 0 ? `${Math.abs(displayTrend)}%` : "0%"}
          </div>
        )}
      </div>
      <div className={styles.statContent}>
        <h3 className={styles.statTitle}>{title}</h3>
        <div className={styles.statValue}>{displayValue}</div>
        <div className={styles.statSubtitle}>{subtitle}</div>
      </div>
    </motion.div>
  );
};

// Enhanced Review Card Component with Safe Data Handling
const ReviewCard = ({
  item,
  type,
  onReview,
  onReturnReview,
  onViewDetails,
  formatCurrency,
  formatDate,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={styles.reviewCard}>
        <div className={styles.cardHeader}>
          <div className={styles.projectInfo}>
            <div className={`${styles.projectIcon} ${styles.skeleton}`} />
            <div className={styles.projectDetails}>
              <div className={`${styles.projectTitle} ${styles.skeleton}`} />
              <div className={`${styles.projectBudget} ${styles.skeleton}`} />
            </div>
          </div>
          <div className={`${styles.statusBadge} ${styles.skeleton}`} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.reviewMeta}>
            <div className={styles.freelancerInfo}>
              <div className={`${styles.avatar} ${styles.skeleton}`} />
              <div>
                <div
                  className={`${styles.freelancerName} ${styles.skeleton}`}
                />
                <div
                  className={`${styles.freelancerRole} ${styles.skeleton}`}
                />
              </div>
            </div>
            <div className={styles.reviewStats}>
              <div className={`${styles.rating} ${styles.skeleton}`} />
              <div className={`${styles.date} ${styles.skeleton}`} />
            </div>
          </div>
          <div className={`${styles.comment} ${styles.skeleton}`} />
        </div>
        <div className={styles.cardActions}>
          <div className={`${styles.btnPrimary} ${styles.skeleton}`} />
        </div>
      </div>
    );
  }

  // Safe data access with fallbacks
  const safeItem = item || {};
  const getProjectTitle = () => {
    const title = safeItem.title || safeItem.project?.title;
    if (!title || title === "Unknown Project") {
      if (type === "given") {
        return `Project with ${safeItem.reviewee?.name || "Freelancer"}`;
      } else if (type === "received") {
        return `Project with ${safeItem.reviewer?.name || "Freelancer"}`;
      } else {
        return `Project with ${safeItem.freelancer?.name || "Freelancer"}`;
      }
    }
    return title;
  };

  const getReviewType = () => {
    if (safeItem.hasClientReview && !safeItem.freelancerReview)
      return "client_reviewed";
    if (safeItem.freelancerReview && !safeItem.hasClientReview)
      return "freelancer_reviewed";
    return "no_reviews";
  };

  const renderRating = (rating) => {
    const safeRating = Number(rating) || 0;
    return (
      <div className={styles.rating}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`${styles.star} ${
                star <= safeRating ? styles.starFilled : styles.starEmpty
              }`}
            />
          ))}
        </div>
        <span className={styles.ratingValue}>{safeRating}.0</span>
      </div>
    );
  };

  const renderStatus = () => {
    const reviewType = getReviewType();
    switch (reviewType) {
      case "client_reviewed":
        return (
          <span className={styles.statusCompleted}>
            <FaCheckCircle /> You Reviewed
          </span>
        );
      case "freelancer_reviewed":
        return (
          <span className={styles.statusPending}>
            <FaHandshake /> Return Review Needed
          </span>
        );
      default:
        return (
          <span className={styles.statusDefault}>
            <FaClock /> Pending Review
          </span>
        );
    }
  };

  const renderActions = () => {
    if (type === "pending") {
      const reviewType = getReviewType();
      if (reviewType === "freelancer_reviewed") {
        return (
          <motion.button
            onClick={() => onReturnReview(safeItem)}
            className={styles.btnSecondary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaHandshake /> Return Review
          </motion.button>
        );
      } else {
        return (
          <motion.button
            onClick={() => onReview(safeItem)}
            className={styles.btnPrimary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaEdit /> Review Now
          </motion.button>
        );
      }
    }
  };

  return (
    <motion.div
      className={styles.reviewCard}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.projectInfo}>
          <div className={styles.projectIcon}>
            <FaBriefcase />
          </div>
          <div className={styles.projectDetails}>
            <h4 className={styles.projectTitle}>{getProjectTitle()}</h4>
            {safeItem.budget && (
              <p className={styles.projectBudget}>
                {formatCurrency(safeItem.budget)}
              </p>
            )}
          </div>
        </div>
        {type === "pending" && (
          <div className={styles.statusBadge}>{renderStatus()}</div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.reviewMeta}>
          <div className={styles.freelancerInfo}>
            <div className={styles.avatar}>
              {type === "given"
                ? safeItem.reviewee?.name?.charAt(0)?.toUpperCase() || "F"
                : safeItem.freelancer?.name?.charAt(0)?.toUpperCase() || "F"}
            </div>
            <div>
              <p className={styles.freelancerName}>
                {type === "given"
                  ? safeItem.reviewee?.name || "Freelancer"
                  : safeItem.freelancer?.name || "Freelancer"}
              </p>
              {type === "received" && (
                <p className={styles.freelancerRole}>Freelancer</p>
              )}
            </div>
          </div>

          {(type === "given" || type === "received") && (
            <div className={styles.reviewStats}>
              {safeItem.rating && renderRating(safeItem.rating)}
              <div className={styles.date}>
                <FaCalendar />
                {formatDate(safeItem.createdAt || safeItem.completedAt)}
              </div>
            </div>
          )}
        </div>

        <div className={styles.comment}>
          {safeItem.comment ? (
            <p className={styles.commentText}>
              {safeItem.comment.length > 120
                ? `${safeItem.comment.substring(0, 120)}...`
                : safeItem.comment}
            </p>
          ) : (
            <span className={styles.noComment}>No comment provided</span>
          )}
        </div>
      </div>

      <div className={styles.cardActions}>{renderActions()}</div>
    </motion.div>
  );
};

// Review Modal Component (same as before, but with safe data access)
const ReviewModal = ({
  isOpen,
  onClose,
  project,
  isReturnReview = false,
  onSubmit,
  isSubmitting,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment("");
      setHoverRating(0);
    }
  }, [isOpen]);

  const formatCurrency = (amount) => {
    const safeAmount = Number(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select Rating";
    }
  };

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <FaSmile className={styles.ratingExcellent} />;
    if (rating >= 3) return <FaMeh className={styles.ratingGood} />;
    return <FaFrown className={styles.ratingPoor} />;
  };

  const handleSubmit = () => {
    onSubmit(rating, comment);
  };

  if (!isOpen) return null;

  const safeProject = project || {};

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modalContent}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <div>
              <h2>
                {isReturnReview
                  ? "Return Review for Freelancer"
                  : "Review Freelancer"}
              </h2>
              <p>
                {isReturnReview
                  ? `Return the favor - ${
                      safeProject.freelancer?.name || "Freelancer"
                    } reviewed your collaboration`
                  : `Share your experience working with ${
                      safeProject.freelancer?.name || "Freelancer"
                    }`}
              </p>
            </div>
            <motion.button
              onClick={onClose}
              className={styles.closeButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.freelancerInfo}>
              <div className={styles.avatar}>
                {safeProject.freelancer?.name?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className={styles.freelancerDetails}>
                <h3>{safeProject.freelancer?.name || "Freelancer"}</h3>
                <div className={styles.projectInfo}>
                  <FaBriefcase />
                  <span>{safeProject.title || "Unknown Project"}</span>
                </div>
                {safeProject.budget && (
                  <div className={styles.projectBudget}>
                    <FaMoneyBillWave />
                    <span>Budget: {formatCurrency(safeProject.budget)}</span>
                  </div>
                )}
                {isReturnReview && safeProject.freelancerReview && (
                  <div className={styles.freelancerReviewInfo}>
                    <FaStar />
                    <span>
                      They gave you {safeProject.freelancerReview.rating}/5
                      stars
                      {safeProject.freelancerReview.comment &&
                        ` - "${safeProject.freelancerReview.comment}"`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.ratingSection}>
              <label>
                {isReturnReview
                  ? "How would you rate your experience with this freelancer in return? *"
                  : "How was your experience with this freelancer? *"}
              </label>
              <div className={styles.starsContainer}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`${styles.starButton} ${
                        (hoverRating || rating) >= star ? styles.starActive : ""
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaStar />
                    </motion.button>
                  ))}
                </div>
                <div className={styles.ratingText}>
                  {getRatingIcon(rating)}
                  {getRatingText(rating)}
                </div>
              </div>
            </div>

            <div className={styles.commentSection}>
              <label>Share your experience (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isReturnReview
                    ? `Respond to ${
                        safeProject.freelancer?.name || "Freelancer"
                      }'s review...`
                    : `Tell us about working with ${
                        safeProject.freelancer?.name || "Freelancer"
                      }...`
                }
                rows="4"
                className={styles.commentTextarea}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <motion.button
              onClick={onClose}
              disabled={isSubmitting}
              className={styles.cancelButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className={
                isReturnReview ? styles.returnSubmitButton : styles.submitButton
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.submitSpinner} />
                  Submitting...
                </>
              ) : (
                <>
                  {isReturnReview ? <FaHandshake /> : <FaStar />}
                  {isReturnReview ? "Submit Return Review" : "Submit Review"}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function ClientAnalytics() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [reviews, setReviews] = useState({
    given: [],
    received: [],
    reviewableProjects: [],
    returnReviewable: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(83);
  const [timeRange, setTimeRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  // Review Modal States
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    project: null,
    isReturn: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeReviewSection, setActiveReviewSection] = useState("pending");

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        if (userObj.role !== "client") {
          router.push("/unauthorized");
          return;
        }
        fetchAllData(userObj.id);
        fetchExchangeRate();
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        setError("Failed to load user data");
        setLoading(false);
      }
    } else {
      router.push("/auth/login");
    }
  }, [router, timeRange]);

  const fetchExchangeRate = async () => {
    try {
      // Use static rate for fallback
      setExchangeRate(0.012);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(0.012);
    }
  };

  const fetchAllData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data from your actual APIs
      const [
        analyticsRes,
        reviewsRes,
        reviewableProjectsRes,
        returnReviewableRes,
        dashboardRes,
      ] = await Promise.all([
        fetch(`/api/analytics/client?userId=${userId}&timeRange=${timeRange}`),
        fetch(`/api/reviews/client?clientId=${userId}`),
        fetch(`/api/projects/client-reviewable?clientId=${userId}`),
        fetch(`/api/projects/client-return-reviewable?clientId=${userId}`),
        fetch(`/api/client/dashboard?userId=${userId}`),
      ]);

      // Handle responses with error checking
      const results = await Promise.allSettled([
        analyticsRes.ok
          ? analyticsRes.json()
          : Promise.resolve({ success: false, data: null }),
        reviewsRes.ok
          ? reviewsRes.json()
          : Promise.resolve({ success: false, reviews: {} }),
        reviewableProjectsRes.ok
          ? reviewableProjectsRes.json()
          : Promise.resolve({ success: false, projects: [] }),
        returnReviewableRes.ok
          ? returnReviewableRes.json()
          : Promise.resolve({ success: false, projects: [] }),
        dashboardRes.ok ? dashboardRes.json() : Promise.resolve({ stats: {} }),
      ]);

      const [
        analyticsData,
        reviewsData,
        reviewableData,
        returnReviewableData,
        dashboardData,
      ] = results;

      // Set analytics data with safe defaults
      if (analyticsData.status === "fulfilled" && analyticsData.value.success) {
        setAnalytics(analyticsData.value.data || {});
      } else {
        setAnalytics({});
      }

      // Set reviews data with safe defaults
      if (reviewsData.status === "fulfilled" && reviewsData.value.success) {
        setReviews((prev) => ({
          ...prev,
          given: reviewsData.value.reviews?.given || [],
          received: reviewsData.value.reviews?.received || [],
        }));
      }

      if (
        reviewableData.status === "fulfilled" &&
        reviewableData.value.success
      ) {
        setReviews((prev) => ({
          ...prev,
          reviewableProjects: reviewableData.value.projects || [],
        }));
      }

      if (
        returnReviewableData.status === "fulfilled" &&
        returnReviewableData.value.success
      ) {
        setReviews((prev) => ({
          ...prev,
          returnReviewable: returnReviewableData.value.projects || [],
        }));
      }

      // Set dashboard data for real spending data
      if (dashboardData.status === "fulfilled") {
        setDashboardData(dashboardData.value || {});

        // Update analytics with real data from dashboard
        if (dashboardData.value?.stats) {
          setAnalytics((prev) => ({
            ...prev,
            totalSpent: dashboardData.value.stats.totalSpent || 0,
            activeProjects: dashboardData.value.stats.activeJobs || 0,
            completedProjects: dashboardData.value.stats.completedJobs || 0,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Review Functions
  const handleOpenReview = (project, isReturn = false) => {
    setReviewModal({ isOpen: true, project, isReturn });
  };

  const handleCloseReview = () => {
    setReviewModal({ isOpen: false, project: null, isReturn: false });
  };

  const handleSubmitReview = async (rating, comment) => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    const project = reviewModal.project;
    if (!project?.freelancer?.id) {
      alert("Please select a freelancer to review");
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        rating,
        comment,
        freelancerId: project.freelancer.id,
        projectId: project.id,
        reviewerId: user.id,
        type: "CLIENT_TO_FREELANCER",
      };

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Refresh data after successful submission
      await fetchAllData(user.id);
      handleCloseReview();
      alert(
        `Review submitted successfully! ⭐ ${
          reviewModal.isReturn ? "(Return review completed)" : ""
        }`
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount, curr = currency) => {
    const numericAmount = Number(amount) || 0;
    if (curr === "USD") {
      const usdAmount = numericAmount * exchangeRate;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    } else {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numericAmount);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Calculate real data for charts from API responses with safe defaults
  const spendingData = useMemo(() => {
    // Use real monthly spending data from analytics API
    if (analytics?.monthlySpending?.length > 0) {
      return analytics.monthlySpending.map((item) => ({
        label: item.month || "Unknown",
        value: Number(item.amount) || 0,
        color: "#3b82f6",
      }));
    }

    // Fallback: Generate data based on total spent
    const total =
      analytics?.totalSpent || dashboardData?.stats?.totalSpent || 0;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.slice(0, 6).map((month, index) => ({
      label: month,
      value: Math.round((total / 6) * (0.8 + Math.random() * 0.4)), // Distribute total across months
      color: "#3b82f6",
    }));
  }, [analytics, dashboardData]);

  const projectDistributionData = useMemo(
    () => [
      {
        label: "Completed",
        value: Number(
          analytics?.completedProjects ||
            dashboardData?.stats?.completedJobs ||
            0
        ),
        color: "#10b981",
      },
      {
        label: "Active",
        value: Number(
          analytics?.activeProjects || dashboardData?.stats?.activeJobs || 0
        ),
        color: "#3b82f6",
      },
      {
        label: "Pending",
        value: Number(analytics?.pendingProjects || 0),
        color: "#f59e0b",
      },
    ],
    [analytics, dashboardData]
  );

  const ratingDistributionData = useMemo(() => {
    if (analytics?.ratingDistribution?.length > 0) {
      return analytics.ratingDistribution.map((item) => ({
        label: `${item.rating} Star${item.rating !== 1 ? "s" : ""}`,
        value: Number(item.count) || 0,
        color:
          item.rating === 5
            ? "#10b981"
            : item.rating === 4
            ? "#22c55e"
            : item.rating === 3
            ? "#f59e0b"
            : item.rating === 2
            ? "#f97316"
            : "#ef4444",
      }));
    }

    // Fallback distribution based on average rating
    const avgRating = analytics?.averageRating || 4.5;
    return [
      { label: "5 Stars", value: Math.round(avgRating * 3), color: "#10b981" },
      { label: "4 Stars", value: Math.round(avgRating * 2), color: "#22c55e" },
      { label: "3 Stars", value: Math.round(avgRating * 1), color: "#f59e0b" },
      {
        label: "2 Stars",
        value: Math.round(avgRating * 0.5),
        color: "#f97316",
      },
      { label: "1 Star", value: 0, color: "#ef4444" },
    ];
  }, [analytics]);

  // Get current items for reviews with search and pagination
  const { currentItems, totalPages, paginatedItems } = useMemo(() => {
    let items = [];

    switch (activeReviewSection) {
      case "pending":
        items = [
          ...(reviews.reviewableProjects || []),
          ...(reviews.returnReviewable || []),
        ];
        break;
      case "given":
        items = reviews.given || [];
        break;
      case "received":
        items = reviews.received || [];
        break;
      default:
        items = [];
    }

    // Apply search filter
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.project?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item?.freelancer?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item?.reviewee?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item?.reviewer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calculate pagination
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

    return { currentItems: items, totalPages, paginatedItems };
  }, [reviews, activeReviewSection, searchTerm, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading your business analytics...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <FaExclamationTriangle />
          </div>
          <h2>Analytics Unavailable</h2>
          <p>{error}</p>
          <button
            onClick={() => fetchAllData(user?.id)}
            className={styles.retryButton}
          >
            <FaRocket /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <FaArrowLeft /> Back
          </button>
          <div className={styles.currencySelector}>
            <FaGlobeAmericas className={styles.currencyIcon} />
            <span>Display in:</span>
            <div className={styles.currencyOptions}>
              <button
                className={`${styles.currencyOption} ${
                  currency === "INR" ? styles.active : ""
                }`}
                onClick={() => setCurrency("INR")}
              >
                INR
              </button>
              <button
                className={`${styles.currencyOption} ${
                  currency === "USD" ? styles.active : ""
                }`}
                onClick={() => setCurrency("USD")}
              >
                USD
              </button>
            </div>
          </div>
        </div>

        <div className={styles.headerMain}>
          <h1>Business Analytics</h1>
          <p>Track your project investments and freelancer collaborations</p>
        </div>

        {/* Navigation Tabs */}
        <nav className={styles.navigation}>
          <div className={styles.tabs}>
            {["overview", "reviews", "spending"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${
                  activeTab === tab ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "overview" && <FaChartLine />}
                {tab === "reviews" && <FaStar />}
                {tab === "spending" && <FaChartBar />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.timeRangeSelector}>
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                className={`${styles.timeButton} ${
                  timeRange === range ? styles.active : ""
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range === "week" && "This Week"}
                {range === "month" && "This Month"}
                {range === "quarter" && "This Quarter"}
                {range === "year" && "This Year"}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className={styles.overview}>
            {/* Key Metrics Grid */}
            <div className={styles.metricsGrid}>
              <StatCard
                icon={<FaMoneyBillWave />}
                title="Total Spent"
                value={formatCurrency(
                  analytics?.totalSpent || dashboardData?.stats?.totalSpent || 0
                )}
                subtitle={`${
                  analytics?.completedProjects ||
                  dashboardData?.stats?.completedJobs ||
                  0
                } completed projects`}
                trend={analytics?.spendingTrend || 8.5}
                color="#10b981"
                loading={loading}
              />
              <StatCard
                icon={<FaProjectDiagram />}
                title="Active Projects"
                value={
                  analytics?.activeProjects ||
                  dashboardData?.stats?.activeJobs ||
                  0
                }
                subtitle="Currently in progress"
                trend={analytics?.activeProjectsTrend || 12.3}
                color="#3b82f6"
                loading={loading}
              />
              <StatCard
                icon={<FaStar />}
                title="Avg. Rating"
                value={(analytics?.averageRating || 0).toFixed(1)}
                subtitle="Based on your reviews"
                trend={analytics?.ratingTrend || 5.2}
                color="#f59e0b"
                loading={loading}
              />
              <StatCard
                icon={<FaUsers />}
                title="Freelancers Hired"
                value={analytics?.freelancersHired || 0}
                subtitle="Unique collaborators"
                trend={analytics?.freelancersTrend || 15.7}
                color="#06b6d4"
                loading={loading}
              />
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <BarChart
                  data={spendingData}
                  title="Monthly Spending"
                  height={200}
                  currency={currency}
                  loading={loading}
                />
              </div>
              <div className={styles.chartCard}>
                <PieChart
                  data={projectDistributionData}
                  title="Project Distribution"
                  size={140}
                  loading={loading}
                />
              </div>
              <div className={styles.chartCard}>
                <BarChart
                  data={ratingDistributionData}
                  title="Rating Distribution"
                  height={200}
                  loading={loading}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.quickStats}>
              <div className={styles.quickStat}>
                <div className={styles.quickStatIcon}>
                  <FaHandshake />
                </div>
                <div>
                  <div className={styles.quickStatValue}>
                    {(reviews.reviewableProjects?.length || 0) +
                      (reviews.returnReviewable?.length || 0)}
                  </div>
                  <div className={styles.quickStatLabel}>Pending Reviews</div>
                </div>
              </div>
              <div className={styles.quickStat}>
                <div className={styles.quickStatIcon}>
                  <FaWallet />
                </div>
                <div>
                  <div className={styles.quickStatValue}>
                    {formatCurrency(
                      analytics?.totalSpent ||
                        dashboardData?.stats?.totalSpent ||
                        0
                    )}
                  </div>
                  <div className={styles.quickStatLabel}>Total Investment</div>
                </div>
              </div>
              <div className={styles.quickStat}>
                <div className={styles.quickStatIcon}>
                  <FaCheckCircle />
                </div>
                <div>
                  <div className={styles.quickStatValue}>
                    {analytics?.completedProjects ||
                      dashboardData?.stats?.completedJobs ||
                      0}
                  </div>
                  <div className={styles.quickStatLabel}>
                    Projects Completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className={styles.reviewsTab}>
            {/* Review Sections Navigation */}
            <div className={styles.reviewSectionsNav}>
              {[
                {
                  key: "pending",
                  label: "Pending Reviews",
                  icon: FaEdit,
                  count:
                    (reviews.reviewableProjects?.length || 0) +
                    (reviews.returnReviewable?.length || 0),
                },
                {
                  key: "given",
                  label: "Your Reviews",
                  icon: FaHandshake,
                  count: reviews.given?.length || 0,
                },
                {
                  key: "received",
                  label: "Received Reviews",
                  icon: FaUser,
                  count: reviews.received?.length || 0,
                },
              ].map((section) => (
                <button
                  key={section.key}
                  className={`${styles.sectionTab} ${
                    activeReviewSection === section.key ? styles.active : ""
                  }`}
                  onClick={() => {
                    setActiveReviewSection(section.key);
                    setCurrentPage(1);
                  }}
                >
                  <section.icon />
                  {section.label}
                  <span className={styles.sectionCount}>{section.count}</span>
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className={styles.tableControls}>
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search projects or freelancers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.tableActions}>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={styles.pageSizeSelect}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                </select>

             
              </div>
            </div>

            {/* Reviews List */}
            <div className={styles.reviewsList}>
              {paginatedItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaStar className={styles.emptyIcon} />
                  <p>
                    {activeReviewSection === "pending"
                      ? "No pending reviews"
                      : activeReviewSection === "given"
                      ? "No reviews given yet"
                      : "No reviews received yet"}
                  </p>
                  {activeReviewSection === "pending" && (
                    <small>
                      Complete some projects to see pending reviews here
                    </small>
                  )}
                </div>
              ) : (
                paginatedItems.map((item, index) => (
                  <ReviewCard
                    key={item?.id || index}
                    item={item}
                    type={activeReviewSection}
                    onReview={(project) => handleOpenReview(project, false)}
                    onReturnReview={(project) =>
                      handleOpenReview(project, true)
                    }
                    onViewDetails={(review) =>
                      console.log("View details", review)
                    }
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    loading={loading}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  <FaChevronLeft /> Previous
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`${styles.pageButton} ${
                          currentPage === pageNum ? styles.active : ""
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className={styles.pageDots}>...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`${styles.pageButton} ${
                          currentPage === totalPages ? styles.active : ""
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Spending Tab */}
        {activeTab === "spending" && (
          <div className={styles.spendingTab}>
            <div className={styles.spendingGrid}>
              <div className={styles.spendingCard}>
                <h3>Spending Overview</h3>
                <div className={styles.spendingMetrics}>
                  <div className={styles.spendingMetric}>
                    <span className={styles.metricLabel}>Total Investment</span>
                    <div className={styles.metricValue}>
                      {formatCurrency(
                        analytics?.totalSpent ||
                          dashboardData?.stats?.totalSpent ||
                          0
                      )}
                    </div>
                  </div>
                  <div className={styles.spendingMetric}>
                    <span className={styles.metricLabel}>
                      Avg. Project Cost
                    </span>
                    <div className={styles.metricValue}>
                      {formatCurrency(
                        (analytics?.totalSpent || 0) /
                          Math.max(
                            analytics?.completedProjects ||
                              dashboardData?.stats?.completedJobs ||
                              1,
                            1
                          )
                      )}
                    </div>
                  </div>
                  <div className={styles.spendingMetric}>
                    <span className={styles.metricLabel}>
                      Projects Completed
                    </span>
                    <div className={styles.metricValue}>
                      {analytics?.completedProjects ||
                        dashboardData?.stats?.completedJobs ||
                        0}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.spendingCard}>
                <h3>Budget Utilization</h3>
                <PieChart
                  data={[
                    {
                      label: "Used",
                      value:
                        analytics?.totalSpent ||
                        dashboardData?.stats?.totalSpent ||
                        0,
                      color: "#3b82f6",
                    },
                    {
                      label: "Remaining",
                      value: Math.max(
                        (analytics?.totalBudget || 100000) -
                          (analytics?.totalSpent || 0),
                        0
                      ),
                      color: "#e5e7eb",
                    },
                  ]}
                  size={120}
                />
                <div className={styles.budgetInfo}>
                  <div className={styles.budgetItem}>
                    <span>
                      Total Budget:{" "}
                      {formatCurrency(analytics?.totalBudget || 100000)}
                    </span>
                  </div>
                  <div className={styles.budgetItem}>
                    <span>
                      Utilized: {formatCurrency(analytics?.totalSpent || 0)}
                    </span>
                  </div>
                  <div className={styles.budgetItem}>
                    <span>
                      Remaining:{" "}
                      {formatCurrency(
                        Math.max(
                          (analytics?.totalBudget || 100000) -
                            (analytics?.totalSpent || 0),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.spendingChartCard}>
              <BarChart
                data={spendingData}
                title="Monthly Spending Trend"
                height={250}
                currency={currency}
              />
            </div>
          </div>
        )}
      </main>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={handleCloseReview}
        project={reviewModal.project}
        isReturnReview={reviewModal.isReturn}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
