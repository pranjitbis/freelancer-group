"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaUser,
  FaCalendar,
  FaFileAlt,
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaHistory,
  FaBriefcase,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaMoneyBillWave,
  FaRupeeSign,
  FaEllipsisV,
  FaChartLine,
  FaCreditCard,
  FaPaperPlane,
} from "react-icons/fa";
import styles from "./ProjectManagement.module.css";

// Currency formatting utility
const formatCurrency = (amount, currency = "USD") => {
  if (!amount && amount !== 0) return "-";

  const formatter = new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  return formatter.format(amount);
};

// Get currency symbol
const getCurrencySymbol = (currency = "USD") => {
  return currency === "INR" ? "₹" : "$";
};

// Get currency icon
const getCurrencyIcon = (currency = "USD") => {
  return currency === "INR" ? FaRupeeSign : FaDollarSign;
};

export default function ProjectManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currency, setCurrency] = useState("USD");

  // Filters
  const [projectFilter, setProjectFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [paymentData, setPaymentData] = useState({
    amount: "",
    description: "",
    dueDate: "",
  });

  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setCurrency(currentUser.currency || "USD");
      if (activeTab === "projects") {
        fetchFreelancerProjects(currentUser.id);
      } else {
        fetchPaymentRequests(currentUser.id);
      }
    }
  }, [currentUser, activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.role !== "freelancer") {
            router.push("/unauthorized");
          }
        }
      } else {
        console.error("Failed to verify user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchFreelancerProjects = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/freelancer?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProjects(data.projects || []);
        }
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentRequests = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/payment-requests?userId=${userId}&userType=freelancer`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentRequests(data.paymentRequests || []);
        }
      } else {
        console.error("Failed to fetch payment requests");
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProject = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    const pendingPayments =
      project?.paymentRequests?.filter(
        (req) => req.status === "pending" || req.status === "approved"
      ) || [];

    if (pendingPayments.length > 0) {
      const paymentList = pendingPayments
        .map(
          (p) =>
            `- ${formatCurrency(p.amount, currency)}: ${p.description} (${
              p.status
            })`
        )
        .join("\n");

      const shouldForce = confirm(
        `This project has pending payments. Are you sure you want to mark it as completed?\n\nPending Payments:\n${paymentList}\n\nClick OK to complete anyway, or Cancel to wait for payments.`
      );

      if (!shouldForce) return;
    } else {
      if (
        !confirm(
          "Are you sure you want to mark this project as completed? This action cannot be undone."
        )
      ) {
        return;
      }
    }

    setActionLoading(projectId);
    try {
      const response = await fetch("/api/projects/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          freelancerId: currentUser.id,
          forceComplete: pendingPayments.length > 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, status: "completed" } : p
          )
        );
        alert(data.message);
      } else {
        if (data.pendingPayments) {
          const paymentList = data.pendingPayments
            .map(
              (p) =>
                `- ${formatCurrency(p.amount, currency)}: ${p.description} (${
                  p.status
                })`
            )
            .join("\n");

          alert(
            `Cannot complete project. Please ensure all payments are released by the client:\n\n${paymentList}`
          );
        } else {
          alert(data.error || "Failed to complete project");
        }
      }
    } catch (error) {
      console.error("Error completing project:", error);
      alert("Failed to complete project");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePaymentRequest = async (project) => {
    setSelectedProject(project);
    setPaymentData({
      amount: "",
      description: `Payment for ${project.title}`,
      dueDate: "",
    });
    setShowPaymentModal(true);
  };

  const submitPaymentRequest = async () => {
    if (!paymentData.amount || !selectedProject) return;

    try {
      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedProject.conversationId,
          freelancerId: currentUser.id,
          clientId: selectedProject.clientId,
          amount: parseFloat(paymentData.amount),
          description: paymentData.description,
          dueDate: paymentData.dueDate || null,
          currency: currency,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment request sent successfully!");
        setShowPaymentModal(false);
        setSelectedProject(null);
        setPaymentData({ amount: "", description: "", dueDate: "" });
        // Refresh both projects and payment requests
        fetchFreelancerProjects(currentUser.id);
        if (activeTab === "payments") {
          fetchPaymentRequests(currentUser.id);
        }
      } else {
        alert(data.error || "Failed to create payment request");
      }
    } catch (error) {
      console.error("Error creating payment request:", error);
      alert("Failed to create payment request");
    }
  };

  const updateCurrencyPreference = async (newCurrency) => {
    try {
      const response = await fetch("/api/users/currency", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          currency: newCurrency,
        }),
      });

      if (response.ok) {
        setCurrency(newCurrency);
        // Update current user state
        setCurrentUser((prev) => ({ ...prev, currency: newCurrency }));
      } else {
        console.error("Failed to update currency preference");
      }
    } catch (error) {
      console.error("Error updating currency preference:", error);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (projectFilter !== "all" && project.status !== projectFilter)
      return false;
    if (
      searchTerm &&
      !project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !project.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Filter payment requests
  const filteredPaymentRequests = paymentRequests.filter((request) => {
    if (paymentFilter !== "all" && request.status !== paymentFilter)
      return false;
    if (
      searchTerm &&
      !request.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !request.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusBadge = (status, type = "project") => {
    const statusConfig = {
      project: {
        active: {
          color: "#10b981",
          label: "Active",
          bgColor: "#ecfdf5",
          icon: FaClock,
        },
        completed: {
          color: "#3b82f6",
          label: "Completed",
          bgColor: "#eff6ff",
          icon: FaCheckCircle,
        },
        cancelled: {
          color: "#ef4444",
          label: "Cancelled",
          bgColor: "#fef2f2",
          icon: FaTimes,
        },
      },
      payment: {
        pending: {
          color: "#f59e0b",
          label: "Pending",
          bgColor: "#fffbeb",
          icon: FaClock,
        },
        approved: {
          color: "#10b981",
          label: "Approved",
          bgColor: "#ecfdf5",
          icon: FaCheckCircle,
        },
        completed: {
          color: "#3b82f6",
          label: "Completed",
          bgColor: "#eff6ff",
          icon: FaCheck,
        },
        rejected: {
          color: "#ef4444",
          label: "Rejected",
          bgColor: "#fef2f2",
          icon: FaTimes,
        },
        failed: {
          color: "#dc2626",
          label: "Failed",
          bgColor: "#fef2f2",
          icon: FaExclamationTriangle,
        },
      },
    };

    const config = statusConfig[type][status] || {
      color: "#6b7280",
      label: status,
      bgColor: "#f9fafb",
      icon: FaExclamationTriangle,
    };
    const IconComponent = config.icon;

    return (
      <span
        className={styles.statusBadge}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          borderColor: config.color,
        }}
      >
        <IconComponent />
        {config.label}
      </span>
    );
  };

  const getStats = () => {
    const projectStats = {
      active: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "completed").length,
      total: projects.length,
      totalEarned: projects.reduce((sum, p) => sum + (p.totalPaid || 0), 0),
    };

    const paymentStats = {
      pending: paymentRequests.filter((p) => p.status === "pending").length,
      approved: paymentRequests.filter((p) => p.status === "approved").length,
      completed: paymentRequests.filter((p) => p.status === "completed").length,
      total: paymentRequests.length,
      totalAmount: paymentRequests.reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    return { projectStats, paymentStats };
  };

  const { projectStats, paymentStats } = getStats();
  const CurrencyIcon = getCurrencyIcon(currency);

  if (loading && !projects.length && !paymentRequests.length) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading project management...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Project Management</h1>
            <p className={styles.pageSubtitle}>
              Manage your projects, track progress, and handle payments
            </p>
          </div>

          <div className={styles.headerControls}>
            <div className={styles.currencySelector}>
              <label className={styles.currencyLabel}>Display Currency:</label>
              <select
                value={currency}
                onChange={(e) => updateCurrencyPreference(e.target.value)}
                className={styles.currencySelect}
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaBriefcase />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{projectStats.total}</div>
              <div className={styles.statLabel}>Total Projects</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaMoneyBillWave />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{paymentStats.total}</div>
              <div className={styles.statLabel}>Payment Requests</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaChartLine />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {formatCurrency(projectStats.totalEarned, currency)}
              </div>
              <div className={styles.statLabel}>Total Earned</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaCheckCircle />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{projectStats.completed}</div>
              <div className={styles.statLabel}>Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.navigationSection}>
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${
              activeTab === "projects" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("projects")}
          >
            <FaBriefcase className={styles.tabIcon} />
            <span className={styles.tabText}>Projects</span>
            <span className={styles.tabBadge}>{projectStats.total}</span>
          </button>

          <button
            className={`${styles.tab} ${
              activeTab === "payments" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("payments")}
          >
            <FaCreditCard className={styles.tabIcon} />
            <span className={styles.tabText}>Payment History</span>
            <span className={styles.tabBadge}>{paymentStats.total}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder={`Search ${
                activeTab === "projects" ? "projects" : "payment requests"
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterContainer}>
            <FaFilter className={styles.filterIcon} />
            <select
              value={activeTab === "projects" ? projectFilter : paymentFilter}
              onChange={(e) =>
                activeTab === "projects"
                  ? setProjectFilter(e.target.value)
                  : setPaymentFilter(e.target.value)
              }
              className={styles.filterSelect}
            >
              <option value="all">
                All {activeTab === "projects" ? "Projects" : "Status"}
              </option>
              {activeTab === "projects" ? (
                <>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <AnimatePresence mode="wait">
          {activeTab === "projects" ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.contentSection}
            >
              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaBriefcase className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No projects found</h3>
                  <p className={styles.emptyDescription}>
                    {searchTerm || projectFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "You don't have any projects yet"}
                  </p>
                </div>
              ) : (
                <div className={styles.projectsGrid}>
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                      getStatusBadge={getStatusBadge}
                      onCompleteProject={handleCompleteProject}
                      onCreatePayment={handleCreatePaymentRequest}
                      actionLoading={actionLoading}
                      router={router}
                      currency={currency}
                      CurrencyIcon={CurrencyIcon}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.contentSection}
            >
              {/* Payment Requests Table */}
              {filteredPaymentRequests.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaCreditCard className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>
                    No payment requests found
                  </h3>
                  <p className={styles.emptyDescription}>
                    {searchTerm || paymentFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "You haven't created any payment requests yet"}
                  </p>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead className={styles.tableHeader}>
                        <tr>
                          <th className={styles.tableHeaderCell}>Project</th>
                          <th className={styles.tableHeaderCell}>Client</th>
                          <th className={styles.tableHeaderCell}>Amount</th>
                          <th className={styles.tableHeaderCell}>Status</th>
                          <th className={styles.tableHeaderCell}>
                            Request Date
                          </th>
                          <th className={styles.tableHeaderCell}>Due Date</th>
                          <th className={styles.tableHeaderCell}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={styles.tableBody}>
                        {filteredPaymentRequests.map((request, index) => (
                          <PaymentRequestRow
                            key={request.id}
                            request={request}
                            index={index}
                            getStatusBadge={getStatusBadge}
                            router={router}
                            currency={currency}
                            formatCurrency={formatCurrency}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Request Modal */}
      <PaymentRequestModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedProject={selectedProject}
        paymentData={paymentData}
        setPaymentData={setPaymentData}
        onSubmit={submitPaymentRequest}
        currency={currency}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

// Project Card Component
const ProjectCard = ({
  project,
  index,
  getStatusBadge,
  onCompleteProject,
  onCreatePayment,
  actionLoading,
  router,
  currency,
  CurrencyIcon,
  formatCurrency,
}) => (
  <motion.div
    className={styles.projectCard}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <div className={styles.cardHeader}>
      <div className={styles.projectTitleSection}>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        {getStatusBadge(project.status, "project")}
      </div>
      <button className={styles.cardMenu}>
        <FaEllipsisV />
      </button>
    </div>

    <div className={styles.cardContent}>
      {/* Client Info */}
      <div className={styles.clientSection}>
        <div className={styles.clientAvatar}>
          {project.client?.name?.charAt(0).toUpperCase() || "C"}
        </div>
        <div className={styles.clientInfo}>
          <div className={styles.clientName}>
            {project.client?.name || "Client"}
          </div>
          <div className={styles.clientEmail}>
            {project.client?.email || ""}
          </div>
          {project.client?.avgRating > 0 && (
            <div className={styles.clientRating}>
              ⭐ {project.client.avgRating} ({project.client.reviewCount}{" "}
              reviews)
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className={styles.projectDetails}>
        <div className={styles.detailItem}>
          <CurrencyIcon className={styles.detailIcon} />
          <span className={styles.detailText}>
            Budget: {formatCurrency(project.budget, currency)}
          </span>
        </div>
        <div className={styles.detailItem}>
          <FaUser className={styles.detailIcon} />
          <span className={styles.detailText}>
            Client: {project.client?.name || "Client"}
          </span>
        </div>
        <div className={styles.detailItem}>
          <FaCalendar className={styles.detailIcon} />
          <span className={styles.detailText}>
            Started: {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Project Progress</span>
          <span className={styles.progressPercentage}>
            {project.progress || 0}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
        <div className={styles.progressText}>
          {formatCurrency(project.totalPaid || 0, currency)} paid of{" "}
          {formatCurrency(project.budget, currency)}
          {(project.pendingPayments || 0) > 0 && (
            <span className={styles.pendingText}>
              ({formatCurrency(project.pendingPayments, currency)} pending)
            </span>
          )}
        </div>
      </div>

      {/* Payment Requests */}
      {project.paymentRequests && project.paymentRequests.length > 0 && (
        <div className={styles.paymentRequests}>
          <h4 className={styles.paymentRequestsTitle}>
            Recent Payment Requests
          </h4>
          {project.paymentRequests.slice(0, 2).map((request) => (
            <div key={request.id} className={styles.paymentRequestItem}>
              <div className={styles.paymentAmount}>
                {formatCurrency(request.amount, request.currency || currency)}
                <span
                  className={`${styles.paymentStatus} ${
                    styles[`status-${request.status}`]
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <div className={styles.paymentDate}>
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {project.paymentRequests.length > 2 && (
            <div className={styles.morePayments}>
              +{project.paymentRequests.length - 2} more requests
            </div>
          )}
        </div>
      )}
    </div>

    <div className={styles.cardActions}>
      {project.status === "active" && (
        <>
          <motion.button
            onClick={() => onCreatePayment(project)}
            className={styles.actionButtonPrimary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaPlus className={styles.buttonIcon} />
            Request Payment
          </motion.button>

          <motion.button
            onClick={() => onCompleteProject(project.id)}
            disabled={actionLoading === project.id}
            className={styles.actionButtonSecondary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {actionLoading === project.id ? (
              <FaSpinner className={styles.actionSpinner} />
            ) : (
              <FaCheckCircle className={styles.buttonIcon} />
            )}
            Mark Complete
          </motion.button>
        </>
      )}

      <button
        onClick={() =>
          router.push(`/messages?conversation=${project.conversationId}`)
        }
        className={styles.actionButtonTertiary}
      >
        <FaPaperPlane className={styles.buttonIcon} />
        View Messages
      </button>
    </div>
  </motion.div>
);

// Payment Request Row Component
const PaymentRequestRow = ({
  request,
  index,
  getStatusBadge,
  router,
  currency,
  formatCurrency,
}) => {
  const requestCurrency = request.currency || currency;
  const CurrencyIcon = getCurrencyIcon(requestCurrency);

  return (
    <motion.tr
      className={styles.tableRow}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <td className={styles.tableCell}>
        <div className={styles.projectTitleCell}>
          {request.projectTitle || "Project"}
        </div>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.clientCell}>
          <div className={styles.clientAvatarSmall}>
            {request.clientName?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <span className={styles.clientNameText}>
            {request.clientName || "Client"}
          </span>
        </div>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.amountCell}>
          <CurrencyIcon className={styles.currencyIcon} />
          <span className={styles.amountText}>
            {formatCurrency(request.amount, requestCurrency)}
          </span>
        </div>
      </td>
      <td className={styles.tableCell}>
        {getStatusBadge(request.status, "payment")}
      </td>
      <td className={styles.tableCell}>
        <div className={styles.dateCell}>
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.dateCell}>
          {request.dueDate
            ? new Date(request.dueDate).toLocaleDateString()
            : "Not set"}
        </div>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.actionCells}>
          <button
            onClick={() =>
              router.push(`/messages?conversation=${request.conversationId}`)
            }
            className={styles.iconButton}
            title="View Conversation"
          >
            <FaEye />
          </button>
          <button
            className={styles.iconButton}
            title="Download Invoice"
            onClick={() => alert("Invoice download feature coming soon!")}
          >
            <FaDownload />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// Payment Request Modal Component
const PaymentRequestModal = ({
  show,
  onClose,
  selectedProject,
  paymentData,
  setPaymentData,
  onSubmit,
  currency,
  formatCurrency,
}) => {
  if (!show) return null;

  const CurrencyIcon = getCurrencyIcon(currency);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modalContainer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create Payment Request</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {selectedProject && (
            <div className={styles.projectInfo}>
              <h4 className={styles.projectInfoTitle}>Project Details</h4>
              <div className={styles.projectInfoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Project:</span>
                  <span className={styles.infoValue}>
                    {selectedProject.title}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Client:</span>
                  <span className={styles.infoValue}>
                    {selectedProject.client?.name || "Client"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Remaining Budget:</span>
                  <span className={styles.infoValue}>
                    {formatCurrency(
                      selectedProject.budget - (selectedProject.totalPaid || 0),
                      currency
                    )}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Currency:</span>
                  <span className={styles.infoValue}>{currency}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Amount ({getCurrencySymbol(currency)})
              </label>
              <div className={styles.amountInputWrapper}>
                <CurrencyIcon className={styles.amountInputIcon} />
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className={styles.amountInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                value={paymentData.description}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe what this payment is for..."
                rows="3"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Due Date (Optional)</label>
              <input
                type="date"
                value={paymentData.dueDate}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, dueDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                className={styles.dateInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={styles.submitButton}
            disabled={
              !paymentData.amount || parseFloat(paymentData.amount) <= 0
            }
          >
            <FaPaperPlane className={styles.submitIcon} />
            Send Payment Request
          </button>
        </div>
      </motion.div>
    </div>
  );
};
