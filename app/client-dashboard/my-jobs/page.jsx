"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./MyJobs.module.css";
import Banner from "../components/page";
import {
  FaBriefcase,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaClock,
  FaMoneyBillWave,
  FaUserFriends,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        fetchMyJobs(userObj.id);
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        setError("Failed to load user data");
        setLoading(false);
      }
    } else {
      setError("No user data found. Please log in.");
      setLoading(false);
    }
  }, []);

  const fetchMyJobs = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching jobs for user:", userId);

      // Try the client-specific route first
      let response = await fetch(`/api/client/my-jobs?userId=${userId}`);

      // If 404, try the general jobs route and filter client-side
      if (response.status === 404) {
        console.log("⚠️ Client route not found, trying general jobs route...");
        response = await fetch(`/api/jobs?userId=${userId}`);

        if (response.ok) {
          const data = await response.json();
          // Filter jobs for this user only
          const userJobs =
            data.jobs?.filter((job) => job.userId === parseInt(userId)) || [];
          setJobs(userJobs);
          console.log(`✅ Loaded ${userJobs.length} jobs from general route`);
          return;
        }
      }

      console.log("📡 Response status:", response.status);

      // Check if response is HTML (404 page)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Received non-JSON response:", text.substring(0, 200));
        throw new Error(`API route not found. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 API Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setJobs(data.jobs || []);
        console.log(`✅ Loaded ${data.jobs?.length || 0} jobs`);
      } else {
        throw new Error(data.error || "Failed to fetch jobs");
      }
    } catch (error) {
      console.error("❌ Error fetching jobs:", error);
      setError(error.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Test API connection
  const testAPI = async () => {
    try {
      console.log("🧪 Testing API connection...");

      // Test multiple endpoints
      const endpoints = ["/api/test", "/api/jobs", "/api/client/my-jobs"];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          console.log(`🧪 ${endpoint}: ${response.status}`);
        } catch (err) {
          console.log(`🧪 ${endpoint}: ERROR - ${err.message}`);
        }
      }
    } catch (error) {
      console.error("❌ Test API failed:", error);
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      // Try client-specific delete route first
      let response = await fetch(`/api/client/jobs/${jobId}`, {
        method: "DELETE",
      });

      // If client route not found, try general route
      if (response.status === 404) {
        response = await fetch(`/api/jobs/${jobId}`, {
          method: "DELETE",
        });
      }

      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  // FIXED: View job function with correct routing
  const viewJob = (job) => {
    // Get username from user data or job data
    const username =
      user?.username ||
      user?.name?.toLowerCase()?.replace(/\s+/g, "-") ||
      "user";

    // Route to the job details page
    router.push(`/find-work/${username}/${job.id}`);
  };

  // FIXED: Edit job function
  const editJob = (jobId) => {
    router.push(`/client-dashboard/edit-job/${jobId}`);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "in progress":
        return "#3b82f6";
      case "completed":
        return "#8b5cf6";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FaClock />;
      case "in progress":
        return <FaUserFriends />;
      case "completed":
        return <FaCheckCircle />;
      case "cancelled":
        return <FaTimesCircle />;
      default:
        return <FaBriefcase />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  // Debug: Test API on component mount
  useEffect(() => {
    testAPI();
  }, []);

  if (loading) {
    return (
      <div className={styles.myJobs}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.myJobs}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <FaExclamationTriangle />
          </div>
          <h3>Unable to Load Jobs</h3>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <button
              className={styles.retryBtn}
              onClick={() => user && fetchMyJobs(user.id)}
            >
              Try Again
            </button>
            <button className={styles.debugBtn} onClick={testAPI}>
              Test API Routes
            </button>
          </div>
          <div className={styles.debugInfo}>
            <p>
              <strong>Troubleshooting:</strong>
            </p>
            <ul>
              <li>Check if API route files exist</li>
              <li>Restart the development server</li>
              <li>Check browser console for errors</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Banner />
    <motion.div
      className={styles.myJobs}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
    
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>My Jobs</h1>
          <p>Manage your job postings and track their progress</p>
        </div>
        <motion.button
          className={styles.postJobBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/client-dashboard/post-job")}
        >
          <FaPlus />
          Post New Job
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#3b82f6" }}
          >
            <FaBriefcase />
          </div>
          <div className={styles.statContent}>
            <h3>{jobs.length}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#10b981" }}
          >
            <FaClock />
          </div>
          <div className={styles.statContent}>
            <h3>{jobs.filter((job) => job.status === "active").length}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#8b5cf6" }}
          >
            <FaUserFriends />
          </div>
          <div className={styles.statContent}>
            <h3>
              {jobs.reduce((acc, job) => acc + (job._count?.proposals || 0), 0)}
            </h3>
            <p>Total Proposals</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <FaFilter className={styles.filterIcon} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className={styles.jobsSection}>
        {filteredJobs.length > 0 ? (
          <div className={styles.jobsGrid}>
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                className={styles.jobCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.jobHeader}>
                  <h3 className={styles.jobTitle}>
                    {job.title || "Untitled Job"}
                  </h3>
                  <div
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(job.status) }}
                  >
                    {getStatusIcon(job.status)}
                    <span>{job.status || "draft"}</span>
                  </div>
                </div>

                <p className={styles.jobDescription}>
                  {job.description && job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description || "No description provided"}
                </p>

                <div className={styles.jobMeta}>
                  <div className={styles.metaItem}>
                    <FaMoneyBillWave />
                    <span>${job.budget || "0"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FaUserFriends />
                    <span>{job._count?.proposals || 0} proposals</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FaCalendarAlt />
                    <span>{formatDate(job.deadline)}</span>
                  </div>
                </div>

                <div className={styles.skillsSection}>
                  {job.skills &&
                    job.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  {job.skills && job.skills.length > 3 && (
                    <span className={styles.moreSkills}>
                      +{job.skills.length - 3} more
                    </span>
                  )}
                  {(!job.skills || job.skills.length === 0) && (
                    <span className={styles.noSkills}>No skills specified</span>
                  )}
                </div>

                <div className={styles.jobActions}>
                  {/* FIXED: View button with correct routing */}
                  <button
                    className={styles.actionBtn}
                    onClick={() => viewJob(job)}
                  >
                    <FaEye />
                    View
                  </button>

                  {/* FIXED: Edit button with correct routing */}
                  <button
                    className={styles.actionBtn}
                    onClick={() => editJob(job.id)}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => deleteJob(job.id)}
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaBriefcase />
            </div>
            <h3>No jobs found</h3>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't posted any jobs yet"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                className={styles.postJobBtn}
                onClick={() => router.push("/client-dashboard/post-job")}
              >
                <FaPlus />
                Post Your First Job
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
    </>
  );
}
