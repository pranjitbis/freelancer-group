"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./WalletRecharge.module.css";
import Banner from "../components/page";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaHistory,
  FaEye,
  FaDownload,
  FaRupeeSign,
  FaDollarSign,
  FaExchangeAlt,
  FaCalculator,
  FaUser,
  FaProjectDiagram,
  FaCalendar,
  FaPlus,
  FaSpinner,
  FaCreditCard,
  FaGlobe,
  FaTimes,
  FaFilter,
  FaSearch,
} from "react-icons/fa";

// Payment Request Card Component
const PaymentRequestCard = ({
  request,
  onRelease,
  onReject,
  actionLoading,
  formatCurrency,
  formatDate,
  type = "pending",
  displayCurrency,
  convertProjectPrice,
  exchangeRate,
}) => {
  const isPending = type === "pending";
  const isApproved = type === "approved";

  const convertedAmount = convertProjectPrice(
    request.amount,
    request.currency || "INR",
    displayCurrency
  );

  return (
    <motion.div
      className={styles.paymentCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className={styles.cardHeader}>
        <h3>{request.projectTitle}</h3>
        <div className={`${styles.status} ${styles[request.status]}`}>
          {request.status}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.freelancerInfo}>
          <div className={styles.avatar}>
            {request.freelancerName?.charAt(0) || "F"}
          </div>
          <div>
            <div className={styles.freelancerName}>
              {request.freelancerName}
            </div>
            <div className={styles.requestDate}>
              Requested: {formatDate(request.createdAt)}
            </div>
          </div>
        </div>

        <div className={styles.paymentDetails}>
          <div className={styles.amount}>{formatCurrency(convertedAmount)}</div>
          {request.dueDate && (
            <div className={styles.dueDate}>
              <FaCalendar />
              Due: {formatDate(request.dueDate)}
            </div>
          )}
        </div>

        <div className={styles.description}>
          <p>{request.description}</p>
        </div>
      </div>

      <div className={styles.cardActions}>
        {isPending && (
          <>
            <button
              className={styles.rejectButton}
              onClick={() => onReject(request.id)}
              disabled={actionLoading === request.id}
            >
              Reject
            </button>
            <button
              className={styles.approveButton}
              onClick={() => onRelease(request.id)}
              disabled={actionLoading === request.id}
            >
              {actionLoading === request.id
                ? "Approving..."
                : "Approve & Release"}
            </button>
          </>
        )}

        {isApproved && (
          <button
            className={styles.releaseButton}
            onClick={() => onRelease(request.id)}
            disabled={actionLoading === request.id}
          >
            {actionLoading === request.id ? "Releasing..." : "Release Payment"}
          </button>
        )}

        <button
          className={styles.messageButton}
          onClick={() =>
            window.open(
              `/client-dashboard/messages?conversation=${request.conversationId}`,
              "_blank"
            )
          }
        >
          <FaEye /> View Chat
        </button>
      </div>
    </motion.div>
  );
};

