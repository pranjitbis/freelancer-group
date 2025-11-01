"use client";
import { useState, useEffect } from "react";
import styles from "./payments.module.css";
import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiCalendar,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiMoreVertical,
  FiDownload,
  FiBarChart2,
} from "react-icons/fi";

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [updatingTransaction, setUpdatingTransaction] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/transactions");

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.user?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.paymentId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    setFilteredTransactions(filtered);
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      setUpdatingTransaction(transactionId);

      const response = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction status");
      }

      const updatedTransaction = await response.json();

      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === transactionId ? updatedTransaction : transaction
        )
      );

      alert("Transaction status updated successfully");
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("Failed to update transaction status");
    } finally {
      setUpdatingTransaction(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        class: styles.statusPending,
        icon: <FiClock size={14} />,
        label: "Pending",
      },
      completed: {
        class: styles.statusCompleted,
        icon: <FiCheckCircle size={14} />,
        label: "Completed",
      },
      failed: {
        class: styles.statusFailed,
        icon: <FiXCircle size={14} />,
        label: "Failed",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`${styles.statusBadge} ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      credit: {
        class: styles.typeCredit,
        icon: <FiArrowDown size={12} />,
        label: "Credit",
      },
      debit: {
        class: styles.typeDebit,
        icon: <FiArrowUp size={12} />,
        label: "Debit",
      },
    };

    const config = typeConfig[type] || typeConfig.credit;

    return (
      <span className={`${styles.typeBadge} ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = [
      "User",
      "Amount",
      "Type",
      "Status",
      "Date",
      "Payment ID",
      "Order ID",
    ];
    const csvData = filteredTransactions.map((transaction) => [
      transaction.user?.name || "N/A",
      transaction.amount,
      transaction.type,
      transaction.status,
      formatDate(transaction.createdAt),
      transaction.paymentId || "N/A",
      transaction.orderId || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === "pending").length,
    completed: transactions.filter((t) => t.status === "completed").length,
    failed: transactions.filter((t) => t.status === "failed").length,
    totalRevenue: transactions
      .filter((t) => t.status === "completed" && t.type === "credit")
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    credits: transactions.filter((t) => t.type === "credit").length,
    debits: transactions.filter((t) => t.type === "debit").length,
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className={styles.paymentsContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1>Transaction Management</h1>
            <p>Monitor and manage all payment transactions in real-time</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.exportButton}
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
            >
              <FiDownload size={18} />
              Export CSV
            </button>
            <button
              className={styles.refreshButton}
              onClick={fetchTransactions}
              disabled={loading}
            >
              <FiRefreshCw
                size={18}
                className={loading ? styles.spinning : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.revenueCard}`}>
          <div className={styles.statIcon}>
            <FiTrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p id={styles.Revenue}>Total Revenue</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiBarChart2 size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.total}</h3>
            <p>Total Transactions</p>
            <span className={styles.statSubtext}>
              {stats.credits} credits • {stats.debits} debits
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.completed}</h3>
            <p>Completed</p>
            <span className={styles.statSubtext}>
              {((stats.completed / stats.total) * 100 || 0).toFixed(1)}% success
              rate
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiClock size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.pending}</h3>
            <p>Pending</p>
            <span className={styles.statSubtext}>Needs attention</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <FiSearch size={20} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.filterControls}>
            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={18} />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterOptions}>
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>

            <button
              className={styles.clearFilters}
              onClick={() => {
                setStatusFilter("all");
                setTypeFilter("all");
                setSearchTerm("");
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>
            <h3>Transaction History</h3>
            <span className={styles.resultCount}>
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </span>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Payment Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                      <FiDollarSign size={48} />
                      <h4>No transactions found</h4>
                      <p>Try adjusting your search criteria or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.userAvatar}>
                          {transaction.user?.name?.charAt(0) || (
                            <FiUser size={16} />
                          )}
                        </div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>
                            {transaction.user?.name || "Unknown User"}
                          </span>
                          <span className={styles.userEmail}>
                            {transaction.user?.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.amountCell}>
                        <span
                          className={`${styles.amount} ${
                            transaction.type === "credit"
                              ? styles.amountCredit
                              : styles.amountDebit
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </span>
                        {transaction.description && (
                          <span className={styles.description}>
                            {transaction.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{getTypeBadge(transaction.type)}</td>
                    <td>{getStatusBadge(transaction.status)}</td>
                    <td>
                      <div className={styles.dateCell}>
                        <FiCalendar size={14} />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className={styles.paymentCell}>
                        {transaction.paymentId && (
                          <div className={styles.paymentId}>
                            <strong>PID:</strong>{" "}
                            {transaction.paymentId.slice(-8)}
                          </div>
                        )}
                        {transaction.orderId && (
                          <div className={styles.orderId}>
                            <strong>OID:</strong>{" "}
                            {transaction.orderId.slice(-8)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        {transaction.status === "pending" ? (
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "completed"
                                )
                              }
                              disabled={updatingTransaction === transaction.id}
                              className={styles.approveBtn}
                              title="Approve transaction"
                            >
                              {updatingTransaction === transaction.id ? (
                                <div className={styles.spinner}></div>
                              ) : (
                                <FiCheckCircle size={16} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "failed"
                                )
                              }
                              disabled={updatingTransaction === transaction.id}
                              className={styles.rejectBtn}
                              title="Reject transaction"
                            >
                              {updatingTransaction === transaction.id ? (
                                <div className={styles.spinner}></div>
                              ) : (
                                <FiXCircle size={16} />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.viewBtn}
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <FiEye size={16} />
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination would go here */}
        {filteredTransactions.length > 0 && (
          <div className={styles.tableFooter}>
            <div className={styles.pagination}>
              <span>
                Showing 1-{filteredTransactions.length} of{" "}
                {filteredTransactions.length} results
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Transaction Details</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedTransaction(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              {/* Modal content for transaction details */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
