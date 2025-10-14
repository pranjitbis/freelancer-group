"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./WalletRecharge.module.css";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaHistory,
  FaEye,
  FaDownload,
  FaRupeeSign,
  FaUser,
  FaProjectDiagram,
  FaCalendar,
  FaPlus,
  FaSpinner,
  FaCreditCard,
} from "react-icons/fa";

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

  const router = useRouter();
  const presetAmounts = [500, 1000, 2000, 5000, 10000, 20000];

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
    }
  }, [router]);

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

    if (!rechargeAmount || rechargeAmount < 100) {
      setRechargeMessage("Please enter a valid amount (minimum ₹100)");
      return;
    }

    setRechargeLoading(true);
    setRechargeMessage("");

    try {
      await loadRazorpayScript();

      const orderResponse = await fetch("/api/payments/client-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(rechargeAmount),
          userId: user.id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      const paymentDetails = {
        amount: parseFloat(rechargeAmount),
        userId: user.id,
        currency: "INR",
        planType: "wallet_recharge",
      };

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Freelance Platform",
        description: "Wallet Recharge",
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
              amount: paymentDetails.amount,
              userId: paymentDetails.userId,
              currency: paymentDetails.currency,
              planType: paymentDetails.planType,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert(
              `Payment successful! ₹${rechargeAmount} added to your wallet.`
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
          color: "#667eea",
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
        alert("Payment released successfully!");
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
        alert("Payment request rejected!");
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

  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading payment requests...</p>
      </div>
    );
  }

  const pendingRequests = paymentRequests.filter(
    (req) => req.status === "pending"
  );
  const approvedRequests = paymentRequests.filter(
    (req) => req.status === "approved"
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h1>Payment Management</h1>
          <p>Manage and release payments to freelancers</p>
        </div>
        <div className={styles.walletInfo}>
          <div className={styles.walletBalance}>
            <FaMoneyBillWave className={styles.walletIcon} />
            <div>
              <span className={styles.balanceLabel}>Wallet Balance</span>
              <span className={styles.balanceAmount}>
                {formatCurrency(walletBalance)}
              </span>
            </div>
          </div>
          <button
            className={styles.rechargeBtn}
            onClick={() => setShowRechargeModal(true)}
          >
            <FaPlus /> Recharge Wallet
          </button>
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
          <FaClock />
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "approved" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("approved")}
        >
          <FaCheckCircle />
          Approved ({approvedRequests.length})
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "history" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory />
          Payment History ({paymentHistory.length})
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "recharge" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("recharge")}
        >
          <FaCreditCard />
          Recharge History ({rechargeHistory.length})
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
                <div className={styles.historyTable}>
                  <table>
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
                      {paymentHistory.map((request) => (
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
                            {formatCurrency(request.amount)}
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
                                className={styles.viewButton}
                                onClick={() =>
                                  router.push(
                                    `/messages?conversation=${request.conversationId}`
                                  )
                                }
                              >
                                <FaEye />
                              </button>
                              <button
                                className={styles.downloadButton}
                                onClick={() =>
                                  alert("Invoice download coming soon!")
                                }
                              >
                                <FaDownload />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                <div className={styles.rechargeHistory}>
                  <div className={styles.historyTable}>
                    <table>
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
                <button
                  className={styles.closeButton}
                  onClick={() => setShowRechargeModal(false)}
                >
                  &times;
                </button>
              </div>

              <div className={styles.userInfo}>
                <p>
                  Recharging for: <strong>{user?.name}</strong>
                </p>
                <p>
                  Current Balance:{" "}
                  <strong>{formatCurrency(walletBalance)}</strong>
                </p>
              </div>

              <div className={styles.presetAmounts}>
                <h4>Quick Select</h4>
                <div className={styles.amountGrid}>
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      className={`${styles.amountButton} ${
                        selectedAmount === preset.toString()
                          ? styles.selected
                          : ""
                      }`}
                      onClick={() => handlePresetAmount(preset)}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.customAmount}>
                <h4>Custom Amount</h4>
                <div className={styles.amountInput}>
                  <FaRupeeSign className={styles.inputIcon} />
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={rechargeAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min="100"
                    step="100"
                  />
                </div>
                <p className={styles.minAmount}>Minimum amount: ₹100</p>
              </div>

              {rechargeMessage && (
                <p className={styles.errorMessage}>{rechargeMessage}</p>
              )}

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
                  `Pay ₹${rechargeAmount || 0}`
                )}
              </button>

              <div className={styles.securityNote}>
                <FaCheckCircle />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Payment Request Card Component (same as before)
const PaymentRequestCard = ({
  request,
  onRelease,
  onReject,
  actionLoading,
  formatCurrency,
  formatDate,
  type = "pending",
}) => {
  const isPending = type === "pending";
  const isApproved = type === "approved";

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
          <div className={styles.amount}>
            <FaRupeeSign className={styles.currencyIcon} />
            {formatCurrency(request.amount)}
          </div>
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
              `/messages?conversation=${request.conversationId}`,
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
