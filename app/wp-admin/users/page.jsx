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
  FiExternalLink,
  FiLogIn,
  FiKey,
  FiEye,
  FiCopy,
  FiLink,
  FiShare2,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiGlobe,
} from "react-icons/fi";
import { FaGoogle, FaEnvelope, FaUserCog, FaUserTie } from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showUserCredentials, setShowUserCredentials] = useState(false);
  const [showAccessUrl, setShowAccessUrl] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [accessUrl, setAccessUrl] = useState("");
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
  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: "",
    temporaryToken: "",
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

  // Available roles in the system with professional icons
  const availableRoles = [
    {
      value: "user",
      label: "User",
      icon: FiUser,
      color: "#6b7280",
      bgColor: "#f8f9fa",
      iconColor: "#6b7280",
    },
    {
      value: "admin",
      label: "Administrator",
      icon: FaUserCog,
      color: "#dc2626",
      bgColor: "#fef2f2",
      iconColor: "#dc2626",
    },
    {
      value: "freelancer",
      label: "Freelancer",
      icon: FaUserTie,
      color: "#059669",
      bgColor: "#f0fdf4",
      iconColor: "#059669",
    },
    {
      value: "client",
      label: "Client",
      icon: FiBriefcase,
      color: "#2563eb",
      bgColor: "#eff6ff",
      iconColor: "#2563eb",
    },
  ];

  // Registration methods with professional icons
  const registrationMethods = [
    {
      value: "google",
      label: "Google",
      icon: FaGoogle,
      color: "#DB4437",
      bgColor: "#FCE8E6",
      iconColor: "#DB4437",
    },
    {
      value: "email",
      label: "Email",
      icon: FaEnvelope,
      color: "#4285F4",
      bgColor: "#E8F0FE",
      iconColor: "#4285F4",
    },
  ];

  // Fixed action button configurations - using direct icon components
  const getActionButtons = (user) => [
    {
      key: "url",
      icon: FiLink,
      label: "Generate Access URL",
      title: "Generate access URL",
      color: "#10b981",
      bgColor: "#ecfdf5",
      hoverColor: "#059669",
      onClick: () => generateAccessUrl(user),
    },
    {
      key: "credentials",
      icon: FiKey,
      label: "View Credentials",
      title: "View credentials",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      hoverColor: "#d97706",
      onClick: () => handleViewCredentials(user),
    },
    {
      key: "access",
      icon: FiLogIn,
      label: "Access Account",
      title: "Access user account",
      color: "#3b82f6",
      bgColor: "#eff6ff",
      hoverColor: "#2563eb",
      onClick: () => handleAdminAccess(user),
      disabled: user.status === "inactive",
    },
    {
      key: "status",
      icon: user.status === "active" ? FiUserCheck : FiUserX,
      label: user.status === "active" ? "Deactivate" : "Activate",
      title: user.status === "active" ? "Deactivate user" : "Activate user",
      color: user.status === "active" ? "#dc2626" : "#059669",
      bgColor: user.status === "active" ? "#fef2f2" : "#f0fdf4",
      hoverColor: user.status === "active" ? "#b91c1c" : "#047857",
      onClick: () => toggleUserStatus(user.id, user.status),
    },
    {
      key: "edit",
      icon: FiEdit,
      label: "Edit User",
      title: "Edit user",
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      hoverColor: "#7c3aed",
      onClick: () => handleEditClick(user),
    },
    {
      key: "delete",
      icon: FiTrash2,
      label: "Delete User",
      title: "Delete user",
      color: "#ef4444",
      bgColor: "#fef2f2",
      hoverColor: "#dc2626",
      onClick: () => deleteUser(user.id),
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
    return <IconComponent size={14} style={{ color: roleConfig?.iconColor }} />;
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
        iconColor: "#6b7280",
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
        <IconComponent size={12} style={{ color: methodInfo.iconColor }} />
        <span>{methodInfo.label}</span>
      </span>
    );
  };

  // Generate Access URL for Super Admin
  const generateAccessUrl = async (user) => {
    try {
      setNotification({
        message: `Generating access URL for ${user.name}...`,
        type: "info",
      });

      const response = await fetch("/api/admin/generate-access-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          expiresIn: "1h",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        let finalUrl = data.accessUrl;

        if (finalUrl.includes("http://localhost:3000https://")) {
          const token = finalUrl.split("/admin/access/")[1];
          finalUrl = `http://localhost:3000/admin/access/${token}`;
        }

        try {
          new URL(finalUrl);
          setAccessUrl(finalUrl);
        } catch (urlError) {
          const token = data.token || finalUrl.split("/admin/access/")[1];
          finalUrl = `${window.location.origin}/admin/access/${token}`;
          setAccessUrl(finalUrl);
        }

        setSelectedUser(user);
        setShowAccessUrl(true);
        setNotification({
          message: "Access URL generated successfully!",
          type: "success",
        });
      } else {
        throw new Error(data.error || "Failed to generate access URL");
      }
    } catch (error) {
      console.error("Error generating access URL:", error);
      setNotification({
        message: error.message || "Error generating access URL",
        type: "error",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Direct Access
  const handleAdminAccess = async (user) => {
    if (
      !window.confirm(
        `Are you sure you want to access ${user.name}'s account? You will be logged in as this user.`
      )
    ) {
      return;
    }

    try {
      setNotification({
        message: `Generating access for ${user.name}...`,
        type: "info",
      });

      const response = await fetch("/api/admin/access-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          action: "login",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        document.cookie = `user_token=${data.userToken}; path=/; max-age=3600`;
        document.cookie = `is_admin_access=true; path=/; max-age=3600`;
        document.cookie = `original_user_id=${user.id}; path=/; max-age=3600`;

        localStorage.setItem("is_admin_access", "true");
        localStorage.setItem(
          "admin_original_user",
          JSON.stringify({
            id: "current-admin-id",
            name: "Administrator",
            role: "super_admin",
          })
        );

        if (user.role === "freelancer") {
          window.location.href = "/freelancer-dashboard";
        } else if (user.role === "client") {
          window.location.href = "/client-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        throw new Error(data.error || "Failed to access user account");
      }
    } catch (error) {
      console.error("Error accessing user account:", error);
      setNotification({
        message: error.message || "Error accessing user account",
        type: "error",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotification({
        message: "Copied to clipboard!",
        type: "success",
      });
      setTimeout(() => setNotification(null), 2000);
    });
  };

  // View User Credentials
  const handleViewCredentials = async (user) => {
    try {
      setNotification({
        message: `Generating credentials for ${user.name}...`,
        type: "info",
      });

      const response = await fetch("/api/admin/access-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          action: "credentials",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedUser(user);
        setUserCredentials({
          email: user.email,
          password: data.temporaryPassword,
          temporaryToken: data.temporaryToken,
        });
        setShowUserCredentials(true);
        setNotification({
          message: `Credentials generated for ${user.name}`,
          type: "success",
        });
      } else {
        throw new Error(data.error || "Failed to generate credentials");
      }
    } catch (error) {
      console.error("Error generating credentials:", error);
      setNotification({
        message: error.message || "Error generating credentials",
        type: "error",
      });
      setTimeout(() => setNotification(null), 5000);
    }
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
              <role.icon size={24} style={{ color: role.iconColor }} />
            </div>
          </div>
        ))}

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
              <method.icon size={24} style={{ color: method.iconColor }} />
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
            <h1 className={styles.title}>
              <FiShield className={styles.titleIcon} />
              Users Management
            </h1>
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
              <FiUserPlus size={18} />
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
            <span>Filters</span>
            {mobileFiltersOpen ? (
              <FiChevronLeft size={14} />
            ) : (
              <FiChevronRight size={14} />
            )}
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
              <h3>
                <FiUserPlus size={20} />
                Create New User
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCreateUser(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiUser size={14} />
                  Name *
                </label>
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
                <label className={styles.formLabel}>
                  <FiMail size={14} />
                  Email *
                </label>
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
                <label className={styles.formLabel}>
                  <FiKey size={14} />
                  Password *
                </label>
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
                <label className={styles.formLabel}>
                  <FiKey size={14} />
                  Confirm Password *
                </label>
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
                <label className={styles.formLabel}>
                  <FaUserCog size={14} />
                  Role *
                </label>
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
                <label className={styles.formLabel}>
                  <FiPhone size={14} />
                  Phone Number
                </label>
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
                <label className={styles.formLabel}>
                  <FiBriefcase size={14} />
                  Professional Title
                </label>
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
                <FiX size={16} />
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
                <FiUserPlus size={16} />
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
              <h3>
                <FiEdit size={20} />
                Edit User
              </h3>
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
                <label className={styles.formLabel}>
                  <FiUser size={14} />
                  Name *
                </label>
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
                <label className={styles.formLabel}>
                  <FiMail size={14} />
                  Email *
                </label>
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
                <label className={styles.formLabel}>
                  <FiPhone size={14} />
                  Phone Number
                </label>
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
                <label className={styles.formLabel}>
                  <FiBriefcase size={14} />
                  Professional Title
                </label>
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
                <label className={styles.formLabel}>
                  <FaUserCog size={14} />
                  Role *
                </label>
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
                <label className={styles.formLabel}>
                  <FiCheckCircle size={14} />
                  Status *
                </label>
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
                  <FiKey size={16} />
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
                <FiX size={16} />
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={updateUser}
                disabled={!editUser.name || !editUser.email}
              >
                <FiCheckCircle size={16} />
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access URL Modal */}
      {showAccessUrl && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                <FiLink size={20} />
                User Access URL
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowAccessUrl(false);
                  setSelectedUser(null);
                  setAccessUrl("");
                }}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.accessUrlInfo}>
                <div className={styles.userSummary}>
                  <div className={styles.userAvatar}>
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={styles.userName}>{selectedUser.name}</h4>
                    <p className={styles.userEmail}>{selectedUser.email}</p>
                    <span
                      className={styles.roleBadge}
                      style={{
                        backgroundColor: getRoleBgColor(selectedUser.role),
                        color: getRoleColor(selectedUser.role),
                      }}
                    >
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                </div>

                <div className={styles.accessUrlSection}>
                  <h4 className={styles.sectionTitle}>
                    <FiLink size={16} />
                    Direct Access URL
                  </h4>
                  <p className={styles.urlDescription}>
                    Share this URL to provide direct access to{" "}
                    {selectedUser.name}'s dashboard. This link will expire in 1
                    hour.
                  </p>

                  <div className={styles.urlContainer}>
                    <div className={styles.copyField}>
                      <input
                        type="text"
                        value={accessUrl}
                        readOnly
                        className={styles.urlInput}
                      />
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(accessUrl)}
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.urlActions}>
                    <button
                      className={styles.openUrlBtn}
                      onClick={() => window.open(accessUrl, "_blank")}
                    >
                      <FiExternalLink size={16} />
                      Open in New Tab
                    </button>
                    <button
                      className={styles.shareUrlBtn}
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `Access ${selectedUser.name}'s Dashboard`,
                            text: `Access ${selectedUser.name}'s dashboard`,
                            url: accessUrl,
                          });
                        } else {
                          copyToClipboard(accessUrl);
                        }
                      }}
                    >
                      <FiShare2 size={16} />
                      Share URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowAccessUrl(false);
                  setSelectedUser(null);
                  setAccessUrl("");
                }}
              >
                <FiX size={16} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Credentials Modal */}
      {showUserCredentials && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                <FiKey size={20} />
                User Access Credentials
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowUserCredentials(false);
                  setSelectedUser(null);
                }}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.credentialsInfo}>
                <div className={styles.userSummary}>
                  <div className={styles.userAvatar}>
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={styles.userName}>{selectedUser.name}</h4>
                    <p className={styles.userEmail}>{selectedUser.email}</p>
                    <span
                      className={styles.roleBadge}
                      style={{
                        backgroundColor: getRoleBgColor(selectedUser.role),
                        color: getRoleColor(selectedUser.role),
                      }}
                    >
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                </div>

                <div className={styles.credentialsSection}>
                  <h4 className={styles.sectionTitle}>
                    <FiKey size={16} />
                    Login Credentials
                  </h4>

                  <div className={styles.credentialField}>
                    <label>
                      <FiMail size={14} />
                      Email
                    </label>
                    <div className={styles.copyField}>
                      <input
                        type="text"
                        value={userCredentials.email}
                        readOnly
                        className={styles.credentialInput}
                      />
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(userCredentials.email)}
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.credentialField}>
                    <label>
                      <FiKey size={14} />
                      Temporary Password
                    </label>
                    <div className={styles.copyField}>
                      <input
                        type="text"
                        value={userCredentials.password}
                        readOnly
                        className={styles.credentialInput}
                      />
                      <button
                        className={styles.copyBtn}
                        onClick={() =>
                          copyToClipboard(userCredentials.password)
                        }
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.credentialField}>
                    <label>
                      <FiShield size={14} />
                      Access Token
                    </label>
                    <div className={styles.copyField}>
                      <input
                        type="text"
                        value={userCredentials.temporaryToken}
                        readOnly
                        className={styles.credentialInput}
                      />
                      <button
                        className={styles.copyBtn}
                        onClick={() =>
                          copyToClipboard(userCredentials.temporaryToken)
                        }
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.accessActions}>
                  <button
                    className={styles.loginBtn}
                    onClick={() => handleAdminAccess(selectedUser)}
                  >
                    <FiLogIn size={16} />
                    Login as User
                  </button>
                  <button
                    className={styles.urlBtn}
                    onClick={() => generateAccessUrl(selectedUser)}
                  >
                    <FiLink size={16} />
                    Generate Access URL
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowUserCredentials(false);
                  setSelectedUser(null);
                }}
              >
                <FiX size={16} />
                Close
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
              <div className={styles.userCell} data-label="User">
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

              <div className={styles.contactCell} data-label="Contact">
                {user.profile?.phoneNumber ? (
                  <div className={styles.contactInfo}>
                    <FiPhone size={14} />
                    <span>{user.profile.phoneNumber}</span>
                  </div>
                ) : (
                  <span className={styles.emptyField}>Not provided</span>
                )}
              </div>

              <div className={styles.roleCell} data-label="Role">
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

              <div
                className={styles.registrationCell}
                data-label="Registration"
              >
                <RegistrationMethodBadge method={user.registrationMethod} />
              </div>

              <div
                className={styles.professionalCell}
                data-label="Professional"
              >
                {user.profile?.title ? (
                  <div className={styles.professionalInfo}>
                    <FiBriefcase size={14} />
                    <span>{user.profile.title}</span>
                  </div>
                ) : (
                  <span className={styles.emptyField}>Not set</span>
                )}
              </div>

              <div className={styles.dateCell} data-label="Joined">
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

              <div className={styles.statusCell} data-label="Status">
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
                  {getActionButtons(user).map((action) => {
                    const IconComponent = action.icon;
                    const isDisabled = action.disabled;
                    const color = action.color;
                    const bgColor = action.bgColor;
                    const hoverColor = action.hoverColor;
                    const title = action.title;

                    return (
                      <button
                        key={action.key}
                        className={styles.actionBtn}
                        onClick={action.onClick}
                        disabled={isDisabled}
                        title={title}
                        style={{
                          "--action-color": color,
                          "--action-bg-color": bgColor,
                          "--action-hover-color": hoverColor,
                        }}
                      >
                        <IconComponent size={14} />
                      </button>
                    );
                  })}
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
            {notification.type === "info" && <FiUser size={20} />}
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
