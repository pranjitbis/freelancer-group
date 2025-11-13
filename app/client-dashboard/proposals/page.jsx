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
  FaBuilding,
  FaMapMarkerAlt,
  FaStar,
  FaBars,
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
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
        if (receivedData.success) {
          setReceivedProposals(receivedData.proposals || []);
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
      pending: {
        color: "#B45309",
        bgColor: "#FFFBEB",
        borderColor: "#FBBF24",
        label: "Under Review",
        icon: <FaHourglassHalf />,
      },
      accepted: {
        color: "#047857",
        bgColor: "#ECFDF5",
        borderColor: "#34D399",
        label: "Accepted",
        icon: <FaCheckCircle />,
      },
      rejected: {
        color: "#DC2626",
        bgColor: "#FEF2F2",
        borderColor: "#F87171",
        label: "Rejected",
        icon: <FaTimes />,
      },
      completed: {
        color: "#1E40AF",
        bgColor: "#EFF6FF",
        borderColor: "#60A5FA",
        label: "Completed",
        icon: <FaCheck />,
      },
    };

    const config = statusConfig[status] || {
      color: "#374151",
      bgColor: "#F9FAFB",
      borderColor: "#D1D5DB",
      label: status,
      icon: <FaFileAlt />,
    };

    return (
      <span
        className={styles.statusBadge}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          borderColor: config.borderColor,
        }}
      >
        {config.icon}
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
    if (!proposal.freelancer?.profile) return false;
    return (
      proposal.freelancer.profile.resumeUrl &&
      proposal.freelancer.profile.resumeUrl.trim() !== ""
    );
  };

  const renderProposalCard = (proposal, index) => {
    const resumeAvailable = hasResume(proposal);

    return (
      <motion.div
        key={proposal.id}
        className={styles.proposalCard}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        <div className={styles.cardHeader}>
          <div className={styles.projectInfo}>
            <div className={styles.titleRow}>
              <h3 className={styles.projectTitle}>
                {activeSection === "received"
                  ? proposal.job?.title || "Unknown Job"
                  : proposal.projectTitle || "Custom Project"}
              </h3>
              {getStatusBadge(proposal.status)}
            </div>
            <div className={styles.projectMeta}>
              <div className={styles.metaItem}>
                <FaDollarSign className={styles.metaIcon} />
                <span>${proposal.bidAmount?.toLocaleString()}</span>
              </div>
              <div className={styles.metaItem}>
                <FaClock className={styles.metaIcon} />
                <span>{proposal.timeframe} days</span>
              </div>
              <div className={styles.metaItem}>
                <FaCalendar className={styles.metaIcon} />
                <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.freelancerSection}>
            <div className={styles.freelancerInfo}>
              <div className={styles.avatar}>
                {proposal.freelancer?.name?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className={styles.freelancerDetails}>
                <h4 className={styles.freelancerName}>
                  {proposal.freelancer?.name || "Unknown Freelancer"}
                </h4>
                <p className={styles.freelancerTitle}>
                  {proposal.freelancer?.profile?.title || "Professional"}
                </p>
                {proposal.freelancer?.profile?.location && (
                  <div className={styles.location}>
                    <FaMapMarkerAlt />
                    <span>{proposal.freelancer.profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {activeSection === "received" && proposal.freelancer?.profile && (
              <div className={styles.freelancerStats}>
                {proposal.freelancer.profile.hourlyRate && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Hourly Rate</span>
                    <span className={styles.statValue}>
                      ${proposal.freelancer.profile.hourlyRate}/hr
                    </span>
                  </div>
                )}
           
              </div>
            )}
          </div>

          {activeSection === "received" &&
            proposal.freelancer?.profile?.skills && (
              <div className={styles.skillsSection}>
                <label className={styles.sectionLabel}>
                  Skills & Expertise
                </label>
                <div className={styles.skillsList}>
                  {getSkillsArray(proposal.freelancer.profile.skills)
                    .slice(0, isMobile ? 3 : 4)
                    .map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            )}

          <div className={styles.coverLetterSection}>
            <label className={styles.sectionLabel}>Cover Letter</label>
            <p className={styles.coverLetterPreview}>
              {proposal.coverLetter?.substring(0, isMobile ? 100 : 120)}...
            </p>
          </div>

          {activeSection === "received" && (
            <div className={styles.resumeSection}>
              <label className={styles.sectionLabel}>Resume</label>
              {resumeAvailable ? (
                <div className={styles.resumeAvailable}>
                  <FaFilePdf className={styles.resumeIcon} />
                  <span>Resume available for download</span>
                  <button
                    onClick={() =>
                      handleDownloadResume(
                        proposal.freelancer.profile.resumeUrl,
                        proposal.freelancer.name,
                        proposal.id
                      )
                    }
                    disabled={downloadLoading === proposal.id}
                    className={styles.downloadButton}
                  >
                    {downloadLoading === proposal.id ? (
                      <div className={styles.actionSpinner} />
                    ) : (
                      <FaDownload />
                    )}
                    Download
                  </button>
                </div>
              ) : (
                <div className={styles.resumeNotAvailable}>
                  <FaFileAlt className={styles.noResumeIcon} />
                  <span>No attachment uploaded</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.actionButtons}>
            <button
              onClick={() => handleViewDetails(proposal)}
              className={styles.primaryButton}
            >
              <FaEye />
              View Details
            </button>

            <button
              onClick={() => handleSendMessage(proposal)}
              className={styles.secondaryButton}
            >
              <FaEnvelope />
              Message
            </button>

            {proposal.status === "pending" && activeSection === "received" && (
              <div className={styles.decisionButtons}>
                <button
                  onClick={() => handleProposalAction(proposal.id, "accepted")}
                  disabled={actionLoading === proposal.id}
                  className={styles.acceptButton}
                >
                  {actionLoading === proposal.id ? (
                    <div className={styles.actionSpinner} />
                  ) : (
                    <FaCheck />
                  )}
                  Accept
                </button>
                <button
                  onClick={() => handleProposalAction(proposal.id, "rejected")}
                  disabled={actionLoading === proposal.id}
                  className={styles.rejectButton}
                >
                  {actionLoading === proposal.id ? (
                    <div className={styles.actionSpinner} />
                  ) : (
                    <FaTimes />
                  )}
                  Reject
                </button>
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
        <div className={styles.spinner}></div>
        <p>Loading proposals...</p>
      </div>
    );
  }

  return (
    <>
      <Banner />
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerMain}>
              <div className={styles.titleSection}>
                <h1>Proposal Management</h1>
                <p>Review and manage project proposals</p>
              </div>
              <button
                onClick={() => router.push("/client-dashboard/analytics")}
                className={styles.analyticsButton}
              >
                <FaChartLine />
                View Analytics
              </button>
            </div>

            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaFileAlt />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>
                    {receivedProposals.length + sentProposals.length}
                  </span>
                  <span className={styles.statLabel}>Total Proposals</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaHourglassHalf />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>
                    {
                      receivedProposals.filter((p) => p.status === "pending")
                        .length
                    }
                  </span>
                  <span className={styles.statLabel}>Pending Review</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FaCheckCircle />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statNumber}>
                    {receivedProposals.filter((p) => p.status === "accepted")
                      .length +
                      sentProposals.filter((p) => p.status === "accepted")
                        .length}
                  </span>
                  <span className={styles.statLabel}>Active Projects</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className={styles.errorMessage}>
            <FaTimes />
            {error}
          </div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>
            <FaCheckCircle />
            {successMessage}
          </div>
        )}

        <div className={styles.controlsSection}>
          <div className={styles.sectionTabs}>
            <button
              className={`${styles.tab} ${
                activeSection === "received" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("received")}
            >
              <FaUser />
              <span>Received Proposals</span>
              <span className={styles.tabCount}>
                ({receivedProposals.length})
              </span>
            </button>
            <button
              className={`${styles.tab} ${
                activeSection === "sent" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("sent")}
            >
              <FaPaperPlane />
              <span>Sent Proposals</span>
              <span className={styles.tabCount}>({sentProposals.length})</span>
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search proposals..."
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
          </div>
        </div>

        <main className={styles.mainContent}>
          {filteredProposals.length === 0 ? (
            <div className={styles.emptyState}>
              <FaFileAlt className={styles.emptyIcon} />
              <h3>No proposals found</h3>
              <p>
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : activeSection === "received"
                  ? "You haven't received any proposals yet"
                  : "You haven't sent any proposals yet"}
              </p>
            </div>
          ) : (
            <div className={styles.proposalsGrid}>
              {filteredProposals.map((proposal, index) =>
                renderProposalCard(proposal, index)
              )}
            </div>
          )}
        </main>

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
              isMobile={isMobile}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function ProposalDetailsModal({
  proposal,
  activeSection,
  onClose,
  onAction,
  actionLoading,
  onDownloadResume,
  downloadLoading,
  isMobile = false,
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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2>Proposal Details</h2>
            <p>Complete information about this proposal</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaBriefcase />
              Project Information
            </h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <label>Project Title</label>
                <p>
                  {activeSection === "received"
                    ? proposal.job?.title || "Unknown Job"
                    : proposal.projectTitle || "Custom Project"}
                </p>
              </div>
              <div className={styles.detailItem}>
                <label>Proposed Budget</label>
                <p>${proposal.bidAmount?.toLocaleString()}</p>
              </div>
              <div className={styles.detailItem}>
                <label>Estimated Timeline</label>
                <p>{proposal.timeframe} days</p>
              </div>
              <div className={styles.detailItem}>
                <label>Current Status</label>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor:
                      proposal.status === "pending"
                        ? "#FFFBEB"
                        : proposal.status === "accepted"
                        ? "#ECFDF5"
                        : proposal.status === "rejected"
                        ? "#FEF2F2"
                        : "#EFF6FF",
                    color:
                      proposal.status === "pending"
                        ? "#B45309"
                        : proposal.status === "accepted"
                        ? "#047857"
                        : proposal.status === "rejected"
                        ? "#DC2626"
                        : "#1E40AF",
                    borderColor:
                      proposal.status === "pending"
                        ? "#FBBF24"
                        : proposal.status === "accepted"
                        ? "#34D399"
                        : proposal.status === "rejected"
                        ? "#F87171"
                        : "#60A5FA",
                  }}
                >
                  {proposal.status}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaUser />
              Freelancer Information
            </h3>
            <div className={styles.freelancerCard}>
              <div className={styles.freelancerHeader}>
                <div className={styles.avatarLarge}>
                  {proposal.freelancer?.name?.charAt(0).toUpperCase() || "F"}
                </div>
                <div className={styles.freelancerInfo}>
                  <h4>{proposal.freelancer?.name || "Unknown Freelancer"}</h4>
                  <p className={styles.email}>
                    {proposal.freelancer?.email || "No email provided"}
                  </p>
                  {proposal.freelancer?.profile?.location && (
                    <div className={styles.location}>
                      <FaMapMarkerAlt />
                      <span>{proposal.freelancer.profile.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {proposal.freelancer?.profile && (
                <div className={styles.freelancerDetails}>
                  {proposal.freelancer.profile.title && (
                    <div className={styles.detailRow}>
                      <strong>Professional Title:</strong>
                      <span>{proposal.freelancer.profile.title}</span>
                    </div>
                  )}
                  {proposal.freelancer.profile.hourlyRate && (
                    <div className={styles.detailRow}>
                      <strong>Hourly Rate:</strong>
                      <span>${proposal.freelancer.profile.hourlyRate}/hr</span>
                    </div>
                  )}

                  {hasResume() && (
                    <div className={styles.resumeSection}>
                      <div className={styles.resumeHeader}>
                        <strong>Professional Resume</strong>
                        <button
                          onClick={handleDownloadClick}
                          disabled={resumeLoading || downloadLoading}
                          className={styles.downloadButton}
                        >
                          {resumeLoading || downloadLoading ? (
                            <div className={styles.actionSpinner} />
                          ) : (
                            <FaDownload />
                          )}
                          Download Resume
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaComment />
              Cover Letter
            </h3>
            <div className={styles.coverLetter}>
              <p>{proposal.coverLetter || "No cover letter provided."}</p>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          {proposal.status === "pending" && activeSection === "received" && (
            <div className={styles.actionButtons}>
              <button
                onClick={() => onAction(proposal.id, "accepted")}
                disabled={actionLoading === proposal.id}
                className={styles.acceptButton}
              >
                {actionLoading === proposal.id ? (
                  <div className={styles.actionSpinner} />
                ) : (
                  <FaCheck />
                )}
                Accept Proposal
              </button>
              <button
                onClick={() => onAction(proposal.id, "rejected")}
                disabled={actionLoading === proposal.id}
                className={styles.rejectButton}
              >
                {actionLoading === proposal.id ? (
                  <div className={styles.actionSpinner} />
                ) : (
                  <FaTimes />
                )}
                Reject Proposal
              </button>
            </div>
          )}
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
