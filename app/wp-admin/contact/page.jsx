"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./ContactManagement.module.css";
import {
  FiMail,
  FiUser,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiX,
  FiPhone,
  FiGlobe,
  FiUsers,
} from "react-icons/fi";

const STATUS_TYPES = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: FiClock,
  },
  accepted: {
    label: "Accepted",
    color: "#10b981",
    bgColor: "#ecfdf5",
    icon: FiCheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bgColor: "#fef2f2",
    icon: FiXCircle,
  },
  completed: {
    label: "Completed",
    color: "#8b5cf6",
    bgColor: "#faf5ff",
    icon: FiCheckCircle,
  },
};

export default function ContactManagementPage() {
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requestType, setRequestType] = useState("website"); // 'website' or 'platform'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Fetch contact requests
  const fetchContactRequests = async () => {
    try {
      setLoading(true);
      const userId = 1; // Replace with actual user ID

      let apiUrl = "";

      if (requestType === "website") {
        // Fetch website contact form submissions
        apiUrl = `/api/contact?userId=${userId}&type=website`;
      } else {
        // Fetch platform contact requests (received by freelancer)
        apiUrl = `/api/contact?userId=${userId}&type=received`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setContactRequests(data.contactRequests || []);
      } else {
        throw new Error(data.error || "Failed to fetch contact requests");
      }
    } catch (error) {
      console.error("Error fetching contact requests:", error);
      showNotification(
        error.message === "Failed to fetch"
          ? "Unable to connect to server. Please check your connection."
          : "Failed to load contact requests",
        "error"
      );
      setContactRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactRequests();
  }, [requestType]);

  // Filter contact requests
  const filteredRequests = useMemo(() => {
    return contactRequests.filter((request) => {
      const matchesSearch =
        request.client?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.isWebsiteSubmission &&
          request.client?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contactRequests, searchTerm, statusFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Handle status update
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const response = await fetch(`/api/contact/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setContactRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? { ...request, status: newStatus }
              : request
          )
        );
        showNotification(`Request ${newStatus} successfully`, "success");
      } else {
        throw new Error(data.error || "Failed to update request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      showNotification("Failed to update request", "error");
    }
  };

  // View request details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = contactRequests.length;
    const pending = contactRequests.filter(
      (r) => r.status === "pending"
    ).length;
    const accepted = contactRequests.filter(
      (r) => r.status === "accepted"
    ).length;
    const rejected = contactRequests.filter(
      (r) => r.status === "rejected"
    ).length;
    const completed = contactRequests.filter(
      (r) => r.status === "completed"
    ).length;

    return { total, pending, accepted, rejected, completed };
  }, [contactRequests]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading contact requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <h1 className={styles.title}>Contact Requests</h1>
            <p className={styles.subtitle}>
              Manage and respond to contact requests ({stats.total} total
              requests)
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={fetchContactRequests}
              className={styles.refreshBtn}
            >
              <FiRefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.total}</h3>
            <p className={styles.statLabel}>Total Requests</p>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
            <FiMail size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.pending}</h3>
            <p className={styles.statLabel}>Pending</p>
          </div>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: STATUS_TYPES.pending.bgColor,
              color: STATUS_TYPES.pending.color,
            }}
          >
            <STATUS_TYPES.pending.icon size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.accepted}</h3>
            <p className={styles.statLabel}>Accepted</p>
          </div>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: STATUS_TYPES.accepted.bgColor,
              color: STATUS_TYPES.accepted.color,
            }}
          >
            <STATUS_TYPES.accepted.icon size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.completed}</h3>
            <p className={styles.statLabel}>Completed</p>
          </div>
          <div
            className={styles.statIcon}
            style={{
              backgroundColor: STATUS_TYPES.completed.bgColor,
              color: STATUS_TYPES.completed.color,
            }}
          >
            <STATUS_TYPES.completed.icon size={24} />
          </div>
        </div>
      </div>

      {/* Request Type Toggle */}
      <div className={styles.typeToggleContainer}>
        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeButton} ${
              requestType === "website" ? styles.typeButtonActive : ""
            }`}
            onClick={() => {
              setRequestType("website");
              setCurrentPage(1);
            }}
          >
            <FiGlobe size={16} />
            Website Submissions
          </button>
          <button
            className={`${styles.typeButton} ${
              requestType === "platform" ? styles.typeButtonActive : ""
            }`}
            onClick={() => {
              setRequestType("platform");
              setCurrentPage(1);
            }}
          >
            <FiUsers size={16} />
            Platform Requests
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder={
              requestType === "website"
                ? "Search website submissions by name, email, or message..."
                : "Search platform requests by client, subject, or message..."
            }
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
          </button>

          <div
            className={`${styles.filterGroup} ${
              mobileFiltersOpen ? styles.filterGroupOpen : ""
            }`}
          >
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <FiFilter size={14} />
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
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Requests Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderCell}>
            {requestType === "website" ? "Contact" : "Client"}
          </div>
          <div className={styles.tableHeaderCell}>Subject</div>
          <div className={styles.tableHeaderCell}>Message</div>
          <div className={styles.tableHeaderCell}>Date</div>
          <div className={styles.tableHeaderCell}>Status</div>
          <div className={styles.tableHeaderCell}>Actions</div>
        </div>

        {currentRequests.length === 0 ? (
          <div className={styles.noData}>
            <FiMail size={48} className={styles.noDataIcon} />
            <p>No contact requests found</p>
            <p className={styles.noDataSubtitle}>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : requestType === "website"
                ? "No website contact form submissions yet"
                : "You don't have any platform contact requests yet"}
            </p>
          </div>
        ) : (
          currentRequests.map((request) => (
            <div key={request.id} className={styles.tableRow}>
              <div className={styles.clientCell}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {request.client?.name?.charAt(0)?.toUpperCase() || (
                      <FiUser size={16} />
                    )}
                    {request.isWebsiteSubmission && (
                      <div className={styles.websiteBadge}>
                        <FiGlobe size={8} />
                      </div>
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {request.client?.name || "Unknown Contact"}
                    </div>
                    <div className={styles.userEmail}>
                      {request.client?.email}
                    </div>
                    {request.isWebsiteSubmission && (
                      <div className={styles.websiteTag}>Website Form</div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.subjectCell}>
                <div className={styles.subjectText}>{request.subject}</div>
              </div>

              <div className={styles.messageCell}>
                <div className={styles.messagePreview}>
                  {request.message && request.message.length > 80
                    ? `${request.message.substring(0, 80)}...`
                    : request.message || "No message"}
                </div>
              </div>

              <div className={styles.dateCell}>
                <div className={styles.dateInfo}>
                  <FiCalendar size={14} />
                  <span>
                    {new Date(request.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.statusCell}>
                <StatusBadge status={request.status} />
              </div>

              <div className={styles.actionsCell}>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => handleViewDetails(request)}
                    title="View details"
                  >
                    <FiEye size={16} />
                  </button>

                  {request.status === "pending" && (
                    <>
                      <button
                        className={styles.acceptBtn}
                        onClick={() =>
                          updateRequestStatus(request.id, "accepted")
                        }
                        title="Accept request"
                      >
                        <FiCheckCircle size={16} />
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() =>
                          updateRequestStatus(request.id, "rejected")
                        }
                        title="Reject request"
                      >
                        <FiXCircle size={16} />
                      </button>
                    </>
                  )}

                  {request.status === "accepted" && (
                    <button
                      className={styles.completeBtn}
                      onClick={() =>
                        updateRequestStatus(request.id, "completed")
                      }
                      title="Mark as completed"
                    >
                      <FiCheckCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {currentRequests.length > 0 && (
          <div className={styles.tableFooter}>
            <div className={styles.tableSummary}>
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredRequests.length)} of{" "}
              {filteredRequests.length} requests
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
          onStatusUpdate={updateRequestStatus}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = STATUS_TYPES[status] || STATUS_TYPES.pending;
  const IconComponent = statusConfig.icon;

  return (
    <span
      className={styles.statusBadge}
      style={{
        backgroundColor: statusConfig.bgColor,
        color: statusConfig.color,
      }}
    >
      <IconComponent size={14} />
      <span>{statusConfig.label}</span>
    </span>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={styles.paginationNumber}
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className={styles.paginationEllipsis}>
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationNumber} ${
            currentPage === i ? styles.paginationNumberActive : ""
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className={styles.paginationEllipsis}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className={styles.paginationNumber}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronLeft size={16} />
        <span className={styles.paginationText}>Previous</span>
      </button>

      <div className={styles.paginationNumbers}>{renderPageNumbers()}</div>

      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className={styles.paginationText}>Next</span>
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

// Request Details Modal Component
const RequestDetailsModal = ({ request, onClose, onStatusUpdate }) => {
  const getServiceFromDetails = (projectDetails) => {
    if (!projectDetails) return "Unknown Service";
    const serviceLine = projectDetails
      .split("\n")
      .find((line) => line.startsWith("Service: "));
    return serviceLine
      ? serviceLine.replace("Service: ", "")
      : "Unknown Service";
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Contact Request Details</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>
                {request.isWebsiteSubmission
                  ? "Contact Information"
                  : "Client Information"}
                {request.isWebsiteSubmission && (
                  <span className={styles.websiteIndicator}>
                    <FiGlobe size={14} />
                    Website Submission
                  </span>
                )}
              </h4>
              <div className={styles.userSummary}>
                <div className={styles.userAvatarLarge}>
                  {request.client?.name?.charAt(0)?.toUpperCase() || (
                    <FiUser size={20} />
                  )}
                  {request.isWebsiteSubmission && (
                    <div className={styles.websiteBadgeLarge}>
                      <FiGlobe size={10} />
                    </div>
                  )}
                </div>
                <div>
                  <div className={styles.userNameLarge}>
                    {request.client?.name || "Unknown Contact"}
                  </div>
                  <div className={styles.userEmail}>
                    {request.client?.email}
                  </div>
                  {request.client?.profile?.phone && (
                    <div className={styles.userPhone}>
                      <FiPhone size={14} />
                      {request.client.profile.phone}
                    </div>
                  )}
                  {request.isWebsiteSubmission && (
                    <div className={styles.serviceInfo}>
                      <strong>Service:</strong>{" "}
                      {getServiceFromDetails(request.projectDetails)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Request Details</h4>
              <div className={styles.detailItem}>
                <label>Subject</label>
                <div className={styles.detailValue}>{request.subject}</div>
              </div>
              <div className={styles.detailItem}>
                <label>Date Received</label>
                <div className={styles.detailValue}>
                  {new Date(request.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className={styles.detailItem}>
                <label>Status</label>
                <div className={styles.detailValue}>
                  <StatusBadge status={request.status} />
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>Message</h4>
              <div className={styles.messageContent}>
                {request.message || "No message provided"}
              </div>
            </div>

            {request.projectDetails && (
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>
                  {request.isWebsiteSubmission
                    ? "Submission Details"
                    : "Project Details"}
                </h4>
                <div className={styles.projectDetails}>
                  {request.projectDetails}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          {request.status === "pending" && (
            <div className={styles.modalActions}>
              <button
                className={styles.rejectBtn}
                onClick={() => {
                  onStatusUpdate(request.id, "rejected");
                  onClose();
                }}
              >
                <FiXCircle size={16} />
                Reject Request
              </button>
              <button
                className={styles.acceptBtn}
                onClick={() => {
                  onStatusUpdate(request.id, "accepted");
                  onClose();
                }}
              >
                <FiCheckCircle size={16} />
                Accept Request
              </button>
            </div>
          )}

          {request.status === "accepted" && (
            <button
              className={styles.completeBtn}
              onClick={() => {
                onStatusUpdate(request.id, "completed");
                onClose();
              }}
            >
              <FiCheckCircle size={16} />
              Mark as Completed
            </button>
          )}

          <button className={styles.cancelBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.notificationContent}>
        {type === "success" && <FiCheckCircle size={20} />}
        {type === "error" && <FiXCircle size={20} />}
        {type === "info" && <FiMail size={20} />}
        <span>{message}</span>
      </div>
      <button className={styles.notificationClose} onClick={onClose}>
        <FiX size={16} />
      </button>
    </div>
  );
};
