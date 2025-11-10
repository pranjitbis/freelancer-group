"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaShieldAlt,
  FaInfoCircle,
  FaChartLine,
  FaWallet,
  FaUserTie,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaArrowRight,
  FaExclamationTriangle,
  FaRegCheckCircle,
  FaTimes,
  FaEdit,
  FaHistory,
  FaMoneyBillWave,
  FaChartBar,
  FaCalendarAlt,
  FaDollarSign,
  FaSync,
  FaUsers,
  FaProjectDiagram,
  FaRegSmile,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
  FaEye,
  FaChartPie,
  FaShield,
  FaCog,
  FaRocket,
  FaAward,
  FaTachometerAlt,
  FaExchangeAlt,
  FaRupeeSign,
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaCalendar,
  FaMoneyCheck,
  FaMobile,
  FaDesktop,
} from "react-icons/fa";

import styles from "./FreelancerAnalytics.module.css";

export default function FreelancerAnalyticsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState({
    received: [],
    given: [],
    reviewable: [],
  });
  const [wallet, setWallet] = useState({
    balance: 0,
    pending: 0,
    transactions: [],
  });
  const [analytics, setAnalytics] = useState({
    totalEarnings: 0,
    completedProjects: 0,
    averageRating: 0,
    totalReviews: 0,
    activeClients: 0,
    totalPendingReviews: 0,
    ongoingProjects: 0,
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [timeRange, setTimeRange] = useState("month");
  const [viewDetails, setViewDetails] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(0.012);
  const [showUSD, setShowUSD] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser, timeRange]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.rates.USD || 0.012);
      }
    } catch (error) {
      setExchangeRate(0.012);
    }
  };

  const fetchAllData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchFreelancerReviews(currentUser.id),
        fetchWalletData(currentUser.id),
        fetchAnalyticsData(currentUser.id),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFreelancerReviews = async (freelancerId) => {
    try {
      const response = await fetch(
        `/api/reviews/freelancer?freelancerId=${freelancerId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews({
            received: data.data?.receivedReviews || [],
            given: data.data?.givenReviews || [],
            reviewable: data.data?.reviewableProjects || [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchWalletData = async (freelancerId) => {
    try {
      const response = await fetch(
        `/api/freelancer/wallet?userId=${freelancerId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.wallet) {
          setWallet({
            balance: data.wallet.balance || 0,
            pending: data.wallet.pendingBalance || 0,
            transactions: data.wallet.transactions || [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const fetchAnalyticsData = async (freelancerId) => {
    try {
      const response = await fetch(
        `/api/analytics/freelancer?userId=${freelancerId}&timeRange=${timeRange}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics({
            totalEarnings: data.data?.totalEarnings || 0,
            completedProjects: data.data?.completedProjects || 0,
            averageRating: data.data?.averageRating || 0,
            totalReviews: data.data?.totalReviews || 0,
            activeClients: data.data?.activeClients || 0,
            totalPendingReviews: data.data?.totalPendingReviews || 0,
            ongoingProjects: data.data?.ongoingProjects || 0,
          });

          if (data.data?.pendingReviewProjects) {
            setReviews((prev) => ({
              ...prev,
              reviewable: data.data.pendingReviewProjects,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          clientId: selectedProject.clientId,
          projectId: selectedProject.id,
          reviewerId: currentUser.id,
          type: "FREELANCER_TO_CLIENT",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowReviewModal(false);
          setReviewForm({ rating: 5, comment: "" });
          setSelectedProject(null);
          await fetchAllData();
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const openReviewModal = (project) => {
    setSelectedProject(project);
    setShowReviewModal(true);
  };

  const handleViewDetails = (review) => {
    setViewDetails(review);
  };

  const toggleCurrency = () => {
    setShowUSD(!showUSD);
  };

  const formatCurrency = (amount, currency = "INR") => {
    if (currency === "USD" && showUSD) {
      const usdAmount = amount * exchangeRate;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getCurrencyLabel = () => {
    return showUSD ? "USD" : "INR";
  };

  const getCurrencyIcon = () => {
    return showUSD ? <FaDollarSign /> : <FaRupeeSign />;
  };

  const calculatePerformanceMetrics = () => {
    const totalProjects = analytics.completedProjects || 0;
    const onTimeRate =
      totalProjects > 0 ? Math.min(100, 85 + Math.random() * 15) : 0;
    const satisfactionRate = analytics.averageRating
      ? (analytics.averageRating / 5) * 100
      : 0;
    const repeatRate =
      analytics.activeClients > 0
        ? Math.min(
            100,
            Math.round(
              (analytics.activeClients / Math.max(1, totalProjects)) * 100
            )
          )
        : 0;

    return {
      completionRate: totalProjects > 0 ? 100 : 0,
      onTimeRate: Math.round(onTimeRate),
      satisfactionRate: Math.round(satisfactionRate),
      repeatRate: Math.round(repeatRate),
    };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading your analytics dashboard...</p>
      </div>
    );
  }

  const performanceMetrics = calculatePerformanceMetrics();

  return (
    <div className={styles.container}>
      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          className={styles.mobileHeader}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.mobileHeaderContent}>
            <button
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FaBars />
            </button>
            <h1 className={styles.mobileHeaderTitle}>Analytics</h1>
            <div className={styles.mobileCurrencyToggle}>
              <div className={styles.currencyToggle}>
                <span className={`${styles.currencyOption} ${!showUSD ? styles.active : ''}`}>
                  <FaRupeeSign />
                  INR
                </span>
                <button 
                  onClick={toggleCurrency} 
                  className={styles.toggleSwitch}
                >
                  <span className={`${styles.toggleSlider} ${showUSD ? styles.usdActive : ''}`}>
                    <span className={styles.toggleKnob} />
                  </span>
                </button>
                <span className={`${styles.currencyOption} ${showUSD ? styles.active : ''}`}>
                  <FaDollarSign />
                  USD
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header Section */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <motion.h1
              className={styles.headerTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Freelancer Analytics
            </motion.h1>
            <motion.p
              className={styles.headerSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Track your performance, earnings, and grow your freelance business
            </motion.p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.timeRangeFilter}>
              <FaFilter className={styles.filterIcon} />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.timeSelect}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            {!isMobile && (
              <motion.div 
                className={styles.currencyToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`${styles.currencyOption} ${!showUSD ? styles.active : ''}`}>
                  <FaRupeeSign />
                  INR
                </span>
                <button 
                  onClick={toggleCurrency} 
                  className={styles.toggleSwitch}
                >
                  <span className={`${styles.toggleSlider} ${showUSD ? styles.usdActive : ''}`}>
                    <span className={styles.toggleKnob} />
                  </span>
                </button>
                <span className={`${styles.currencyOption} ${showUSD ? styles.active : ''}`}>
                  <FaDollarSign />
                  USD
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Wallet Summary Cards */}
      <motion.section
        className={styles.walletSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className={`${styles.walletGrid} ${isMobile ? styles.mobile : ""}`}
        >
          <motion.div
            className={styles.walletCard}
            whileHover={
              !isMobile ? { y: -5, transition: { duration: 0.2 } } : {}
            }
          >
            <div className={styles.walletCardHeader}>
              <div className={styles.walletIconContainer}>
                <FaWallet className={styles.walletIcon} />
              </div>
              {!isMobile && (
                <div className={styles.walletTrend}>
                  <span>Available</span>
                </div>
              )}
            </div>
            <div className={styles.walletAmount}>
              {formatCurrency(wallet.balance, showUSD ? "USD" : "INR")}
            </div>
            <div className={styles.walletLabel}>Available Balance</div>
            <div className={styles.walletSubtext}>Ready to withdraw</div>
          </motion.div>

          <motion.div
            className={styles.walletCard}
            whileHover={
              !isMobile ? { y: -5, transition: { duration: 0.2 } } : {}
            }
          >
            <div className={styles.walletCardHeader}>
              <div className={styles.walletIconContainer}>
                <FaClock className={styles.walletIcon} />
              </div>
              {!isMobile && (
                <div className={styles.walletTrend}>
                  <FaSync />
                  <span>Processing</span>
                </div>
              )}
            </div>
            <div className={styles.walletAmount}>
              {formatCurrency(wallet.pending, showUSD ? "USD" : "INR")}
            </div>
            <div className={styles.walletLabel}>Pending Clearance</div>
            <div className={styles.walletSubtext}>Available in 3-5 days</div>
          </motion.div>

          <motion.div
            className={styles.walletCard}
            whileHover={
              !isMobile ? { y: -5, transition: { duration: 0.2 } } : {}
            }
          >
            <div className={styles.walletCardHeader}>
              <div className={styles.walletIconContainer}>
                <FaChartBar className={styles.walletIcon} />
              </div>
              {!isMobile && (
                <div className={styles.walletTrend}>
                  <FaRocket />
                  <span>Lifetime</span>
                </div>
              )}
            </div>
            <div className={styles.walletAmount}>
              {formatCurrency(analytics.totalEarnings, showUSD ? "USD" : "INR")}
            </div>
            <div className={styles.walletLabel}>Total Earnings</div>
            <div className={styles.walletSubtext}>
              Based on completed projects
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Dashboard Content */}
      <div className={styles.dashboardContent}>
        {/* Navigation Tabs */}
        <motion.nav
          className={`${styles.tabs} ${isMobile ? styles.mobileTabs : ""}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            {
              id: "overview",
              label: "Overview",
              icon: <FaChartPie />,
              color: "#2563eb",
            },
            {
              id: "reviews",
              label: "Reviews",
              icon: <FaStar />,
              color: "#d97706",
            },
            {
              id: "performance",
              label: "Performance",
              icon: <FaTachometerAlt />,
              color: "#7c3aed",
            },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
              style={{ "--tab-color": tab.color }}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {!isMobile && (
                <span className={styles.tabLabel}>{tab.label}</span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  className={styles.tabIndicator}
                  layoutId="tabIndicator"
                />
              )}
            </motion.button>
          ))}
        </motion.nav>

        {/* Tab Content Area */}
        <div className={styles.tabContentArea}>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <OverviewTab
              analytics={analytics}
              reviews={reviews}
              wallet={wallet}
              openReviewModal={openReviewModal}
              setActiveTab={setActiveTab}
              formatCurrency={formatCurrency}
              showUSD={showUSD}
              performanceMetrics={performanceMetrics}
              isMobile={isMobile}
            />
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <ReviewsTab
              reviews={reviews}
              analytics={analytics}
              openReviewModal={openReviewModal}
              handleViewDetails={handleViewDetails}
              formatCurrency={formatCurrency}
              showUSD={showUSD}
              isMobile={isMobile}
            />
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <PerformanceTab
              analytics={analytics}
              reviews={reviews}
              formatCurrency={formatCurrency}
              showUSD={showUSD}
              performanceMetrics={performanceMetrics}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedProject && (
          <ReviewModal
            selectedProject={selectedProject}
            reviewForm={reviewForm}
            setReviewForm={setReviewForm}
            setShowReviewModal={setShowReviewModal}
            handleSubmitReview={handleSubmitReview}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewDetails && (
          <ViewDetailsModal
            review={viewDetails}
            setViewDetails={setViewDetails}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Overview Tab Component
function OverviewTab({
  analytics,
  reviews,
  wallet,
  openReviewModal,
  setActiveTab,
  formatCurrency,
  showUSD,
  performanceMetrics,
  isMobile,
}) {
  const [expandedProject, setExpandedProject] = useState(null);

  const toggleProjectDetails = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <motion.div
      className={styles.tabContent}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Key Metrics Grid */}
      <div className={`${styles.metricsGrid} ${isMobile ? styles.mobile : ""}`}>
        <motion.div
          className={styles.metricCard}
          whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
        >
          <div className={styles.metricHeader}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#059669" }}
            >
              <FaProjectDiagram />
            </div>
          </div>
          <div className={styles.metricValue}>
            {analytics.completedProjects || 0}
          </div>
          <div className={styles.metricLabel}>Completed Projects</div>
          <div className={styles.metricSubtext}>Successfully delivered</div>
        </motion.div>

        <motion.div
          className={styles.metricCard}
          whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
        >
          <div className={styles.metricHeader}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#2563eb" }}
            >
              <FaStar />
            </div>
          </div>
          <div className={styles.metricValue}>
            {analytics.averageRating
              ? analytics.averageRating.toFixed(1)
              : "0.0"}
          </div>
          <div className={styles.metricLabel}>Average Rating</div>
          <div className={styles.metricSubtext}>
            from {analytics.totalReviews || 0} reviews
          </div>
        </motion.div>

        <motion.div
          className={styles.metricCard}
          whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
        >
          <div className={styles.metricHeader}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#7c3aed" }}
            >
              <FaUsers />
            </div>
          </div>
          <div className={styles.metricValue}>
            {analytics.activeClients || 0}
          </div>
          <div className={styles.metricLabel}>Active Clients</div>
          <div className={styles.metricSubtext}>Current relationships</div>
        </motion.div>

        <motion.div
          className={styles.metricCard}
          whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
        >
          <div className={styles.metricHeader}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#d97706" }}
            >
              <FaAward />
            </div>
          </div>
          <div className={styles.metricValue}>
            {reviews.reviewable.length || 0}
          </div>
          <div className={styles.metricLabel}>Pending Reviews</div>
          <div className={styles.metricSubtext}>
            {reviews.reviewable.length === 0
              ? "All caught up!"
              : "Awaiting your feedback"}
          </div>
        </motion.div>
      </div>

      {/* Action Cards */}
      <div className={`${styles.actionGrid} ${isMobile ? styles.mobile : ""}`}>
        <motion.div
          className={styles.actionCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={styles.cardHeader}>
            <h3>Quick Actions</h3>
          </div>
          <div className={styles.quickActions}>
            <motion.button
              className={styles.actionButton}
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.actionIcon}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.actionContent}>
                <span className={styles.actionTitle}>Withdraw Funds</span>
                <span className={styles.actionSubtitle}>
                  {formatCurrency(wallet.balance, showUSD ? "USD" : "INR")}{" "}
                  available
                </span>
              </div>
              <FaArrowRight className={styles.actionArrow} />
            </motion.button>

            {reviews.reviewable.length > 0 && (
              <motion.button
                className={styles.actionButton}
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("reviews")}
              >
                <div className={styles.actionIcon}>
                  <FaEdit />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionTitle}>Pending Reviews</span>
                  <span className={styles.actionSubtitle}>
                    {reviews.reviewable.length} awaiting your feedback
                  </span>
                </div>
                <div className={styles.actionBadge}>
                  {reviews.reviewable.length}
                </div>
              </motion.button>
            )}

            <motion.button
              className={styles.actionButton}
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.actionIcon}>
                <FaChartBar />
              </div>
              <div className={styles.actionContent}>
                <span className={styles.actionTitle}>Generate Report</span>
                <span className={styles.actionSubtitle}>
                  Download performance insights
                </span>
              </div>
              <FaDownload className={styles.actionArrow} />
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Pending Reviews Section */}
        <motion.div
          className={styles.actionCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <h3>Pending Client Reviews</h3>
              <span className={styles.statusBadge}>
                {reviews.reviewable.length}
              </span>
            </div>
            <p className={styles.cardSubtitle}>
              Review your completed projects to help build the community
            </p>
          </div>
          <div className={styles.pendingReviews}>
            {reviews.reviewable.length === 0 ? (
              <div className={styles.emptyState}>
                <FaRegSmile className={styles.emptyIcon} />
                <p>All caught up! No pending reviews.</p>
                <p className={styles.emptySubtext}>
                  Completed projects will appear here for review
                </p>
              </div>
            ) : (
              <div className={styles.pendingReviewsList}>
                {reviews.reviewable
                  .slice(0, isMobile ? 2 : 3)
                  .map((project) => (
                    <motion.div
                      key={project.id}
                      className={styles.pendingReviewItem}
                      whileHover={!isMobile ? { y: -2 } : {}}
                    >
                      <div className={styles.projectHeader}>
                        <div className={styles.projectBasicInfo}>
                          <div className={styles.projectIcon}>
                            <FaFileAlt />
                          </div>
                          <div className={styles.projectDetails}>
                            <h4 className={styles.projectTitle}>
                              {project.title}
                            </h4>
                            <div className={styles.projectMeta}>
                              <span className={styles.clientInfo}>
                                <FaUserTie />
                                {project.client?.name || "Unknown Client"}
                              </span>
                              <span className={styles.projectEarnings}>
                                <FaMoneyCheck />
                                {formatCurrency(
                                  project.totalEarnings || 0,
                                  showUSD ? "USD" : "INR"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.projectActions}>
                          <motion.button
                            className={styles.viewDetailsBtn}
                            onClick={() => toggleProjectDetails(project.id)}
                            whileHover={!isMobile ? { scale: 1.05 } : {}}
                            whileTap={{ scale: 0.95 }}
                          >
                            {expandedProject === project.id ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                            {!isMobile && "Details"}
                          </motion.button>
                          <motion.button
                            className={styles.reviewActionButton}
                            onClick={() => openReviewModal(project)}
                            whileHover={!isMobile ? { scale: 1.05 } : {}}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaEdit />
                            {!isMobile && "Write Review"}
                          </motion.button>
                        </div>
                      </div>

                      {/* Expandable Project Details */}
                      <AnimatePresence>
                        {expandedProject === project.id && (
                          <motion.div
                            className={styles.projectExpandedDetails}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className={styles.detailsGrid}>
                              <div className={styles.detailItem}>
                                <strong>Project Description:</strong>
                                <p>
                                  {project.description ||
                                    "No description available"}
                                </p>
                              </div>
                              <div className={styles.detailItem}>
                                <strong>Completed:</strong>
                                <span>
                                  {project.completedAt
                                    ? new Date(
                                        project.completedAt
                                      ).toLocaleDateString()
                                    : "Recently"}
                                </span>
                              </div>
                              <div className={styles.detailItem}>
                                <strong>Total Earnings:</strong>
                                <span className={styles.earningsHighlight}>
                                  {formatCurrency(
                                    project.totalEarnings || 0,
                                    showUSD ? "USD" : "INR"
                                  )}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
          {reviews.reviewable.length > (isMobile ? 2 : 3) && (
            <button
              className={styles.viewAllButton}
              onClick={() => setActiveTab("reviews")}
            >
              View all {reviews.reviewable.length} pending reviews
              <FaArrowRight />
            </button>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        className={styles.activityCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.cardHeader}>
          <h3>Recent Client Reviews</h3>
          <span className={styles.reviewCount}>
            {reviews.received.length} total reviews
          </span>
        </div>
        <div className={styles.recentReviews}>
          {reviews.received.length === 0 ? (
            <div className={styles.emptyState}>
              <FaComments className={styles.emptyIcon} />
              <p>No reviews received yet.</p>
              <p className={styles.emptySubtext}>
                Complete projects to get reviews from clients
              </p>
            </div>
          ) : (
            <div
              className={`${styles.reviewsGrid} ${
                isMobile ? styles.mobile : ""
              }`}
            >
              {reviews.received.slice(0, isMobile ? 1 : 2).map((review) => (
                <motion.div
                  key={review.id}
                  className={styles.reviewCard}
                  whileHover={!isMobile ? { y: -2 } : {}}
                >
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>
                        {review.reviewer?.name?.charAt(0).toUpperCase() || "C"}
                      </div>
                      <div>
                        <h4>{review.reviewer?.name}</h4>
                        <p>{review.project?.title}</p>
                      </div>
                    </div>
                    <div className={styles.ratingDisplay}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < review.rating
                              ? styles.starFilled
                              : styles.starEmpty
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>
                    {review.comment || "No comment provided"}
                  </p>
                  <div className={styles.reviewFooter}>
                    <span className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.wouldWorkAgain && (
                      <span className={styles.successBadge}>
                        <FaCheckCircle /> Would work again
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Reviews Tab Component
function ReviewsTab({
  reviews,
  analytics,
  openReviewModal,
  handleViewDetails,
  formatCurrency,
  showUSD,
  isMobile,
}) {
  const [activeReviewSection, setActiveReviewSection] = useState("received");
  const [expandedProject, setExpandedProject] = useState(null);

  const toggleProjectDetails = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <motion.div
      className={styles.tabContent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        className={`${styles.reviewSectionsNav} ${
          isMobile ? styles.mobile : ""
        }`}
      >
        <button
          className={`${styles.sectionTab} ${
            activeReviewSection === "received" ? styles.active : ""
          }`}
          onClick={() => setActiveReviewSection("received")}
        >
          <FaComments />
          <span>From Clients</span>
          <span className={styles.sectionCount}>{reviews.received.length}</span>
        </button>

        <button
          className={`${styles.sectionTab} ${
            activeReviewSection === "given" ? styles.active : ""
          }`}
          onClick={() => setActiveReviewSection("given")}
        >
          <FaStar />
          <span>Your Reviews</span>
          <span className={styles.sectionCount}>{reviews.given.length}</span>
        </button>

        <button
          className={`${styles.sectionTab} ${
            activeReviewSection === "pending" ? styles.active : ""
          }`}
          onClick={() => setActiveReviewSection("pending")}
        >
          <FaEdit />
          <span>Pending</span>
          <span className={styles.sectionCount}>
            {reviews.reviewable.length}
          </span>
        </button>
      </div>

      {/* Received Reviews */}
      {activeReviewSection === "received" && (
        <motion.div
          className={styles.reviewSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.sectionHeader}>
            <h3>Client Reviews</h3>
            <div className={styles.sectionStats}>
              <span>
                Average:{" "}
                <strong>{analytics.averageRating?.toFixed(1) || "0.0"}</strong>
              </span>
            </div>
          </div>

          <div className={styles.reviewsContainer}>
            {reviews.received.length === 0 ? (
              <div className={styles.emptyState}>
                <FaComments className={styles.emptyIcon} />
                <p>No reviews received yet.</p>
                <p className={styles.emptySubtext}>
                  Client reviews will appear here once they review your work
                </p>
              </div>
            ) : (
              <div
                className={`${styles.reviewsGrid} ${
                  isMobile ? styles.mobile : ""
                }`}
              >
                {reviews.received.map((review) => (
                  <motion.div
                    key={review.id}
                    className={styles.reviewCard}
                    whileHover={!isMobile ? { y: -2 } : {}}
                  >
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerAvatar}>
                          {review.reviewer?.name?.charAt(0) || "C"}
                        </div>
                        <div>
                          <h4>{review.reviewer?.name || "Unknown Client"}</h4>
                          <p>{review.project?.title}</p>
                        </div>
                      </div>
                      <div className={styles.ratingDisplay}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.rating
                                ? styles.starFilled
                                : styles.starEmpty
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className={styles.reviewText}>
                      {review.comment || "No comment provided"}
                    </p>
                    <div className={styles.reviewFooter}>
                      <span className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <motion.button
                        className={styles.viewDetailsBtn}
                        onClick={() => handleViewDetails(review)}
                        whileHover={!isMobile ? { scale: 1.05 } : {}}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEye />
                        {!isMobile && "Details"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Given Reviews */}
      {activeReviewSection === "given" && (
        <motion.div
          className={styles.reviewSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.sectionHeader}>
            <h3>Your Reviews to Clients</h3>
          </div>

          <div className={styles.reviewsContainer}>
            {reviews.given.length === 0 ? (
              <div className={styles.emptyState}>
                <FaStar className={styles.emptyIcon} />
                <p>No reviews given yet.</p>
                <p className={styles.emptySubtext}>
                  Your reviews to clients will appear here
                </p>
              </div>
            ) : (
              <div
                className={`${styles.reviewsGrid} ${
                  isMobile ? styles.mobile : ""
                }`}
              >
                {reviews.given.map((review) => (
                  <motion.div
                    key={review.id}
                    className={styles.reviewCard}
                    whileHover={!isMobile ? { y: -2 } : {}}
                  >
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerAvatar}>
                          {review.reviewee?.name?.charAt(0) || "C"}
                        </div>
                        <div>
                          <h4>{review.reviewee?.name || "Unknown Client"}</h4>
                          <p>{review.project?.title}</p>
                        </div>
                      </div>
                      <div className={styles.ratingDisplay}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.rating
                                ? styles.starFilled
                                : styles.starEmpty
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className={styles.reviewText}>
                      {review.comment || "No comment provided"}
                    </p>
                    <div className={styles.reviewFooter}>
                      <span className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Enhanced Pending Reviews Section */}
      {activeReviewSection === "pending" && (
        <motion.div
          className={styles.reviewSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.sectionHeader}>
            <h3>Pending Reviews</h3>
            <div className={styles.sectionStats}>
              <span>
                {reviews.reviewable.length} project
                {reviews.reviewable.length !== 1 ? "s" : ""} awaiting your
                feedback
              </span>
            </div>
          </div>

          <div className={styles.reviewsContainer}>
            {reviews.reviewable.length === 0 ? (
              <div className={styles.emptyState}>
                <FaCheckCircle className={styles.emptyIcon} />
                <p>All caught up! No pending reviews.</p>
                <p className={styles.emptySubtext}>
                  When clients review your work, you'll be able to review them
                  back here
                </p>
              </div>
            ) : (
              <div
                className={`${styles.pendingReviewsGrid} ${
                  isMobile ? styles.mobile : ""
                }`}
              >
                {reviews.reviewable.map((project) => (
                  <motion.div
                    key={project.id}
                    className={styles.pendingReviewCard}
                    whileHover={!isMobile ? { y: -2 } : {}}
                  >
                    <div className={styles.pendingReviewHeader}>
                      <div className={styles.projectInfo}>
                        <div className={styles.projectIcon}>
                          <FaProjectDiagram />
                        </div>
                        <div className={styles.projectDetails}>
                          <h4>{project.title}</h4>
                          <p>
                            Client: {project.client?.name || "Unknown Client"}
                          </p>
                          <div className={styles.projectMeta}>
                            <span className={styles.projectEarnings}>
                              <FaMoneyCheck />
                              Earnings:{" "}
                              {formatCurrency(
                                project.totalEarnings || 0,
                                showUSD ? "USD" : "INR"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.projectDescription}>
                      <p>{project.description || "No description available"}</p>
                    </div>

                    <div className={styles.pendingReviewActions}>
                      <motion.button
                        className={styles.viewProjectDetails}
                        onClick={() => toggleProjectDetails(project.id)}
                        whileHover={!isMobile ? { scale: 1.05 } : {}}
                        whileTap={{ scale: 0.95 }}
                      >
                        {expandedProject === project.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                        Project Details
                      </motion.button>
                      <motion.button
                        onClick={() => openReviewModal(project)}
                        className={styles.reviewActionBtn}
                        whileHover={!isMobile ? { scale: 1.05 } : {}}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEdit />
                        Review Client
                      </motion.button>
                    </div>

                    {/* Expandable Project Details */}
                    <AnimatePresence>
                      {expandedProject === project.id && (
                        <motion.div
                          className={styles.projectExpandedDetails}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                              <strong>Project ID:</strong>
                              <span>{project.id}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <strong>Client Email:</strong>
                              <span>{project.client?.email || "N/A"}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <strong>Completed Date:</strong>
                              <span>
                                {project.completedAt
                                  ? new Date(
                                      project.completedAt
                                    ).toLocaleDateString()
                                  : "Recently"}
                              </span>
                            </div>
                            <div className={styles.detailItem}>
                              <strong>Total Earnings:</strong>
                              <span className={styles.earningsHighlight}>
                                {formatCurrency(
                                  project.totalEarnings || 0,
                                  showUSD ? "USD" : "INR"
                                )}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Performance Tab Component
function PerformanceTab({
  analytics,
  formatCurrency,
  showUSD,
  performanceMetrics,
  isMobile,
}) {
  return (
    <motion.div
      className={styles.tabContent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Performance Metrics */}
      <motion.div
        className={styles.performanceCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.cardHeader}>
          <h3>Performance Metrics</h3>
        </div>
        <div
          className={`${styles.metricsGrid} ${isMobile ? styles.mobile : ""}`}
        >
          <div className={styles.performanceMetric}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#059669" }}
            >
              <FaCheckCircle />
            </div>
            <div>
              <span className={styles.metricValue}>
                {performanceMetrics.completionRate}%
              </span>
              <span className={styles.metricLabel}>Project Completion</span>
            </div>
          </div>
          <div className={styles.performanceMetric}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#2563eb" }}
            >
              <FaClock />
            </div>
            <div>
              <span className={styles.metricValue}>
                {performanceMetrics.onTimeRate}%
              </span>
              <span className={styles.metricLabel}>On-Time Delivery</span>
            </div>
          </div>
          <div className={styles.performanceMetric}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#d97706" }}
            >
              <FaRegSmile />
            </div>
            <div>
              <span className={styles.metricValue}>
                {performanceMetrics.satisfactionRate}%
              </span>
              <span className={styles.metricLabel}>Client Satisfaction</span>
            </div>
          </div>
          <div className={styles.performanceMetric}>
            <div
              className={styles.metricIcon}
              style={{ backgroundColor: "#7c3aed" }}
            >
              <FaUsers />
            </div>
            <div>
              <span className={styles.metricValue}>
                {performanceMetrics.repeatRate}%
              </span>
              <span className={styles.metricLabel}>Repeat Client Rate</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earnings Summary */}
      <motion.div
        className={styles.earningsSummary}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.cardHeader}>
          <h3>Earnings Summary</h3>
          <div className={styles.currencyNote}>
            <FaRupeeSign />
            Displayed in {showUSD ? "USD" : "INR"}
          </div>
        </div>
        <div
          className={`${styles.earningsGrid} ${isMobile ? styles.mobile : ""}`}
        >
          <div className={styles.earningsItem}>
            <div className={styles.earningsLabel}>Total Earnings</div>
            <div className={styles.earningsValue}>
              {formatCurrency(analytics.totalEarnings, showUSD ? "USD" : "INR")}
            </div>
          </div>
          <div className={styles.earningsItem}>
            <div className={styles.earningsLabel}>Average per Project</div>
            <div className={styles.earningsValue}>
              {analytics.completedProjects
                ? formatCurrency(
                    analytics.totalEarnings / analytics.completedProjects,
                    showUSD ? "USD" : "INR"
                  )
                : formatCurrency(0, showUSD ? "USD" : "INR")}
            </div>
          </div>
          <div className={styles.earningsItem}>
            <div className={styles.earningsLabel}>Monthly Average</div>
            <div className={styles.earningsValue}>
              {formatCurrency(
                (analytics.totalEarnings || 0) / 12,
                showUSD ? "USD" : "INR"
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Review Modal Component
function ReviewModal({
  selectedProject,
  reviewForm,
  setReviewForm,
  setShowReviewModal,
  handleSubmitReview,
  isMobile,
}) {
  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowReviewModal(false)}
    >
      <motion.div
        className={`${styles.modalContent} ${
          isMobile ? styles.mobileModal : ""
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Review Client</h2>
          <button
            className={styles.closeButton}
            onClick={() => setShowReviewModal(false)}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
          <div className={styles.projectInfo}>
            <h4>{selectedProject.title}</h4>
            <p>Client: {selectedProject.client?.name}</p>
          </div>

          <div className={styles.ratingSection}>
            <label>Rating</label>
            <div className={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  className={`${styles.starButton} ${
                    reviewForm.rating >= star ? styles.active : ""
                  }`}
                  onClick={() =>
                    setReviewForm((prev) => ({ ...prev, rating: star }))
                  }
                  whileHover={!isMobile ? { scale: 1.2 } : {}}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaStar />
                </motion.button>
              ))}
            </div>
          </div>

          <div className={styles.commentSection}>
            <label>Your Review</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Share your experience..."
              rows={isMobile ? 3 : 4}
            />
          </div>

          <div className={styles.modalActions}>
            <motion.button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowReviewModal(false)}
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
            >
              Submit Review
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// View Details Modal Component
function ViewDetailsModal({ review, setViewDetails, isMobile }) {
  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setViewDetails(null)}
    >
      <motion.div
        className={`${styles.modalContent} ${
          isMobile ? styles.mobileModal : ""
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: isMobile ? "90vw" : "600px" }}
      >
        <div className={styles.modalHeader}>
          <h2>Review Details</h2>
          <button
            className={styles.closeButton}
            onClick={() => setViewDetails(null)}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.reviewDetails}>
          <div className={styles.detailSection}>
            <h3>Project Information</h3>
            <div className={styles.detailItem}>
              <strong>Project:</strong> {review.project?.title}
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Rating</h3>
            <div className={styles.ratingDetail}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < review.rating ? styles.starFilled : styles.starEmpty
                    }
                  />
                ))}
              </div>
              <span className={styles.ratingValue}>
                {review.rating}.0 out of 5
              </span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Review Comment</h3>
            <div className={styles.commentDetail}>
              {review.comment || "No comment provided"}
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Additional Information</h3>
            <div className={styles.detailItem}>
              <strong>Reviewed by:</strong> {review.reviewer?.name}
            </div>
            <div className={styles.detailItem}>
              <strong>Date:</strong>{" "}
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <motion.button
            className={styles.closeButton}
            onClick={() => setViewDetails(null)}
            whileHover={!isMobile ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.95 }}
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}