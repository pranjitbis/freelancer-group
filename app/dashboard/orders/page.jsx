"use client";
import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";
import {
  FiSearch,
  FiRefreshCw,
  FiClock,
  FiCheck,
} from "react-icons/fi";

export default function OrdersPage() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setUserRole(userData.role || "user");
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (userRole === "admin") {
        const ordersRes = await fetch("/api/orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      } else {
        const ordersRes = await fetch(`/api/orders?email=${user.email}`);
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) =>
          prev.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order
          )
        );
        alert(`Order #${orderId} status updated to ${newStatus}`);
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order status");
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (userRole !== "admin") {
      alert("Only admins can update order status");
      return;
    }
    updateOrderStatus(orderId, newStatus);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.ordersContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={fetchData} className={styles.refreshButton}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      <div className={styles.ordersTable}>
        <div className={styles.tableHeader}>
          <span>Order ID</span>
          {userRole === "admin" && <span>Customer</span>}
          <span>Service</span>
          <span>Date</span>
          <span>Status</span>
          {userRole === "admin" && <span>Actions</span>}
        </div>

        {loading ? (
          <div className={styles.loading}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.noData}>
            {userRole === "admin"
              ? "No orders found"
              : "You haven't placed any orders yet"}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={styles.tableRow}>
              <span>#{order.id}</span>
              {userRole === "admin" && (
                <span>
                  <div className={styles.customerName}>{order.name}</div>
                  <div className={styles.customerEmail}>
                    {order.email}
                  </div>
                </span>
              )}
              <span>{order.category}</span>
              <span>
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span>
                <div
                  className={`${styles.statusBadge} ${
                    styles[order.status]
                  }`}
                >
                  {order.status === "pending" ? (
                    <FiClock className={styles.statusIcon} />
                  ) : (
                    <FiCheck className={styles.statusIcon} />
                  )}
                  <span className={styles.statusText}>
                    {order.status}
                  </span>
                </div>
              </span>
              {userRole === "admin" && (
                <span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`${styles.statusSelect} ${
                      styles[order.status]
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}