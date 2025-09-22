"use client";
import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import {
  FiShoppingBag,
  FiClock,
  FiCheck,
  FiUsers,
} from "react-icons/fi";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

      if (userRole === "admin") {
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalUsers: userRole === "admin" ? users.length : 1,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.welcomeBanner}>
        <h2>{userRole === "admin" ? "Admin Dashboard" : "My Dashboard"}</h2>
        {userRole !== "admin" && (
          <p className={styles.userEmail}>Logged in as: {user?.email}</p>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(16, 185, 129, 0.1)" }}
          >
            <FiShoppingBag color="#10b981" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(245, 158, 11, 0.1)" }}
          >
            <FiClock color="#f59e0b" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(16, 185, 129, 0.1)" }}
          >
            <FiCheck color="#10b981" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.completedOrders}</h3>
            <p>Completed Orders</p>
          </div>
        </div>

        {userRole === "admin" && (
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(99, 102, 241, 0.1)" }}
            >
              <FiUsers color="#6366f1" />
            </div>
            <div className={styles.statInfo}>
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}