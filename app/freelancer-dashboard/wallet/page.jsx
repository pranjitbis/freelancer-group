"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FreelancerWallet.module.css";
import Banner from "../components/page";
import {
  FaWallet,
  FaMoneyBillWave,
  FaHistory,
  FaPlus,
  FaUniversity,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaSpinner,
  FaSync,
  FaExclamationTriangle,
  FaInfoCircle,
  FaShieldAlt,
  FaRocket,
  FaAward,
  FaRupeeSign,
  FaDollarSign,
} from "react-icons/fa";

// Currency conversion utility
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const data = await response.json();
    const rate = data.rates[toCurrency];

    if (!rate) {
      throw new Error(`Exchange rate for ${toCurrency} not found`);
    }

    return amount * rate;
  } catch (error) {
    console.error("Currency conversion error:", error);
    // Fallback to a hardcoded rate if API fails
    const fallbackRates = {
      "USD-INR": 83.0,
      "INR-USD": 0.012,
    };

    const fallbackKey = `${fromCurrency}-${toCurrency}`;
    if (fallbackRates[fallbackKey]) {
      return amount * fallbackRates[fallbackKey];
    }

    return amount; // Return original amount if conversion fails
  }
};

// Currency formatting utility
const formatCurrency = (amount, currency = "INR") => {
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
const getCurrencySymbol = (currency = "INR") => {
  return currency === "INR" ? "₹" : "$";
};

// Get currency icon component
const getCurrencyIcon = (currency = "INR") => {
  return currency === "INR" ? FaRupeeSign : FaDollarSign;
};

export default function FreelancerWallet() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({
    balance: 0,
    transactions: [],
    bankDetails: [],
    payoutRequests: [],
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [currency, setCurrency] = useState("INR"); // Default currency
  const [convertedBalance, setConvertedBalance] = useState(0);

  const hasSyncedRef = useRef(false);

  // Bank form state
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    ifscCode: "",
    branch: "",
  });

  // Payout form state
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    bankDetailId: "",
    description: "",
  });

  // Constants for testing
  const MINIMUM_PAYOUT_AMOUNT = {
    INR: 10.0,
    USD: 0.12, // Approximately $0.12 for testing
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      initializeWallet(userObj.id);
    }
  }, []);

  // Update converted balance when currency changes
  useEffect(() => {
    const updateConvertedBalance = async () => {
      if (wallet.balance > 0) {
        const converted = await convertCurrency(
          wallet.balance,
          "INR",
          currency
        );
        setConvertedBalance(converted);
      } else {
        setConvertedBalance(0);
      }
    };
    updateConvertedBalance();
  }, [currency, wallet.balance]);

  // Initialize wallet and auto-sync payments
  const initializeWallet = async (userId) => {
    try {
      setLoading(true);
      clearMessages();

      // First, fetch the wallet data
      await fetchWalletData(userId);

      // Then auto-sync payments (but only once per session)
      if (!hasSyncedRef.current) {
        await autoSyncPayments(userId);
        hasSyncedRef.current = true;
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
      setError("Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-sync payments without user interaction
  const autoSyncPayments = async (userId) => {
    try {
      setSyncing(true);
      const response = await fetch("/api/freelancer/sync-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          autoSync: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync payments: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.syncedCount > 0) {
        await fetchWalletData(userId);
        setLastSync(new Date());
        setSuccess(`Auto-synced ${data.syncedCount} new payments`);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error auto-syncing payments:", error);
    } finally {
      setSyncing(false);
    }
  };

  // Manual sync function
  const manualSyncPayments = async () => {
    if (!user?.id) return;

    try {
      setSyncing(true);
      clearMessages();
      const response = await fetch("/api/freelancer/sync-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          autoSync: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync payments: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (data.syncedCount > 0) {
          const convertedAmount = await convertCurrency(
            data.totalAmount,
            "INR",
            currency
          );
          setSuccess(
            `Successfully synced ${
              data.syncedCount
            } payments worth ${formatCurrency(convertedAmount, currency)}!`
          );
          await fetchWalletData(user.id);
        } else {
          setSuccess("No new payments found to sync.");
        }
        setLastSync(new Date());
      } else {
        throw new Error(data.error || "Failed to sync payments");
      }
    } catch (error) {
      console.error("Error syncing payments:", error);
      setError("Failed to sync payments. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const fetchWalletData = async (userId) => {
    try {
      const response = await fetch(`/api/freelancer/wallet?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet data: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setWallet(data.wallet);
        // Initialize converted balance
        const converted = await convertCurrency(
          data.wallet.balance,
          "INR",
          currency
        );
        setConvertedBalance(converted);
      } else {
        throw new Error(data.error || "Failed to fetch wallet data");
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      throw error;
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      clearMessages();
      const response = await fetch("/api/freelancer/bank-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bankForm,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add bank details: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(
          "Bank details added successfully! Waiting for verification."
        );
        setShowAddBank(false);
        setBankForm({
          bankName: "",
          accountNumber: "",
          accountHolder: "",
          ifscCode: "",
          branch: "",
        });
        await fetchWalletData(user.id);
      } else {
        throw new Error(data.error || "Failed to add bank details");
      }
    } catch (error) {
      console.error("Error adding bank details:", error);
      setError("Failed to add bank details. Please try again.");
    }
  };

  const handlePayoutRequest = async (e) => {
    e.preventDefault();

    const currentMinAmount = MINIMUM_PAYOUT_AMOUNT[currency];
    const currentBalance =
      currency === "INR" ? wallet.balance : convertedBalance;

    if (parseFloat(payoutForm.amount) > currentBalance) {
      setError("Insufficient balance for this payout");
      return;
    }

    if (parseFloat(payoutForm.amount) < currentMinAmount) {
      setError(
        `Minimum payout amount is ${formatCurrency(currentMinAmount, currency)}`
      );
      return;
    }

    try {
      clearMessages();

      // Convert amount back to INR for backend processing
      let amountInINR = parseFloat(payoutForm.amount);
      if (currency === "USD") {
        amountInINR = await convertCurrency(amountInINR, "USD", "INR");
      }

      const response = await fetch("/api/freelancer/payout-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payoutForm,
          amount: amountInINR,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit payout request: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Payout request submitted successfully!");
        setShowPayout(false);
        setPayoutForm({
          amount: "",
          bankDetailId: "",
          description: "",
        });
        await fetchWalletData(user.id);
      } else {
        throw new Error(data.error || "Failed to submit payout request");
      }
    } catch (error) {
      console.error("Error submitting payout request:", error);
      setError("Failed to submit payout request. Please try again.");
    }
  };

  const getCurrentBalance = () => {
    return currency === "INR" ? wallet.balance : convertedBalance;
  };

  const getMinimumPayoutAmount = () => {
    return MINIMUM_PAYOUT_AMOUNT[currency];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(ddiffInSeconds / 86400)} days ago`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f59e0b", label: "Pending" },
      approved: { color: "#10b981", label: "Approved" },
      completed: { color: "#3b82f6", label: "Completed" },
      rejected: { color: "#ef4444", label: "Rejected" },
      credited: { color: "#10b981", label: "Credited" },
    };

    const config = statusConfig[status] || { color: "#6b7280", label: status };

    return (
      <span
        className={styles.statusBadge}
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    );
  };

  // Check if payout button should be enabled
  const isPayoutEnabled = () => {
    const hasVerifiedBanks =
      wallet.bankDetails?.some((bank) => bank.isVerified) || false;
    const currentBalance = getCurrentBalance();
    const currentMinAmount = getMinimumPayoutAmount();
    const hasSufficientBalance = currentBalance >= currentMinAmount;
    return hasVerifiedBanks && hasSufficientBalance;
  };

  // Currency toggle handler
  const handleCurrencyToggle = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const CurrencyIcon = getCurrencyIcon(currency);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={() => setError("")} className={styles.closeError}>
            &times;
          </button>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className={styles.successBanner}>
          <FaCheckCircle />
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className={styles.closeSuccess}
          >
            &times;
          </button>
        </div>
      )}

      <Banner />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerTop}>
            <div className={styles.headerText}>
              <h1>Financial Dashboard</h1>
              <p>Track your earnings and manage payouts</p>
            </div>
            <div className={styles.currencyToggleContainer}>
              <label className={styles.currencyLabel}>Display Currency:</label>
              <div className={styles.currencyToggle}>
                <button
                  type="button"
                  className={`${styles.currencyOption} ${
                    currency === "INR" ? styles.currencyOptionActive : ""
                  }`}
                  onClick={() => handleCurrencyToggle("INR")}
                >
                  <FaRupeeSign className={styles.currencyOptionIcon} />
                  INR
                </button>
                <button
                  type="button"
                  className={`${styles.currencyOption} ${
                    currency === "USD" ? styles.currencyOptionActive : ""
                  }`}
                  onClick={() => handleCurrencyToggle("USD")}
                >
                  <FaDollarSign className={styles.currencyOptionIcon} />
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.balanceCard}>
          <div className={styles.balanceHeader}>
            <div className={styles.balanceTitle}>
              <FaWallet className={styles.walletIcon} />
              <div>
                <span className={styles.balanceLabel}>Available Balance</span>
                <div className={styles.balanceAmount}>
                  {showBalance ? (
                    formatCurrency(getCurrentBalance(), currency)
                  ) : (
                    <span className={styles.hiddenBalance}>••••••</span>
                  )}
                  <button
                    type="button"
                    className={styles.toggleBalance}
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.balanceActions}>
            <button
              type="button"
              className={styles.payoutButton}
              onClick={() => setShowPayout(true)}
              disabled={!isPayoutEnabled()}
            >
              <FaMoneyBillWave className={styles.buttonIcon} />
              Request Payout
            </button>
            {!isPayoutEnabled() && (
              <p className={styles.warningText}>
                {getCurrentBalance() < getMinimumPayoutAmount()
                  ? `Minimum balance required: ${formatCurrency(
                      getMinimumPayoutAmount(),
                      currency
                    )}`
                  : "Add verified bank details to request payout"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "overview" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <FaWallet className={styles.tabIcon} />
          Overview
        </button>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "transactions" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          <FaHistory className={styles.tabIcon} />
          Transactions ({wallet.transactions?.length || 0})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "bank" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("bank")}
        >
          <FaUniversity className={styles.tabIcon} />
          Bank Details ({wallet.bankDetails?.length || 0})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === "payouts" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("payouts")}
        >
          <FaMoneyBillWave className={styles.tabIcon} />
          Payout Requests ({wallet.payoutRequests?.length || 0})
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.tabContent}
            >
              <div className={styles.overviewGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CurrencyIcon />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>
                      {formatCurrency(getCurrentBalance(), currency)}
                    </span>
                    <span className={styles.statLabel}>Available Balance</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FaMoneyBillWave />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>
                      {wallet.payoutRequests?.filter(
                        (p) => p.status === "pending"
                      ).length || 0}
                    </span>
                    <span className={styles.statLabel}>Pending Payouts</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FaUniversity />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>
                      {wallet.bankDetails?.filter((b) => b.isVerified).length ||
                        0}
                    </span>
                    <span className={styles.statLabel}>Verified Banks</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FaHistory />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>
                      {wallet.transactions?.length || 0}
                    </span>
                    <span className={styles.statLabel}>Total Transactions</span>
                  </div>
                </div>
              </div>

              <div className={styles.quickActions}>
                <h3>Quick Actions</h3>
                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => setShowAddBank(true)}
                  >
                    <FaPlus className={styles.buttonIcon} />
                    Add Bank Account
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => setShowPayout(true)}
                    disabled={!isPayoutEnabled()}
                  >
                    <FaMoneyBillWave className={styles.buttonIcon} />
                    Request Payout
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={manualSyncPayments}
                    disabled={syncing}
                  >
                    <FaSync className={styles.buttonIcon} />
                    {syncing ? "Syncing..." : "Sync Payments"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tab contents remain the same */}
          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.tabContent}
            >
              <div className={styles.transactionHeader}>
                <h3>Transaction History</h3>
                <div className={styles.transactionInfo}>
                  <span>Last sync: {formatTimeAgo(lastSync)}</span>
                  <button
                    type="button"
                    className={styles.syncNowButton}
                    onClick={manualSyncPayments}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <FaSpinner className={styles.spinner} />
                    ) : (
                      <FaSync className={styles.buttonIcon} />
                    )}
                    {syncing ? "Syncing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {wallet.transactions && wallet.transactions.length > 0 ? (
                <div className={styles.transactionList}>
                  {wallet.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={styles.transactionItem}
                    >
                      <div className={styles.transactionMain}>
                        <div className={styles.transactionType}>
                          <div
                            className={`${styles.typeIcon} ${
                              transaction.type === "credit"
                                ? styles.credit
                                : styles.debit
                            }`}
                          >
                            {transaction.type === "credit" ? (
                              <FaPlus />
                            ) : (
                              <FaMoneyBillWave />
                            )}
                          </div>
                          <div className={styles.transactionDetails}>
                            <span className={styles.transactionDesc}>
                              {transaction.description}
                            </span>
                            <span className={styles.transactionDate}>
                              {formatDate(transaction.createdAt)}
                            </span>
                            <div className={styles.transactionStatus}>
                              {getStatusBadge(transaction.status)}
                              {transaction.adminNotes && (
                                <span className={styles.adminNotes}>
                                  Note: {transaction.adminNotes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`${styles.transactionAmount} ${
                            transaction.type === "credit"
                              ? styles.credit
                              : styles.debit
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount, "INR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <FaHistory className={styles.emptyIcon} />
                  <h3>No Transactions Yet</h3>
                  <p>
                    Your transaction history will appear here once you receive
                    payments
                  </p>
                  <p className={styles.syncHint}>
                    Payments are automatically synced. If you're expecting
                    payments, they should appear shortly.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "bank" && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.tabContent}
            >
              <div className={styles.bankHeader}>
                <h3>Bank Accounts</h3>
                <button
                  type="button"
                  className={styles.addBankButton}
                  onClick={() => setShowAddBank(true)}
                >
                  <FaPlus className={styles.buttonIcon} /> Add Bank Account
                </button>
              </div>

              {wallet.bankDetails && wallet.bankDetails.length > 0 ? (
                <div className={styles.bankList}>
                  {wallet.bankDetails.map((bank) => (
                    <div key={bank.id} className={styles.bankCard}>
                      <div className={styles.bankInfo}>
                        <div className={styles.bankIcon}>
                          <FaUniversity />
                        </div>
                        <div className={styles.bankDetails}>
                          <h4>{bank.bankName}</h4>
                          <p>Account: ••••{bank.accountNumber.slice(-4)}</p>
                          <p>Holder: {bank.accountHolder}</p>
                          <p>IFSC: {bank.ifscCode}</p>
                          <p>Branch: {bank.branch}</p>
                        </div>
                      </div>
                      <div className={styles.bankStatus}>
                        {bank.isVerified ? (
                          <span className={styles.verified}>
                            <FaCheckCircle className={styles.statusIcon} />{" "}
                            Verified
                          </span>
                        ) : (
                          <span className={styles.pending}>
                            <FaSpinner className={styles.statusIcon} /> Pending
                            Verification
                          </span>
                        )}
                        {bank.isActive && (
                          <span className={styles.default}>Default</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <FaUniversity className={styles.emptyIcon} />
                  <h3>No Bank Accounts</h3>
                  <p>Add your bank account to receive payments</p>
                  <button
                    type="button"
                    className={styles.addBankButton}
                    onClick={() => setShowAddBank(true)}
                  >
                    <FaPlus className={styles.buttonIcon} /> Add Bank Account
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "payouts" && (
            <motion.div
              key="payouts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.tabContent}
            >
              <div className={styles.payoutHeader}>
                <h3>Payout Requests</h3>
                <button
                  type="button"
                  className={styles.requestPayoutButton}
                  onClick={() => setShowPayout(true)}
                  disabled={!isPayoutEnabled()}
                >
                  <FaMoneyBillWave className={styles.buttonIcon} /> Request
                  Payout
                </button>
              </div>

              {wallet.payoutRequests && wallet.payoutRequests.length > 0 ? (
                <div className={styles.payoutList}>
                  {wallet.payoutRequests.map((request) => (
                    <div key={request.id} className={styles.payoutCard}>
                      <div className={styles.payoutMain}>
                        <div className={styles.payoutAmount}>
                          {formatCurrency(request.amount, "INR")}
                        </div>
                        <div className={styles.payoutDetails}>
                          <p className={styles.payoutDescription}>
                            {request.description || "Payout Request"}
                          </p>
                          <span className={styles.payoutDate}>
                            {formatDate(request.createdAt)}
                          </span>
                          {request.bankDetail && (
                            <span className={styles.bankInfo}>
                              {request.bankDetail.bankName} ••••
                              {request.bankDetail.accountNumber.slice(-4)}
                            </span>
                          )}
                          <div className={styles.payoutStatusInfo}>
                            {getStatusBadge(request.status)}
                            {request.adminNotes && (
                              <span className={styles.adminNotes}>
                                Admin: {request.adminNotes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <FaMoneyBillWave className={styles.emptyIcon} />
                  <h3>No Payout Requests</h3>
                  <p>Your payout requests will appear here</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals remain the same */}
      <AnimatePresence>
        {showAddBank && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddBank(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Add Bank Account</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setShowAddBank(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddBank} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, bankName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        accountNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    value={bankForm.accountHolder}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        accountHolder: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, ifscCode: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Branch</label>
                  <input
                    type="text"
                    value={bankForm.branch}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, branch: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowAddBank(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Add Bank Account
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayout && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPayout(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Request Payout</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setShowPayout(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handlePayoutRequest} className={styles.modalForm}>
                <div className={styles.currencyDisplay}>
                  <span>Currency: {currency}</span>
                </div>
                <div className={styles.formGroup}>
                  <label>
                    Amount (Minimum:{" "}
                    {formatCurrency(getMinimumPayoutAmount(), currency)})
                  </label>
                  <input
                    type="number"
                    value={payoutForm.amount}
                    onChange={(e) =>
                      setPayoutForm({ ...payoutForm, amount: e.target.value })
                    }
                    min={getMinimumPayoutAmount()}
                    max={getCurrentBalance()}
                    step="0.01"
                    required
                  />
                  <p className={styles.availableBalance}>
                    Available: {formatCurrency(getCurrentBalance(), currency)}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label>Bank Account</label>
                  <select
                    value={payoutForm.bankDetailId}
                    onChange={(e) =>
                      setPayoutForm({
                        ...payoutForm,
                        bankDetailId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Bank Account</option>
                    {wallet.bankDetails
                      .filter((bank) => bank.isVerified)
                      .map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bankName} - ••••{bank.accountNumber.slice(-4)}
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Description (Optional)</label>
                  <textarea
                    value={payoutForm.description}
                    onChange={(e) =>
                      setPayoutForm({
                        ...payoutForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Add any notes about this payout request"
                    rows="3"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowPayout(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={
                      !payoutForm.amount ||
                      parseFloat(payoutForm.amount) <
                        getMinimumPayoutAmount() ||
                      parseFloat(payoutForm.amount) > getCurrentBalance() ||
                      !payoutForm.bankDetailId
                    }
                  >
                    Request Payout
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
