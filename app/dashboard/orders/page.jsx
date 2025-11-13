"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./orders.module.css";
import {
  FiSearch,
  FiRefreshCw,
  FiClock,
  FiCheck,
  FiUser,
  FiMail,
  FiCalendar,
  FiPackage,
  FiChevronDown,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className={styles.ordersContent}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.pageHeader}
      >
        <div className={styles.headerTitle}>
          <h1>Order Management</h1>
          <p>Manage and track all customer orders</p>
        </div>
        
        <div className={styles.headerActions}>
          <motion.div 
            whileFocus={{ scale: 1.02 }}
            className={styles.searchBox}
          >
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search orders by name, email, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
          
          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </motion.select>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData} 
            className={styles.refreshButton}
          >
            <FiRefreshCw /> Refresh
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.ordersTable}
      >
        <motion.div 
          variants={itemVariants}
          className={styles.tableHeader}
        >
          <span>Order ID</span>
          {userRole === "admin" && <span>Customer</span>}
          <span>Service</span>
          <span>Date</span>
          <span>Status</span>
          {userRole === "admin" && <span>Actions</span>}
        </motion.div>

        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.loading}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={styles.loadingSpinner}
              >
                <FiRefreshCw />
              </motion.div>
              Loading orders...
            </motion.div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.noData}
            >
              <FiPackage className={styles.noDataIcon} />
              <h3>No orders found</h3>
              <p>
                {userRole === "admin"
                  ? "No orders match your search criteria"
                  : "You haven't placed any orders yet"}
              </p>
            </motion.div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: index * 0.1 }}
                className={styles.tableRow}
              >
                <span className={styles.orderId}>#{order.id}</span>
                
                {userRole === "admin" && (
                  <span className={styles.customerInfo}>
                    <div className={styles.customerName}>
                      <FiUser className={styles.infoIcon} />
                      {order.name}
                    </div>
                    <div className={styles.customerEmail}>
                      <FiMail className={styles.infoIcon} />
                      {order.email}
                    </div>
                  </span>
                )}
                
                <span className={styles.service}>
                  <FiPackage className={styles.infoIcon} />
                  {order.category}
                </span>
                
                <span className={styles.date}>
                  <FiCalendar className={styles.infoIcon} />
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                
                <span>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
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
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </motion.div>
                </span>
                
                {userRole === "admin" && (
                  <span>
                    <motion.div 
                      className={styles.selectWrapper}
                      whileHover={{ scale: 1.02 }}
                    >
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
                      <FiChevronDown className={styles.selectArrow} />
                    </motion.div>
                  </span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}