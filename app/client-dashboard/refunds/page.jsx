"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaFileInvoiceDollar,
  FaPlus,
} from "react-icons/fa";
import styles from "./Refunds.module.css";
import Banner from '../components/page'
export default function ClientRefundsPage() {
  const [user, setUser] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          fetchPaymentRequests(data.user.id);
          fetchRefundHistory(data.user.id);
        } else {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchPaymentRequests = async (userId) => {
    try {
      const response = await fetch(`/api/payment-requests?userId=${userId}&userType=client&status=completed`);
      if (response.ok) {
        const data = await response.json();
        setPaymentRequests(data.paymentRequests || []);
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    }
  };

  const fetchRefundHistory = async (userId) => {
    try {
      const response = await fetch(`/api/refunds?userId=${userId}&userType=client`);
      if (response.ok) {
        const data = await response.json();
        setRefundRequests(data.refunds || []);
      }
    } catch (error) {
      console.error("Error fetching refund history:", error);
    }
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayment || !refundAmount || !reason) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequestId: selectedPayment.id,
          amount: parseFloat(refundAmount),
          reason,
          description,
          clientId: user.id,
          freelancerId: selectedPayment.freelancerId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Refund request submitted successfully!");
        setSelectedPayment(null);
        setRefundAmount("");
        setReason("");
        setDescription("");
        setShowRequestForm(false);
        fetchRefundHistory(user.id);
      } else {
        alert(result.error || "Failed to submit refund request");
      }
    } catch (error) {
      console.error("Refund request error:", error);
      alert("Failed to submit refund request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: styles.pending, text: "Pending", icon: FaExclamationTriangle },
      approved: { class: styles.approved, text: "Approved", icon: FaCheckCircle },
      rejected: { class: styles.rejected, text: "Rejected", icon: FaTimesCircle },
      processed: { class: styles.processed, text: "Processed", icon: FaCheckCircle },
      cancelled: { class: styles.cancelled, text: "Cancelled", icon: FaTimesCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`${styles.statusBadge} ${config.class}`}>
        <IconComponent />
        {config.text}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Banner />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <h1>Refund Management</h1>
            <p>Request and track refunds for your payments</p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className={styles.newRequestButton}
          >
            <FaPlus />
            New Refund Request
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {refundRequests.filter(r => r.status === "pending").length}
            </span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {refundRequests.filter(r => r.status === "approved").length}
            </span>
            <span className={styles.statLabel}>Approved</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {refundRequests.filter(r => r.status === "processed").length}
            </span>
            <span className={styles.statLabel}>Processed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{refundRequests.length}</span>
            <span className={styles.statLabel}>Total Requests</span>
          </div>
        </div>

        {/* Refund History */}
        <div className={styles.historySection}>
          <div className={styles.card}>
            <h2>Refund History</h2>
            
            {refundRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <FaHistory className={styles.emptyIcon} />
                <h4>No refund requests yet</h4>
                <p>Your refund requests will appear here once submitted</p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className={styles.createFirstButton}
                >
                  <FaFileInvoiceDollar />
                  Create Your First Refund Request
                </button>
              </div>
            ) : (
              <div className={styles.refundsList}>
                {refundRequests.map((refund) => (
                  <div key={refund.id} className={styles.refundItem}>
                    <div className={styles.refundHeader}>
                      <div className={styles.refundInfo}>
                        <h4>{refund.paymentRequest?.projectTitle || "Project"}</h4>
                        <p>{refund.paymentRequest?.description}</p>
                        <div className={styles.freelancerInfo}>
                          <span>Freelancer: {refund.freelancer?.name}</span>
                        </div>
                      </div>
                      <div className={styles.refundMeta}>
                        <div className={styles.amount}>
                          {refund.paymentRequest?.currency === "INR" ? "₹" : "$"}
                          {refund.amount}
                        </div>
                        {getStatusBadge(refund.status)}
                      </div>
                    </div>
                    
                    <div className={styles.refundDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Reason:</span>
                        <span className={styles.detailValue}>{refund.reason}</span>
                      </div>
                      {refund.description && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Details:</span>
                          <span className={styles.detailValue}>{refund.description}</span>
                        </div>
                      )}
                      {refund.adminNotes && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Admin Notes:</span>
                          <span className={styles.detailValue}>{refund.adminNotes}</span>
                        </div>
                      )}
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Submitted:</span>
                        <span className={styles.detailValue}>
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {refund.updatedAt !== refund.createdAt && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Last Updated:</span>
                          <span className={styles.detailValue}>
                            {new Date(refund.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Refund Request Modal */}
        {showRequestForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>New Refund Request</h2>
                <button
                  onClick={() => {
                    setShowRequestForm(false);
                    setSelectedPayment(null);
                    setRefundAmount("");
                    setReason("");
                    setDescription("");
                  }}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                {/* Payment Selection */}
                <div className={styles.section}>
                  <h3>Select Payment</h3>
                  <div className={styles.paymentGrid}>
                    {paymentRequests.map((payment) => (
                      <div
                        key={payment.id}
                        className={`${styles.paymentCard} ${
                          selectedPayment?.id === payment.id ? styles.selected : ""
                        }`}
                        onClick={() => {
                          setSelectedPayment(payment);
                          setRefundAmount(payment.amount.toString());
                        }}
                      >
                        <div className={styles.paymentInfo}>
                          <h4>{payment.projectTitle || "Project"}</h4>
                          <p>{payment.description}</p>
                          <div className={styles.paymentDetails}>
                            <span className={styles.amount}>
                              {payment.currency === "INR" ? "₹" : "$"}
                              {payment.amount}
                            </span>
                            <span className={styles.freelancer}>
                              To: {payment.freelancer?.name}
                            </span>
                          </div>
                          <div className={styles.date}>
                            Paid on: {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {paymentRequests.length === 0 && (
                    <div className={styles.emptyState}>
                      <FaMoneyBillWave className={styles.emptyIcon} />
                      <h4>No completed payments found</h4>
                      <p>You need to have completed payments to request refunds</p>
                    </div>
                  )}
                </div>

                {/* Refund Form */}
                {selectedPayment && (
                  <form onSubmit={handleSubmitRefund} className={styles.refundForm}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="refundAmount">Refund Amount *</label>
                        <div className={styles.amountInput}>
                          <span className={styles.currencySymbol}>
                            {selectedPayment.currency === "INR" ? "₹" : "$"}
                          </span>
                          <input
                            type="number"
                            id="refundAmount"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            max={selectedPayment.amount}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <small>Maximum: {selectedPayment.currency === "INR" ? "₹" : "$"}{selectedPayment.amount}</small>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="reason">Reason for Refund *</label>
                        <select
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                        >
                          <option value="">Select a reason</option>
                          <option value="poor_quality">Poor Quality Work</option>
                          <option value="not_delivered">Work Not Delivered</option>
                          <option value="late_delivery">Late Delivery</option>
                          <option value="not_as_described">Not as Described</option>
                          <option value="duplicate_payment">Duplicate Payment</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="description">Additional Details</label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        placeholder="Please provide any additional details about your refund request..."
                      />
                    </div>

                    <div className={styles.formActions}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRequestForm(false);
                          setSelectedPayment(null);
                          setRefundAmount("");
                          setReason("");
                          setDescription("");
                        }}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className={styles.spinner}></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaFileInvoiceDollar />
                            Submit Refund Request
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}