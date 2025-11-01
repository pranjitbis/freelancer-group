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
  FaPaperPlane,
  FaFileAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartLine,
  FaDownload,
  FaFilePdf,
  FaIdCard,
  FaReceipt,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import styles from "./FreelancerProposals.module.css";

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
      console.log("🔄 Fetching proposals for user:", userId);

      const receivedResponse = await fetch(
        `/api/proposals/client?userId=${userId}&includeProfile=true`
      );
      const sentResponse = await fetch(
        `/api/proposals/client-to-freelancer?userId=${userId}&includeProfile=true`
      );

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        console.log("📥 Received proposals:", receivedData);
        if (receivedData.success) {
          setReceivedProposals(receivedData.proposals || []);
        }
      }

      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        console.log("📤 Sent proposals:", sentData);
        if (sentData.success) {
          setSentProposals(sentData.proposals || []);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching proposals:", error);
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
          proposal.client?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.coverLetter
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.projectTitle
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
    try {
      const response = await fetch("/api/proposals/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId,
          action,
          type: activeSection === "received" ? "received" : "sent",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (activeSection === "received") {
          setReceivedProposals((prev) =>
            prev.map((p) =>
              p.id === proposalId ? { ...p, status: action } : p
            )
          );
        } else {
          setSentProposals((prev) =>
            prev.map((p) =>
              p.id === proposalId ? { ...p, status: action } : p
            )
          );
        }

        if (selectedProposal && selectedProposal.id === proposalId) {
          setSelectedProposal((prev) => ({ ...prev, status: action }));
        }

        setSuccessMessage(`Proposal ${action} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        await fetchClientProposals(currentUser.id);
      } else {
        alert(data.error || "Failed to update proposal");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to update proposal. Please check your connection.");
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
      console.log("📥 Starting resume download:", {
        resumeUrl,
        freelancerName,
      });

      // Check if it's a relative URL and convert to absolute
      let downloadUrl = resumeUrl;
      if (resumeUrl.startsWith("/")) {
        downloadUrl = `${window.location.origin}${resumeUrl}`;
      }

      console.log("📥 Download URL:", downloadUrl);

      // Fetch the resume file
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch resume: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log("📥 Blob size:", blob.size);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Create filename from freelancer name
      const fileName = `${freelancerName.replace(/\s+/g, "_")}_Resume.pdf`;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`Resume downloaded successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error downloading resume:", error);
      alert("Failed to download resume. Please try again.");
    } finally {
      if (proposalId) {
        setDownloadLoading(null);
      }
    }
  };

  const handleViewResume = (resumeUrl) => {
    // Open resume in new tab
    let viewUrl = resumeUrl;
    if (resumeUrl.startsWith("/")) {
      viewUrl = `${window.location.origin}${resumeUrl}`;
    }
    window.open(viewUrl, "_blank");
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
          `/messages?conversation=${conversationData.conversation.id}`
        );
      } else {
        throw new Error(
          conversationData.error || "Failed to create conversation"
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to start conversation. Please try again.");
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
        return <FaHourglassHalf style={{ color: "#6b7280" }} />;
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

  const hasResume = (proposal) => {
    return proposal.freelancer?.profile?.resumeUrl;
  };

  const renderProposalCard = (proposal, index) => (
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
        <div className={styles.headerRight}>
          {hasResume(proposal) && (
            <div className={styles.resumeBadge}>
              <FaFilePdf />
              Resume Available
            </div>
          )}
          {getStatusBadge(proposal.status)}
        </div>
      </div>

      <div className={styles.proposalDetails}>
        {/* Freelancer/Client Info */}
        <div className={styles.freelancerInfo}>
          <div className={styles.freelancerHeader}>
            <div className={styles.avatar}>
              {activeSection === "received"
                ? proposal.freelancer?.name?.charAt(0).toUpperCase()
                : proposal.freelancer?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.freelancerName}>
                {activeSection === "received"
                  ? proposal.freelancer?.name
                  : proposal.freelancer?.name}
              </div>
              <div className={styles.freelancerTitle}>
                {activeSection === "received" ? "Freelancer" : "Professional"}
              </div>
            </div>
          </div>

          {activeSection === "received" && proposal.freelancer?.profile && (
            <div className={styles.freelancerDetailsEnhanced}>
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

              {/* Resume Availability with Download Button */}
              <div className={styles.resumeInfo}>
                {hasResume(proposal) ? (
                  <div className={styles.resumeAvailableSection}>
                    <FaFilePdf className={styles.resumeIcon} />
                    <div className={styles.resumeText}>
                      <span className={styles.resumeAvailable}>
                        Professional Resume Available
                      </span>
                      <span className={styles.resumeHint}>
                        Download to review full qualifications
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.resumeNotAvailable}>
                    <FaFileAlt />
                    <span>No Resume Uploaded</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Proposal Details */}
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
            {activeSection === "received" &&
              proposal.job?.budget &&
              calculateSavings(proposal.job.budget, proposal.bidAmount) > 0 && (
                <div className={styles.savings}>
                  You save: $
                  {calculateSavings(
                    proposal.job.budget,
                    proposal.bidAmount
                  ).toLocaleString()}
                </div>
              )}
          </div>

          {/* Skills */}
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
                  {getSkillsArray(proposal.freelancer.profile.skills).length >
                    4 && (
                    <span className={styles.moreSkills}>
                      +
                      {getSkillsArray(proposal.freelancer.profile.skills)
                        .length - 4}{" "}
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

          {/* Resume Actions */}
          {activeSection === "received" && hasResume(proposal) && (
            <div className={styles.resumeActions}>
              <motion.button
                onClick={() =>
                  handleViewResume(proposal.freelancer.profile.resumeUrl)
                }
                className={styles.viewResumeBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaExternalLinkAlt /> View Resume
              </motion.button>
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
            </div>
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

          {proposal.status === "accepted" && (
            <motion.button
              onClick={() => handleProposalAction(proposal.id, "completed")}
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
              Complete
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading proposals...</p>
      </div>
    );
  }

  return (
    <>
      <Banner />
      <div className={styles.container}>
        {/* Header */}
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

        {/* Section Tabs */}
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

        <AnimatePresence>
          {successMessage && (
            <motion.div
              className={styles.successMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FaCheckCircle />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

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
              placeholder={
                activeSection === "received"
                  ? "Search by job title, freelancer name, or skills..."
                  : "Search by project title or freelancer name..."
              }
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
              {!searchTerm && filterStatus === "all" && (
                <div className={styles.emptyActions}>
                  {activeSection === "received" ? (
                    <button
                      onClick={() => router.push("/client-dashboard/post-job")}
                      className={styles.postJobButton}
                    >
                      Post a New Job
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/hire-freelancer")}
                      className={styles.postJobButton}
                    >
                      Browse Freelancers
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <div className={styles.proposalsGrid}>
              {filteredProposals.map((proposal, index) =>
                renderProposalCard(proposal, index)
              )}
            </div>
          )}
        </div>

        {/* Proposal Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedProposal && (
            <ProposalDetailsModal
              proposal={selectedProposal}
              activeSection={activeSection}
              onClose={() => setShowDetailsModal(false)}
              onAction={handleProposalAction}
              actionLoading={actionLoading}
              onDownloadResume={handleDownloadResume}
              onViewResume={handleViewResume}
              downloadLoading={downloadLoading}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Enhanced Modal Component with Download Button
function ProposalDetailsModal({
  proposal,
  activeSection,
  onClose,
  onAction,
  actionLoading,
  onDownloadResume,
  onViewResume,
  downloadLoading,
}) {
  const [resumeLoading, setResumeLoading] = useState(false);

  const getSkillsArray = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "string")
      return skills.split(",").map((skill) => skill.trim());
    return [];
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

  const handleDownloadClick = async () => {
    if (proposal.freelancer?.profile?.resumeUrl) {
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

  const handleViewClick = () => {
    if (proposal.freelancer?.profile?.resumeUrl) {
      onViewResume(proposal.freelancer.profile.resumeUrl);
    }
  };

  const hasResume = proposal.freelancer?.profile?.resumeUrl;

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
          {/* Project Information */}
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
                <strong>Status:</strong> {getStatusBadge(proposal.status)}
              </div>
            </div>
            {(proposal.job?.description || proposal.projectDescription) && (
              <div className={styles.jobDescription}>
                <strong>Project Description:</strong>
                <p>
                  {proposal.job?.description || proposal.projectDescription}
                </p>
              </div>
            )}
          </div>

          {/* Freelancer Information */}
          <div className={styles.detailSection}>
            <h3>
              <FaUser />{" "}
              {activeSection === "received" ? "Freelancer" : "Professional"}{" "}
              Information
            </h3>
            <div className={styles.freelancerModalInfo}>
              <div className={styles.freelancerHeader}>
                <div className={styles.avatarLarge}>
                  {proposal.freelancer?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{proposal.freelancer?.name}</h4>
                  <p>{proposal.freelancer?.email}</p>
                </div>
              </div>

              {proposal.freelancer?.profile && (
                <>
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
                    {proposal.freelancer.profile.experience && (
                      <div className={styles.detailItem}>
                        <strong>Experience:</strong>{" "}
                        {proposal.freelancer.profile.experience}
                      </div>
                    )}
                    {proposal.freelancer.profile.education && (
                      <div className={styles.detailItem}>
                        <strong>Education:</strong>{" "}
                        {proposal.freelancer.profile.education}
                      </div>
                    )}
                  </div>

                  {/* Tax Information */}
                  {(proposal.freelancer.profile.panNumber ||
                    proposal.freelancer.profile.gstNumber) && (
                    <div className={styles.taxInfoSection}>
                      <h5>Tax Information</h5>
                      <div className={styles.taxDetails}>
                        {proposal.freelancer.profile.panNumber && (
                          <div className={styles.taxDetail}>
                            <FaIdCard />
                            <span>
                              PAN: {proposal.freelancer.profile.panNumber}
                            </span>
                          </div>
                        )}
                        {proposal.freelancer.profile.gstNumber && (
                          <div className={styles.taxDetail}>
                            <FaReceipt />
                            <span>
                              GST: {proposal.freelancer.profile.gstNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {proposal.freelancer.profile.skills && (
                    <div className={styles.skillsSection}>
                      <strong>Skills:</strong>
                      <div className={styles.skillsList}>
                        {getSkillsArray(proposal.freelancer.profile.skills).map(
                          (skill, index) => (
                            <span key={index} className={styles.skillTag}>
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {proposal.freelancer.profile.bio && (
                    <div className={styles.bioSection}>
                      <strong>Professional Bio:</strong>
                      <p>{proposal.freelancer.profile.bio}</p>
                    </div>
                  )}

                  {/* Resume Section with Download Button */}
                  {hasResume && (
                    <div className={styles.resumeSection}>
                      <div className={styles.resumeHeader}>
                        <h4>
                          <FaFilePdf /> Professional Resume
                        </h4>
                        <div className={styles.resumeActions}>
                          <motion.button
                            onClick={handleViewClick}
                            className={styles.viewResumeBtn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaExternalLinkAlt /> View Resume
                          </motion.button>
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
                      <div className={styles.resumeViewer}>
                        <iframe
                          src={proposal.freelancer.profile.resumeUrl}
                          className={styles.resumeIframe}
                          title={`${proposal.freelancer.name}'s Resume`}
                          onLoad={() => setResumeLoading(false)}
                          onError={() => setResumeLoading(false)}
                        />
                        {(resumeLoading || downloadLoading) && (
                          <div className={styles.resumeLoading}>
                            <div className={styles.resumeSpinner} />
                            <p>Loading resume...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <div className={styles.detailSection}>
            <h3>
              <FaComment /> Cover Letter
            </h3>
            <div className={styles.coverLetterFull}>{proposal.coverLetter}</div>
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
