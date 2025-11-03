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
  FaBriefcase,
  FaEnvelope,
  FaPaperPlane,
  FaFileAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartLine,
  FaDownload,
  FaFilePdf,
  FaIdCard,
  FaReceipt,
} from "react-icons/fa";
import styles from "./ClientProposals.module.css";

export default function ClientProposalsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [receivedProposals, setReceivedProposals] = useState([]);
  const [sentProposals, setSentProposals] = useState([]);
  const [activeSection, setActiveSection] = useState("received");
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    filterProposals();
  }, [
    receivedProposals,
    sentProposals,
    activeSection,
    searchTerm,
    filterStatus,
  ]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.role === "client") {
            await fetchClientProposals(data.user.id);
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
      setError("");

      const [receivedResponse, sentResponse] = await Promise.all([
        fetch(`/api/proposals/client?userId=${userId}`),
        fetch(`/api/proposals/client-to-freelancer?userId=${userId}`),
      ]);

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        console.log("📥 RAW RECEIVED PROPOSALS DATA:", receivedData);

        if (receivedData.success) {
          setReceivedProposals(receivedData.proposals || []);

          // Debug each proposal
          if (receivedData.proposals && receivedData.proposals.length > 0) {
            receivedData.proposals.forEach((proposal, index) => {
              console.log(`🔍 Proposal ${index + 1} Resume Check:`, {
                freelancerName: proposal.freelancer?.name,
                hasFreelancer: !!proposal.freelancer,
                hasProfile: !!proposal.freelancer?.profile,
                resumeUrl: proposal.freelancer?.profile?.resumeUrl,
                hasResumeUrl: !!proposal.freelancer?.profile?.resumeUrl,
                resumeUrlNotEmpty:
                  proposal.freelancer?.profile?.resumeUrl &&
                  proposal.freelancer.profile.resumeUrl.trim() !== "",
              });
            });
          } else {
            console.log("📭 No proposals received");
          }
        } else {
          setError("Failed to load received proposals");
        }
      } else {
        setError("Failed to fetch received proposals");
      }

      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        if (sentData.success) {
          setSentProposals(sentData.proposals || []);
        }
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setError("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  const filterProposals = () => {
    const proposals =
      activeSection === "received" ? receivedProposals : sentProposals;
    let filtered = proposals;

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (proposal) => proposal.status === filterStatus
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.job?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.freelancer?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.coverLetter
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.freelancer?.profile?.skills
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
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
    setError("");
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
        setSuccessMessage(`Proposal ${action} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        await fetchClientProposals(currentUser.id);
      } else {
        setError(data.error || "Failed to update proposal");
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
      setError("Failed to update proposal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadResume = async (
    resumeUrl,
    freelancerName,
    proposalId = null
  ) => {
    if (proposalId) {
      setDownloadLoading(proposalId);
    }

    try {
      let downloadUrl = resumeUrl;
      if (resumeUrl.startsWith("/")) {
        downloadUrl = `${window.location.origin}${resumeUrl}`;
      }

      console.log("📥 Downloading resume from:", downloadUrl);

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch resume");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${freelancerName.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Resume downloaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setError("Failed to download resume");
    } finally {
      if (proposalId) {
        setDownloadLoading(null);
      }
    }
  };

  const handleSendMessage = async (proposal) => {
    try {
      const freelancerId =
        activeSection === "received"
          ? proposal.freelancerId
          : proposal.freelancer.id;

      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: currentUser.id,
          freelancerId: freelancerId,
        }),
      });

      const conversationData = await conversationResponse.json();

      if (conversationData.success) {
        router.push(
          `/client-dashboard/messages?conversation=${conversationData.conversation.id}`
        );
      } else {
        throw new Error(
          conversationData.error || "Failed to create conversation"
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to start conversation");
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
        {status === "pending" && <FaHourglassHalf />}
        {status === "accepted" && <FaCheckCircle />}
        {status === "rejected" && <FaTimes />}
        {status === "completed" && <FaCheck />}
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

  const hasResume = (proposal) => {
    if (!proposal.freelancer?.profile) {
      console.log(
        "❌ No profile found for freelancer:",
        proposal.freelancer?.name
      );
      return false;
    }

    const hasResume =
      proposal.freelancer.profile.resumeUrl &&
      proposal.freelancer.profile.resumeUrl.trim() !== "";

    console.log(`🔍 Resume check for ${proposal.freelancer?.name}:`, {
      resumeUrl: proposal.freelancer.profile.resumeUrl,
      hasResume: hasResume,
    });

    return hasResume;
  };

  const renderProposalCard = (proposal, index) => {
    const resumeAvailable = hasResume(proposal);

    return (
      <motion.div
        key={proposal.id}
        className={styles.proposalCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className={styles.proposalHeader}>
          <div className={styles.jobInfo}>
            <h3 className={styles.jobTitle}>
              {activeSection === "received"
                ? proposal.job?.title || "Unknown Job"
                : proposal.projectTitle || "Custom Project"}
            </h3>
            <div className={styles.metaInfo}>
              <span className={styles.budget}>
                Budget: ${proposal.bidAmount?.toLocaleString()}
              </span>
              {activeSection === "received" && proposal.job?.category && (
                <span className={styles.category}>{proposal.job.category}</span>
              )}
            </div>
          </div>
          {getStatusBadge(proposal.status)}
        </div>

        <div className={styles.proposalDetails}>
          <div className={styles.freelancerInfo}>
            <div className={styles.freelancerHeader}>
              <div className={styles.avatar}>
                {proposal.freelancer?.name?.charAt(0).toUpperCase() || "F"}
              </div>
              <div>
                <div className={styles.freelancerName}>
                  {proposal.freelancer?.name || "Unknown Freelancer"}
                </div>
                <div className={styles.freelancerTitle}>
                  {activeSection === "received" ? "Freelancer" : "Professional"}
                </div>
              </div>
            </div>

            {activeSection === "received" && proposal.freelancer?.profile && (
              <div className={styles.freelancerDetails}>
                {proposal.freelancer.profile.title && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Title:</span>
                    <span className={styles.detailValue}>
                      {proposal.freelancer.profile.title}
                    </span>
                  </div>
                )}
                {proposal.freelancer.profile.hourlyRate && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Rate:</span>
                    <span className={styles.detailValue}>
                      ${proposal.freelancer.profile.hourlyRate}/hr
                    </span>
                  </div>
                )}
                {proposal.freelancer.profile.location && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Location:</span>
                    <span className={styles.detailValue}>
                      {proposal.freelancer.profile.location}
                    </span>
                  </div>
                )}

                {/* Resume Section */}
                <div className={styles.resumeSection}>
                  {resumeAvailable ? (
                    <div className={styles.resumeAvailable}>
                      <FaFilePdf style={{ color: "#ef4444" }} />
                      <span>Resume Available</span>
                      <div className={styles.resumeActions}>
                        <button
                          className={styles.viewResumeBtn}
                          onClick={() => handleViewDetails(proposal)}
                        >
                          View
                        </button>
                        <motion.button
                          onClick={() =>
                            handleDownloadResume(
                              proposal.freelancer.profile.resumeUrl,
                              proposal.freelancer.name,
                              proposal.id
                            )
                          }
                          disabled={downloadLoading === proposal.id}
                          className={styles.downloadResumeBtn}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {downloadLoading === proposal.id ? (
                            <div className={styles.actionSpinner} />
                          ) : (
                            <FaDownload />
                          )}
                          Download
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.resumeNotAvailable}>
                      <FaFileAlt style={{ color: "#6b7280" }} />
                      <span>No Resume Uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.proposalInfo}>
            <div className={styles.bidInfo}>
              <div className={styles.bidItem}>
                <FaDollarSign className={styles.bidIcon} />
                <span>Bid: ${proposal.bidAmount?.toLocaleString()}</span>
              </div>
              <div className={styles.bidItem}>
                <FaClock className={styles.bidIcon} />
                <span>Timeline: {proposal.timeframe} days</span>
              </div>
            </div>

            {activeSection === "received" &&
              proposal.freelancer?.profile?.skills && (
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
                  </div>
                </div>
              )}

            <div className={styles.coverLetterPreview}>
              <p>{proposal.coverLetter?.substring(0, 120)}...</p>
            </div>
          </div>
        </div>

        <div className={styles.proposalFooter}>
          <div className={styles.proposalMeta}>
            <span className={styles.submittedDate}>
              <FaCalendar />
              {activeSection === "received" ? "Received: " : "Sent: "}
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

            <motion.button
              onClick={() => handleSendMessage(proposal)}
              className={styles.messageButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEnvelope /> Message
            </motion.button>

            {/* MAIN DOWNLOAD BUTTON - This should show when resume is available */}
            {activeSection === "received" && resumeAvailable && (
              <motion.button
                onClick={() =>
                  handleDownloadResume(
                    proposal.freelancer.profile.resumeUrl,
                    proposal.freelancer.name,
                    proposal.id
                  )
                }
                disabled={downloadLoading === proposal.id}
                className={styles.downloadBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {downloadLoading === proposal.id ? (
                  <div className={styles.actionSpinner} />
                ) : (
                  <FaDownload />
                )}
                Download Resume
              </motion.button>
            )}

            {proposal.status === "pending" && activeSection === "received" && (
              <div className={styles.actionButtons}>
                <motion.button
                  onClick={() => handleProposalAction(proposal.id, "accepted")}
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
                  onClick={() => handleProposalAction(proposal.id, "rejected")}
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
          </div>
        </div>
      </motion.div>
    );
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
              <div className={styles.headerTitle}>
                <h1>Proposals Management</h1>

                <button
                  onClick={() => router.push("/client-dashboard/analytics")}
                  className={styles.analyticsButton}
                >
                  <FaChartLine />
                  View Analytics
                </button>
              </div>
              <p>Manage proposals you've received and sent to freelancers</p>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {receivedProposals.length + sentProposals.length}
                </span>
                <span className={styles.statLabel}>Total Proposals</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {
                    receivedProposals.filter((p) => p.status === "pending")
                      .length
                  }
                </span>
                <span className={styles.statLabel}>Pending Review</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {receivedProposals.filter((p) => p.status === "accepted")
                    .length +
                    sentProposals.filter((p) => p.status === "accepted").length}
                </span>
                <span className={styles.statLabel}>Active Projects</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Error Message */}
        {error && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaTimes />
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaCheckCircle />
            {successMessage}
          </motion.div>
        )}

        <motion.div
          className={styles.sectionTabs}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            className={`${styles.sectionTab} ${
              activeSection === "received" ? styles.active : ""
            }`}
            onClick={() => setActiveSection("received")}
          >
            <FaUser />
            Proposals Received
            <span className={styles.tabCount}>
              ({receivedProposals.length})
            </span>
          </button>
          <button
            className={`${styles.sectionTab} ${
              activeSection === "sent" ? styles.active : ""
            }`}
            onClick={() => setActiveSection("sent")}
          >
            <FaPaperPlane />
            Proposals Sent
            <span className={styles.tabCount}>({sentProposals.length})</span>
          </button>
        </motion.div>

        <motion.div
          className={styles.filters}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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

        <div className={styles.proposalsSection}>
          {filteredProposals.length === 0 ? (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaFileAlt className={styles.emptyIcon} />
              <h3>
                {activeSection === "received"
                  ? "No proposals received yet"
                  : "No proposals sent yet"}
              </h3>
              <p>
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : activeSection === "received"
                  ? "You haven't received any proposals for your job posts yet."
                  : "You haven't sent any proposals to freelancers yet."}
              </p>
            </motion.div>
          ) : (
            <div className={styles.proposalsGrid}>
              {filteredProposals.map((proposal, index) =>
                renderProposalCard(proposal, index)
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showDetailsModal && selectedProposal && (
            <ProposalDetailsModal
              proposal={selectedProposal}
              activeSection={activeSection}
              onClose={() => setShowDetailsModal(false)}
              onAction={handleProposalAction}
              actionLoading={actionLoading}
              onDownloadResume={handleDownloadResume}
              downloadLoading={downloadLoading}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Modal Component
function ProposalDetailsModal({
  proposal,
  activeSection,
  onClose,
  onAction,
  actionLoading,
  onDownloadResume,
  downloadLoading,
}) {
  const [resumeLoading, setResumeLoading] = useState(false);

  const hasResume = () => {
    return (
      proposal.freelancer?.profile?.resumeUrl &&
      proposal.freelancer.profile.resumeUrl.trim() !== ""
    );
  };

  const handleDownloadClick = async () => {
    if (hasResume()) {
      setResumeLoading(true);
      try {
        await onDownloadResume(
          proposal.freelancer.profile.resumeUrl,
          proposal.freelancer.name
        );
      } finally {
        setResumeLoading(false);
      }
    }
  };

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
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
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailSection}>
            <h3>
              <FaBriefcase /> Project Information
            </h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <strong>Project Title:</strong>{" "}
                {activeSection === "received"
                  ? proposal.job?.title || "Unknown Job"
                  : proposal.projectTitle || "Custom Project"}
              </div>
              <div className={styles.detailItem}>
                <strong>Budget:</strong> ${proposal.bidAmount?.toLocaleString()}
              </div>
              <div className={styles.detailItem}>
                <strong>Timeline:</strong> {proposal.timeframe} days
              </div>
              <div className={styles.detailItem}>
                <strong>Status:</strong>{" "}
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor:
                      proposal.status === "pending"
                        ? "#fffbeb"
                        : proposal.status === "accepted"
                        ? "#ecfdf5"
                        : proposal.status === "rejected"
                        ? "#fef2f2"
                        : "#eff6ff",
                    color:
                      proposal.status === "pending"
                        ? "#f59e0b"
                        : proposal.status === "accepted"
                        ? "#10b981"
                        : proposal.status === "rejected"
                        ? "#ef4444"
                        : "#3b82f6",
                  }}
                >
                  {proposal.status}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>
              <FaUser /> Freelancer Information
            </h3>
            <div className={styles.freelancerModalInfo}>
              <div className={styles.freelancerHeader}>
                <div className={styles.avatarLarge}>
                  {proposal.freelancer?.name?.charAt(0).toUpperCase() || "F"}
                </div>
                <div>
                  <h4>{proposal.freelancer?.name || "Unknown Freelancer"}</h4>
                  <p>{proposal.freelancer?.email || "No email"}</p>
                </div>
              </div>

              {proposal.freelancer?.profile && (
                <div className={styles.freelancerDetailsGrid}>
                  {proposal.freelancer.profile.title && (
                    <div className={styles.detailItem}>
                      <strong>Professional Title:</strong>{" "}
                      {proposal.freelancer.profile.title}
                    </div>
                  )}
                  {proposal.freelancer.profile.hourlyRate && (
                    <div className={styles.detailItem}>
                      <strong>Hourly Rate:</strong> $
                      {proposal.freelancer.profile.hourlyRate}/hr
                    </div>
                  )}
                  {proposal.freelancer.profile.location && (
                    <div className={styles.detailItem}>
                      <strong>Location:</strong>{" "}
                      {proposal.freelancer.profile.location}
                    </div>
                  )}

                  {/* Resume Section in Modal */}
                  {hasResume() && (
                    <div className={styles.resumeSection}>
                      <div className={styles.resumeHeader}>
                        <h4>
                          <FaFilePdf /> Resume
                        </h4>
                        <div className={styles.resumeActions}>
                          <motion.button
                            onClick={handleDownloadClick}
                            disabled={resumeLoading || downloadLoading}
                            className={styles.downloadBtn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {resumeLoading || downloadLoading ? (
                              <div className={styles.resumeSpinner} />
                            ) : (
                              <FaDownload />
                            )}
                            Download Resume
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>
              <FaComment /> Cover Letter
            </h3>
            <div className={styles.coverLetterFull}>
              {proposal.coverLetter || "No cover letter provided."}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          {proposal.status === "pending" && activeSection === "received" && (
            <div className={styles.modalActions}>
              <motion.button
                onClick={() => onAction(proposal.id, "accepted")}
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
                Accept Proposal
              </motion.button>
              <motion.button
                onClick={() => onAction(proposal.id, "rejected")}
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
                Reject Proposal
              </motion.button>
            </div>
          )}

          <button onClick={onClose} className={styles.closeModalButton}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
