// app/admin/orders/page.jsx
"use client";
import { useState, useEffect } from "react";
import styles from "./adminOrder.module.css";
import {
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
      
      // Initialize status update state
      const initialStatusUpdate = {};
      data.forEach(order => {
        initialStatusUpdate[order.id] = order.status;
      });
      setStatusUpdate(initialStatusUpdate);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(
          orders.map((order) =>
            order.id === id ? { ...order, status: newStatus } : order
          )
        );
        
        // Update the status in the statusUpdate state
        setStatusUpdate(prev => ({
          ...prev,
          [id]: newStatus
        }));
        
        alert("Order status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await fetch(`/api/orders/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setOrders(orders.filter((order) => order.id !== id));
          alert("Order deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Error deleting order");
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredOrders = sortedOrders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch =
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length;
  };

  const stats = {
    total: orders.length,
    pending: getStatusCount("pending"),
    completed: getStatusCount("completed"),
    cancelled: getStatusCount("cancelled"),
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdate(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Orders Management</h1>
          <div className={styles.headerActions}>
            <button onClick={fetchOrders} className={styles.refreshBtn}>
              <FiRefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.total}</h3>
            <p className={styles.statLabel}>Total Orders</p>
          </div>
          <div className={`${styles.statIcon} ${styles.total}`}>
            <FiCalendar size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.pending}</h3>
            <p className={styles.statLabel}>Pending</p>
          </div>
          <div className={`${styles.statIcon} ${styles.pending}`}>
            <FiClock size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.completed}</h3>
            <p className={styles.statLabel}>Completed</p>
          </div>
          <div className={`${styles.statIcon} ${styles.completed}`}>
            <FiCheckCircle size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.cancelled}</h3>
            <p className={styles.statLabel}>Cancelled</p>
          </div>
          <div className={`${styles.statIcon} ${styles.cancelled}`}>
            <FiXCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search orders by name, email, service, or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <FiFilter className={styles.filterIcon} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell} onClick={() => handleSort("name")}>
            Customer {sortConfig.key === "name" && (
              sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />
            )}
          </div>
          <div className={styles.headerCell} onClick={() => handleSort("service")}>
            Service {sortConfig.key === "service" && (
              sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />
            )}
          </div>
          <div className={styles.headerCell} onClick={() => handleSort("createdAt")}>
            Date {sortConfig.key === "createdAt" && (
              sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />
            )}
          </div>
          <div className={styles.headerCell} onClick={() => handleSort("status")}>
            Status {sortConfig.key === "status" && (
              sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />
            )}
          </div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className={styles.noOrders}>
            <p>No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={styles.orderItem}>
              <div className={styles.orderSummary} onClick={() => toggleExpandOrder(order.id)}>
                <div className={styles.customerCell}>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerName}>
                      <FiUser size={14} />
                      {order.name}
                    </div>
                    <div className={styles.customerEmail}>{order.email}</div>
                    {order.phone && <div className={styles.customerPhone}>{order.phone}</div>}
                  </div>
                </div>

                <div className={styles.serviceCell}>
                  {order.service}
                  {order.category && <div className={styles.serviceCategory}>{order.category}</div>}
                </div>

                <div className={styles.dateCell}>
                  <div className={styles.dateInfo}>
                    <FiCalendar size={14} />
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className={styles.statusCell}>
                  <span
                    className={`${styles.statusBadge} ${styles[order.status]}`}
                  >
                    {order.status === "pending" ? (
                      <FiClock />
                    ) : order.status === "completed" ? (
                      <FiCheckCircle />
                    ) : (
                      <FiXCircle />
                    )}
                    {order.status}
                  </span>
                </div>

                <div className={styles.actionsCell}>
                  <button
                    className={styles.expandBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpandOrder(order.id);
                    }}
                  >
                    {expandedOrder === order.id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className={styles.orderDetails}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailGroup}>
                      <h4>Order Information</h4>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Order ID:</span>
                        <span className={styles.detailValue}>{order.id}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Payment ID:</span>
                        <span className={styles.detailValue}>{order.paymentId || "N/A"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Created:</span>
                        <span className={styles.detailValue}>{formatDateTime(order.createdAt)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Last Updated:</span>
                        <span className={styles.detailValue}>{formatDateTime(order.updatedAt)}</span>
                      </div>
                    </div>

                    <div className={styles.detailGroup}>
                      <h4>Service Details</h4>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Service:</span>
                        <span className={styles.detailValue}>{order.service}</span>
                      </div>
                      {order.category && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Category:</span>
                          <span className={styles.detailValue}>{order.category}</span>
                        </div>
                      )}
                      {order.subcategory && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Subcategory:</span>
                          <span className={styles.detailValue}>{order.subcategory}</span>
                        </div>
                      )}
                      {order.quantity && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Quantity:</span>
                          <span className={styles.detailValue}>{order.quantity}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.detailGroup}>
                      <h4>Additional Information</h4>
                      {order.urgency && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Urgency:</span>
                          <span className={styles.detailValue}>{order.urgency}</span>
                        </div>
                      )}
                      {order.duration && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Duration:</span>
                          <span className={styles.detailValue}>{order.duration}</span>
                        </div>
                      )}
                      {order.experienceLevel && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Experience Level:</span>
                          <span className={styles.detailValue}>{order.experienceLevel}</span>
                        </div>
                      )}
                      {order.resume && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Resume:</span>
                          <a href={order.resume} target="_blank" rel="noopener noreferrer" className={styles.downloadLink}>
                            <FiDownload size={14} />
                            Download
                          </a>
                        </div>
                      )}
                    </div>

                    {order.requirements && (
                      <div className={styles.detailGroupFull}>
                        <h4>Requirements</h4>
                        <div className={styles.requirements}>
                          {order.requirements}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.statusUpdateSection}>
                    <h4>Update Status</h4>
                    <div className={styles.statusUpdateControls}>
                      <select
                        value={statusUpdate[order.id] || order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => updateOrderStatus(order.id, statusUpdate[order.id] || order.status)}
                        className={styles.updateStatusBtn}
                      >
                        <FiSave size={16} />
                        Update Status
                      </button>
                    </div>
                  </div>

                  <div className={styles.detailActions}>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className={styles.deleteBtn}
                    >
                      <FiTrash2 size={16} />
                      Delete Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className={styles.footer}>
        <div className={styles.summary}>
          <span>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
          <span>•</span>
          <span>Pending: {stats.pending}</span>
          <span>•</span>
          <span>Completed: {stats.completed}</span>
          <span>•</span>
          <span>Cancelled: {stats.cancelled}</span>
        </div>
      </div>
    </div>
  );
}