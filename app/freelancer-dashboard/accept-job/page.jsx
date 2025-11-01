"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./AcceptJob.module.css";
import { motion, AnimatePresence } from "framer-motion";
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
  FaFileAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaTools,
} from "react-icons/fa";

export default function AcceptJobPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    filterProposals();
  }, [proposals, searchTerm, filterStatus]);

  const fetchCurrentUser = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        fetchFreelancerProposals(parsedUser.id);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/login");
    }
  };

  const fetchFreelancerProposals = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proposals/freelancer?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProposals(data.proposals || []);
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
          proposal.job?.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.job?.category
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

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status: action } : p))
        );

        // Update selected proposal if it's the one being viewed
        if (selectedProposal && selectedProposal.id === proposalId) {
          setSelectedProposal((prev) => ({ ...prev, status: action }));
        }

        // Show success message
        alert(`Proposal ${action} successfully!`);
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
      pending: { color: "#f59e0b", label: "Pending Review", bgColor: "#fffbeb" },
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
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading job requests...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerContent}>
          <button
            onClick={() => router.push("/freelancer-dashboard")}
            className={styles.backButton}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className={styles.headerMain}>
            <h1>Job Requests</h1>
            <p>Manage and respond to job proposals from clients</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{proposals.length}</span>
              <span className={styles.statLabel}>Total Requests</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {proposals.filter((p) => p.status === "pending").length}
              </span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {proposals.filter((p) => p.status === "accepted").length}
              </span>
              <span className={styles.statLabel}>Accepted</span>
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
            placeholder="Search by job title, client name, or skills..."
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
            <h3>No job requests found</h3>
            <p>
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't received any job requests yet"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => router.push("/find-work")}
                className={styles.browseJobsButton}
              >
                Browse Available Jobs
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
                        <FaDollarSign />
                        {proposal.bidAmount?.toLocaleString()}
                      </span>
                      <span className={styles.timeline}>
                        <FaClock />
                        {proposal.timeframe} days
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(proposal.status)}
                </div>

                <div className={styles.proposalDetails}>
                  {/* Client Info */}
                  <div className={styles.clientInfo}>
                    <div className={styles.clientHeader}>
                      <div className={styles.avatar}>
                        {proposal.job?.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.clientName}>
                          {proposal.job?.user?.name}
                        </div>
                        <div className={styles.clientRating}>
                          <FaStar />
                          <span>4.8</span>
                          <span className={styles.reviewCount}>(24 reviews)</span>
                        </div>
                      </div>
                    </div>

                    {proposal.job?.user?.profile && (
                      <div className={styles.clientDetails}>
                        {proposal.job.user.profile.location && (
                          <div className={styles.location}>
                            <FaMapMarkerAlt />
                            {proposal.job.user.profile.location}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className={styles.jobDetails}>
                    <div className={styles.jobMeta}>
                      <div className={styles.metaItem}>
                        <FaBriefcase />
                        <span>{proposal.job?.category}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FaUser />
                        <span>{proposal.job?.experienceLevel}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {proposal.job?.skills && (
                      <div className={styles.skillsSection}>
                        <strong>Required Skills:</strong>
                        <div className={styles.skillsList}>
                          {getSkillsArray(proposal.job.skills)
                            .slice(0, 4)
                            .map((skill, index) => (
                              <span key={index} className={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          {getSkillsArray(proposal.job.skills).length > 4 && (
                            <span className={styles.moreSkills}>
                              +{getSkillsArray(proposal.job.skills).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Job Description Preview */}
                    <div className={styles.jobDescriptionPreview}>
                      <p>{proposal.job?.description?.substring(0, 120)}...</p>
                    </div>
                  </div>
                </div>

                <div className={styles.proposalFooter}>
                  <div className={styles.proposalMeta}>
                    <span className={styles.submittedDate}>
                      <FaCalendar />
                      Received: {getTimeAgo(proposal.createdAt)}
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
                      <div className={styles.acceptedActions}>
                        <motion.button
                          onClick={() => router.push(`/messages?conversation=${proposal.conversationId}`)}
                          className={styles.messageButton}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaEnvelope />
                          Message Client
                        </motion.button>
                      </div>
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
                <h2>Job Request Details</h2>
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
                      <strong>Job Title:</strong> {selectedProposal.job?.title}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Category:</strong> {selectedProposal.job?.category}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Budget:</strong> {selectedProposal.bidAmount?.toLocaleString()}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Timeline:</strong> {selectedProposal.timeframe} days
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Experience Level:</strong> {selectedProposal.job?.experienceLevel}
                    </div>
                  </div>
                  <div className={styles.jobDescription}>
                    <strong>Job Description:</strong>
                    <p>{selectedProposal.job?.description}</p>
                  </div>
                </div>

                {/* Client Information */}
                <div className={styles.detailSection}>
                  <h3>
                    <FaUser /> Client Information
                  </h3>
                  <div className={styles.clientModalInfo}>
                    <div className={styles.clientHeader}>
                      <div className={styles.avatarLarge}>
                        {selectedProposal.job?.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{selectedProposal.job?.user?.name}</h4>
                        <div className={styles.clientRating}>
                          <FaStar />
                          <span>4.8</span>
                          <span className={styles.reviewCount}>(24 reviews)</span>
                        </div>
                      </div>
                    </div>

                    {selectedProposal.job?.user?.profile && (
                      <div className={styles.clientDetailsGrid}>
                        {selectedProposal.job.user.profile.location && (
                          <div className={styles.detailItem}>
                            <strong>Location:</strong> {selectedProposal.job.user.profile.location}
                          </div>
                        )}
                        {selectedProposal.job.user.profile.bio && (
                          <div className={styles.detailItem}>
                            <strong>About:</strong> {selectedProposal.job.user.profile.bio}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Skills */}
                {selectedProposal.job?.skills && (
                  <div className={styles.detailSection}>
                    <h3>
                      <FaTools /> Required Skills
                    </h3>
                    <div className={styles.skillsList}>
                      {getSkillsArray(selectedProposal.job.skills).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proposal Status */}
                <div className={styles.detailSection}>
                  <h3>
                    <FaFileAlt /> Request Status
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Status:</strong> {getStatusBadge(selectedProposal.status)}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Received:</strong> {getTimeAgo(selectedProposal.createdAt)}
                    </div>
                    {selectedProposal.updatedAt && (
                      <div className={styles.detailItem}>
                        <strong>Last Updated:</strong> {getTimeAgo(selectedProposal.updatedAt)}
                      </div>
                    )}
                  </div>
                </div>
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
                      Accept Job
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
                      Reject
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
    </div>
  );
}