"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Banner from "../components/page";
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

// Simple currency conversion utility - BACKEND AMOUNTS ARE IN INR
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount && amount !== 0) return 0;
  if (fromCurrency === toCurrency) return amount;

  // Ensure amount is a number
  const numericAmount =
    typeof amount === "number" ? amount : parseFloat(amount) || 0;

  // Simple conversion rates
  const conversionRates = {
    "INR-USD": 0.012, // 1 INR = 0.012 USD
    "USD-INR": 83.33, // 1 USD = 83.33 INR
  };

  const conversionKey = `${fromCurrency}-${toCurrency}`;

  if (conversionRates[conversionKey]) {
    const converted = numericAmount * conversionRates[conversionKey];
    return converted;
  }

  return numericAmount;
};

// Currency formatting utility with proper decimal handling
const formatCurrency = (amount, currency = "INR") => {
  if (!amount && amount !== 0) return "-";

  // Ensure amount is a number
  const numericAmount =
    typeof amount === "number" ? amount : parseFloat(amount) || 0;

  try {
    // For USD, show 2 decimal places. For INR, show 0 decimal places
    const options =
      currency === "INR"
        ? {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }
        : {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          };

    const formatter = new Intl.NumberFormat(
      currency === "INR" ? "en-IN" : "en-US",
      options
    );

    return formatter.format(numericAmount);
  } catch (error) {
    // Fallback formatting
    const symbol = currency === "INR" ? "₹" : "$";
    if (currency === "INR") {
      return `${symbol}${Math.round(numericAmount).toLocaleString()}`;
    } else {
      return `${symbol}${numericAmount.toFixed(2)}`;
    }
  }
};

// Get currency symbol
const getCurrencySymbol = (currency = "INR") => {
  return currency === "INR" ? "₹" : "$";
};

