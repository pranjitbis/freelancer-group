// app\freelancer-dashboard\analytics\page.jsx
"use client";
import { useState, useEffect } from "react";
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
  FaComments,
  FaMoneyBillWave,
  FaProjectDiagram,
  FaExchangeAlt,
  FaGlobeAmericas,
  FaRocket,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaRupeeSign,
  FaClock,
  FaUsers,
  FaRegSmile,
  FaTimes,
  FaCheck,
  FaSmile,
  FaFrown,
  FaMeh,
  FaEdit,
  FaPlus,
  FaPen,
} from "react-icons/fa";
import styles from "./Analytics.module.css";

export default function FreelancerAnalytics() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [clientReviews, setClientReviews] = useState([]);
  const [reviewableProjects, setReviewableProjects] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(83);

  // Client Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAspects, setSelectedAspects] = useState({
    communication: false,
    payment: false,
    clarity: false,
    professionalism: false,
  });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        if (userObj.role !== "freelancer") {
          router.push("/unauthorized");
          return;
        }
        fetchAnalyticsData(userObj.id);
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
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      const data = await response.json();
      setExchangeRate(data.rates.USD || 0.012);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(0.012);
    }
  };

  const fetchAnalyticsData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const [
        analyticsRes,
        reviewsRes,
        performanceRes,
        clientReviewsRes,
        reviewableProjectsRes,
      ] = await Promise.all([
        fetch(
          `/api/analytics/freelancer?userId=${userId}&timeRange=${timeRange}`
        ),
        fetch(`/api/reviews/freelancer?freelancerId=${userId}`),
        fetch(`/api/performance/freelancer?userId=${userId}`),
        fetch(`/api/reviews/freelancer-given?freelancerId=${userId}`),
        fetch(`/api/projects/reviewable?freelancerId=${userId}`),
      ]);

      if (!analyticsRes.ok) {
        throw new Error(`Analytics API error: ${analyticsRes.status}`);
      }

      const analyticsData = await analyticsRes.json();
      const reviewsData = await reviewsRes
        .json()
        .catch(() => ({ success: false, reviews: [] }));
      const performanceData = await performanceRes
        .json()
        .catch(() => ({ success: false, data: null }));
      const clientReviewsData = await clientReviewsRes
        .json()
        .catch(() => ({ success: false, reviews: [] }));
      const reviewableProjectsData = await reviewableProjectsRes
        .json()
        .catch(() => ({ success: false, projects: [] }));

      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      } else {
        throw new Error(analyticsData.error || "Failed to load analytics");
      }

      if (reviewsData.success) {
        setReviews(reviewsData.reviews || []);
      }

      if (performanceData.success) {
        setPerformance(performanceData.data);
      }

      if (clientReviewsData.success) {
        setClientReviews(clientReviewsData.reviews || []);
      }

      if (reviewableProjectsData.success) {
        setReviewableProjects(reviewableProjectsData.projects || []);
      }
    } catch (error) {
      console.error("❌ Error fetching analytics data:", error);
      setError(error.message || "Failed to load analytics data");
      setAnalytics(null);
      setReviews([]);
      setClientReviews([]);
      setReviewableProjects([]);
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  };

  // Client Review Functions
  const handleOpenReview = (project = null) => {
    if (project) {
      setSelectedProject(project);
    } else if (reviewableProjects.length > 0) {
      setSelectedProject(reviewableProjects[0]);
    } else {
      // If no specific project, create a generic one
      setSelectedProject({
        id: "general",
        title: "Completed Project",
        client: { name: "Select Client" },
        clientId: null,
      });
    }
    setShowReviewModal(true);
    setRating(0);
    setComment("");
    setHoverRating(0);
    setSelectedAspects({
      communication: false,
      payment: false,
      clarity: false,
      professionalism: false,
    });
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    setSelectedProject(null);
    setRating(0);
    setComment("");
    setHoverRating(0);
    setSelectedAspects({
      communication: false,
      payment: false,
      clarity: false,
      professionalism: false,
    });
  };

  const handleAspectToggle = (aspect) => {
    setSelectedAspects((prev) => ({
      ...prev,
      [aspect]: !prev[aspect],
    }));
  };

  const handleSubmitClientReview = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!selectedProject?.clientId) {
      alert("Please select a client to review");
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        rating,
        comment,
        clientId: selectedProject.clientId,
        projectId: selectedProject.id,
        reviewerId: user.id,
        type: "FREELANCER_TO_CLIENT",
        aspects: Object.keys(selectedAspects).filter(
          (key) => selectedAspects[key]
        ),
      };

      const response = await fetch("/api/reviews/client", {
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

      // Refresh data
      fetchAnalyticsData(user.id);
      handleCloseReview();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
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
    if (rating >= 4) return <FaSmile style={{ color: "#10b981" }} />;
    if (rating >= 3) return <FaMeh style={{ color: "#f59e0b" }} />;
    return <FaFrown style={{ color: "#ef4444" }} />;
  };

  const reviewAspects = [
    { key: "communication", label: "Good Communication", icon: "💬" },
    { key: "payment", label: "Prompt Payment", icon: "💰" },
    { key: "clarity", label: "Clear Requirements", icon: "🎯" },
    { key: "professionalism", label: "Professional", icon: "👔" },
  ];

  // Existing helper functions
  const formatCurrency = (amount, curr = currency) => {
    const numericAmount = amount || 0;

    if (curr === "USD") {
      const usdAmount = numericAmount * exchangeRate;
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    } else {
      return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numericAmount);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "INR" ? "USD" : "INR"));
  };

  const getTrendData = () => {
    const earningsData = analytics?.earningsData || [];
    const projectsData = analytics?.projectsData || [];

    const currentEarnings =
      earningsData[earningsData.length - 1]?.earnings || 0;
    const previousEarnings =
      earningsData[earningsData.length - 2]?.earnings || 0;
    const earningsTrend =
      previousEarnings > 0
        ? ((currentEarnings - previousEarnings) / previousEarnings) * 100
        : 0;

    const currentProjects =
      projectsData[projectsData.length - 1]?.projects || 0;
    const previousProjects =
      projectsData[projectsData.length - 2]?.projects || 0;
    const projectsTrend =
      previousProjects > 0
        ? ((currentProjects - previousProjects) / previousProjects) * 100
        : 0;

    return {
      earnings: { value: Math.round(earningsTrend), period: "this month" },
      projects: { value: Math.round(projectsTrend), period: "this month" },
      rating: { value: 0, period: "this month" },
      clients: { value: 0, period: "this month" },
    };
  };

  const calculatePerformanceMetrics = () => {
    if (!analytics || !performance) return null;

    const totalProjects = analytics.completedProjects || 0;
    const onTimeProjects = performance.onTimeProjects || 0;
    const repeatClients = performance.repeatClients || 0;
    const totalClients = analytics.activeClients || 1;
    const averageResponseTime = performance.averageResponseTime || 0;
    const clientSatisfaction = analytics.averageRating || 0;

    return {
      onTimeDelivery: {
        value:
          totalProjects > 0
            ? Math.round((onTimeProjects / totalProjects) * 100)
            : 0,
        description: `${onTimeProjects} of ${totalProjects} projects delivered on time`,
      },
      clientRetention: {
        value: Math.round((repeatClients / totalClients) * 100),
        description: `${repeatClients} repeat clients out of ${totalClients} total`,
      },
      satisfactionScore: {
        value: Math.round(clientSatisfaction * 20), // Convert 5-star to percentage
        description: `Based on ${analytics.totalReviews || 0} client reviews`,
      },
      responseTime: {
        value: averageResponseTime,
        description: "Average response time to client messages",
      },
    };
  };

  // Chart Components
  const BarChart = ({
    data,
    color = "#2563eb",
    valueKey = "value",
    labelKey = "label",
    currency = "INR",
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className={styles.emptyChart}>
          <FaChartLine className={styles.emptyChartIcon} />
          <p>No data available</p>
          <small>Complete projects to see your earnings trend</small>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d[valueKey]), 1);
    const isEarnings = valueKey === "earnings";

    return (
      <div className={styles.barChart}>
        {data.map((item, index) => (
          <div key={index} className={styles.barContainer}>
            <div className={styles.barWrapper}>
              <div
                className={styles.bar}
                style={{
                  height: `${(item[valueKey] / maxValue) * 85}%`,
                  background: `linear-gradient(to top, ${color}, ${color}00)`,
                }}
              />
              <div className={styles.barValuePopup}>
                {isEarnings
                  ? currency === "INR"
                    ? `₹${item[valueKey]?.toLocaleString() || 0}`
                    : `$${((item[valueKey] || 0) / 83).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                  : item[valueKey]}
              </div>
            </div>
            <div className={styles.barLabel}>{item[labelKey]}</div>
          </div>
        ))}
      </div>
    );
  };

  const EarningsChart = ({ data, currency }) => {
    const chartData = data.map((item) => ({
      label: item.month,
      value: item.earnings,
    }));

    return (
      <BarChart
        data={chartData}
        color="#059669"
        valueKey="value"
        labelKey="label"
        currency={currency}
      />
    );
  };

  const ProjectsChart = ({ data }) => {
    const chartData = data.map((item) => ({
      label: item.month,
      value: item.projects,
    }));

    return (
      <BarChart
        data={chartData}
        color="#2563eb"
        valueKey="value"
        labelKey="label"
      />
    );
  };

  // Metric Card Component
  const MetricCard = ({
    icon,
    title,
    value,
    subtitle,
    trend,
    color,
    currency,
    onCurrencyToggle,
    isEarnings = false,
  }) => {
    const isPositive = trend?.value > 0;

    return (
      <motion.div
        className={styles.metricCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        <div className={styles.metricHeader}>
          <div className={styles.metricIcon} style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div className={styles.metricTitle}>
            <h3>{title}</h3>
            {onCurrencyToggle && (
              <button
                className={styles.currencyToggleBtn}
                onClick={onCurrencyToggle}
                title={`Switch to ${currency === "INR" ? "USD" : "INR"}`}
              >
                <FaExchangeAlt />
                {currency}
              </button>
            )}
          </div>
        </div>

        <div className={styles.metricValue}>
          {isEarnings && (
            <span className={styles.currencySymbol}>
              {currency === "INR" ? <FaRupeeSign /> : <FaDollarSign />}
            </span>
          )}
          {value}
        </div>

        <div className={styles.metricFooter}>
          <span className={styles.metricSubtitle}>{subtitle}</span>
          {trend && (
            <span
              className={`${styles.trend} ${
                isPositive ? styles.trendPositive : styles.trendNegative
              }`}
            >
              {isPositive ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(trend.value)}% {trend.period}
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  // Performance Metric Component
  const PerformanceMetric = ({ icon, label, value, description, color }) => {
    return (
      <div className={styles.performanceMetric}>
        <div
          className={styles.performanceIcon}
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className={styles.performanceContent}>
          <div className={styles.performanceLabel}>{label}</div>
          <div className={styles.performanceValue}>{value}</div>
          <div className={styles.performanceDescription}>{description}</div>
        </div>
      </div>
    );
  };

  // Helper function for review aspects
  const getAspectLabel = (aspect) => {
    const aspectLabels = {
      communication: "Good Communication",
      payment: "Prompt Payment",
      clarity: "Clear Requirements",
      professionalism: "Professional",
    };
    return aspectLabels[aspect] || aspect;
  };

  // Add Review Button Component
  const AddReviewButton = ({ project, variant = "primary" }) => {
    return (
      <motion.button
        className={`${styles.addReviewButton} ${
          variant === "primary" ? styles.primary : styles.secondary
        }`}
        onClick={() => handleOpenReview(project)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaPlus className={styles.addReviewIcon} />
        {variant === "primary" ? "Give Review" : "Review Client"}
      </motion.button>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your professional analytics...</p>
        <small>Crunching the numbers</small>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIconWrapper}>
            <FaChartLine className={styles.errorIcon} />
          </div>
          <h2>Analytics Unavailable</h2>
          <p>{error}</p>
          <button
            onClick={() => fetchAnalyticsData(user?.id)}
            className={styles.retryButton}
          >
            <FaRocket />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const trends = getTrendData();
  const performanceMetrics = calculatePerformanceMetrics();

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <button onClick={() => router.back()} className={styles.backButton}>
              <FaArrowLeft />
            </button>
            <div>
              <h1>Performance Analytics</h1>
              <p>Track your freelance business growth and performance</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.currencySelector}>
              <FaGlobeAmericas className={styles.currencyIcon} />
              <span>Display in:</span>
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

            {/* Quick Review Button in Header */}
            {reviewableProjects.length > 0 && (
              <motion.button
                className={styles.quickReviewButton}
                onClick={() => handleOpenReview()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEdit />
                Review Clients ({reviewableProjects.length})
              </motion.button>
            )}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className={styles.timeRangeSelector}>
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              className={`${styles.timeButton} ${
                timeRange === range ? styles.active : ""
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range === "week" && "This Week"}
              {range === "month" && "This Month"}
              {range === "year" && "This Year"}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <MetricCard
          icon={<FaMoneyBillWave />}
          title="Total Earnings"
          value={formatCurrency(analytics?.totalEarnings)}
          subtitle={`${analytics?.completedProjects || 0} completed projects`}
          trend={trends.earnings}
          color="#059669"
          currency={currency}
          onCurrencyToggle={toggleCurrency}
          isEarnings={true}
        />

        <MetricCard
          icon={<FaProjectDiagram />}
          title="Projects Completed"
          value={formatNumber(analytics?.completedProjects)}
          subtitle="Successfully delivered"
          trend={trends.projects}
          color="#2563eb"
        />

        <MetricCard
          icon={<FaStar />}
          title="Average Rating"
          value={(analytics?.averageRating || 0).toFixed(1)}
          subtitle={`${analytics?.totalReviews || 0} client reviews`}
          trend={trends.rating}
          color="#d97706"
        />

        <MetricCard
          icon={<FaUser />}
          title="Active Clients"
          value={formatNumber(analytics?.activeClients)}
          subtitle="Current engagements"
          trend={trends.clients}
          color="#7c3aed"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className={styles.analyticsGrid}>
        {/* Earnings Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaChartLine />
              <h3>Earnings Trend</h3>
            </div>
            <div className={styles.cardActions}>
              <span className={styles.timeLabel}>{timeRange}</span>
              <button
                className={styles.currencyBtn}
                onClick={toggleCurrency}
                title={`Switch to ${currency === "INR" ? "USD" : "INR"}`}
              >
                <FaExchangeAlt />
                {currency}
              </button>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <EarningsChart
              data={analytics?.earningsData || []}
              currency={currency}
            />
          </div>
          <div className={styles.chartFooter}>
            <FaCheckCircle />
            <span>
              Real data from {analytics?.completedProjects || 0} completed
              projects
            </span>
          </div>
        </motion.div>

        {/* Projects Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaBriefcase />
              <h3>Projects Overview</h3>
            </div>
            <span className={styles.timeLabel}>{timeRange}</span>
          </div>
          <div className={styles.chartContainer}>
            <ProjectsChart data={analytics?.projectsData || []} />
          </div>
          <div className={styles.chartFooter}>
            <FaArrowUp />
            <span>Project completion trend</span>
          </div>
        </motion.div>

        {/* Client Reviews Section */}
        <motion.div
          className={styles.clientReviewsCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaUser />
              <h3>Client Reviews</h3>
            </div>
            <div className={styles.reviewActions}>
              <div className={styles.reviewStats}>
                <span className={styles.reviewCount}>
                  {clientReviews.length} reviews given
                </span>
                {reviewableProjects.length > 0 && (
                  <span className={styles.pendingReviews}>
                    {reviewableProjects.length} pending
                  </span>
                )}
              </div>

              {/* Main Review Button in Client Reviews Section */}
              <motion.button
                className={styles.mainReviewButton}
                onClick={() => handleOpenReview()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={reviewableProjects.length === 0}
              >
                <FaPen className={styles.reviewButtonIcon} />
                Return Review to Client
                {reviewableProjects.length > 0 && (
                  <span className={styles.reviewButtonBadge}>
                    {reviewableProjects.length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Pending Reviews Section */}
          {reviewableProjects.length > 0 && (
            <div className={styles.pendingReviewsSection}>
              <div className={styles.pendingHeader}>
                <h4>Review These Clients</h4>
                <AddReviewButton
                  project={reviewableProjects[0]}
                  variant="primary"
                />
              </div>
              <div className={styles.pendingProjectsList}>
                {reviewableProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className={styles.pendingProject}>
                    <div className={styles.projectInfo}>
                      <div className={styles.clientAvatar}>
                        {project.client?.name?.charAt(0).toUpperCase() || "C"}
                      </div>
                      <div>
                        <div className={styles.clientName}>
                          {project.client?.name || "Client"}
                        </div>
                        <div className={styles.projectTitle}>
                          {project.title}
                        </div>
                        <div className={styles.projectDate}>
                          Completed:{" "}
                          {new Date(project.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <AddReviewButton project={project} variant="secondary" />
                  </div>
                ))}
              </div>
              {reviewableProjects.length > 3 && (
                <div className={styles.moreProjects}>
                  <span>
                    +{reviewableProjects.length - 3} more projects to review
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Given Reviews List */}
          <div className={styles.reviewsList}>
            {clientReviews.length === 0 ? (
              <div className={styles.emptyReviews}>
                <FaUser className={styles.emptyReviewsIcon} />
                <p>No client reviews yet</p>
                <small>
                  Review your clients after project completion to help other
                  freelancers
                </small>
                {reviewableProjects.length > 0 && (
                  <AddReviewButton
                    project={reviewableProjects[0]}
                    variant="primary"
                  />
                )}
              </div>
            ) : (
              clientReviews.slice(0, 4).map((review, index) => (
                <div key={review.id || index} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.clientInfo}>
                      <div className={styles.avatar}>
                        {review.reviewee?.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <div className={styles.clientName}>
                          {review.reviewee?.name || "Client"}
                        </div>
                        <div className={styles.projectName}>
                          {review.project?.title || "Completed Project"}
                        </div>
                      </div>
                    </div>
                    <div className={styles.rating}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${styles.star} ${
                            i < review.rating
                              ? styles.starFilled
                              : styles.starEmpty
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className={styles.reviewComment}>"{review.comment}"</p>
                  )}
                  {review.aspects && review.aspects.length > 0 && (
                    <div className={styles.reviewAspects}>
                      {review.aspects.map((aspect, i) => (
                        <span key={i} className={styles.aspectTag}>
                          {getAspectLabel(aspect)}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.reviewDate}>
                    <FaCalendar />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {clientReviews.length > 4 && (
            <button
              className={styles.viewAllButton}
              onClick={() =>
                router.push("/freelancer-dashboard/client-reviews")
              }
            >
              View All Client Reviews
            </button>
          )}
        </motion.div>

        {/* Performance Insights */}
        <motion.div
          className={styles.performanceCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaRegSmile />
              <h3>Performance Insights</h3>
            </div>
            {/* Quick Review Button in Performance Section */}
            {reviewableProjects.length > 0 && (
              <AddReviewButton
                project={reviewableProjects[0]}
                variant="primary"
              />
            )}
          </div>
          <div className={styles.performanceGrid}>
            {performanceMetrics ? (
              <>
                <PerformanceMetric
                  icon={<FaCheckCircle />}
                  label="On-Time Delivery"
                  value={`${performanceMetrics.onTimeDelivery.value}%`}
                  description={performanceMetrics.onTimeDelivery.description}
                  color="#dcfce7"
                />
                <PerformanceMetric
                  icon={<FaUsers />}
                  label="Client Retention"
                  value={`${performanceMetrics.clientRetention.value}%`}
                  description={performanceMetrics.clientRetention.description}
                  color="#dbeafe"
                />
                <PerformanceMetric
                  icon={<FaStar />}
                  label="Satisfaction Score"
                  value={`${performanceMetrics.satisfactionScore.value}%`}
                  description={performanceMetrics.satisfactionScore.description}
                  color="#fef3c7"
                />
                <PerformanceMetric
                  icon={<FaClock />}
                  label="Response Time"
                  value={`${performanceMetrics.responseTime.value}h`}
                  description={performanceMetrics.responseTime.description}
                  color="#f3e8ff"
                />
              </>
            ) : (
              <div className={styles.noPerformanceData}>
                <FaChartLine className={styles.noDataIcon} />
                <p>Performance data not available</p>
                <small>
                  Complete more projects to see performance insights
                </small>
                {reviewableProjects.length > 0 && (
                  <AddReviewButton
                    project={reviewableProjects[0]}
                    variant="primary"
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Review Button for Mobile */}
      {reviewableProjects.length > 0 && (
        <motion.div
          className={styles.floatingReviewButton}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleOpenReview()}
        >
          <FaEdit />
          <span>Review Clients</span>
          <div className={styles.floatingBadge}>
            {reviewableProjects.length}
          </div>
        </motion.div>
      )}

      {/* Client Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseReview}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h2>Return Review to Client</h2>
                  <p>Share your experience working with this client</p>
                </div>
                <button
                  onClick={handleCloseReview}
                  className={styles.closeButton}
                >
                  <FaTimes />
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Client Selection Dropdown */}
                {reviewableProjects.length > 0 && (
                  <div className={styles.clientSelection}>
                    <label>Select Client to Review *</label>
                    <select
                      value={selectedProject?.id || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const project = reviewableProjects.find(
                          (p) => p.id === selectedId
                        );
                        if (project) {
                          setSelectedProject(project);
                        }
                      }}
                      className={styles.clientDropdown}
                    >
                      <option value="">Choose a client...</option>
                      {reviewableProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.client?.name || "Client"} - {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Client and Project Info */}
                {selectedProject && (
                  <div className={styles.clientInfo}>
                    <div className={styles.avatar}>
                      {selectedProject.client?.name?.charAt(0).toUpperCase() ||
                        "C"}
                    </div>
                    <div className={styles.clientDetails}>
                      <h3>{selectedProject.client?.name || "Client"}</h3>
                      <div className={styles.projectInfo}>
                        <FaBriefcase />
                        <span>{selectedProject.title}</span>
                      </div>
                      <div className={styles.roleInfo}>
                        <FaUser />
                        <span>Client</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Section */}
                <div className={styles.ratingSection}>
                  <label>Overall Rating *</label>
                  <div className={styles.starsContainer}>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`${styles.starButton} ${
                            (hoverRating || rating) >= star
                              ? styles.starActive
                              : ""
                          }`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                    <div className={styles.ratingText}>
                      {getRatingIcon(rating)}
                      {getRatingText(rating)}
                    </div>
                  </div>
                </div>

                {/* Review Aspects */}
                <div className={styles.aspectsSection}>
                  <label>What made this client great? (Optional)</label>
                  <div className={styles.aspectsGrid}>
                    {reviewAspects.map((aspect) => (
                      <button
                        key={aspect.key}
                        type="button"
                        onClick={() => handleAspectToggle(aspect.key)}
                        className={`${styles.aspectButton} ${
                          selectedAspects[aspect.key]
                            ? styles.aspectSelected
                            : ""
                        }`}
                      >
                        <span className={styles.aspectIcon}>{aspect.icon}</span>
                        <span className={styles.aspectLabel}>
                          {aspect.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Section */}
                <div className={styles.commentSection}>
                  <label>Additional Comments (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share details about your experience working with this client. What went well? Any suggestions for improvement?"
                    rows="5"
                    className={styles.commentTextarea}
                  />
                  <p className={styles.commentHint}>
                    Your review will help other freelancers understand what it's
                    like to work with this client.
                  </p>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  onClick={handleCloseReview}
                  disabled={isSubmitting}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitClientReview}
                  disabled={
                    isSubmitting || rating === 0 || !selectedProject?.clientId
                  }
                  className={styles.submitButton}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.submitSpinner} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
