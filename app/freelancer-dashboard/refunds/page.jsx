"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Banner from "../components/page"
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaEye,
} from "react-icons/fa";
import styles from "./Refunds.module.css";

export default function FreelancerRefundsPage() {
  const [user, setUser] = useState(null);
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
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
          fetchRefundRequests(data.user.id);
        } else {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchRefundRequests = async (userId) => {
    try {
      const response = await fetch(`/api/refunds?userId=${userId}&userType=freelancer`);
      if (response.ok) {
        const data = await response.json();
        setRefundRequests(data.refunds || []);
      }
    } catch (error) {
      console.error("Error fetching refund requests:", error);
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading refund requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Banner />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Refund Requests</h1>
          <p>Manage refund requests from clients</p>
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
            <span className={styles.statLabel}>Total</span>
          </div>
        </div>

        {/* Refunds List */}
        <div className={styles.refundsSection}>
          <div className={styles.card}>
            <h2>Refund Requests</h2>
            
            {refundRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <FaMoneyBillWave className={styles.emptyIcon} />
                <h4>No refund requests</h4>
                <p>You don't have any refund requests at the moment</p>
              </div>
            ) : (
              <div className={styles.refundsList}>
                {refundRequests.map((refund) => (
                  <div key={refund.id} className={styles.refundItem}>
                    <div className={styles.refundHeader}>
                      <div className={styles.refundInfo}>
                        <h4>{refund.paymentRequest?.projectTitle || "Project"}</h4>
                        <p>{refund.paymentRequest?.description}</p>
                        <div className={styles.clientInfo}>
                          <span>From: {refund.client?.name}</span>
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
                        <span className={styles.detailLabel}>Requested:</span>
                        <span className={styles.detailValue}>
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.refundActions}>
                      <button
                        onClick={() => setSelectedRefund(refund)}
                        className={styles.viewButton}
                      >
                        <FaEye />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Refund Detail Modal */}
        {selectedRefund && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Refund Request Details</h2>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.detailSection}>
                  <h3>Project Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Project:</label>
                      <span>{selectedRefund.paymentRequest?.projectTitle || "Project"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Client:</label>
                      <span>{selectedRefund.client?.name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Original Amount:</label>
                      <span className={styles.amount}>
                        {selectedRefund.paymentRequest?.currency === "INR" ? "₹" : "$"}
                        {selectedRefund.paymentRequest?.amount}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Refund Amount:</label>
                      <span className={styles.amount}>
                        {selectedRefund.paymentRequest?.currency === "INR" ? "₹" : "$"}
                        {selectedRefund.amount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Refund Details</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Status:</label>
                      {getStatusBadge(selectedRefund.status)}
                    </div>
                    <div className={styles.detailItem}>
                      <label>Reason:</label>
                      <span>{selectedRefund.reason}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Description:</label>
                      <span>{selectedRefund.description || "No additional details"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Requested:</label>
                      <span>{new Date(selectedRefund.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedRefund.adminNotes && (
                  <div className={styles.detailSection}>
                    <h3>Admin Decision</h3>
                    <div className={styles.adminNotes}>
                      <p>{selectedRefund.adminNotes}</p>
                      {selectedRefund.processedBy && (
                        <small>Processed by: {selectedRefund.processedBy?.name}</small>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button
                    onClick={() => setSelectedRefund(null)}
                    className={styles.closeModalButton}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}