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
            <button
              onClick={() => router.push("/client-dashboard")}
              className={styles.backButton}
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
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
    </>
  );
}