export default function ClientPayments() {
  const [user, setUser] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeMessage, setRechargeMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(83.5);
  const [displayCurrency, setDisplayCurrency] = useState("INR");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();
  const presetAmounts = {
    INR: [500, 1000, 2000, 5000, 10000, 20000],
    USD: [10, 20, 50, 100, 200, 500],
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      if (userObj.role !== "client") {
        router.push("/unauthorized");
        return;
      }
      fetchClientData(userObj.id);
      loadRazorpayScript();
      fetchExchangeRate();
    }
  }, [router]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();
      setExchangeRate(data.rates.INR || 83.5);
    } catch (error) {
      console.error("Error fetching exchange rate, using default:", error);
      setExchangeRate(83.5);
    }
  };

  const convertProjectPrice = (amount, fromCurrency, toCurrency) => {
    if (!amount || isNaN(amount)) return amount;

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) return amount;

    if (fromCurrency === toCurrency) {
      return numericAmount;
    }

    if (fromCurrency === "USD" && toCurrency === "INR") {
      return numericAmount * exchangeRate;
    } else if (fromCurrency === "INR" && toCurrency === "USD") {
      return numericAmount / exchangeRate;
    }

    return numericAmount;
  };

  const formatCurrency = (amount, curr = displayCurrency) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "-";

    if (curr === "INR") {
      return `₹${numericAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    } else {
      return `$${numericAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  const formatWalletBalance = () => {
    if (displayCurrency === "INR") {
      return `₹${walletBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    } else {
      const usdBalance = walletBalance / exchangeRate;
      return `$${usdBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage("");
    }, 3000);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchClientData = async (userId) => {
    try {
      setLoading(true);
      const [paymentsRes, walletRes, rechargeRes] = await Promise.all([
        fetch(`/api/payments/client?userId=${userId}`),
        fetch(`/api/wallet?userId=${userId}`),
        fetch(`/api/wallet/recharge-history?userId=${userId}`),
      ]);

      const paymentsData = await paymentsRes.json();
      const walletData = await walletRes.json();
      const rechargeData = await rechargeRes.json();

      if (paymentsData.success) {
        setPaymentRequests(paymentsData.pendingRequests || []);
        setPaymentHistory(paymentsData.completedRequests || []);
      }

      if (walletData.success) {
        setWalletBalance(walletData.wallet.balance);
      }

      if (rechargeData.success) {
        setRechargeHistory(rechargeData.rechargeHistory || []);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!user || !user.id) {
      alert("User information not available. Please refresh the page.");
      return;
    }

    if (!rechargeAmount || rechargeAmount < 1) {
      setRechargeMessage(
        `Please enter a valid amount (minimum ${
          currency === "INR" ? "₹1" : "$1"
        })`
      );
      return;
    }

    setRechargeLoading(true);
    setRechargeMessage("");

    try {
      await loadRazorpayScript();

      let amountInSmallestUnit;
      if (currency === "INR") {
        amountInSmallestUnit = Math.round(parseFloat(rechargeAmount) * 100);
      } else {
        amountInSmallestUnit = Math.round(parseFloat(rechargeAmount) * 100);
      }

      const orderResponse = await fetch("/api/payments/client-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInSmallestUnit,
          userId: user.id,
          currency: currency,
          displayAmount: parseFloat(rechargeAmount),
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Freelance Platform",
        description: `Wallet Recharge - ${
          currency === "INR" ? "₹" : "$"
        }${rechargeAmount}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderData.order.amount,
              displayAmount: parseFloat(rechargeAmount),
              userId: user.id,
              currency: currency,
              planType: "wallet_recharge",
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            showSuccessMessage(
              `Payment successful! ${
                currency === "INR" ? "₹" : "$"
              }${rechargeAmount} added to your wallet.`
            );
            setShowRechargeModal(false);
            setRechargeAmount("");
            setSelectedAmount("");
            fetchClientData(user.id);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setRechargeLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setRechargeLoading(false);
    }
  };

  const handlePresetAmount = (presetAmount) => {
    setRechargeAmount(presetAmount.toString());
    setSelectedAmount(presetAmount.toString());
    setRechargeMessage("");
  };

  const handleCustomAmountChange = (value) => {
    setRechargeAmount(value);
    setSelectedAmount("");
    setRechargeMessage("");
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "INR" ? "USD" : "INR"));
    setRechargeAmount("");
    setSelectedAmount("");
    setRechargeMessage("");
  };

  const handleReleasePayment = async (paymentRequestId) => {
    if (!confirm("Are you sure you want to release this payment?")) return;

    setActionLoading(paymentRequestId);
    try {
      const response = await fetch("/api/payments/release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequestId,
          clientId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessMessage("Payment released successfully!");
        fetchClientData(user.id);
      } else {
        alert(data.error || "Failed to release payment");
      }
    } catch (error) {
      console.error("Error releasing payment:", error);
      alert("Failed to release payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async (paymentRequestId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setActionLoading(paymentRequestId);
    try {
      const response = await fetch("/api/payments/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequestId,
          clientId: user.id,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessMessage("Payment request rejected successfully!");
        fetchClientData(user.id);
      } else {
        alert(data.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Failed to reject payment");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter payment requests based on search and status
  const filteredPaymentRequests = paymentRequests.filter((request) => {
    const matchesSearch =
      request.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.freelancerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingRequests = filteredPaymentRequests.filter(
    (req) => req.status === "pending"
  );
  const approvedRequests = filteredPaymentRequests.filter(
    (req) => req.status === "approved"
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading payment requests...</p>
      </div>
    );
  }

  return (
    <>
      <Banner />

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className={styles.successNotification}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className={styles.successContent}>
              <FaCheckCircle className={styles.successIcon} />
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.pageTitle}>Payment Management</h1>
              <p className={styles.pageSubtitle}>
                Manage and release payments to freelancers
              </p>
            </div>

            <div className={styles.headerStats}>
              <div className={styles.walletCard}>
                <div className={styles.walletIconContainer}>
                  <FaMoneyBillWave className={styles.walletIcon} />
                </div>
                <div className={styles.walletInfo}>
                  <span className={styles.walletLabel}>Wallet Balance</span>
                  <div className={styles.walletBalance}>
                    {formatWalletBalance()}
                  </div>
                </div>
              </div>

              <div className={styles.headerActions}>
                {/* Currency Toggle */}
                <div className={styles.currencyToggleContainer}>
                  <span className={styles.currencyLabel}>
                    Display Currency:
                  </span>
                  <div className={styles.currencyToggle}>
                    <button
                      className={`${styles.currencyOption} ${
                        displayCurrency === "INR" ? styles.active : ""
                      }`}
                      onClick={() => setDisplayCurrency("INR")}
                    >
                      <FaRupeeSign className={styles.currencyIcon} />
                      INR
                    </button>
                    <button
                      className={`${styles.currencyOption} ${
                        displayCurrency === "USD" ? styles.active : ""
                      }`}
                      onClick={() => setDisplayCurrency("USD")}
                    >
                      <FaDollarSign className={styles.currencyIcon} />
                      USD
                    </button>
                  </div>
                </div>

                <button
                  className={styles.rechargeBtn}
                  onClick={() => setShowRechargeModal(true)}
                >
                  <FaPlus className={styles.btnIcon} />
                  Recharge Wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaClock />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{pendingRequests.length}</div>
              <div className={styles.statLabel}>Pending Requests</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaCheckCircle />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{approvedRequests.length}</div>
              <div className={styles.statLabel}>Approved</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaHistory />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{paymentHistory.length}</div>
              <div className={styles.statLabel}>Completed</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaCreditCard />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{rechargeHistory.length}</div>
              <div className={styles.statLabel}>Recharges</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by project or freelancer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <FaFilter className={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "pending" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("pending")}
          >
            <FaClock className={styles.tabIcon} />
            <span className={styles.tabText}>Pending Requests</span>
            {pendingRequests.length > 0 && (
              <span className={styles.tabBadge}>{pendingRequests.length}</span>
            )}
          </button>

          <button
            className={`${styles.tab} ${
              activeTab === "approved" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("approved")}
          >
            <FaCheckCircle className={styles.tabIcon} />
            <span className={styles.tabText}>Approved</span>
            {approvedRequests.length > 0 && (
              <span className={styles.tabBadge}>{approvedRequests.length}</span>
            )}
          </button>

          <button
            className={`${styles.tab} ${
              activeTab === "history" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("history")}
          >
            <FaHistory className={styles.tabIcon} />
            <span className={styles.tabText}>Payment History</span>
            {paymentHistory.length > 0 && (
              <span className={styles.tabBadge}>{paymentHistory.length}</span>
            )}
          </button>

          <button
            className={`${styles.tab} ${
              activeTab === "recharge" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("recharge")}
          >
            <FaCreditCard className={styles.tabIcon} />
            <span className={styles.tabText}>Recharge History</span>
            {rechargeHistory.length > 0 && (
              <span className={styles.tabBadge}>{rechargeHistory.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {activeTab === "pending" && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.tabContent}
              >
                {pendingRequests.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaMoneyBillWave className={styles.emptyIcon} />
                    <h3>No Pending Payments</h3>
                    <p>You don't have any pending payment requests</p>
                  </div>
                ) : (
                  <div className={styles.paymentGrid}>
                    {pendingRequests.map((request) => (
                      <PaymentRequestCard
                        key={request.id}
                        request={request}
                        onRelease={handleReleasePayment}
                        onReject={handleRejectPayment}
                        actionLoading={actionLoading}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        type="pending"
                        displayCurrency={displayCurrency}
                        convertProjectPrice={convertProjectPrice}
                        exchangeRate={exchangeRate}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "approved" && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.tabContent}
              >
                {approvedRequests.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaCheckCircle className={styles.emptyIcon} />
                    <h3>No Approved Payments</h3>
                    <p>You don't have any approved payment requests</p>
                  </div>
                ) : (
                  <div className={styles.paymentGrid}>
                    {approvedRequests.map((request) => (
                      <PaymentRequestCard
                        key={request.id}
                        request={request}
                        onRelease={handleReleasePayment}
                        actionLoading={actionLoading}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        type="approved"
                        displayCurrency={displayCurrency}
                        convertProjectPrice={convertProjectPrice}
                        exchangeRate={exchangeRate}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.tabContent}
              >
                {paymentHistory.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaHistory className={styles.emptyIcon} />
                    <h3>No Payment History</h3>
                    <p>Your completed payments will appear here</p>
                  </div>
                ) : (
                  <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Freelancer</th>
                          <th>Project</th>
                          <th>Amount</th>
                          <th>Released Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((request) => {
                          const convertedAmount = convertProjectPrice(
                            request.amount,
                            request.currency || "INR",
                            displayCurrency
                          );

                          return (
                            <tr key={request.id}>
                              <td>
                                <div className={styles.userCell}>
                                  <div className={styles.avatar}>
                                    {request.freelancerName?.charAt(0) || "F"}
                                  </div>
                                  <span>{request.freelancerName}</span>
                                </div>
                              </td>
                              <td>{request.projectTitle}</td>
                              <td className={styles.amountCell}>
                                {formatCurrency(convertedAmount)}
                              </td>
                              <td>{formatDate(request.updatedAt)}</td>
                              <td>
                                <span
                                  className={`${styles.status} ${styles.completed}`}
                                >
                                  Completed
                                </span>
                              </td>
                              <td>
                                <div className={styles.actions}>
                                  <button
                                    className={styles.iconButton}
                                    onClick={() =>
                                      router.push(
                                        `/messages?conversation=${request.conversationId}`
                                      )
                                    }
                                  >
                                    <FaEye />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "recharge" && (
              <motion.div
                key="recharge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.tabContent}
              >
                {rechargeHistory.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FaCreditCard className={styles.emptyIcon} />
                    <h3>No Recharge History</h3>
                    <p>Your wallet recharge history will appear here</p>
                    <button
                      className={styles.rechargeNowBtn}
                      onClick={() => setShowRechargeModal(true)}
                    >
                      <FaPlus /> Recharge Now
                    </button>
                  </div>
                ) : (
                  <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Payment ID</th>
                          <th>Status</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rechargeHistory.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>{formatDate(transaction.createdAt)}</td>
                            <td className={styles.amountCell}>
                              <span className={styles.creditAmount}>
                                +{formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className={styles.paymentId}>
                              {transaction.paymentId
                                ? transaction.paymentId.slice(-8)
                                : "N/A"}
                            </td>
                            <td>
                              <span
                                className={`${styles.status} ${styles.completed}`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                            <td className={styles.description}>
                              {transaction.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recharge Modal */}
        <AnimatePresence>
          {showRechargeModal && (
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRechargeModal(false)}
            >
              <motion.div
                className={styles.rechargeModal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Recharge Wallet</h2>
                  <div className={styles.modalActions}>
                    <div className={styles.currencyToggle}>
                      <button
                        className={`${styles.currencyOption} ${
                          currency === "INR" ? styles.active : ""
                        }`}
                        onClick={() => toggleCurrency()}
                      >
                        <FaRupeeSign className={styles.currencyIcon} />
                        INR
                      </button>
                      <button
                        className={`${styles.currencyOption} ${
                          currency === "USD" ? styles.active : ""
                        }`}
                        onClick={() => toggleCurrency()}
                      >
                        <FaDollarSign className={styles.currencyIcon} />
                        USD
                      </button>
                    </div>
                    <button
                      className={styles.closeButton}
                      onClick={() => setShowRechargeModal(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.userInfo}>
                    <p>
                      Recharging for: <strong>{user?.name}</strong>
                    </p>
                    <p>
                      Current Balance: <strong>{formatWalletBalance()}</strong>
                    </p>
                  </div>

                  <div className={styles.presetAmounts}>
                    <h4>Quick Select ({currency})</h4>
                    <div className={styles.amountGrid}>
                      {presetAmounts[currency].map((preset) => (
                        <button
                          key={preset}
                          className={`${styles.amountButton} ${
                            selectedAmount === preset.toString()
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handlePresetAmount(preset)}
                        >
                          {currency === "INR" ? "₹" : "$"}
                          {preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.customAmount}>
                    <h4>Custom Amount</h4>
                    <div className={styles.amountInput}>
                      {currency === "INR" ? (
                        <FaRupeeSign className={styles.inputIcon} />
                      ) : (
                        <FaDollarSign className={styles.inputIcon} />
                      )}
                      <input
                        type="number"
                        placeholder={`Enter amount in ${currency}`}
                        value={rechargeAmount}
                        onChange={(e) =>
                          handleCustomAmountChange(e.target.value)
                        }
                        min="1"
                        step={currency === "INR" ? "1" : "0.01"}
                      />
                    </div>
                    <p className={styles.minAmount}>
                      Minimum amount: {currency === "INR" ? "₹1" : "$1"}
                    </p>
                  </div>

                  {rechargeMessage && (
                    <p className={styles.errorMessage}>{rechargeMessage}</p>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.payButton}
                    onClick={handleRecharge}
                    disabled={rechargeLoading || !rechargeAmount}
                  >
                    {rechargeLoading ? (
                      <>
                        <FaSpinner className={styles.buttonSpinner} />
                        Processing...
                      </>
                    ) : (
                      `Pay ${currency === "INR" ? "₹" : "$"}${
                        rechargeAmount || 0
                      }`
                    )}
                  </button>

                  <div className={styles.securityNote}>
                    <FaCheckCircle />
                    <span>Secure payment powered by Razorpay</span>
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
