"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaEye,
  FaFileAlt,
  FaUser,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaHistory,
  FaConnectdevelop,
  FaProjectDiagram,
  FaCalendar,
  FaMoneyBillWave,
  FaStar,
  FaChartLine,
  FaSync,
  FaPaperPlane,
  FaCrown,
  FaSeedling,
  FaBuilding,
  FaEnvelope,
  FaBriefcase,
  FaTools,
  FaCheck,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
import styles from "./AdminProposals.module.css";

export default function AdminProposalsPage() {
  const [user, setUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [connectHistory, setConnectHistory] = useState([]);
  const [stats, setStats] = useState({
    totalProposals: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    totalConnectsUsed: 0,
    totalBidAmount: 0,
    averageBidAmount: 0,
  });
  const router = useRouter();

  // Professional color scheme
  const colors = {
    primary: "#2563eb",
    secondary: "#7c3aed",
    success: "#059669",
    warning: "#d97706",
    error: "#dc2626",
    info: "#0369a1",
    dark: "#1e293b",
    light: "#f8fafc",
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    filterProposals();
    calculateStats();
  }, [proposals, searchTerm, filterStatus]);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user?.role !== "admin") {
          router.push("/unauthorized");
          return;
        }
        setUser(data.user);
        fetchAllProposals();
        fetchConnectHistory();
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchAllProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/proposals/?limit=100");
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Proposals data:", data);
        if (data.success) {
          setProposals(data.proposals || []);
        } else {
          console.error("API returned error:", data.error);
          setProposals([]);
        }
      } else {
        console.error("Failed to fetch proposals, status:", response.status);
        // Fallback to empty array
        setProposals([]);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      // Fallback to empty array
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectHistory = async () => {
    try {
      const response = await fetch("/api/users/connect-history");
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Connect history data:", data);
        if (data.success) {
          setConnectHistory(data.history || []);
        } else {
          console.error("API returned error:", data.error);
          setConnectHistory([]);
        }
      } else {
        console.error("Failed to fetch connect history, status:", response.status);
        // Fallback to mock data for testing
        setConnectHistory(getMockConnectHistory());
      }
    } catch (error) {
      console.error("Error fetching connect history:", error);
      // Fallback to mock data for testing
      setConnectHistory(getMockConnectHistory());
    }
  };

  // Mock data for testing if API fails
  const getMockConnectHistory = () => {
    return [
      {
        id: 1,
        type: "usage",
        amount: -1,
        description: "Submitted proposal for Website Development",
        createdAt: new Date().toISOString(),
        userName: "John Developer",
        projectDetails: {
          jobTitle: "Website Development",
          clientName: "Jane Client"
        }
      },
      {
        id: 2,
        type: "bonus",
        amount: 5,
        description: "Welcome bonus connects",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userName: "Sarah Designer",
        projectDetails: null
      },
      {
        id: 3,
        type: "usage",
        amount: -1,
        description: "Submitted proposal for Mobile App",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        userName: "Mike Developer",
        projectDetails: {
          jobTitle: "Mobile App Development",
          clientName: "Tech Corp"
        }
      }
    ];
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
          proposal.job?.client?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.coverLetter
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.job?.category
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProposals(filtered);
  };

  const calculateStats = () => {
    const totalProposals = proposals.length;
    const pending = proposals.filter((p) => p.status === "pending").length;
    const accepted = proposals.filter((p) => p.status === "accepted").length;
    const rejected = proposals.filter((p) => p.status === "rejected").length;

    const totalConnectsUsed = proposals.reduce(
      (sum, p) => sum + (p.connectsUsed || 1),
      0
    );
    const totalBidAmount = proposals.reduce((sum, p) => sum + (p.bidAmount || 0), 0);
    const averageBidAmount =
      proposals.length > 0 ? totalBidAmount / proposals.length : 0;

    setStats({
      totalProposals,
      pending,
      accepted,
      rejected,
      totalConnectsUsed,
      totalBidAmount,
      averageBidAmount: Math.round(averageBidAmount),
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock style={{ color: colors.warning }} />;
      case "accepted":
        return <FaCheckCircle style={{ color: colors.success }} />;
      case "rejected":
        return <FaTimesCircle style={{ color: colors.error }} />;
      case "completed":
        return <FaCheckCircle style={{ color: colors.info }} />;
      default:
        return <FaExclamationTriangle style={{ color: colors.warning }} />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: colors.warning, label: "Under Review" },
      accepted: { color: colors.success, label: "Accepted" },
      rejected: { color: colors.error, label: "Rejected" },
      completed: { color: colors.info, label: "Completed" },
    };

    const config = statusConfig[status] || { color: "#64748b", label: status };

    return (
      <span
        className={styles.statusBadge}
        style={{ backgroundColor: config.color }}
      >
        {getStatusIcon(status)}
        {config.label}
      </span>
    );
  };

  const handleViewDetails = async (proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsModal(true);
  };

  const getConnectHistoryIcon = (type) => {
    switch (type) {
      case "usage":
        return <FaPaperPlane />;
      case "plan_change":
        return <FaCrown />;
      case "reset":
        return <FaSync />;
      case "bonus":
        return <FaStar />;
      default:
        return <FaConnectdevelop />;
    }
  };

  const getConnectHistoryColor = (type) => {
    switch (type) {
      case "usage":
        return colors.error;
      case "plan_change":
        return colors.success;
      case "reset":
        return colors.info;
      case "bonus":
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  // Safe skills display function
  const getSkillsArray = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map(skill => skill.trim());
    return [];
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <p>Loading proposals...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.headerContent}>
          <motion.button
            onClick={() => router.push("/wp-admin")}
            className={styles.backButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaArrowLeft /> Back to Admin Dashboard
          </motion.button>
          <div className={styles.headerMain}>
            <h1>Proposals Management</h1>
            <p>Manage and review all project proposals and connect usage</p>
          </div>
        </div>
      </motion.header>

      {/* Stats Summary */}
      <motion.div
        className={styles.statsSummary}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={styles.stat}>
          <div
            className={styles.statIcon}
            style={{ background: colors.primary }}
          >
            <FaFileAlt />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.totalProposals}</span>
            <span className={styles.statLabel}>Total Proposals</span>
          </div>
        </div>
        <div className={styles.stat}>
          <div
            className={styles.statIcon}
            style={{ background: colors.warning }}
          >
            <FaClock />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending Review</span>
          </div>
        </div>
        <div className={styles.stat}>
          <div
            className={styles.statIcon}
            style={{ background: colors.success }}
          >
            <FaCheckCircle />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.accepted}</span>
            <span className={styles.statLabel}>Accepted</span>
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statIcon} style={{ background: colors.error }}>
            <FaTimesCircle />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.rejected}</span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statIcon} style={{ background: colors.info }}>
            <FaConnectdevelop />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.totalConnectsUsed}</span>
            <span className={styles.statLabel}>Connects Used</span>
          </div>
        </div>
        <div className={styles.stat}>
          <div
            className={styles.statIcon}
            style={{ background: colors.secondary }}
          >
            <FaMoneyBillWave />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>
              ${stats.averageBidAmount}
            </span>
            <span className={styles.statLabel}>Avg. Bid</span>
          </div>
        </div>
      </motion.div>

      <div className={styles.contentGrid}>
        {/* Main Content - Proposals */}
        <div className={styles.mainContent}>
          {/* Filters */}
          <motion.div
            className={styles.filters}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by job title, freelancer, client, category..."
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
                transition={{ duration: 0.5 }}
              >
                <FaFileAlt className={styles.emptyIcon} />
                <h3>No proposals found</h3>
                <p>
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "No proposals have been submitted yet"}
                </p>
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
                          <span className={styles.category}>
                            {proposal.job?.category || "Uncategorized"}
                          </span>
                          <div className={styles.clientInfo}>
                            <FaUser className={styles.clientIcon} />
                            <span>
                              Client: {proposal.job?.client?.name || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>

                    <div className={styles.proposalDetails}>
                      <div className={styles.freelancerInfo}>
                        <div className={styles.freelancerName}>
                          <strong>Freelancer:</strong>{" "}
                          {proposal.freelancer?.name || "Unknown"}
                        </div>
                        <div className={styles.freelancerEmail}>
                          {proposal.freelancer?.email}
                        </div>
                        <div className={styles.freelancerSkills}>
                          Skills:{" "}
                          {getSkillsArray(proposal.freelancer?.profile?.skills).join(", ") || "Not specified"}
                        </div>
                      </div>

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
                        <div className={styles.bidItem}>
                          <FaConnectdevelop className={styles.bidIcon} />
                          <span>
                            Connects Used: {proposal.connectsUsed || 1}
                          </span>
                        </div>
                        <div className={styles.bidItem}>
                          <span>
                            Job Budget: $
                            {proposal.job?.budget?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className={styles.coverLetterPreview}>
                        <p>{proposal.coverLetter?.substring(0, 120)}...</p>
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Connect History */}
        <motion.div
          className={styles.sidebar}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={styles.connectHistory}>
            <div className={styles.sidebarHeader}>
              <FaHistory />
              <h3>Recent Connect Activity</h3>
            </div>
            <div className={styles.historyList}>
              {connectHistory.length === 0 ? (
                <div className={styles.emptyHistory}>
                  <FaConnectdevelop />
                  <p>No connect activity yet</p>
                </div>
              ) : (
                connectHistory.slice(0, 8).map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={styles.historyItem}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className={styles.historyIcon}
                      style={{
                        backgroundColor: getConnectHistoryColor(item.type),
                      }}
                    >
                      {getConnectHistoryIcon(item.type)}
                    </div>
                    <div className={styles.historyContent}>
                      <div className={styles.historyDescription}>
                        {item.description}
                      </div>
                      <div className={styles.historyMeta}>
                        <span className={styles.userName}>{item.userName}</span>
                        <span className={styles.historyDate}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {item.projectDetails && (
                        <div className={styles.projectDetails}>
                          {item.projectDetails.jobTitle} -{" "}
                          {item.projectDetails.clientName}
                        </div>
                      )}
                    </div>
                    <div
                      className={`${styles.connectChange} ${
                        item.amount > 0 ? styles.positive : styles.negative
                      }`}
                    >
                      {item.amount > 0 ? "+" : ""}
                      {item.amount}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            {connectHistory.length > 8 && (
              <button 
                className={styles.viewAllButton}
                onClick={() => alert("View all connect history feature coming soon!")}
              >
                View All Activity
              </button>
            )}
          </div>
        </motion.div>
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
                    <FaProjectDiagram /> Job Information
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Job Title:</strong> {selectedProposal.job?.title}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Category:</strong>{" "}
                      {selectedProposal.job?.category || "Not specified"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Budget:</strong> $
                      {selectedProposal.job?.budget?.toLocaleString()}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Experience Level:</strong>{" "}
                      {selectedProposal.job?.experienceLevel || "Not specified"}
                    </div>
                  </div>
                  <div className={styles.jobDescription}>
                    <strong>Job Description:</strong>
                    <p>{selectedProposal.job?.description || "No description available"}</p>
                  </div>
                </div>

                {/* Client Information */}
                <div className={styles.detailSection}>
                  <h3>
                    <FaBuilding /> Client Information
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Name:</strong>{" "}
                      {selectedProposal.job?.client?.name || "Unknown"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Email:</strong>{" "}
                      {selectedProposal.job?.client?.email || "Unknown"}
                    </div>
                  </div>
                </div>

                {/* Freelancer Information */}
                <div className={styles.detailSection}>
                  <h3>
                    <FaUser /> Freelancer Information
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Name:</strong> {selectedProposal.freelancer?.name || "Unknown"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Email:</strong>{" "}
                      {selectedProposal.freelancer?.email || "Unknown"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Experience:</strong>{" "}
                      {selectedProposal.freelancer?.profile?.experience || "Not specified"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Hourly Rate:</strong> $
                      {selectedProposal.freelancer?.profile?.hourlyRate || "0"}/hr
                    </div>
                  </div>
                  <div className={styles.skillsSection}>
                    <strong>Skills:</strong>
                    <div className={styles.skillsList}>
                      {getSkillsArray(selectedProposal.freelancer?.profile?.skills).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedProposal.freelancer?.profile?.bio && (
                    <div className={styles.bioSection}>
                      <strong>Bio:</strong>
                      <p>{selectedProposal.freelancer?.profile?.bio}</p>
                    </div>
                  )}
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
                      <strong>Connects Used:</strong>{" "}
                      {selectedProposal.connectsUsed || 1}
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
                    <FaEdit /> Cover Letter
                  </h3>
                  <div className={styles.coverLetterFull}>
                    {selectedProposal.coverLetter}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
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