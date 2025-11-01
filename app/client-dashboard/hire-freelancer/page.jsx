"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./HireFreelancer.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaUser,
  FaStar,
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaPaperPlane,
} from "react-icons/fa";
import Banner from "../components/page";
export default function HireFreelancer() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    minRate: "",
    maxRate: "",
    skills: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const categories = [
    "all",
    "web-development",
    "mobile-development",
    "graphic-design",
    "digital-marketing",
    "video-animation",
    "data-science",
    "ai-ml",
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);
    }
    fetchFreelancers();
  }, [filters, pagination.currentPage]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "12",
        includeProfile: "true",
        ...filters,
      });

      const response = await fetch(`/api/freelancer?${queryParams}`);

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);
      if (data.success) {
        const freelancersWithImages = data.freelancers.map((freelancer) => {
          const profileImage =
            freelancer.profileImage ||
            freelancer.avatar ||
            freelancer.profile?.profileImage ||
            freelancer.profile?.avatar ||
            null;

          return {
            ...freelancer,
            id: freelancer.id || freelancer._id,
            name: freelancer.name || freelancer.username || "Unknown",
            avatar: profileImage,
            profile: freelancer.profile || {},
            skills: freelancer.skills || freelancer.profile?.skills || [],
            avgRating: freelancer.avgRating || freelancer.rating || "0.0",
            reviewCount: freelancer.reviewCount || 0,
            completedProjects: freelancer.completedProjects || 0,
          };
        });

        console.log("Processed freelancers:", freelancersWithImages); // Debug log
        setFreelancers(freelancersWithImages);
        setPagination((prev) => ({
          ...prev,
          ...data.pagination,
        }));
      } else {
        setError(data.error || "Failed to fetch freelancers");
      }
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setError(
        error.message || "Failed to load freelancers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleHireClick = (freelancer) => {
    if (!currentUser) {
      alert("Please login to hire freelancers");
      router.push("/login");
      return;
    }

    if (currentUser.id === freelancer.id) {
      alert("You cannot hire yourself!");
      return;
    }

    setSelectedFreelancer(freelancer);
    setShowHireModal(true);
  };

  const handleHireSubmit = async (formData) => {
    if (!currentUser) return;

    setHireLoading(true);
    try {
      const response = await fetch("/api/hire-freelancer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: currentUser.id,
          freelancerId: selectedFreelancer.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Hire request sent successfully!");
        setShowHireModal(false);
        setSelectedFreelancer(null);
      } else {
        alert(data.error || "Failed to send hire request");
      }
    } catch (error) {
      console.error("Error sending hire request:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setHireLoading(false);
    }
  };

  const getExperienceLevel = (experience) => {
    if (!experience) return "Not specified";
    const exp = experience.toLowerCase();
    if (exp.includes("junior") || exp.includes("0-2") || exp.includes("entry"))
      return "Junior";
    if (
      exp.includes("mid") ||
      exp.includes("2-5") ||
      exp.includes("intermediate")
    )
      return "Mid-Level";
    if (exp.includes("senior") || exp.includes("5+") || exp.includes("expert"))
      return "Senior";
    return experience;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src);
    e.target.style.display = "none";
    // Show the FaUser icon as fallback
    const parent = e.target.parentElement;
    const fallbackIcon = parent.querySelector(".fallback-icon");
    if (fallbackIcon) {
      fallbackIcon.style.display = "flex";
    }
  };

  return (
    <div className={styles.container}>
      <Banner />
      <motion.section
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerContent}>
          <div className={styles.headerMain}>
            <h1>Find Professional Freelancers</h1>
            <p>
              Browse through talented professionals and hire the best fit for
              your project
            </p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{pagination.totalCount}</span>
              <span className={styles.statLabel}>Available Freelancers</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Error Message */}
      {error && (
        <motion.div
          className={styles.errorBanner}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.errorContent}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
            <button onClick={fetchFreelancers} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.section
        className={styles.filtersSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.filtersContainer}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, skills, or expertise..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {categories
                  .filter((cat) => cat !== "all")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category.replace("-", " ").toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <input
                type="text"
                placeholder="Filter by skills..."
                value={filters.skills}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <input
                type="number"
                placeholder="Min rate ($)"
                value={filters.minRate}
                onChange={(e) => handleFilterChange("minRate", e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <input
                type="number"
                placeholder="Max rate ($)"
                value={filters.maxRate}
                onChange={(e) => handleFilterChange("maxRate", e.target.value)}
                className={styles.filterInput}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Freelancers Grid */}
      <section className={styles.freelancersSection}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className={styles.loadingState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.loadingSpinner}></div>
              <p>Loading freelancers...</p>
            </motion.div>
          ) : freelancers.length === 0 ? (
            <motion.div
              key="empty"
              className={styles.emptyState}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FaUser className={styles.emptyIcon} />
              <h3>No freelancers found</h3>
              <p>
                {filters.search ||
                filters.category !== "all" ||
                filters.skills ||
                filters.minRate ||
                filters.maxRate
                  ? "Try adjusting your search criteria or filters"
                  : "No freelancers are currently available. Check back later!"}
              </p>
              {(filters.search ||
                filters.category !== "all" ||
                filters.skills ||
                filters.minRate ||
                filters.maxRate) && (
                <button
                  onClick={() => {
                    setFilters({
                      search: "",
                      category: "all",
                      minRate: "",
                      maxRate: "",
                      skills: "",
                    });
                  }}
                  className={styles.clearFiltersButton}
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="freelancers"
              className={styles.freelancersGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {freelancers.map((freelancer) => (
                <motion.div
                  key={freelancer.id}
                  className={styles.freelancerCard}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.freelancerBasic}>
                      <div className={styles.avatar}>
                        {freelancer.avatar || freelancer.profileImage ? (
                          <>
                            <img
                              src={freelancer.avatar || freelancer.profileImage}
                              alt={freelancer.name}
                              onError={(e) => {
                                console.log(
                                  "Image failed to load:",
                                  e.target.src
                                );
                                e.target.style.display = "none";
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div
                              className={styles.fallbackIcon}
                              style={{ display: "none" }}
                            >
                              <FaUser />
                            </div>
                          </>
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className={styles.basicInfo}>
                        <h3 className={styles.name}>{freelancer.name}</h3>
                        <p className={styles.title}>
                          {freelancer.profile?.title ||
                            freelancer.profileTitle ||
                            "Freelancer"}
                        </p>
                        {freelancer.avgRating &&
                          freelancer.avgRating !== "0.0" && (
                            <div className={styles.rating}>
                              <FaStar />
                              <span>{freelancer.avgRating}</span>
                              <span className={styles.reviewCount}>
                                ({freelancer.reviewCount || 0} reviews)
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Freelancer Details */}
                  <div className={styles.freelancerDetails}>
                    {freelancer.profile?.location && (
                      <div className={styles.detailItem}>
                        <FaMapMarkerAlt />
                        <span>{freelancer.profile.location}</span>
                      </div>
                    )}

                    {freelancer.profile?.hourlyRate && (
                      <div className={styles.detailItem}>
                        <FaDollarSign />
                        <span>${freelancer.profile.hourlyRate}/hour</span>
                      </div>
                    )}

                    {freelancer.profile?.experience && (
                      <div className={styles.detailItem}>
                        <FaBriefcase />
                        <span>
                          {getExperienceLevel(freelancer.profile.experience)}
                        </span>
                      </div>
                    )}

                    {freelancer.completedProjects > 0 && (
                      <div className={styles.detailItem}>
                        <FaCheckCircle />
                        <span>
                          {freelancer.completedProjects} projects completed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className={styles.skillsSection}>
                      <div className={styles.skills}>
                        {freelancer.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                        {freelancer.skills.length > 4 && (
                          <span className={styles.moreSkills}>
                            +{freelancer.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio Preview */}
                  {freelancer.profile?.bio && (
                    <div className={styles.bioSection}>
                      <p className={styles.bioPreview}>
                        {freelancer.profile.bio.length > 120
                          ? `${freelancer.profile.bio.substring(0, 120)}...`
                          : freelancer.profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <motion.button
                      className={styles.viewProfileButton}
                      onClick={() =>
                        router.push(`/freelancer-profile/${freelancer.id}`)
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEye />
                      View Profile
                    </motion.button>
                    <motion.button
                      className={styles.hireButton}
                      onClick={() => handleHireClick(freelancer)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPaperPlane />
                      Hire Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {pagination.totalPages > 1 && !loading && freelancers.length > 0 && (
          <motion.div
            className={styles.pagination}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              className={styles.paginationButton}
            >
              Previous
            </button>

            <div className={styles.pageNumbers}>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: page,
                        }))
                      }
                      className={`${styles.pageButton} ${
                        pagination.currentPage === page ? styles.active : ""
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              className={styles.paginationButton}
            >
              Next
            </button>
          </motion.div>
        )}
      </section>

      {/* Hire Modal */}
      <AnimatePresence>
        {showHireModal && selectedFreelancer && (
          <HireModal
            freelancer={selectedFreelancer}
            onClose={() => {
              setShowHireModal(false);
              setSelectedFreelancer(null);
            }}
            onSubmit={handleHireSubmit}
            loading={hireLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Hire Modal Component (unchanged)
function HireModal({ freelancer, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    budget: "",
    timeframe: "30",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Hire {freelancer.name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.hireForm}>
          <div className={styles.formGroup}>
            <label>Job Title *</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Enter job title..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Job Description *</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Describe the project details, requirements, and expectations..."
              rows="4"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Budget ($) *</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Enter budget"
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Timeline (days)</label>
              <input
                type="number"
                name="timeframe"
                value={formData.timeframe}
                onChange={handleChange}
                placeholder="30"
                min="1"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Message to Freelancer</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Add a personal message to the freelancer..."
              rows="3"
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Hire Request"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
