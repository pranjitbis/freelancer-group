"use client";
import { useState, useEffect } from "react";
import styles from "./user.module.css";
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
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiBriefcase,
  FiDownload,
  FiSearch,
  FiFilter,
  FiUsers,
  FiTool,
  FiBriefcase as FiClient,
  FiStar,
  FiMail,
} from "react-icons/fi";
import { FaGoogle, FaEnvelope } from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    phoneNumber: "",
    title: "",
  });
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    title: "",
    role: "user",
    status: "active",
    password: "",
    confirmPassword: "",
  });

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [registrationMethodFilter, setRegistrationMethodFilter] =
    useState("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available roles in the system
  const availableRoles = [
    {
      value: "user",
      label: "User",
      icon: FiUser,
      color: "#6b7280",
      bgColor: "#f3f4f6",
    },
    {
      value: "admin",
      label: "Administrator",
      icon: FiTool,
      color: "#dc2626",
      bgColor: "#fef2f2",
    },
    {
      value: "freelancer",
      label: "Freelancer",
      icon: FiBriefcase,
      color: "#059669",
      bgColor: "#f0fdf4",
    },
    {
      value: "client",
      label: "Client",
      icon: FiClient,
      color: "#2563eb",
      bgColor: "#eff6ff",
    },
  ];

  // Registration methods
  const registrationMethods = [
    {
      value: "google",
      label: "Google",
      icon: FaGoogle,
      color: "#DB4437",
      bgColor: "#FCE8E6",
    },
    {
      value: "email",
      label: "Email",
      icon: FaEnvelope,
      color: "#4285F4",
      bgColor: "#E8F0FE",
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.users) {
        setUsers(data.users);
      } else {
        console.error("Error fetching users:", data.error);
        setNotification({
          message: data.error || "Failed to fetch users",
          type: "error",
        });
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setNotification({
        message: "Failed to load users. Please try again.",
        type: "error",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRegistrationMethod =
      registrationMethodFilter === "all" ||
      user.registrationMethod === registrationMethodFilter;

    return (
      matchesSearch && matchesRole && matchesStatus && matchesRegistrationMethod
    );
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Helper functions
  const getRoleIcon = (role) => {
    const roleConfig = availableRoles.find((r) => r.value === role);
    const IconComponent = roleConfig?.icon || FiUser;
    return <IconComponent size={14} />;
  };

  const getRoleLabel = (role) => {
    const roleConfig = availableRoles.find((r) => r.value === role);
    return roleConfig?.label || "User";
  };

  const getRoleColor = (role) => {
    const roleConfig = availableRoles.find((r) => r.value === role);
    return roleConfig?.color || "#6b7280";
  };

  const getRoleBgColor = (role) => {
    const roleConfig = availableRoles.find((r) => r.value === role);
    return roleConfig?.bgColor || "#f3f4f6";
  };

  const getRegistrationMethodInfo = (method) => {
    const methodConfig = registrationMethods.find((m) => m.value === method);
    return (
      methodConfig || {
        value: method,
        label: method?.charAt(0)?.toUpperCase() + method?.slice(1) || "Email",
        icon: FaEnvelope,
        color: "#6b7280",
        bgColor: "#f3f4f6",
      }
    );
  };

  const RegistrationMethodBadge = ({ method }) => {
    const methodInfo = getRegistrationMethodInfo(method);
    const IconComponent = methodInfo.icon;

    return (
      <span
        className={styles.registrationBadge}
        style={{
          backgroundColor: methodInfo.bgColor,
          color: methodInfo.color,
        }}
      >
        <IconComponent size={12} />
        <span>{methodInfo.label}</span>
      </span>
    );
  };

  // Create user function
  const createUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      setNotification({
        message: "Passwords do not match!",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (newUser.password.length < 6) {
      setNotification({
        message: "Password must be at least 6 characters long!",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          phoneNumber: newUser.phoneNumber,
          title: newUser.title,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers([...users, data.user]);
        setNewUser({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
          phoneNumber: "",
          title: "",
        });
        setShowCreateUser(false);
        setNotification({
          message: "User created successfully!",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: `Error creating user: ${data.error}`,
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setNotification({
        message: "Error creating user. Please try again.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Edit user functions
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditUser({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.profile?.phoneNumber || "",
      title: user.profile?.title || "",
      role: user.role || "user",
      status: user.status || "active",
      password: "",
      confirmPassword: "",
    });
    setShowEditUser(true);
  };

  const updateUser = async () => {
    if (editUser.password && editUser.password !== editUser.confirmPassword) {
      setNotification({
        message: "Passwords do not match!",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (editUser.password && editUser.password.length < 6) {
      setNotification({
        message: "Password must be at least 6 characters long!",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          status: editUser.status,
          phoneNumber: editUser.phoneNumber,
          title: editUser.title,
          ...(editUser.password && { password: editUser.password }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the users list to get updated data
        await fetchUsers();
        setShowEditUser(false);
        setEditingUser(null);
        setEditUser({
          name: "",
          email: "",
          phoneNumber: "",
          title: "",
          role: "user",
          status: "active",
          password: "",
          confirmPassword: "",
        });
        setNotification({
          message: "User updated successfully!",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setNotification({
        message: error.message || "Error updating user",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Delete user function
  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== id));
        setNotification({
          message: "User deleted successfully!",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setNotification({
        message: error.message || "Error deleting user",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Status toggle function
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        setNotification({
          message: `User ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully!`,
          type: "success",
        });
      } else {
        throw new Error(data.error || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      setNotification({
        message: error.message || "Error updating user status",
        type: "error",
      });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Registration Method",
      "Status",
      "Phone",
      "Title",
      "Joined Date",
    ];
    const csvData = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.registrationMethod,
      user.status || "active",
      user.profile?.phoneNumber || "N/A",
      user.profile?.title || "N/A",
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setNotification({
      message: "Users exported to CSV successfully!",
      type: "success",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FiChevronLeft size={16} />
          <span className={styles.paginationText}>Previous</span>
        </button>

        <div className={styles.paginationNumbers}>
          {startPage > 1 && (
            <>
              <button
                className={styles.paginationNumber}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
              {startPage > 2 && (
                <span className={styles.paginationEllipsis}>...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`${styles.paginationNumber} ${
                currentPage === page ? styles.paginationNumberActive : ""
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className={styles.paginationEllipsis}>...</span>
              )}
              <button
                className={styles.paginationNumber}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className={styles.paginationButton}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className={styles.paginationText}>Next</span>
          <FiChevronRight size={16} />
        </button>
      </div>
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Stats Cards component
  const StatsCards = () => {
    const registrationStats = registrationMethods.map((method) => ({
      ...method,
      count: users.filter((user) => user.registrationMethod === method.value)
        .length,
    }));

    return (
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{users.length}</h3>
            <p className={styles.statLabel}>Total Users</p>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
            <FiUsers size={24} />
          </div>
        </div>

        {availableRoles.map((role) => (
          <div key={role.value} className={styles.statCard}>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>
                {users.filter((user) => user.role === role.value).length}
              </h3>
              <p className={styles.statLabel}>{role.label}s</p>
            </div>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: role.bgColor, color: role.color }}
            >
              <role.icon size={24} />
            </div>
          </div>
        ))}

        {/* Registration Method Stats */}
        {registrationStats.map((method) => (
          <div key={method.value} className={styles.statCard}>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{method.count}</h3>
              <p className={styles.statLabel}>{method.label}</p>
              <p className={styles.statPercentage}>
                {users.length > 0
                  ? Math.round((method.count / users.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: method.bgColor, color: method.color }}
            >
              <method.icon size={24} />
            </div>
          </div>
        ))}
      </div>
    );
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <h1 className={styles.title}>Users Management</h1>
            <p className={styles.subtitle}>
              Manage and monitor all system users ({users.length} total users)
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.exportBtn}
              onClick={exportToCSV}
              disabled={users.length === 0}
            >
              <FiDownload size={18} />
              <span>Export CSV</span>
            </button>
            <button
              className={styles.newUserBtn}
              onClick={() => setShowCreateUser(true)}
            >
              <FiPlus size={18} />
              <span>Create User</span>
            </button>
            <button onClick={fetchUsers} className={styles.refreshBtn}>
              <FiRefreshCw size={18} />
              <span className={styles.buttonText}>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <StatsCards />

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <button
            className={styles.mobileFilterToggle}
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <FiFilter size={16} />
            Filters
          </button>

          <div
            className={`${styles.filterGroup} ${
              mobileFiltersOpen ? styles.filterGroupOpen : ""
            }`}
          >
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <FiUser size={14} />
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.filterSelect}
              >
                <option value="all">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <FaGoogle size={14} />
                Registration
              </label>
              <select
                value={registrationMethodFilter}
                onChange={(e) => {
                  setRegistrationMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.filterSelect}
              >
                <option value="all">All Methods</option>
                {registrationMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <FiCheckCircle size={14} />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
                <label className={styles.formLabel}>Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className={styles.formInput}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className={styles.formInput}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className={styles.formInput}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm Password *</label>
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
                <label className={styles.formLabel}>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className={styles.formSelect}
                  required
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <div className={styles.inputWithIcon}>
                  <FiPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    value={newUser.phoneNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phoneNumber: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Professional Title</label>
                <div className={styles.inputWithIcon}>
                  <FiBriefcase className={styles.inputIcon} />
                  <input
                    type="text"
                    value={newUser.title}
                    onChange={(e) =>
                      setNewUser({ ...newUser, title: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Enter professional title"
                  />
                </div>
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

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Edit User</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowEditUser(false);
                  setEditingUser(null);
                }}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name *</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <div className={styles.inputWithIcon}>
                  <FiPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    value={editUser.phoneNumber}
                    onChange={(e) =>
                      setEditUser({ ...editUser, phoneNumber: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Professional Title</label>
                <div className={styles.inputWithIcon}>
                  <FiBriefcase className={styles.inputIcon} />
                  <input
                    type="text"
                    value={editUser.title}
                    onChange={(e) =>
                      setEditUser({ ...editUser, title: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Enter professional title"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role *</label>
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                  className={styles.formSelect}
                  required
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status *</label>
                <select
                  value={editUser.status}
                  onChange={(e) =>
                    setEditUser({ ...editUser, status: e.target.value })
                  }
                  className={styles.formSelect}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className={styles.passwordSection}>
                <h4 className={styles.sectionTitle}>
                  Change Password (Optional)
                </h4>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Password</label>
                  <input
                    type="password"
                    value={editUser.password}
                    onChange={(e) =>
                      setEditUser({ ...editUser, password: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={editUser.confirmPassword}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={styles.formInput}
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowEditUser(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={updateUser}
                disabled={!editUser.name || !editUser.email}
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderCell}>User</div>
          <div className={styles.tableHeaderCell}>Contact</div>
          <div className={styles.tableHeaderCell}>Role</div>
          <div className={styles.tableHeaderCell}>Registration</div>
          <div className={styles.tableHeaderCell}>Professional</div>
          <div className={styles.tableHeaderCell}>Joined</div>
          <div className={styles.tableHeaderCell}>Status</div>
          <div className={styles.tableHeaderCell}>Actions</div>
        </div>

        {currentUsers.length === 0 ? (
          <div className={styles.noData}>
            <FiUser size={48} className={styles.noDataIcon} />
            <p>No users found</p>
            <p className={styles.noDataSubtitle}>
              {searchTerm ||
              roleFilter !== "all" ||
              statusFilter !== "all" ||
              registrationMethodFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Create your first user to get started"}
            </p>
          </div>
        ) : (
          currentUsers.map((user) => (
            <div key={user.id} className={styles.tableRow}>
              <div className={styles.userCell}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.name?.charAt(0).toUpperCase() || <FiUser size={16} />}
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
              </div>

              <div className={styles.contactCell}>
                {user.profile?.phoneNumber ? (
                  <div className={styles.contactInfo}>
                    <FiPhone size={14} />
                    <span>{user.profile.phoneNumber}</span>
                  </div>
                ) : (
                  <span className={styles.emptyField}>Not provided</span>
                )}
              </div>

              <div className={styles.roleCell}>
                <span
                  className={styles.roleBadge}
                  style={{
                    backgroundColor: getRoleBgColor(user.role),
                    color: getRoleColor(user.role),
                  }}
                >
                  {getRoleIcon(user.role)}
                  <span className={styles.roleText}>
                    {getRoleLabel(user.role)}
                  </span>
                </span>
              </div>

              <div className={styles.registrationCell}>
                <RegistrationMethodBadge method={user.registrationMethod} />
              </div>

              <div className={styles.professionalCell}>
                {user.profile?.title ? (
                  <div className={styles.professionalInfo}>
                    <FiBriefcase size={14} />
                    <span>{user.profile.title}</span>
                  </div>
                ) : (
                  <span className={styles.emptyField}>Not set</span>
                )}
              </div>

              <div className={styles.dateCell}>
                <div className={styles.dateInfo}>
                  <FiCalendar size={14} />
                  <span>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.statusCell}>
                <span
                  className={`${styles.statusBadge} ${
                    user.status === "active"
                      ? styles.statusActive
                      : styles.statusInactive
                  }`}
                >
                  {user.status === "active" ? <FiCheckCircle /> : <FiXCircle />}
                  <span>
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>

              <div className={styles.actionsCell}>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.statusBtn}
                    onClick={() => toggleUserStatus(user.id, user.status)}
                    title={
                      user.status === "active"
                        ? "Deactivate user"
                        : "Activate user"
                    }
                  >
                    {user.status === "active" ? (
                      <FiXCircle size={14} />
                    ) : (
                      <FiCheckCircle size={14} />
                    )}
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditClick(user)}
                    title="Edit user"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className={styles.deleteBtn}
                    title="Delete user"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination and Summary */}
        {currentUsers.length > 0 && (
          <div className={styles.tableFooter}>
            <div className={styles.tableSummary}>
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>
            <Pagination />
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            {notification.type === "success" && <FiCheckCircle size={20} />}
            {notification.type === "error" && <FiXCircle size={20} />}
            <span>{notification.message}</span>
          </div>
          <button
            className={styles.notificationClose}
            onClick={() => setNotification(null)}
          >
            <FiX size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
