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
  FaSync,
  FaPaperPlane,
  FaCrown,
  FaBuilding,
  FaEdit,
  FaRedo,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaChartLine,
  FaDatabase,
  FaRocket,
  FaPlus,
  FaMinus,
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
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalProposals: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    totalConnectsUsed: 0,
    totalBidAmount: 0,
    averageBidAmount: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalPlatformConnects: 0,
    conversionRate: 0,
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

  // Fetch data on component mount
  useEffect(() => {
    console.log("🚀 Component mounted, starting data fetch...");
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      console.log("📡 Starting to fetch initial data...");
      setError("");

      // Since we're using temporary middleware, skip complex auth for now
      setUser({
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
      });

      // Fetch proposals with statistics
      await fetchAllProposals();
      await fetchConnectHistory();

      console.log("✅ All data fetched successfully");
    } catch (error) {
      console.error("❌ Error in fetchInitialData:", error);
      setError("Failed to load data. Please try again.");
    }
  };

  useEffect(() => {
    filterProposals();
    calculateStats();
  }, [proposals, searchTerm, filterStatus]);

  const fetchAllProposals = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching proposals from API with stats...");

      const response = await fetch(
        "/api/proposals?limit=100&includeStats=true"
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📝 API Response with Stats:", data);

      if (data.success && data.proposals) {
        console.log(`✅ Found ${data.proposals.length} proposals`);
        console.log(`📊 Platform Stats:`, data.stats);
        setProposals(data.proposals);

        // Update stats with platform data
        if (data.stats) {
          setStats((prev) => ({
            ...prev,
            totalProjects: data.stats.totalProjects || 0,
            totalPlatformConnects: data.stats.totalConnectsUsed || 0,
          }));
        }
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("❌ Error fetching proposals:", error);
      setError(`Failed to load proposals: ${error.message}`);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectHistory = async () => {
    try {
      console.log("📊 Fetching connect history...");
      // This would fetch from your connect history API
      // For now, we'll use mock data
      const mockHistory = [
        {
          id: 1,
          type: "usage",
          amount: -1,
          description: "Proposal submission",
          userName: "John Doe",
          createdAt: new Date().toISOString(),
          projectDetails: {
            jobTitle: "Website Development",
            clientName: "Acme Corp",
          },
        },
        {
          id: 2,
          type: "bonus",
          amount: 5,
          description: "Welcome bonus",
          userName: "Jane Smith",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setConnectHistory(mockHistory);
    } catch (error) {
      console.error("Error fetching connect history:", error);
      setConnectHistory([]);
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
          proposal.client?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.job?.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.client?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.job?.user?.email
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

    // Calculate connects used from actual data
    const totalConnectsUsed = proposals.reduce(
      (sum, p) => sum + (p.totalConnectsUsed || 1),
      0
    );

    const totalBidAmount = proposals.reduce(
      (sum, p) => sum + (p.bidAmount || 0),
      0
    );

    const averageBidAmount =
      proposals.length > 0 ? totalBidAmount / proposals.length : 0;

    // Calculate project statistics
    const projectsFromProposals = proposals.filter((p) => p.hasProject);
    const activeProjects = projectsFromProposals.filter(
      (p) => p.projectStatus === "active"
    ).length;
    const completedProjects = projectsFromProposals.filter(
      (p) => p.projectStatus === "completed"
    ).length;

    // Calculate conversion rate
    const conversionRate =
      totalProposals > 0 ? (accepted / totalProposals) * 100 : 0;

    setStats((prev) => ({
      ...prev,
      totalProposals,
      pending,
      accepted,
      rejected,
      totalConnectsUsed,
      totalBidAmount,
      averageBidAmount: Math.round(averageBidAmount),
      activeProjects,
      completedProjects,
      conversionRate: Math.round(conversionRate * 100) / 100,
    }));
  };

  // Helper function to get client information from either structure
  const getClientInfo = (proposal) => {
    return (
      proposal.client ||
      proposal.job?.user || { name: "Unknown", email: "Unknown" }
    );
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

  // Safe skills display function
  const getSkillsArray = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "string")
      return skills.split(",").map((skill) => skill.trim());
    return [];
  };

  const handleRetry = () => {
    setError("");
    setLoading(true);
    fetchInitialData();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <p>Loading proposals and platform data...</p>
        <p
          style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "10px" }}
        >
          Fetching real data from API...
        </p>
      </div>
    );
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
            <h1>Proposals & Projects Management</h1>
            <p>
              Manage proposals, projects, and connect usage across the platform
            </p>
          </div>
          <motion.button
            onClick={handleRetry}
            className={styles.refreshButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Refresh data"
          >
            <FaRedo /> Refresh
          </motion.button>
        </div>
      </motion.header>

      {/* Error Message */}
      {error && (
        <motion.div
          className={styles.errorBanner}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={handleRetry} className={styles.retryButton}>
            <FaRedo /> Try Again
          </button>
        </motion.div>
      )}

      {/* Enhanced Stats Summary */}
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
            style={{ background: colors.secondary }}
          >
            <FaProjectDiagram />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.totalProjects}</span>
            <span className={styles.statLabel}>Total Projects</span>
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
            <span className={styles.statLabel}>Accepted Proposals</span>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.statIcon} style={{ background: colors.info }}>
            <FaConnectdevelop />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>
              {stats.totalPlatformConnects}
            </span>
            <span className={styles.statLabel}>Platform Connects Used</span>
          </div>
        </div>

        <div className={styles.stat}>
          <div
            className={styles.statIcon}
            style={{ background: colors.warning }}
          >
            <FaChartLine />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.conversionRate}%</span>
            <span className={styles.statLabel}>Conversion Rate</span>
          </div>
        </div>
      </motion.div>

      {/* Additional Platform Stats */}
      <motion.div
        className={styles.platformStats}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.platformStat}>
          <FaRocket className={styles.platformStatIcon} />
          <div>
            <span className={styles.platformStatNumber}>
              {stats.activeProjects}
            </span>
            <span className={styles.platformStatLabel}>Active Projects</span>
          </div>
        </div>
        <div className={styles.platformStat}>
          <FaCheckCircle
            className={styles.platformStatIcon}
            style={{ color: colors.success }}
          />
          <div>
            <span className={styles.platformStatNumber}>
              {stats.completedProjects}
            </span>
            <span className={styles.platformStatLabel}>Completed Projects</span>
          </div>
        </div>
        <div className={styles.platformStat}>
          <FaDatabase
            className={styles.platformStatIcon}
            style={{ color: colors.info }}
          />
          <div>
            <span className={styles.platformStatNumber}>
              {stats.totalConnectsUsed}
            </span>
            <span className={styles.platformStatLabel}>
              Proposal Connects Used
            </span>
          </div>
        </div>
        <div className={styles.platformStat}>
          <FaClock
            className={styles.platformStatIcon}
            style={{ color: colors.warning }}
          />
          <div>
            <span className={styles.platformStatNumber}>{stats.pending}</span>
            <span className={styles.platformStatLabel}>Pending Review</span>
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
                {filteredProposals.map((proposal, index) => {
                  const clientInfo = getClientInfo(proposal);
                  return (
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
                                Client: {clientInfo.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.headerRight}>
                          {getStatusBadge(proposal.status)}
                          {proposal.hasProject && (
                            <span className={styles.projectBadge}>
                              <FaProjectDiagram /> Has Project
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.proposalDetails}>
                        <div className={styles.freelancerInfo}>
                          <div className={styles.freelancerName}>
                            <strong>Freelancer:</strong>{" "}
                            {proposal.freelancer?.name || "Unknown"}
                          </div>
                          <div className={styles.freelancerEmail}>
                            <FaEnvelope className={styles.emailIcon} />
                            {proposal.freelancer?.email || "No email"}
                          </div>
                          <div className={styles.freelancerSkills}>
                            Skills:{" "}
                            {getSkillsArray(
                              proposal.freelancer?.profile?.skills
                            ).join(", ") || "Not specified"}
                          </div>
                        </div>

                        <div className={styles.clientContact}>
                          <div className={styles.contactItem}>
                            <FaEnvelope className={styles.contactIcon} />
                            <span>Email: {clientInfo.email || "Unknown"}</span>
                          </div>
                          {clientInfo.phone && (
                            <div className={styles.contactItem}>
                              <FaPhone className={styles.contactIcon} />
                              <span>Phone: {clientInfo.phone}</span>
                            </div>
                          )}
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
                              Connects Used: {proposal.totalConnectsUsed || 1}
                            </span>
                          </div>
                          {proposal.hasProject && (
                            <div className={styles.bidItem}>
                              <FaProjectDiagram className={styles.bidIcon} />
                              <span>
                                Project: {proposal.projectStatus || "Active"}
                              </span>
                            </div>
                          )}
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
                  );
                })}
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
              <div className={styles.totalConnects}>
                Total: {stats.totalPlatformConnects}
              </div>
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
                        backgroundColor:
                          item.amount > 0 ? colors.success : colors.error,
                      }}
                    >
                      {item.amount > 0 ? <FaPlus /> : <FaMinus />}
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
          </div>

          {/* Platform Summary */}
          <div className={styles.platformSummary}>
            <div className={styles.sidebarHeader}>
              <FaChartLine />
              <h3>Platform Summary</h3>
            </div>
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Projects:</span>
                <span className={styles.summaryValue}>
                  {stats.totalProjects}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Active Projects:</span>
                <span className={styles.summaryValue}>
                  {stats.activeProjects}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Completed Projects:</span>
                <span className={styles.summaryValue}>
                  {stats.completedProjects}
                </span>
              </div>
  
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>
                  Total Connects Used:
                </span>
                <span className={styles.summaryValue}>
                  {stats.totalPlatformConnects}
                </span>
              </div>
            </div>
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
                      {getClientInfo(selectedProposal).name || "Unknown"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Email:</strong>{" "}
                      {getClientInfo(selectedProposal).email || "Unknown"}
                    </div>
                    {getClientInfo(selectedProposal).phone && (
                      <div className={styles.detailItem}>
                        <strong>Phone:</strong>{" "}
                        {getClientInfo(selectedProposal).phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Freelancer Information */}
                <div className={styles.detailSection}>
                  <h3>
                    <FaUser /> Freelancer Information
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Name:</strong>{" "}
                      {selectedProposal.freelancer?.name || "Unknown"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Email:</strong>{" "}
                      {selectedProposal.freelancer?.email || "Unknown"}
                    </div>
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
                      <strong>Connects Used:</strong>{" "}
                      {selectedProposal.totalConnectsUsed}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Status:</strong>{" "}
                      {getStatusBadge(selectedProposal.status)}
                    </div>
                    {selectedProposal.hasProject && (
                      <div className={styles.detailItem}>
                        <strong>Project Status:</strong>{" "}
                        {selectedProposal.projectStatus}
                      </div>
                    )}
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