// Get currency icon
const getCurrencyIcon = (currency = "INR") => {
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
  const [currency, setCurrency] = useState("INR");

  // Store converted amounts
  const [convertedAmounts, setConvertedAmounts] = useState({
    projects: {},
    paymentRequests: {},
    totals: {},
  });

  // Filters
  const [projectFilter, setProjectFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [paymentData, setPaymentData] = useState({
    amount: "",
    description: "",
    dueDate: "",
    currency: "INR",
  });

  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userCurrency = currentUser.currency || "INR";
      setCurrency(userCurrency);
      fetchFreelancerProjects(currentUser.id);
      fetchPaymentRequests(currentUser.id);
    }
  }, [currentUser]);

  // Update converted amounts when currency changes
  useEffect(() => {
    if (projects.length > 0) {
      updateConvertedAmounts();
    }
  }, [currency, projects.length]);

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
        } else {
          console.error("User verification failed");
          router.push("/auth/login");
        }
      } else {
        console.error("Failed to verify user");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/auth/login");
    }
  };

  const fetchFreelancerProjects = async (userId) => {
    try {
      setLoading(true);
      console.log("🔄 Fetching projects for user:", userId);

      const response = await fetch(`/api/projects/freelancer?userId=${userId}`);
      console.log("📊 Projects API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Projects API response data:", data);

        if (data.success) {
          const projectsData = data.projects || [];
          console.log("✅ Loaded projects:", projectsData.length);
          setProjects(projectsData);
          updateConvertedAmounts(projectsData);
        } else {
          console.error("❌ Projects API returned error:", data.error);
          setProjects([]);
        }
      } else {
        console.error("❌ Failed to fetch projects, status:", response.status);
        setProjects([]);
      }
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentRequests = async (userId) => {
    try {
      const response = await fetch(
        `/api/payment-requests?userId=${userId}&userType=freelancer`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const paymentRequestsData = data.paymentRequests || [];
          setPaymentRequests(paymentRequestsData);
          convertPaymentRequestAmounts(paymentRequestsData);
        }
      } else {
        console.error("Failed to fetch payment requests");
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    }
  };

  const updateConvertedAmounts = (projectsData = projects) => {
    if (!projectsData || projectsData.length === 0) {
      console.log("No projects data to convert");
      return;
    }

    try {
      const convertedProjects = {};
      const totals = {
        totalEarned: 0,
        totalBudget: 0,
      };

      for (const project of projectsData) {
        // Convert all amounts from INR to target currency
        const convertedBudget = convertCurrency(
          project.budget || 0,
          "INR",
          currency
        );
        const convertedTotalPaid = convertCurrency(
          project.totalPaid || 0,
          "INR",
          currency
        );
        const convertedPendingPayments = convertCurrency(
          project.pendingPayments || 0,
          "INR",
          currency
        );

        convertedProjects[project.id] = {
          budget: convertedBudget,
          totalPaid: convertedTotalPaid,
          pendingPayments: convertedPendingPayments,
        };

        totals.totalEarned += convertedTotalPaid;
        totals.totalBudget += convertedBudget;
      }

      console.log(
        "✅ Updated converted amounts for",
        Object.keys(convertedProjects).length,
        "projects"
      );
      setConvertedAmounts((prev) => ({
        ...prev,
        projects: convertedProjects,
        totals,
      }));
    } catch (error) {
      console.error("Error updating converted amounts:", error);
    }
  };

  const convertPaymentRequestAmounts = (
    paymentRequestsData = paymentRequests
  ) => {
    if (!paymentRequestsData || paymentRequestsData.length === 0) return;

    try {
      const convertedPayments = {};

      for (const payment of paymentRequestsData) {
        const convertedAmount = convertCurrency(
          payment.amount || 0,
          "INR",
          currency
        );
        convertedPayments[payment.id] = {
          amount: convertedAmount,
        };
      }

      setConvertedAmounts((prev) => ({
        ...prev,
        paymentRequests: convertedPayments,
      }));
    } catch (error) {
      console.error("Error converting payment request amounts:", error);
    }
  };

  const getConvertedProjectAmount = (projectId, field) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      console.log(`Project ${projectId} not found`);
      return 0;
    }

    const originalAmount = project[field] || 0;
    const converted = convertedAmounts.projects[projectId];

    // If we have converted amount, use it
    if (converted?.[field] !== undefined) {
      return converted[field];
    }

    // If no conversion available but currency is INR, return original
    if (currency === "INR") {
      return originalAmount;
    }

    // If USD but no conversion, do quick conversion
    return convertCurrency(originalAmount, "INR", currency);
  };

  const getConvertedPaymentAmount = (paymentId) => {
    const payment = paymentRequests.find((p) => p.id === paymentId);
    const originalAmount = payment?.amount || 0;
    const converted = convertedAmounts.paymentRequests[paymentId];

    if (converted?.amount !== undefined) {
      return converted.amount;
    }

    if (currency === "INR") {
      return originalAmount;
    }

    return convertCurrency(originalAmount, "INR", currency);
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
      console.log("🔄 Completing project:", {
        projectId,
        userId: currentUser.id,
        userType: "FREELANCER",
        forceComplete: pendingPayments.length > 0,
      });

      const response = await fetch("/api/projects/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectId,
          userId: currentUser.id, // Changed from freelancerId to userId
          userType: "FREELANCER", // Added userType
          forceComplete: pendingPayments.length > 0,
        }),
      });

      const data = await response.json();
      console.log("📊 Complete project response:", data);

      if (response.ok && data.success) {
        // Update the project status in state
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  reviewStatus: "pending_reviews",
                }
              : p
          )
        );

        alert(data.message || "Project marked as completed successfully!");

        // Refresh the data to get updated project information
        await fetchFreelancerProjects(currentUser.id);
      } else {
        console.error("❌ Failed to complete project:", data);

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
          alert(data.error || "Failed to complete project. Please try again.");
        }
      }
    } catch (error) {
      console.error("❌ Error completing project:", error);
      alert("Failed to complete project. Please try again.");
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
      currency: currency,
    });
    setShowPaymentModal(true);
  };

  const submitPaymentRequest = async () => {
    if (!paymentData.amount || !selectedProject) return;

    try {
      // Convert the entered amount to INR for backend storage
      let amountInINR = parseFloat(paymentData.amount);

      // If user entered amount in USD, convert to INR for backend
      if (paymentData.currency === "USD") {
        amountInINR = convertCurrency(amountInINR, "USD", "INR");
      }

      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedProject.conversationId,
          freelancerId: currentUser.id,
          clientId: selectedProject.clientId,
          amount: amountInINR,
          description: paymentData.description,
          dueDate: paymentData.dueDate || null,
          currency: "INR",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment request sent successfully!");
        setShowPaymentModal(false);
        setSelectedProject(null);
        setPaymentData({
          amount: "",
          description: "",
          dueDate: "",
          currency: currency,
        });
        // Refresh data
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

  const updateCurrencyPreference = (newCurrency) => {
    console.log(`Changing currency from ${currency} to ${newCurrency}`);
    setCurrency(newCurrency);
    // Update current user state
    setCurrentUser((prev) => ({ ...prev, currency: newCurrency }));
    // Convert all amounts to new currency
    updateConvertedAmounts();
    convertPaymentRequestAmounts();
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (projectFilter !== "all" && project.status !== projectFilter)
      return false;
    if (
      searchTerm &&
      !project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const totalEarned = projects.reduce((sum, p) => {
      const convertedAmount = getConvertedProjectAmount(p.id, "totalPaid");
      return sum + convertedAmount;
    }, 0);

    const totalBudget = projects.reduce((sum, p) => {
      const convertedAmount = getConvertedProjectAmount(p.id, "budget");
      return sum + convertedAmount;
    }, 0);

    const projectStats = {
      active: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "completed").length,
      total: projects.length,
      totalEarned: totalEarned,
      totalBudget: totalBudget,
    };

    const paymentStats = {
      pending: paymentRequests.filter((p) => p.status === "pending").length,
      approved: paymentRequests.filter((p) => p.status === "approved").length,
      completed: paymentRequests.filter((p) => p.status === "completed").length,
      total: paymentRequests.length,
      totalAmount: paymentRequests.reduce((sum, p) => {
        const convertedAmount = getConvertedPaymentAmount(p.id);
        return sum + convertedAmount;
      }, 0),
    };

    return { projectStats, paymentStats };
  };

  const { projectStats, paymentStats } = getStats();
  const CurrencyIcon = getCurrencyIcon(currency);

  // Currency Toggle Component
  const CurrencyToggle = () => (
    <div className={styles.currencyToggle}>
      <button
        className={`${styles.currencyOption} ${
          currency === "INR" ? styles.active : ""
        }`}
        onClick={() => updateCurrencyPreference("INR")}
      >
        <FaRupeeSign className={styles.currencyIcon} />
        INR
      </button>
      <button
        className={`${styles.currencyOption} ${
          currency === "USD" ? styles.active : ""
        }`}
        onClick={() => updateCurrencyPreference("USD")}
      >
        <FaDollarSign className={styles.currencyIcon} />
        USD
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading project management...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Banner />

      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Project Management</h1>
            <p className={styles.pageSubtitle}>
              Manage your projects, track progress, and handle payments
            </p>
          </div>

          <div className={styles.headerControls}>
            <div className={styles.currencySection}>
              <span className={styles.currencyLabel}>Display Currency:</span>
              <CurrencyToggle />
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
                  <h3 className={styles.emptyTitle}>
                    {loading ? "Loading projects..." : "No projects found"}
                  </h3>
                  <p className={styles.emptyDescription}>
                    {searchTerm || projectFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "You don't have any projects yet. Start by accepting proposals from clients!"}
                  </p>
                  {!loading && !searchTerm && projectFilter === "all" && (
                    <button
                      onClick={() =>
                        router.push("/freelancer-dashboard/proposals")
                      }
                      className={styles.findWorkButton}
                    >
                      View Proposals
                    </button>
                  )}
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
                      getConvertedAmount={getConvertedProjectAmount}
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
                            getConvertedAmount={getConvertedPaymentAmount}
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
      {showPaymentModal && (
        <PaymentRequestModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedProject={selectedProject}
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          onSubmit={submitPaymentRequest}
          currency={currency}
          formatCurrency={formatCurrency}
          getConvertedAmount={getConvertedProjectAmount}
        />
      )}
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
  getConvertedAmount,
}) => {
  const convertedBudget = getConvertedAmount(project.id, "budget");
  const convertedTotalPaid = getConvertedAmount(project.id, "totalPaid");
  const convertedPendingPayments = getConvertedAmount(
    project.id,
    "pendingPayments"
  );

  return (
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
            {project.client?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div className={styles.clientInfo}>
            <div className={styles.clientName}>
              {project.client?.name || "Client"}
            </div>
            <div className={styles.clientEmail}>
              {project.client?.email || ""}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className={styles.projectDetails}>
          <div className={styles.detailItem}>
            <CurrencyIcon className={styles.detailIcon} />
            <span className={styles.detailText}>
              Budget: {formatCurrency(convertedBudget, currency)}
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
            {formatCurrency(convertedTotalPaid, currency)} paid of{" "}
            {formatCurrency(convertedBudget, currency)}
            {convertedPendingPayments > 0 && (
              <span className={styles.pendingText}>
                ({formatCurrency(convertedPendingPayments, currency)} pending)
              </span>
            )}
          </div>
        </div>
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
            router.push(
              `/freelancer-dashboard/messages?conversation=${project.conversationId}`
            )
          }
          className={styles.actionButtonTertiary}
        >
          <FaPaperPlane className={styles.buttonIcon} />
          View Messages
        </button>
      </div>
    </motion.div>
  );
};

// Payment Request Row Component
const PaymentRequestRow = ({
  request,
  index,
  getStatusBadge,
  router,
  currency,
  formatCurrency,
  getConvertedAmount,
}) => {
  const convertedAmount = getConvertedAmount(request.id);
  const CurrencyIcon = getCurrencyIcon(currency);

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
            {formatCurrency(convertedAmount, currency)}
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
  getConvertedAmount,
}) => {
  if (!show) return null;

  const CurrencyIcon = getCurrencyIcon(paymentData.currency);
  const convertedBudget = selectedProject
    ? getConvertedAmount(selectedProject.id, "budget")
    : 0;
  const convertedTotalPaid = selectedProject
    ? getConvertedAmount(selectedProject.id, "totalPaid")
    : 0;
  const remainingBudget = convertedBudget - convertedTotalPaid;

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
                    {formatCurrency(remainingBudget, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formSection}>
            {/* Currency Toggle */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Request Currency</label>
              <div className={styles.currencyToggle}>
                <button
                  type="button"
                  className={`${styles.currencyOption} ${
                    paymentData.currency === "INR"
                      ? styles.currencyOptionActive
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentData({ ...paymentData, currency: "INR" })
                  }
                >
                  <FaRupeeSign className={styles.currencyOptionIcon} />
                  <span>INR (₹)</span>
                </button>
                <button
                  type="button"
                  className={`${styles.currencyOption} ${
                    paymentData.currency === "USD"
                      ? styles.currencyOptionActive
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentData({ ...paymentData, currency: "USD" })
                  }
                >
                  <FaDollarSign className={styles.currencyOptionIcon} />
                  <span>USD ($)</span>
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Amount ({getCurrencySymbol(paymentData.currency)})
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
                  max={remainingBudget}
                  className={styles.amountInput}
                />
              </div>
              {remainingBudget > 0 && (
                <div className={styles.amountHint}>
                  Available: {formatCurrency(remainingBudget, currency)}
                </div>
              )}
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
              !paymentData.amount ||
              parseFloat(paymentData.amount) <= 0 ||
              parseFloat(paymentData.amount) > remainingBudget
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
