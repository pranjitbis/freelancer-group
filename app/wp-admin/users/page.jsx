"use client";
import { useState, useEffect } from "react";
import styles from "../wp-admin.module.css";
import {
  FiRefreshCw,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiX,
  FiXCircle,
} from "react-icons/fi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/create-user");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Validate password length
    if (newUser.password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
        setNewUser({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
        });
        setShowCreateUser(false);
        setNotification({
          message: "User create successfully!",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        alert(`Error creating user: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/create-user/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setUsers(users.filter((user) => user.id !== id));
          setNotification({
            message: "User deleted successfully!",
            type: "success",
          });
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Users Management</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.newUserBtn}
              onClick={() => setShowCreateUser(true)}
            >
              <FiPlus size={18} />
              Create User
            </button>
            <button onClick={fetchUsers} className={styles.refreshBtn}>
              <FiRefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Create New User</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCreateUser(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className={styles.formInput}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm Password *</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={styles.formInput}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className={styles.formSelect}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCreateUser(false)}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={createUser}
                disabled={
                  !newUser.name ||
                  !newUser.email ||
                  !newUser.password ||
                  !newUser.confirmPassword
                }
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Joined</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {users.length === 0 ? (
          <div className={styles.noOrders}>
            <p>No users found</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className={styles.tableRow}>
              <div className={styles.customerCell}>
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>
                    <FiUser size={14} />
                    {user.name}
                  </div>
                </div>
              </div>

              <div className={styles.serviceCell}>{user.email}</div>

              <div className={styles.paymentCell}>
                <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                  {user.role}
                </span>
              </div>

              <div className={styles.dateCell}>
                <div className={styles.dateInfo}>
                  <FiCalendar size={14} />
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className={styles.statusCell}>
                <span className={`${styles.statusBadge} ${styles.active}`}>
                  <FiCheckCircle />
                  Active
                </span>
              </div>

              <div className={styles.actionsCell}>
                <div className={styles.actionButtons}>
                  <button className={styles.editBtn}>
                    <FiEdit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className={styles.deleteBtn}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {notification && (
          <div className={styles.notification}>
            {notification.type === "success" && <FiCheckCircle size={20} />}
            {notification.type === "error" && <FiXCircle size={20} />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </>
  );
}
