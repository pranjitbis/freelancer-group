"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Banner from "../components/page";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaCheck,
  FaTimes,
  FaComment,
  FaUser,
  FaDollarSign,
  FaClock,
  FaCalendar,
  FaStar,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaDownload,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHourglassHalf,
  FaInfoCircle,
  FaLightbulb,
  FaPaperPlane,
  FaShieldAlt,
  FaRegLaughBeam,
  FaRegSmile,
  FaRegMeh,
  FaRegFrown,
  FaRegSadTear,
  FaMousePointer,
  FaHashtag,
  FaBolt,
  FaHandshake,
  FaHeart,
} from "react-icons/fa";
import styles from "./ClientProposals.module.css";

export default function ClientProposalsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProposal, setReviewProposal] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: "",
    hoverRating: 0,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    filterProposals();
  }, [proposals, searchTerm, filterStatus]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.role === "client") {
            fetchClientProposals(data.user.id);
          } else {
            router.push("/unauthorized");
          }
        } else {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/auth/login");
    }
  };

  const fetchClientProposals = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proposals/client?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Add hasReview field to check if review already exists
          const proposalsWithReviewStatus = data.proposals.map((proposal) => ({
            ...proposal,
            hasReview: proposal.reviews && proposal.reviews.length > 0,
          }));
          setProposals(proposalsWithReviewStatus || []);
        }
      } else {
        console.error("Failed to fetch proposals");
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProposals = () => {
    let filtered = proposals;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (proposal) => proposal.status === filterStatus
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.job?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.freelancer?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.freelancer?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.coverLetter?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProposals(filtered);
  };

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsModal(true);
  };

  const handleProposalAction = async (proposalId, action) => {
    setActionLoading(proposalId);

    try {
      console.log("Sending proposal action:", { proposalId, action });

      const response = await fetch("/api/proposals/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId,
          action,
        }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        // Update local state
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status: action } : p))
        );

        // Update selected proposal if it's the one being viewed
        if (selectedProposal && selectedProposal.id === proposalId) {
          setSelectedProposal((prev) => ({ ...prev, status: action }));
        }

        // If accepting, create a project
        if (action === "accepted") {
          await createProject(proposalId);
        }
      } else {
        alert(data.error || "Failed to update proposal");
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
      alert("Failed to update proposal");
    } finally {
      setActionLoading(null);
    }
  };

  const createProject = async (proposalId) => {
    try {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal) return;

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: proposal.job.title,
          description: proposal.job.description,
          budget: proposal.bidAmount,
          clientId: currentUser.id,
          freelancerId: proposal.freelancerId,
          proposalId: proposalId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Review Functions
  const handleOpenReview = (proposal) => {
    setReviewProposal(proposal);
    setReviewData({
      rating: 0,
      comment: "",
      hoverRating: 0,
    });
    setShowReviewModal(true);
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    setReviewProposal(null);
    setReviewData({
      rating: 0,
      comment: "",
      hoverRating: 0,
    });
  };

  const handleSubmitReview = async () => {
    if (reviewData.rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment,
          freelancerId: reviewProposal.freelancerId,
          projectId: reviewProposal.id,
          reviewerId: currentUser.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Update the proposal to mark as reviewed
      setProposals((prev) =>
        prev.map((p) =>
          p.id === reviewProposal.id
            ? {
                ...p,
                hasReview: true,
                reviews: [...(p.reviews || []), data.review],
              }
            : p
        )
      );

      // Update selected proposal if it's the one being viewed
      if (selectedProposal && selectedProposal.id === reviewProposal.id) {
        setSelectedProposal((prev) => ({
          ...prev,
          hasReview: true,
          reviews: [...(prev.reviews || []), data.review],
        }));
      }

      handleCloseReview();
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleStarClick = (rating) => {
    setReviewData((prev) => ({ ...prev, rating }));
  };

  const handleStarHover = (rating) => {
    setReviewData((prev) => ({ ...prev, hoverRating: rating }));
  };

  const handleStarLeave = () => {
    setReviewData((prev) => ({ ...prev, hoverRating: 0 }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaHourglassHalf style={{ color: "#f59e0b" }} />;
      case "accepted":
        return <FaCheckCircle style={{ color: "#10b981" }} />;
      case "rejected":
        return <FaTimes style={{ color: "#ef4444" }} />;
      case "completed":
        return <FaCheck style={{ color: "#3b82f6" }} />;
      default:
        return <FaExclamationTriangle style={{ color: "#6b7280" }} />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f59e0b", label: "Under Review", bgColor: "#fffbeb" },
      accepted: { color: "#10b981", label: "Accepted", bgColor: "#ecfdf5" },
      rejected: { color: "#ef4444", label: "Rejected", bgColor: "#fef2f2" },
      completed: { color: "#3b82f6", label: "Completed", bgColor: "#eff6ff" },
    };

    const config = statusConfig[status] || {
      color: "#6b7280",
      label: status,
      bgColor: "#f9fafb",
    };

    return (
      <span
        className={styles.statusBadge}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          borderColor: config.color,
        }}
      >
        {getStatusIcon(status)}
        {config.label}
      </span>
    );
  };

  const getSkillsArray = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "string")
      return skills.split(",").map((skill) => skill.trim());
    return [];
  };

  const calculateSavings = (jobBudget, bidAmount) => {
    const savings = jobBudget - bidAmount;
    return savings > 0 ? savings : 0;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading proposals...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Banner />
      <div className={styles.container}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.headerContent}>
            <div className={styles.headerMain}>
              <h1>Job Proposals</h1>
              <p>Manage and review proposals for your job posts</p>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{proposals.length}</span>
                <span className={styles.statLabel}>Total Proposals</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {proposals.filter((p) => p.status === "pending").length}
                </span>
                <span className={styles.statLabel}>Pending Review</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {
                    proposals.filter(
                      (p) => p.status === "completed" && !p.hasReview
                    ).length
                  }
                </span>
                <span className={styles.statLabel}>Awaiting Review</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Filters */}
        <motion.div
          className={styles.filters}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by job title, freelancer name, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <FaFilter className={styles.filterIcon} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </motion.div>

        {/* Proposals Grid */}
        <div className={styles.proposalsSection}>
          {filteredProposals.length === 0 ? (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaFileAlt className={styles.emptyIcon} />
              <h3>No proposals found</h3>
              <p>
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't received any proposals yet"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button
                  onClick={() => router.push("/client-dashboard/post-job")}
                  className={styles.postJobButton}
                >
                  Post a New Job
                </button>
              )}
            </motion.div>
          ) : (
            <div className={styles.proposalsGrid}>
              {filteredProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  className={styles.proposalCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className={styles.proposalHeader}>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>
                        {proposal.job?.title || "Unknown Job"}
                      </h3>
                      <div className={styles.metaInfo}>
                        <span className={styles.budget}>
                          Budget: ${proposal.job?.budget?.toLocaleString()}
                        </span>
                        <span className={styles.category}>
                          {proposal.job?.category}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>

                  <div className={styles.proposalDetails}>
                    {/* Freelancer Info */}
                    <div className={styles.freelancerInfo}>
                      <div className={styles.freelancerHeader}>
                        <div className={styles.avatar}>
                          {proposal.freelancer?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.freelancerName}>
                            {proposal.freelancer?.name}
                          </div>
                          {proposal.hasReview && (
                            <div className={styles.reviewedIndicator}>
                              <FaStar style={{ color: "#f59e0b" }} />
                              <span>Reviewed</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {proposal.freelancer?.profile && (
                        <div className={styles.freelancerDetails}>
                          {proposal.freelancer.profile.title && (
                            <div className={styles.freelancerTitle}>
                              {proposal.freelancer.profile.title}
                            </div>
                          )}
                          {proposal.freelancer.profile.hourlyRate && (
                            <div className={styles.hourlyRate}>
                              <FaDollarSign />$
                              {proposal.freelancer.profile.hourlyRate}/hr
                            </div>
                          )}
                          {proposal.freelancer.profile.location && (
                            <div className={styles.location}>
                              <FaUser />
                              {proposal.freelancer.profile.location}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Proposal Details */}
                    <div className={styles.proposalInfo}>
                      <div className={styles.bidInfo}>
                        <div className={styles.bidItem}>
                          <FaDollarSign className={styles.bidIcon} />
                          <span>
                            Bid: ${proposal.bidAmount?.toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.bidItem}>
                          <FaClock className={styles.bidIcon} />
                          <span>Timeline: {proposal.timeframe} days</span>
                        </div>
                        {calculateSavings(
                          proposal.job?.budget,
                          proposal.bidAmount
                        ) > 0 && (
                          <div className={styles.savings}>
                            You save: $
                            {calculateSavings(
                              proposal.job?.budget,
                              proposal.bidAmount
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {proposal.freelancer?.profile?.skills && (
                        <div className={styles.skillsSection}>
                          <strong>Skills:</strong>
                          <div className={styles.skillsList}>
                            {getSkillsArray(proposal.freelancer.profile.skills)
                              .slice(0, 4)
                              .map((skill, index) => (
                                <span key={index} className={styles.skillTag}>
                                  {skill}
                                </span>
                              ))}
                            {getSkillsArray(proposal.freelancer.profile.skills)
                              .length > 4 && (
                              <span className={styles.moreSkills}>
                                +
                                {getSkillsArray(
                                  proposal.freelancer.profile.skills
                                ).length - 4}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cover Letter Preview */}
                      <div className={styles.coverLetterPreview}>
                        <p>{proposal.coverLetter?.substring(0, 120)}...</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.proposalFooter}>
                    <div className={styles.proposalMeta}>
                      <span className={styles.submittedDate}>
                        <FaCalendar />
                        Submitted:{" "}
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.proposalActions}>
                      <motion.button
                        onClick={() => handleViewDetails(proposal)}
                        className={styles.viewButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEye /> View Details
                      </motion.button>

                      {proposal.status === "pending" && (
                        <div className={styles.actionButtons}>
                          <motion.button
                            onClick={() =>
                              handleProposalAction(proposal.id, "accepted")
                            }
                            disabled={actionLoading === proposal.id}
                            className={styles.acceptButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {actionLoading === proposal.id ? (
                              <div className={styles.actionSpinner} />
                            ) : (
                              <FaCheck />
                            )}
                            Accept
                          </motion.button>
                          <motion.button
                            onClick={() =>
                              handleProposalAction(proposal.id, "rejected")
                            }
                            disabled={actionLoading === proposal.id}
                            className={styles.rejectButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {actionLoading === proposal.id ? (
                              <div className={styles.actionSpinner} />
                            ) : (
                              <FaTimes />
                            )}
                            Reject
                          </motion.button>
                        </div>
                      )}

                      {proposal.status === "accepted" && (
                        <motion.button
                          onClick={() =>
                            handleProposalAction(proposal.id, "completed")
                          }
                          disabled={actionLoading === proposal.id}
                          className={styles.completeButton}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {actionLoading === proposal.id ? (
                            <div className={styles.actionSpinner} />
                          ) : (
                            <FaCheckCircle />
                          )}
                          Mark Complete
                        </motion.button>
                      )}

                      {/* Review Button for Completed Projects */}
                      {proposal.status === "completed" &&
                        !proposal.hasReview && (
                          <motion.button
                            onClick={() => handleOpenReview(proposal)}
                            className={styles.reviewButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaStar /> Leave Review
                          </motion.button>
                        )}

                      {proposal.status === "completed" &&
                        proposal.hasReview && (
                          <span className={styles.reviewedBadge}>
                            <FaStar /> Reviewed
                          </span>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Proposal Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedProposal && (
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                className={styles.modalContent}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Proposal Details</h2>
                  <button
                    className={styles.closeButton}
                    onClick={() => setShowDetailsModal(false)}
                  >
                    ×
                  </button>
                </div>

                <div className={styles.modalBody}>
                  {/* Job Information */}
                  <div className={styles.detailSection}>
                    <h3>
                      <FaBriefcase /> Job Information
                    </h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <strong>Job Title:</strong>{" "}
                        {selectedProposal.job?.title}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Category:</strong>{" "}
                        {selectedProposal.job?.category}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Budget:</strong> $
                        {selectedProposal.job?.budget?.toLocaleString()}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Experience Level:</strong>{" "}
                        {selectedProposal.job?.experienceLevel}
                      </div>
                    </div>
                    <div className={styles.jobDescription}>
                      <strong>Job Description:</strong>
                      <p>{selectedProposal.job?.description}</p>
                    </div>
                  </div>

                  {/* Freelancer Information */}
                  <div className={styles.detailSection}>
                    <h3>
                      <FaUser /> Freelancer Information
                    </h3>
                    <div className={styles.freelancerModalInfo}>
                      <div className={styles.freelancerHeader}>
                        <div className={styles.avatarLarge}>
                          {selectedProposal.freelancer?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <h4>{selectedProposal.freelancer?.name}</h4>
                          {selectedProposal.hasReview && (
                            <div className={styles.reviewedIndicator}>
                              <FaStar style={{ color: "#f59e0b" }} />
                              <span>You've reviewed this freelancer</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedProposal.freelancer?.profile && (
                        <div className={styles.freelancerDetailsGrid}>
                          {selectedProposal.freelancer.profile.title && (
                            <div className={styles.detailItem}>
                              <strong>Professional Title:</strong>{" "}
                              {selectedProposal.freelancer.profile.title}
                            </div>
                          )}
                          {selectedProposal.freelancer.profile.hourlyRate && (
                            <div className={styles.detailItem}>
                              <strong>Hourly Rate:</strong> $
                              {selectedProposal.freelancer.profile.hourlyRate}
                              /hr
                            </div>
                          )}
                          {selectedProposal.freelancer.profile.location && (
                            <div className={styles.detailItem}>
                              <strong>Location:</strong>{" "}
                              {selectedProposal.freelancer.profile.location}
                            </div>
                          )}
                          {selectedProposal.freelancer.profile.experience && (
                            <div className={styles.detailItem}>
                              <strong>Experience:</strong>{" "}
                              {selectedProposal.freelancer.profile.experience}
                            </div>
                          )}
                          {selectedProposal.freelancer.profile.education && (
                            <div className={styles.detailItem}>
                              <strong>Education:</strong>{" "}
                              {selectedProposal.freelancer.profile.education}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skills */}
                      {selectedProposal.freelancer?.profile?.skills && (
                        <div className={styles.skillsSection}>
                          <strong>Skills:</strong>
                          <div className={styles.skillsList}>
                            {getSkillsArray(
                              selectedProposal.freelancer.profile.skills
                            ).map((skill, index) => (
                              <span key={index} className={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      {selectedProposal.freelancer?.profile?.bio && (
                        <div className={styles.bioSection}>
                          <strong>Bio:</strong>
                          <p>{selectedProposal.freelancer.profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proposal Details */}
                  <div className={styles.detailSection}>
                    <h3>
                      <FaFileAlt /> Proposal Details
                    </h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <strong>Bid Amount:</strong> $
                        {selectedProposal.bidAmount?.toLocaleString()}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Timeline:</strong> {selectedProposal.timeframe}{" "}
                        days
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Status:</strong>{" "}
                        {getStatusBadge(selectedProposal.status)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Submitted:</strong>{" "}
                        {new Date(selectedProposal.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className={styles.detailSection}>
                    <h3>
                      <FaComment /> Cover Letter
                    </h3>
                    <div className={styles.coverLetterFull}>
                      {selectedProposal.coverLetter}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  {selectedProposal.reviews &&
                    selectedProposal.reviews.length > 0 && (
                      <div className={styles.detailSection}>
                        <h3>
                          <FaStar /> Your Review
                        </h3>
                        {selectedProposal.reviews.map((review, index) => (
                          <div key={index} className={styles.reviewItem}>
                            <div className={styles.reviewHeader}>
                              <div className={styles.reviewRating}>
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    style={{
                                      color:
                                        i < review.rating
                                          ? "#f59e0b"
                                          : "#d1d5db",
                                    }}
                                  />
                                ))}
                              </div>
                              <span className={styles.reviewDate}>
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className={styles.reviewComment}>
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                  {selectedProposal.status === "pending" && (
                    <div className={styles.modalActions}>
                      <motion.button
                        onClick={() =>
                          handleProposalAction(selectedProposal.id, "accepted")
                        }
                        disabled={actionLoading === selectedProposal.id}
                        className={styles.acceptButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {actionLoading === selectedProposal.id ? (
                          <div className={styles.actionSpinner} />
                        ) : (
                          <FaCheck />
                        )}
                        Accept Proposal
                      </motion.button>
                      <motion.button
                        onClick={() =>
                          handleProposalAction(selectedProposal.id, "rejected")
                        }
                        disabled={actionLoading === selectedProposal.id}
                        className={styles.rejectButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {actionLoading === selectedProposal.id ? (
                          <div className={styles.actionSpinner} />
                        ) : (
                          <FaTimes />
                        )}
                        Reject Proposal
                      </motion.button>
                    </div>
                  )}

                  {selectedProposal.status === "completed" &&
                    !selectedProposal.hasReview && (
                      <div className={styles.modalActions}>
                        <motion.button
                          onClick={() => handleOpenReview(selectedProposal)}
                          className={styles.reviewButton}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaStar /> Leave Review
                        </motion.button>
                      </div>
                    )}

                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className={styles.closeModalButton}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Modal */}
        {/* Review Modal */}
        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && reviewProposal && (
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseReview}
            >
              <motion.div
                className={styles.reviewModalContent}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={styles.modalHeader}>
                  <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                      <FaStar className={styles.starIcon} />
                    </div>
                    <div className={styles.headerText}>
                      <h2>Share Your Experience</h2>
                      <p className={styles.headerSubtitle}>
                        Help build the community by leaving honest feedback
                      </p>
                    </div>
                  </div>
                  <button
                    className={styles.closeButton}
                    onClick={handleCloseReview}
                    disabled={isSubmittingReview}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  {/* Freelancer Card */}
                  <div className={styles.freelancerCard}>
                    <div className={styles.freelancerAvatar}>
                      <div className={styles.avatarWrapper}>
                        {reviewProposal.freelancer?.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className={styles.verifiedBadge}>
                        <FaCheck className={styles.verifiedIcon} />
                      </div>
                    </div>
                    <div className={styles.freelancerInfo}>
                      <h3 className={styles.freelancerName}>
                        {reviewProposal.freelancer?.name}
                      </h3>
                      <p className={styles.projectTitle}>
                        <FaBriefcase className={styles.projectIcon} />
                        Project: <span>{reviewProposal.job?.title}</span>
                      </p>
                      <div className={styles.projectMeta}>
                        <span className={styles.metaItem}>
                          <FaCalendar className={styles.metaIcon} />
                          Completed {new Date().toLocaleDateString()}
                        </span>
                        <span className={styles.metaItem}>
                          <FaDollarSign className={styles.metaIcon} />$
                          {reviewProposal.bidAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className={styles.ratingSection}>
                    <div className={styles.sectionHeader}>
                      <label className={styles.ratingLabel}>
                        <FaStar className={styles.labelIcon} />
                        Overall Rating
                        <span className={styles.requiredStar}>*</span>
                      </label>
                    </div>

                    <div className={styles.starContainer}>
                      <div className={styles.starRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => handleStarHover(star)}
                            onMouseLeave={handleStarLeave}
                            className={styles.starButton}
                            disabled={isSubmittingReview}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              initial={{ scale: 1 }}
                              animate={{
                                scale:
                                  (reviewData.hoverRating ||
                                    reviewData.rating) >= star
                                    ? 1.2
                                    : 1,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                              }}
                            >
                              <FaStar
                                className={`${styles.star} ${
                                  (reviewData.hoverRating ||
                                    reviewData.rating) >= star
                                    ? styles.filled
                                    : styles.empty
                                }`}
                              />
                            </motion.div>
                          </motion.button>
                        ))}
                      </div>

                      <div className={styles.ratingLabels}>
                        <div className={styles.ratingText}>
                          {reviewData.rating === 0 ? (
                            <span className={styles.placeholderText}>
                              <FaMousePointer className={styles.pointerIcon} />
                              Click stars to rate
                            </span>
                          ) : (
                            <motion.div
                              key={reviewData.rating}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={styles.selectedRating}
                            >
                              <div className={styles.ratingDescription}>
                                {reviewData.rating === 5 && (
                                  <>
                                    <FaRegLaughBeam
                                      className={styles.ratingEmoji}
                                    />
                                    Excellent - Outstanding work!
                                  </>
                                )}
                                {reviewData.rating === 4 && (
                                  <>
                                    <FaRegSmile
                                      className={styles.ratingEmoji}
                                    />
                                    Very Good - Great quality
                                  </>
                                )}
                                {reviewData.rating === 3 && (
                                  <>
                                    <FaRegMeh className={styles.ratingEmoji} />
                                    Good - Met expectations
                                  </>
                                )}
                                {reviewData.rating === 2 && (
                                  <>
                                    <FaRegFrown
                                      className={styles.ratingEmoji}
                                    />
                                    Fair - Needs improvement
                                  </>
                                )}
                                {reviewData.rating === 1 && (
                                  <>
                                    <FaRegSadTear
                                      className={styles.ratingEmoji}
                                    />
                                    Poor - Below expectations
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className={styles.commentSection}>
                    <div className={styles.sectionHeader}>
                      <label className={styles.commentLabel}>
                        <FaComment className={styles.labelIcon} />
                        Detailed Feedback
                      </label>
                      <div className={styles.characterCounter}>
                        <span
                          className={`
                  ${styles.characterCount} 
                  ${reviewData.comment.length > 450 ? styles.warning : ""}
                  ${reviewData.comment.length === 500 ? styles.max : ""}
                `}
                        >
                          <FaHashtag className={styles.countIcon} />
                          {reviewData.comment.length}/500
                        </span>
                      </div>
                    </div>

                    <div className={styles.textareaWrapper}>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setReviewData((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }));
                          }
                        }}
                        placeholder="Tell us about your experience...
• What stood out about their work quality?
• How was their communication and professionalism?
• Did they meet deadlines and expectations?
• Would you work with them again?"
                        rows="6"
                        className={`${styles.commentTextarea} ${
                          reviewData.comment.length === 500
                            ? styles.maxLength
                            : ""
                        }`}
                        disabled={isSubmittingReview}
                      />

                      <div className={styles.textareaDecoration}>
                        <div className={styles.progressBar}>
                          <motion.div
                            className={`
                      ${styles.progressFill} 
                      ${reviewData.comment.length > 450 ? styles.warning : ""}
                      ${reviewData.comment.length === 500 ? styles.max : ""}
                    `}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (reviewData.comment.length / 500) * 100
                              }%`,
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.helpSection}>
                      <div className={styles.helpItem}>
                        <FaInfoCircle className={styles.helpIcon} />
                        <span>
                          Your honest feedback helps freelancers improve and
                          guides other clients
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guidelines Card */}
                  <motion.div
                    className={styles.guidelinesCard}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className={styles.guidelinesHeader}>
                      <FaLightbulb className={styles.guidelinesIcon} />
                      <h4>Tips for Great Reviews</h4>
                    </div>
                    <div className={styles.guidelinesGrid}>
                      <div className={styles.guidelineItem}>
                        <div className={styles.guidelineIconWrapper}>
                          <FaSearch className={styles.guidelineIcon} />
                        </div>
                        <div>
                          <strong>Be Specific</strong>
                          <p>
                            Mention particular skills or aspects you appreciated
                          </p>
                        </div>
                      </div>
                      <div className={styles.guidelineItem}>
                        <div className={styles.guidelineIconWrapper}>
                          <FaBolt className={styles.guidelineIcon} />
                        </div>
                        <div>
                          <strong>Highlight Strengths</strong>
                          <p>Focus on what made their service exceptional</p>
                        </div>
                      </div>
                      <div className={styles.guidelineItem}>
                        <div className={styles.guidelineIconWrapper}>
                          <FaHandshake className={styles.guidelineIcon} />
                        </div>
                        <div>
                          <strong>Professional & Constructive</strong>
                          <p>Keep feedback professional and helpful</p>
                        </div>
                      </div>
                      <div className={styles.guidelineItem}>
                        <div className={styles.guidelineIconWrapper}>
                          <FaHeart className={styles.guidelineIcon} />
                        </div>
                        <div>
                          <strong>Be Honest</strong>
                          <p>Your authentic experience helps everyone</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Footer Actions */}
                <div className={styles.modalFooter}>
                  <div className={styles.footerContent}>
                    <div className={styles.actionButtons}>
                      <motion.button
                        onClick={handleCloseReview}
                        disabled={isSubmittingReview}
                        className={styles.cancelButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaTimes className={styles.cancelIcon} />
                        Cancel Review
                      </motion.button>

                      <div className={styles.submitGroup}>
                        {reviewData.rating > 0 && (
                          <motion.div
                            className={styles.ratingPreview}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <div className={styles.previewContent}>
                              <div className={styles.previewStars}>
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`${styles.previewStar} ${
                                      i < reviewData.rating ? styles.filled : ""
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={styles.previewText}>
                                {reviewData.rating}.0
                              </span>
                            </div>
                          </motion.div>
                        )}

                        <motion.button
                          onClick={handleSubmitReview}
                          disabled={
                            isSubmittingReview || reviewData.rating === 0
                          }
                          className={`${styles.submitButton} ${
                            reviewData.rating === 0 ? styles.disabled : ""
                          } ${isSubmittingReview ? styles.loading : ""}`}
                          whileHover={
                            reviewData.rating > 0 && !isSubmittingReview
                              ? { scale: 1.02 }
                              : {}
                          }
                          whileTap={
                            reviewData.rating > 0 ? { scale: 0.98 } : {}
                          }
                        >
                          {isSubmittingReview ? (
                            <>
                              <motion.div
                                className={styles.buttonSpinner}
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                              <span>Publishing Review...</span>
                            </>
                          ) : (
                            <>
                              <FaPaperPlane className={styles.submitIcon} />
                              <span>Publish Review</span>
                              <FaCheck className={styles.successIcon} />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <div className={styles.footerNote}>
                      <div className={styles.noteContent}>
                        <FaShieldAlt className={styles.shieldIcon} />
                        <div>
                          <strong>Your review matters</strong>
                          <p>
                            This feedback will be publicly visible and help
                            maintain our community standards
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
