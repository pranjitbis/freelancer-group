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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(83.5);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [converterAmount, setConverterAmount] = useState("");
  const [converterFrom, setConverterFrom] = useState("INR");
  const [converterTo, setConverterTo] = useState("USD");
  const [converterResult, setConverterResult] = useState("");
  const [converterLoading, setConverterLoading] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState("INR"); // For displaying project prices

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

  useEffect(() => {
    if (rechargeAmount && !isNaN(rechargeAmount)) {
      const amount = parseFloat(rechargeAmount);
      if (currency === "USD") {
        setConvertedAmount(amount * exchangeRate);
      } else {
        setConvertedAmount(amount / exchangeRate);
      }
    } else {
      setConvertedAmount(0);
    }
  }, [rechargeAmount, currency, exchangeRate]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();
      setExchangeRate(data.rates.INR || 83.5);
    } catch (error) {
      console.error("Error fetching exchange rate, using default:", error);
      try {
        const fallbackResponse = await fetch(
          "https://api.frankfurter.app/latest?from=USD&to=INR"
        );
        const fallbackData = await fallbackResponse.json();
        setExchangeRate(fallbackData.rates.INR || 83.5);
      } catch (fallbackError) {
        console.error("Fallback API also failed, using default rate");
        setExchangeRate(83.5);
      }
    }
  };

  const convertCurrency = async (amount, from, to) => {
    if (!amount || isNaN(amount)) return "";

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) return "";

    setConverterLoading(true);
    try {
      let rate;

      if (from === to) {
        return numericAmount.toFixed(2);
      }

      if (from === "USD" && to === "INR") {
        rate = exchangeRate;
      } else if (from === "INR" && to === "USD") {
        rate = 1 / exchangeRate;
      } else {
        const response = await fetch(
          `https://api.frankfurter.app/latest?from=${from}&to=${to}`
        );
        const data = await response.json();
        rate = data.rates[to];
      }

      const result = (numericAmount * rate).toFixed(2);
      setConverterLoading(false);
      return result;
    } catch (error) {
      console.error("Error converting currency:", error);
      let result;
      if (from === "USD" && to === "INR") {
        result = (numericAmount * exchangeRate).toFixed(2);
      } else if (from === "INR" && to === "USD") {
        result = (numericAmount / exchangeRate).toFixed(2);
      } else {
        result = numericAmount.toFixed(2);
      }
      setConverterLoading(false);
      return result;
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

  // FIXED: Format currency function with proper symbols
  const formatCurrency = (amount, curr = displayCurrency) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    if (curr === "INR") {
      return `${numericAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    } else {
      return `${numericAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  // FIXED: Wallet balance display function
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

  // FIXED: Get equivalent balance
  const getEquivalentBalance = () => {
    if (displayCurrency === "INR") {
      const usdBalance = walletBalance / exchangeRate;
      return `${usdBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else {
      return `${walletBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
  };

  const handleConverterChange = async (value, from, to) => {
    setConverterAmount(value);

    if (!value || isNaN(value)) {
      setConverterResult("");
      return;
    }

    const result = await convertCurrency(value, from, to);
    setConverterResult(result);
  };

  const swapCurrencies = () => {
    setConverterFrom(converterTo);
    setConverterTo(converterFrom);
    setConverterAmount(converterResult);
    setConverterResult(converterAmount);
  };

  const toggleDisplayCurrency = () => {
    setDisplayCurrency((prev) => (prev === "INR" ? "USD" : "INR"));
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
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <h1>Payment Management</h1>
            <p>Manage and release payments to freelancers</p>
          </div>
          <div className={styles.walletInfo}>
            {/* FIXED: Wallet Balance Display */}
            <div className={styles.walletBalance}>
              <FaMoneyBillWave className={styles.walletIcon} />
              <div className={styles.balanceContainer}>
                <span className={styles.balanceLabel}>Wallet Balance</span>
                <div className={styles.balanceMain}>
                  <span className={styles.balanceAmount}>
                    {formatWalletBalance()}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              {/* Project Price Converter Toggle */}
              <div className={styles.priceConverterToggle}>
                <span className={styles.converterLabel}>Show prices in:</span>
                <button
                  className={styles.currencyDisplayToggle}
                  onClick={toggleDisplayCurrency}
                >
                  <FaExchangeAlt className={styles.exchangeIcon} />
                  {displayCurrency}
                  <FaGlobe className={styles.globeIcon} />
                </button>
              </div>

              <button
                className={styles.rechargeBtn}
                onClick={() => setShowRechargeModal(true)}
              >
                <FaPlus /> Recharge Wallet
              </button>
            </div>
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
                  <div className={styles.historyTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Freelancer</th>
                          <th>Project</th>
                          <th>
                            <div className={styles.amountHeader}>
                              Amount
                              <button
                                className={styles.tableCurrencyToggle}
                                onClick={toggleDisplayCurrency}
                                title={`Show in ${
                                  displayCurrency === "INR" ? "USD" : "INR"
                                }`}
                              >
                                <FaExchangeAlt />
                              </button>
                            </div>
                          </th>
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
                                <div className={styles.amountWithConversion}>
                                  <span className={styles.mainAmount}>
                                    {formatCurrency(convertedAmount)}
                                  </span>
                                  {displayCurrency !==
                                    (request.currency || "INR") && (
                                    <span className={styles.originalAmount}>
                                      {request.currency === "USD" ? "$" : "₹"}
                                      {request.amount}
                                    </span>
                                  )}
                                </div>
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
                  <div className={styles.currencyToggleContainer}>
                    <button
                      className={styles.currencyToggle}
                      onClick={toggleCurrency}
                    >
                      <FaExchangeAlt className={styles.exchangeIcon} />
                      {currency} <FaGlobe className={styles.globeIcon} />
                    </button>
                  </div>
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
                    Current Balance: <strong>{formatWalletBalance()}</strong>
                  </p>
                </div>

                {/* Currency Conversion Display */}
                {rechargeAmount && !isNaN(rechargeAmount) && (
                  <div className={styles.conversionDisplay}>
                    <div className={styles.conversionRate}>
                      <FaExchangeAlt className={styles.conversionIcon} />
                      <span>1 USD = {exchangeRate.toFixed(2)} INR</span>
                    </div>
                  </div>
                )}

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
                        {preset}
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
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Updated Payment Request Card Component with Price Conversion
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

  // Convert the project price to display currency
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
          <div className={styles.amountWithConversion}>
            <div className={styles.mainAmount}>
              {displayCurrency === "USD" ? (
                <FaDollarSign className={styles.currencyIcon} />
              ) : (
                <FaRupeeSign className={styles.currencyIcon} />
              )}
              {formatCurrency(convertedAmount, displayCurrency)}
            </div>
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
