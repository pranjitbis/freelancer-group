// app\freelancer-dashboard\analytics\page.jsx (Updated Client Reviews Section)
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
  FaDatabase,
  FaEdit,
  FaPlus,
  FaEye,
  FaThumbsUp,
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submittedReview, setSubmittedReview] = useState(null);

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
    respect: false,
    collaboration: false,
    feedback: false,
    flexibility: false,
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

  const showSuccessMessage = (message, review = null) => {
    setSuccessMessage(message);
    setSubmittedReview(review);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage("");
      setSubmittedReview(null);
    }, 5000);
  };

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
        fetch(`/api/reviews/client?freelancerId=${userId}`),
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
  const handleOpenReview = (project) => {
    setSelectedProject(project);
    setShowReviewModal(true);
    setRating(0);
    setComment("");
    setHoverRating(0);
    setSelectedAspects({
      communication: false,
      payment: false,
      clarity: false,
      professionalism: false,
      respect: false,
      collaboration: false,
      feedback: false,
      flexibility: false,
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
      respect: false,
      collaboration: false,
      feedback: false,
      flexibility: false,
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

    setIsSubmitting(true);
    try {
      const aspects = Object.keys(selectedAspects).filter(
        (key) => selectedAspects[key]
      );

      const reviewData = {
        rating,
        comment,
        clientId: selectedProject.clientId,
        projectId: selectedProject.id,
        reviewerId: user.id,
        type: "FREELANCER_TO_CLIENT",
        aspects: aspects,
      };

      console.log("📝 Submitting client review:", reviewData);

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

      // Show success message with the returned review data
      const aspectCount = aspects.length;
      let message = "Review submitted successfully!";

      if (aspectCount >= 5) {
        message =
          "Outstanding review! You highlighted many great qualities about this client! 🌟";
      } else if (aspectCount >= 3) {
        message =
          "Excellent review! Your detailed feedback helps other freelancers. 🎉";
      } else if (aspectCount >= 1) {
        message = "Great review! Thanks for sharing your experience. 👍";
      }

      showSuccessMessage(message, data.review);

      // Refresh data to update the lists
      fetchAnalyticsData(user.id);
      handleCloseReview();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Poor - Would not work with again";
      case 2:
        return "Fair - Needs improvement";
      case 3:
        return "Good - Satisfactory experience";
      case 4:
        return "Very Good - Great to work with";
      case 5:
        return "Excellent - Outstanding client!";
      default:
        return "Select Rating";
    }
  };

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <FaSmile style={{ color: "#10b981" }} />;
    if (rating >= 3) return <FaMeh style={{ color: "#f59e0b" }} />;
    return <FaFrown style={{ color: "#ef4444" }} />;
  };

  // Enhanced review aspects for better client feedback
  const reviewAspects = [
    {
      key: "communication",
      label: "Clear Communication",
      icon: "💬",
      description: "Responded promptly and communicated clearly",
    },
    {
      key: "payment",
      label: "Prompt Payment",
      icon: "💰",
      description: "Paid on time without delays",
    },
    {
      key: "clarity",
      label: "Clear Requirements",
      icon: "🎯",
      description: "Provided clear project requirements and goals",
    },
    {
      key: "professionalism",
      label: "Professional",
      icon: "👔",
      description: "Maintained professional conduct throughout",
    },
    {
      key: "respect",
      label: "Respectful",
      icon: "🙏",
      description: "Respected my time and expertise",
    },
    {
      key: "collaboration",
      label: "Good Collaboration",
      icon: "🤝",
      description: "Worked together effectively as a team",
    },
    {
      key: "feedback",
      label: "Constructive Feedback",
      icon: "💡",
      description: "Provided helpful and constructive feedback",
    },
    {
      key: "flexibility",
      label: "Flexible",
      icon: "🔄",
      description: "Was flexible with changes and updates",
    },
  ];

  // Helper function for review aspects
  const getAspectLabel = (aspect) => {
    const aspectLabels = {
      communication: "Clear Communication",
      payment: "Prompt Payment",
      clarity: "Clear Requirements",
      professionalism: "Professional",
      respect: "Respectful",
      collaboration: "Good Collaboration",
      feedback: "Constructive Feedback",
      flexibility: "Flexible",
    };
    return aspectLabels[aspect] || aspect;
  };

  // Client Reviews Section Component
  const ClientReviewsSection = () => {
    return (
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
          <div className={styles.reviewStats}>
            <span className={styles.reviewCount}>
              {clientReviews.length} reviews given
            </span>
            {reviewableProjects.length > 0 && (
              <span className={styles.pendingReviews}>
                {reviewableProjects.length} pending reviews
              </span>
            )}
          </div>
        </div>

        {/* Success Review Display */}
        {submittedReview && (
          <div className={styles.reviewSuccessCard}>
            <div className={styles.successHeader}>
              <FaCheckCircle className={styles.successIcon} />
              <h4>Review Submitted Successfully!</h4>
            </div>
            <div className={styles.reviewPreview}>
              <div className={styles.previewHeader}>
                <div className={styles.clientAvatar}>
                  {submittedReview.reviewee?.name?.charAt(0)?.toUpperCase() ||
                    "C"}
                </div>
                <div className={styles.previewInfo}>
                  <div className={styles.clientName}>
                    {submittedReview.reviewee?.name || "Client"}
                  </div>
                  <div className={styles.projectName}>
                    {submittedReview.project?.title || "Project"}
                  </div>
                </div>
                <div className={styles.ratingDisplay}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${styles.star} ${
                        i < submittedReview.rating
                          ? styles.starFilled
                          : styles.starEmpty
                      }`}
                    />
                  ))}
                  <span className={styles.ratingText}>
                    {submittedReview.rating}.0
                  </span>
                </div>
              </div>
              {submittedReview.comment && (
                <div className={styles.previewComment}>
                  "{submittedReview.comment}"
                </div>
              )}
              {submittedReview.aspects &&
                submittedReview.aspects.length > 0 && (
                  <div className={styles.previewAspects}>
                    <strong>Positive aspects:</strong>{" "}
                    {submittedReview.aspects.map(getAspectLabel).join(", ")}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Pending Reviews Section */}
        {reviewableProjects.length > 0 && (
          <div className={styles.pendingReviewsSection}>
            <div className={styles.sectionHeader}>
              <h4>Review These Clients</h4>
              <span className={styles.sectionBadge}>
                {reviewableProjects.length} projects completed
              </span>
            </div>
            <p className={styles.sectionDescription}>
              Share your experience working with these clients to help other
              freelancers
            </p>
            <div className={styles.pendingProjectsGrid}>
              {reviewableProjects.slice(0, 6).map((project) => (
                <div key={project.id} className={styles.pendingProjectCard}>
                  <div className={styles.projectHeader}>
                    <div className={styles.clientAvatar}>
                      {project.client?.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div className={styles.clientInfo}>
                      <div className={styles.clientName}>
                        {project.client?.name || "Client"}
                      </div>
                      <div className={styles.projectTitle}>{project.title}</div>
                    </div>
                  </div>

                  <div className={styles.projectDetails}>
                    <div className={styles.projectMeta}>
                      <div className={styles.metaItem}>
                        <FaCalendar />
                        <span>
                          Completed{" "}
                          {new Date(project.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <FaMoneyBillWave />
                        <span>
                          Earned: ₹
                          {project.totalPayment?.toLocaleString() ||
                            project.budget?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reviewActions}>
                    <button
                      onClick={() => handleOpenReview(project)}
                      className={styles.reviewButton}
                    >
                      <FaStar />
                      Review Client
                    </button>
                    <button
                      onClick={() => {
                        setRating(5);
                        setSelectedAspects({
                          communication: true,
                          payment: true,
                          clarity: true,
                          professionalism: true,
                          respect: false,
                          collaboration: false,
                          feedback: false,
                          flexibility: false,
                        });
                        handleOpenReview(project);
                      }}
                      className={styles.quickReviewButton}
                    >
                      <FaThumbsUp />
                      Quick 5-Star
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Given Reviews List */}
        <div className={styles.givenReviewsSection}>
          <div className={styles.sectionHeader}>
            <h4>Your Client Reviews</h4>
            <span className={styles.sectionBadge}>
              {clientReviews.length} reviews given
            </span>
          </div>

          {clientReviews.length === 0 ? (
            <div className={styles.emptyReviews}>
              <div className={styles.emptyReviewsIcon}>
                <FaUser />
              </div>
              <h5>No Client Reviews Yet</h5>
              <p>
                Review your clients after project completion to help other
                freelancers
              </p>
              {reviewableProjects.length === 0 && (
                <button
                  className={styles.exploreProjectsButton}
                  onClick={() => router.push("/freelancer-dashboard/projects")}
                >
                  <FaBriefcase />
                  View Your Projects
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={styles.reviewsGrid}>
                {clientReviews.slice(0, 6).map((review, index) => (
                  <ReviewCard key={review.id || index} review={review} />
                ))}
              </div>

              {clientReviews.length > 6 && (
                <div className={styles.viewAllSection}>
                  <button
                    className={styles.viewAllButton}
                    onClick={() =>
                      router.push("/freelancer-dashboard/client-reviews")
                    }
                  >
                    View All {clientReviews.length} Client Reviews
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // Review Card Component
  const ReviewCard = ({ review }) => {
    return (
      <div className={styles.reviewCard}>
        <div className={styles.reviewHeader}>
          <div className={styles.clientInfo}>
            <div className={styles.avatar}>
              {review.reviewee?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div className={styles.clientDetails}>
              <div className={styles.clientName}>
                {review.reviewee?.name || "Client"}
              </div>
              <div className={styles.projectName}>
                {review.project?.title || "Completed Project"}
              </div>
            </div>
          </div>
          <div className={styles.ratingBadge}>
            <FaStar className={styles.ratingStar} />
            <span>{review.rating}.0</span>
          </div>
        </div>

        {review.comment && (
          <div className={styles.reviewComment}>
            <FaComments className={styles.commentIcon} />
            <p>"{review.comment}"</p>
          </div>
        )}

        {review.aspects && review.aspects.length > 0 && (
          <div className={styles.reviewAspects}>
            <div className={styles.aspectsLabel}>Positive Aspects:</div>
            <div className={styles.aspectsList}>
              {review.aspects.map((aspect, i) => (
                <span key={i} className={styles.aspectTag}>
                  {getAspectLabel(aspect)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.reviewFooter}>
          <div className={styles.reviewDate}>
            <FaCalendar />
            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
          </div>
          <div className={styles.reviewActions}>
            <button
              className={styles.viewDetailsButton}
              onClick={() => console.log("View review details:", review.id)}
            >
              <FaEye />
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ... Rest of the component remains the same (loading states, headers, etc.)
  // Only showing the Client Reviews section for brevity

  return (
    <div className={styles.container}>
      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
          >
            <div className={styles.successContent}>
              <motion.div
                className={styles.successIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <FaCheckCircle />
              </motion.div>
              <div className={styles.successText}>
                <h4>Success!</h4>
                <p>{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and other components... */}

      {/* Client Reviews Section */}
      <ClientReviewsSection />

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedProject && (
          <ReviewModal
            selectedProject={selectedProject}
            rating={rating}
            setRating={setRating}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
            comment={comment}
            setComment={setComment}
            selectedAspects={selectedAspects}
            handleAspectToggle={handleAspectToggle}
            handleCloseReview={handleCloseReview}
            handleSubmitClientReview={handleSubmitClientReview}
            isSubmitting={isSubmitting}
            getRatingText={getRatingText}
            getRatingIcon={getRatingIcon}
            reviewAspects={reviewAspects}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Separate Review Modal Component for better organization
const ReviewModal = ({
  selectedProject,
  rating,
  setRating,
  hoverRating,
  setHoverRating,
  comment,
  setComment,
  selectedAspects,
  handleAspectToggle,
  handleCloseReview,
  handleSubmitClientReview,
  isSubmitting,
  getRatingText,
  getRatingIcon,
  reviewAspects,
}) => {
  return (
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
            <h2>Review Client</h2>
            <p>
              Share your experience working with{" "}
              {selectedProject.client?.name || "this client"}
            </p>
          </div>
          <button onClick={handleCloseReview} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Client and Project Info */}
          <div className={styles.clientInfo}>
            <div className={styles.avatar}>
              {selectedProject.client?.name?.charAt(0).toUpperCase() || "C"}
            </div>
            <div className={styles.clientDetails}>
              <h3>{selectedProject.client?.name || "Client"}</h3>
              <div className={styles.projectInfo}>
                <FaBriefcase />
                <span>{selectedProject.title}</span>
              </div>
              <div className={styles.projectEarnings}>
                <FaMoneyBillWave />
                <span>
                  Earned: ₹
                  {selectedProject.totalPayment?.toLocaleString() ||
                    selectedProject.budget?.toLocaleString() ||
                    "0"}
                </span>
              </div>
            </div>
          </div>

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
                      star <= (hoverRating || rating) ? styles.starActive : ""
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
              <div className={styles.ratingText}>
                {getRatingIcon(rating)}
                <span>{getRatingText(rating)}</span>
              </div>
            </div>
          </div>

          {/* Review Aspects */}
          <div className={styles.aspectsSection}>
            <label>What made this client great to work with? (Optional)</label>
            <p className={styles.aspectsHint}>
              Select all that apply to help other freelancers
            </p>
            <div className={styles.aspectsGrid}>
              {reviewAspects.map((aspect) => (
                <button
                  key={aspect.key}
                  type="button"
                  onClick={() => handleAspectToggle(aspect.key)}
                  className={`${styles.aspectButton} ${
                    selectedAspects[aspect.key] ? styles.aspectSelected : ""
                  }`}
                >
                  <span className={styles.aspectIcon}>{aspect.icon}</span>
                  <div className={styles.aspectContent}>
                    <span className={styles.aspectLabel}>{aspect.label}</span>
                    <span className={styles.aspectDescription}>
                      {aspect.description}
                    </span>
                  </div>
                  {selectedAspects[aspect.key] && (
                    <div className={styles.aspectCheck}>
                      <FaCheck />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className={styles.commentSection}>
            <label>Share Your Experience (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Tell us about your experience working with ${
                selectedProject.client?.name || "this client"
              }. What went well? What made them a good client to work with? Any suggestions for improvement?`}
              rows="5"
              className={styles.commentTextarea}
            />
            <p className={styles.commentHint}>
              Your honest review helps other freelancers understand what it's
              like to work with this client. Be constructive and professional.
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.selectedAspectsCount}>
            {Object.values(selectedAspects).filter(Boolean).length > 0 && (
              <span>
                {Object.values(selectedAspects).filter(Boolean).length} aspects
                selected
              </span>
            )}
          </div>
          <div className={styles.modalActions}>
            <button
              onClick={handleCloseReview}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitClientReview}
              disabled={isSubmitting || rating === 0}
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
        </div>
      </motion.div>
    </motion.div>
  );
};
