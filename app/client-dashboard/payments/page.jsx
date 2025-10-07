"use client";
import { useState, useEffect } from "react";
import styles from "./WalletRecharge.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWallet,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaPlus,
  FaRupeeSign,
} from "react-icons/fa";

export default function WalletRecharge() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [amountmessage, setAmountmessage] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);

  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchWalletBalance(userObj.id);
      loadRazorpayScript();
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if script is already loaded
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

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await fetch(`/api/wallet?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleRecharge = async () => {
    // Check if user is available
    if (!user || !user.id) {
      alert("User information not available. Please refresh the page.");
      return;
    }

    if (!amount || amount < 10) {
      setAmountmessage("Please enter a valid amount (minimum ₹10)");
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script if not already loaded
      await loadRazorpayScript();

      // Create order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          userId: user.id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Freelance Platform",
        description: "Wallet Recharge",
        order_id: orderData.order.id,
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert(`Payment successful! ₹${amount} added to your wallet.`);
            setWallet((prev) => ({
              ...prev,
              balance: verifyData.walletBalance,
            }));
            setShowRecharge(false);
            setAmount("");
            setSelectedAmount("");
            fetchWalletBalance(user.id); // Refresh transactions
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
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetAmount = (presetAmount) => {
    setAmount(presetAmount.toString());
    setSelectedAmount(presetAmount.toString());
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

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading wallet information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Wallet Balance Card */}
      <motion.div
        className={styles.walletCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.walletHeader}>
          <div className={styles.walletInfo}>
            <FaWallet className={styles.walletIcon} />
            <div>
              <h3>Wallet Balance</h3>
              <p>Available funds for projects</p>
            </div>
          </div>
          <button
            className={styles.rechargeButton}
            onClick={() => setShowRecharge(true)}
          >
            <FaPlus /> Recharge
          </button>
        </div>

        <div className={styles.balance}>
          <FaRupeeSign className={styles.rupeeIcon} />
          <span className={styles.balanceAmount}>
            {wallet.balance.toFixed(2)}
          </span>
        </div>
      </motion.div>

      {/* Quick Recharge Modal */}
      <AnimatePresence>
        {showRecharge && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRecharge(false)}
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
                  onClick={() => setShowRecharge(false)}
                >
                  &times;
                </button>
              </div>

              <div className={styles.userInfo}>
                <p>
                  Recharging for: <strong>{user.name}</strong>
                </p>
                <p>
                  Email: <strong>{user.email}</strong>
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
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedAmount("");
                    }}
                    min="10"
                    step="10"
                  />
                </div>
                <p className={styles.minAmount}>Minimum amount: ₹10</p>
              </div>

              <button
                className={styles.payButton}
                onClick={handleRecharge}
                disabled={loading || !amount}
              >
                {loading ? "Processing..." : `Pay ₹${amount || 0}`}
              </button>
              <p className={styles.memimomaount}>{amountmessage}</p>
              <div className={styles.securityNote}>
                <FaCheckCircle />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction History */}
      <motion.div
        className={styles.transactionSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.sectionHeader}>
          <FaHistory className={styles.sectionIcon} />
          <h3>Recent Transactions</h3>
        </div>

        {wallet.transactions && wallet.transactions.length > 0 ? (
          <div className={styles.transactionList}>
            {wallet.transactions.map((transaction) => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div className={styles.transactionInfo}>
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
                        <FaTimesCircle />
                      )}
                    </div>
                    <div>
                      <span className={styles.transactionDesc}>
                        {transaction.description}
                      </span>
                      <span className={styles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`${styles.transactionAmount} ${
                      transaction.type === "credit"
                        ? styles.credit
                        : styles.debit
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount}
                  </div>
                </div>
                <div
                  className={`${styles.status} ${
                    transaction.status === "completed"
                      ? styles.completed
                      : transaction.status === "pending"
                      ? styles.pending
                      : styles.failed
                  }`}
                >
                  {transaction.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noTransactions}>
            <p>No transactions yet</p>
            <span>Your transaction history will appear here</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
