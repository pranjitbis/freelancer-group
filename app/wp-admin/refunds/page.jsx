"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaSync,
  FaDownload,
} from "react-icons/fa";
import styles from "./Refunds.module.css";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRefunds();
  }, []);

  useEffect(() => {
    filterRefunds();
  }, [refunds, searchTerm, statusFilter]);

  const fetchRefunds = async () => {
    try {
      const response = await fetch("/api/admin/refunds");
      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds || []);
      } else if (response.status === 401 || response.status === 403) {
        // Redirect to login if not authenticated
        router.push("/wp-admin/login");
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRefunds = () => {
    let filtered = refunds;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((refund) => refund.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (refund) =>
          refund.client?.name?.toLowerCase().includes(term) ||
          refund.freelancer?.name?.toLowerCase().includes(term) ||
          refund.paymentRequest?.projectTitle?.toLowerCase().includes(term) ||
          refund.reason?.toLowerCase().includes(term)
      );
    }

    setFilteredRefunds(filtered);
  };

  const handleStatusUpdate = async (refundId, newStatus, notes = "") => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: notes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Refund ${newStatus} successfully!`);
        setSelectedRefund(null);
        setAdminNotes("");
        fetchRefunds();
      } else {
        alert(result.error || "Failed to update refund status");
      }
    } catch (error) {
      console.error("Update refund error:", error);
      alert("Failed to update refund status");
    } finally {
      setProcessing(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Client",
      "Freelancer",
      "Project",
      "Amount",
      "Reason",
      "Status",
      "Created Date",
    ];
    const csvData = filteredRefunds.map((refund) => [
      refund.id,
      refund.client?.name,
      refund.freelancer?.name,
      refund.paymentRequest?.projectTitle,
      refund.amount,
      refund.reason,
      refund.status,
      new Date(refund.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refunds-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        class: styles.pending,
        text: "Pending",
        icon: FaExclamationTriangle,
      },
      approved: {
        class: styles.approved,
        text: "Approved",
        icon: FaCheckCircle,
      },
      rejected: {
        class: styles.rejected,
        text: "Rejected",
        icon: FaTimesCircle,
      },
      processed: {
        class: styles.processed,
        text: "Processed",
        icon: FaCheckCircle,
      },
      cancelled: {
        class: styles.cancelled,
        text: "Cancelled",
        icon: FaTimesCircle,
      },
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

  const getStatusActions = (refund) => {
    if (refund.status === "pending") {
      return (
        <div className={styles.actionButtons}>
          <button
            onClick={() => handleStatusUpdate(refund.id, "approved")}
            className={styles.approveButton}
            disabled={processing}
          >
            <FaCheckCircle />
            Approve
          </button>
          <button
            onClick={() => setSelectedRefund(refund)}
            className={styles.rejectButton}
          >
            <FaTimesCircle />
            Reject
          </button>
        </div>
      );
    } else if (refund.status === "approved") {
      return (
        <div className={styles.actionButtons}>
          <button
            onClick={() => handleStatusUpdate(refund.id, "processed")}
            className={styles.processButton}
            disabled={processing}
          >
            <FaMoneyBillWave />
            Process Refund
          </button>
        </div>
      );
    }
    return null;
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
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <h1>Refund Management</h1>
            <p>Manage and process refund requests from clients</p>
          </div>
          <button onClick={exportToCSV} className={styles.exportButton}>
            <FaDownload />
            Export CSV
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Filters and Search */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by client, freelancer, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filterBox}>
            <FaFilter className={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processed">Processed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {refunds.filter((r) => r.status === "pending").length}
            </span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {refunds.filter((r) => r.status === "approved").length}
            </span>
            <span className={styles.statLabel}>Approved</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {refunds.filter((r) => r.status === "processed").length}
            </span>
            <span className={styles.statLabel}>Processed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{refunds.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        </div>

        {/* Refunds Table */}
        <div className={styles.refundsTable}>
          {filteredRefunds.length === 0 ? (
            <div className={styles.emptyState}>
              <FaMoneyBillWave className={styles.emptyIcon} />
              <h4>No refund requests found</h4>
              <p>There are no refund requests matching your criteria</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Freelancer</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.map((refund) => (
                    <tr key={refund.id}>
                      <td className={styles.idColumn}>#{refund.id}</td>
                      <td>
                        <div className={styles.userInfo}>
                          <div className={styles.avatar}>
                            {refund.client?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={styles.userName}>
                              {refund.client?.name}
                            </span>
                            <span className={styles.userEmail}>
                              {refund.client?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userInfo}>
                          <div className={styles.avatar}>
                            {refund.freelancer?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={styles.userName}>
                              {refund.freelancer?.name}
                            </span>
                            <span className={styles.userEmail}>
                              {refund.freelancer?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.projectInfo}>
                          <strong>
                            {refund.paymentRequest?.projectTitle || "Project"}
                          </strong>
                          <span>{refund.paymentRequest?.description}</span>
                        </div>
                      </td>
                      <td className={styles.amount}>
                        <div className={styles.amountWrapper}>
                          <span className={styles.currency}>
                            {refund.paymentRequest?.currency === "INR"
                              ? "₹"
                              : "$"}
                          </span>
                          <span className={styles.amountValue}>
                            {refund.amount}
                          </span>
                        </div>
                        <small>of {refund.paymentRequest?.amount}</small>
                      </td>
                      <td>
                        <span className={styles.reason}>{refund.reason}</span>
                      </td>
                      <td>{getStatusBadge(refund.status)}</td>
                      <td>
                        <div className={styles.dateWrapper}>
                          <span>
                            {new Date(refund.createdAt).toLocaleDateString()}
                          </span>
                          <small>
                            {new Date(refund.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => setSelectedRefund(refund)}
                            className={styles.viewButton}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {getStatusActions(refund)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <h3>Basic Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Refund ID:</label>
                      <span>#{selectedRefund.id}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Client:</label>
                      <span>
                        {selectedRefund.client?.name} (
                        {selectedRefund.client?.email})
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Freelancer:</label>
                      <span>
                        {selectedRefund.freelancer?.name} (
                        {selectedRefund.freelancer?.email})
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Project:</label>
                      <span>
                        {selectedRefund.paymentRequest?.projectTitle ||
                          "Project"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Original Amount:</label>
                      <span className={styles.amount}>
                        {selectedRefund.paymentRequest?.currency === "INR"
                          ? "₹"
                          : "$"}
                        {selectedRefund.paymentRequest?.amount}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Refund Amount:</label>
                      <span className={styles.amount}>
                        {selectedRefund.paymentRequest?.currency === "INR"
                          ? "₹"
                          : "$"}
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
                      <span>
                        {selectedRefund.description || "No additional details"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Submitted:</label>
                      <span>
                        {new Date(selectedRefund.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedRefund.processedBy && (
                      <div className={styles.detailItem}>
                        <label>Processed By:</label>
                        <span>{selectedRefund.processedBy?.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRefund.adminNotes && (
                  <div className={styles.detailSection}>
                    <h3>Admin Notes</h3>
                    <div className={styles.adminNotes}>
                      <p>{selectedRefund.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Action Section */}
                {selectedRefund.status === "pending" && (
                  <div className={styles.actionSection}>
                    <h3>Admin Actions</h3>
                    <div className={styles.actionForm}>
                      <label htmlFor="adminNotes">Admin Notes (Optional)</label>
                      <textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows="3"
                        placeholder="Add notes about this refund decision..."
                      />
                      <div className={styles.modalActions}>
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              selectedRefund.id,
                              "approved",
                              adminNotes
                            )
                          }
                          className={styles.approveButton}
                          disabled={processing}
                        >
                          <FaCheckCircle />
                          Approve Refund
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              selectedRefund.id,
                              "rejected",
                              adminNotes
                            )
                          }
                          className={styles.rejectButton}
                          disabled={processing}
                        >
                          <FaTimesCircle />
                          Reject Refund
                        </button>
                        <button
                          onClick={() => setSelectedRefund(null)}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
