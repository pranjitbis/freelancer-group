"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaUser,
  FaDollarSign,
  FaCalendar,
  FaClock,
  FaFileAlt,
  FaTag,
  FaMapMarkerAlt,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaEdit,
  FaHistory,
  FaList,
  FaPlusCircle,
  FaSearch,
  FaFilter,
  FaEye,
  FaCopy,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import styles from "./ManualProjectEntry.module.css";

export default function ManualProjectEntry() {
  const [activeTab, setActiveTab] = useState("create");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingProject, setViewingProject] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    skills: [],
    budgetType: "fixed",
    budget: "",
    timeframe: "",
    experienceLevel: "intermediate",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    clientLocation: "",
    clientWebsite: "",
    attachments: [],
    specialRequirements: "",
    visibility: "public",
    urgent: false,
    featured: false,
  });

  const categories = [
    "Web Development",
    "Mobile Development",
    "Design & Creative",
    "Writing & Content",
    "Digital Marketing",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Business",
    "Consulting",
  ];

  const experienceLevels = [
    { value: "entry", label: "Entry Level", color: "#10b981" },
    { value: "intermediate", label: "Intermediate", color: "#3b82f6" },
    { value: "expert", label: "Expert", color: "#8b5cf6" },
  ];

  const budgetTypes = [
    { value: "fixed", label: "Fixed Price", icon: FaDollarSign },
    { value: "hourly", label: "Hourly Rate", icon: FaClock },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active", color: "#10b981" },
    { value: "completed", label: "Completed", color: "#6b7280" },
    { value: "draft", label: "Draft", color: "#f59e0b" },
  ];

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects/manual-create");
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects || []);
      } else {
        throw new Error(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects");
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle skills input
  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setFormData((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  // Handle file attachments
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Validation
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          setError("Project title is required");
          return false;
        }
        if (!formData.description.trim()) {
          setError("Project description is required");
          return false;
        }
        if (!formData.category) {
          setError("Category is required");
          return false;
        }
        break;

      case 2:
        if (!formData.clientName.trim()) {
          setError("Client name is required");
          return false;
        }
        if (!formData.clientEmail.trim()) {
          setError("Client email is required");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.clientEmail)) {
          setError("Please enter a valid email address");
          return false;
        }
        break;

      case 3:
        break;
    }

    setError("");
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const formDataToSend = new FormData();

      // Append all text fields
      Object.keys(formData).forEach((key) => {
        if (key !== 'attachments') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files
      formData.attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const response = await fetch("/api/projects/manual-create", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create project");
      }

      setSuccess(true);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      setError(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // Update project
  const handleUpdate = async () => {
    if (!editingProject) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/projects/manual-create/${editingProject.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update project");
      }

      setSuccess(true);
      resetForm();
      setEditingProject(null);
      setActiveTab("history");
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      setError(error.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const handleDelete = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/manual-create/${projectId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete project");
      }

      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(error.message || "Failed to delete project");
    }
  };

  // Edit project
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      category: project.category || "",
      subcategory: project.subcategory || "",
      skills: Array.isArray(project.skills) ? project.skills : [],
      budgetType: project.budgetType || "fixed",
      budget: project.budget?.toString() || "",
      timeframe: project.timeframe?.toString() || "",
      experienceLevel: project.experienceLevel || "intermediate",
      clientName: project.clientName || "",
      clientEmail: project.clientEmail || "",
      clientPhone: project.clientPhone || "",
      clientCompany: project.clientCompany || "",
      clientLocation: project.clientLocation || "",
      clientWebsite: project.clientWebsite || "",
      attachments: [],
      specialRequirements: project.specialRequirements || "",
      visibility: project.visibility || "public",
      urgent: Boolean(project.urgent),
      featured: Boolean(project.featured),
    });
    setActiveTab("create");
    setCurrentStep(1);
  };

  // View project details
  const handleView = (project) => {
    setViewingProject(project);
    setShowViewModal(true);
  };

  // Duplicate project
  const handleDuplicate = (project) => {
    setFormData({
      title: `${project.title} (Copy)` || "New Project (Copy)",
      description: project.description || "",
      category: project.category || "",
      subcategory: project.subcategory || "",
      skills: Array.isArray(project.skills) ? project.skills : [],
      budgetType: project.budgetType || "fixed",
      budget: project.budget?.toString() || "",
      timeframe: project.timeframe?.toString() || "",
      experienceLevel: project.experienceLevel || "intermediate",
      clientName: project.clientName || "",
      clientEmail: project.clientEmail || "",
      clientPhone: project.clientPhone || "",
      clientCompany: project.clientCompany || "",
      clientLocation: project.clientLocation || "",
      clientWebsite: project.clientWebsite || "",
      attachments: [],
      specialRequirements: project.specialRequirements || "",
      visibility: project.visibility || "public",
      urgent: Boolean(project.urgent),
      featured: Boolean(project.featured),
    });
    setActiveTab("create");
    setCurrentStep(1);
    setEditingProject(null);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      skills: [],
      budgetType: "fixed",
      budget: "",
      timeframe: "",
      experienceLevel: "intermediate",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientCompany: "",
      clientLocation: "",
      clientWebsite: "",
      attachments: [],
      specialRequirements: "",
      visibility: "public",
      urgent: false,
      featured: false,
    });
    setCurrentStep(1);
    setEditingProject(null);
  };

  // Filter projects based on search and filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || project.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Progress calculation
  const progress = ((currentStep - 1) / 2) * 100;

  if (success && activeTab === "create") {
    return (
      <div className={styles.successContainer}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={styles.successCard}
        >
          <div className={styles.successIcon}>
            <FaCheckCircle />
          </div>
          <h2 className={styles.successTitle}>
            {editingProject
              ? "Project Updated Successfully!"
              : "Project Created Successfully!"}
          </h2>
          <p className={styles.successMessage}>
            {editingProject
              ? "The project has been updated successfully."
              : "The project has been added to the platform and is now visible to freelancers."}
          </p>
          <div className={styles.successButtons}>
            <button
              onClick={() => {
                setSuccess(false);
                resetForm();
              }}
              className={styles.secondaryButton}
            >
              {editingProject ? "Edit Another" : "Add Another"}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={styles.primaryButton}
            >
              View All Projects
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => router.push("/wp-admin")}
              className={styles.backButton}
            >
              <FaArrowLeft />
              <span>Back to Admin</span>
            </button>
            <div className={styles.headerText}>
              <h1 className={styles.title}>
                {editingProject ? "Edit Project" : "Manual Project Entry"}
              </h1>
              <p className={styles.subtitle}>
                {editingProject
                  ? "Update project details and requirements"
                  : "Add and manage projects on the platform"}
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{projects.length}</span>
              <span className={styles.statLabel}>Total Projects</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "create" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("create");
              if (editingProject && !success) {
                resetForm();
              }
            }}
          >
            <FaPlusCircle />
            {editingProject ? "Edit Project" : "Create Project"}
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "history" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("history")}
          >
            <FaHistory />
            Project History ({projects.length})
          </button>
        </div>
      </div>

      {/* Create/Edit Project Tab */}
      {activeTab === "create" && (
        <div className={styles.tabContent}>
          {/* Progress Bar */}
          <div className={styles.progressSection}>
            <div className={styles.progressContent}>
              <div className={styles.progressInfo}>
                <span className={styles.progressText}>
                  Step {currentStep} of 3
                </span>
                <span className={styles.progressText}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.errorAlert}
            >
              <div className={styles.errorContent}>
                <FaExclamationTriangle className={styles.errorIcon} />
                <span className={styles.errorText}>{error}</span>
                <button
                  onClick={() => setError("")}
                  className={styles.errorClose}
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          <div className={styles.formCard}>
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <h2 className={styles.sectionTitle}>
                  <FaFileAlt className={styles.sectionIcon} />
                  Project Details
                </h2>
                <p className={styles.sectionDescription}>
                  Provide basic information about your project
                </p>

                <div className={styles.formGrid}>
                  <div className={styles.fullWidth}>
                    <label className={styles.label}>Project Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className={styles.input}
                      placeholder="e.g., E-commerce Website Development"
                    />
                  </div>

                  <div className={styles.fullWidth}>
                    <label className={styles.label}>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={6}
                      className={styles.textarea}
                      placeholder="Describe the project in detail..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className={styles.select}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Subcategory</label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) =>
                        handleInputChange("subcategory", e.target.value)
                      }
                      className={styles.input}
                      placeholder="e.g., React.js, WordPress"
                    />
                  </div>

                  <div className={styles.fullWidth}>
                    <label className={styles.label}>
                      Required Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.skills.join(", ")}
                      onChange={handleSkillsChange}
                      className={styles.input}
                      placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                    />
                    <div className={styles.skillsContainer}>
                      {formData.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Budget Type</label>
                    <div className={styles.radioGroup}>
                      {budgetTypes.map((type) => (
                        <label key={type.value} className={styles.radioLabel}>
                          <input
                            type="radio"
                            value={type.value}
                            checked={formData.budgetType === type.value}
                            onChange={(e) =>
                              handleInputChange("budgetType", e.target.value)
                            }
                            className={styles.radioInput}
                          />
                          <span className={styles.radioCustom}></span>
                          <type.icon className={styles.radioIcon} />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {formData.budgetType === "fixed"
                        ? "Fixed Budget"
                        : "Hourly Rate"}{" "}
                      *
                    </label>
                    <div className={styles.inputWithIcon}>
                      <FaDollarSign className={styles.inputIcon} />
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) =>
                          handleInputChange("budget", e.target.value)
                        }
                        className={styles.input}
                        placeholder={
                          formData.budgetType === "fixed" ? "5000" : "50"
                        }
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Timeframe (days) *</label>
                    <div className={styles.inputWithIcon}>
                      <FaCalendar className={styles.inputIcon} />
                      <input
                        type="number"
                        value={formData.timeframe}
                        onChange={(e) =>
                          handleInputChange("timeframe", e.target.value)
                        }
                        className={styles.input}
                        placeholder="30"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Experience Level</label>
                    <div className={styles.experienceLevels}>
                      {experienceLevels.map((level) => (
                        <label key={level.value} className={styles.radioLabel}>
                          <input
                            type="radio"
                            value={level.value}
                            checked={formData.experienceLevel === level.value}
                            onChange={(e) =>
                              handleInputChange("experienceLevel", e.target.value)
                            }
                            className={styles.radioInput}
                          />
                          <span 
                            className={styles.radioCustom}
                            style={{ borderColor: level.color }}
                          ></span>
                          <span>{level.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Client Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <h2 className={styles.sectionTitle}>
                  <FaUser className={styles.sectionIcon} />
                  Client Information
                </h2>
                <p className={styles.sectionDescription}>
                  Provide details about the client
                </p>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Client Name *</label>
                    <div className={styles.inputWithIcon}>
                      <FaUser className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) =>
                          handleInputChange("clientName", e.target.value)
                        }
                        className={styles.input}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Client Email *</label>
                    <div className={styles.inputWithIcon}>
                      <FaEnvelope className={styles.inputIcon} />
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) =>
                          handleInputChange("clientEmail", e.target.value)
                        }
                        className={styles.input}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.inputWithIcon}>
                      <FaPhone className={styles.inputIcon} />
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) =>
                          handleInputChange("clientPhone", e.target.value)
                        }
                        className={styles.input}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Company</label>
                    <div className={styles.inputWithIcon}>
                      <FaBriefcase className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.clientCompany}
                        onChange={(e) =>
                          handleInputChange("clientCompany", e.target.value)
                        }
                        className={styles.input}
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Location</label>
                    <div className={styles.inputWithIcon}>
                      <FaMapMarkerAlt className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.clientLocation}
                        onChange={(e) =>
                          handleInputChange("clientLocation", e.target.value)
                        }
                        className={styles.input}
                        placeholder="New York, USA"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Website</label>
                    <div className={styles.inputWithIcon}>
                      <FaGlobe className={styles.inputIcon} />
                      <input
                        type="url"
                        value={formData.clientWebsite}
                        onChange={(e) =>
                          handleInputChange("clientWebsite", e.target.value)
                        }
                        className={styles.input}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Additional Requirements */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <h2 className={styles.sectionTitle}>
                  <FaBriefcase className={styles.sectionIcon} />
                  Additional Requirements
                </h2>
                <p className={styles.sectionDescription}>
                  Add any special requirements and project settings
                </p>

                <div className={styles.fullWidthGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Special Requirements</label>
                    <textarea
                      value={formData.specialRequirements}
                      onChange={(e) =>
                        handleInputChange("specialRequirements", e.target.value)
                      }
                      rows={4}
                      className={styles.textarea}
                      placeholder="Any specific requirements, preferences, or additional information..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Attachments</label>
                    <div className={styles.fileUploadArea}>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className={styles.fileInput}
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={styles.fileUploadButton}
                      >
                        <FaPlus />
                        Choose Files
                      </label>
                      <p className={styles.fileUploadText}>
                        Upload project files, images, or documents (Max: 10MB per file)
                      </p>
                    </div>

                    {formData.attachments.length > 0 && (
                      <div className={styles.attachmentsList}>
                        {formData.attachments.map((file, index) => (
                          <div key={index} className={styles.attachmentItem}>
                            <div className={styles.attachmentInfo}>
                              <FaFileAlt className={styles.attachmentIcon} />
                              <div>
                                <p className={styles.attachmentName}>
                                  {file.name}
                                </p>
                                <p className={styles.attachmentSize}>
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeAttachment(index)}
                              className={styles.removeAttachmentButton}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.optionsGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Visibility</label>
                      <select
                        value={formData.visibility}
                        onChange={(e) =>
                          handleInputChange("visibility", e.target.value)
                        }
                        className={styles.select}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="invite-only">Invite Only</option>
                      </select>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        id="urgent"
                        checked={formData.urgent}
                        onChange={(e) =>
                          handleInputChange("urgent", e.target.checked)
                        }
                        className={styles.checkbox}
                      />
                      <label htmlFor="urgent" className={styles.checkboxLabel}>
                        <span className={styles.checkboxCustom}></span>
                        Mark as Urgent
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) =>
                          handleInputChange("featured", e.target.checked)
                        }
                        className={styles.checkbox}
                      />
                      <label
                        htmlFor="featured"
                        className={styles.checkboxLabel}
                      >
                        <span className={styles.checkboxCustom}></span>
                        Featured Project
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className={styles.navigationButtons}>
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`${styles.navButton} ${styles.previousButton} ${
                  currentStep === 1 ? styles.disabledButton : ""
                }`}
              >
                <FaChevronLeft size={16} />
                Previous
              </button>

              <div className={styles.stepIndicator}>
                Step {currentStep} of 3
              </div>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className={`${styles.navButton} ${styles.nextButton}`}
                >
                  Next
                  <FaChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={editingProject ? handleUpdate : handleSubmit}
                  disabled={loading}
                  className={`${styles.navButton} ${styles.submitButton} ${
                    loading ? styles.loadingButton : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner} />
                      {editingProject ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {editingProject ? "Update Project" : "Create Project"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project History Tab */}
      {activeTab === "history" && (
        <div className={styles.tabContent}>
          <div className={styles.historyHeader}>
            <div className={styles.searchSection}>
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search projects by title, client name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.filterSection}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab("create");
                resetForm();
              }}
              className={styles.addButton}
            >
              <FaPlus />
              Add New Project
            </button>
          </div>

          {filteredProjects.length === 0 ? (
            <div className={styles.noProjects}>
              <FaFileAlt className={styles.noProjectsIcon} />
              <h3>No Projects Found</h3>
              <p>
                {projects.length === 0
                  ? "Get started by creating your first project."
                  : "No projects match your search criteria."}
              </p>
              <button
                onClick={() => {
                  setActiveTab("create");
                  resetForm();
                }}
                className={styles.primaryButton}
              >
                <FaPlus />
                Create First Project
              </button>
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {filteredProjects.map((project) => (
                <div key={project.id} className={styles.projectCard}>
                  <div className={styles.projectHeader}>
                    <div className={styles.projectTitleSection}>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <div className={styles.projectMeta}>
                        <span className={styles.projectCategory}>
                          {project.category}
                        </span>
                        {project.urgent && (
                          <span className={styles.urgentBadge}>Urgent</span>
                        )}
                        {project.featured && (
                          <span className={styles.featuredBadge}>Featured</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.projectStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[project.status?.toLowerCase() || "active"]
                        }`}
                      >
                        {project.status || "Active"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.projectDescription}>
                    {project.description.length > 150
                      ? `${project.description.substring(0, 150)}...`
                      : project.description}
                  </div>

                  <div className={styles.projectDetails}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <FaUser className={styles.detailIcon} />
                        <span className={styles.detailValue}>
                          {project.clientName}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <FaDollarSign className={styles.detailIcon} />
                        <span className={styles.detailValue}>
                          ${project.budget} ({project.budgetType})
                        </span>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <FaCalendar className={styles.detailIcon} />
                        <span className={styles.detailValue}>
                          {project.timeframe} days
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <FaClock className={styles.detailIcon} />
                        <span className={styles.detailValue}>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.projectActions}>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(project)}
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title="Edit Project"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleView(project)}
                        className={`${styles.actionBtn} ${styles.viewBtn}`}
                        title="View Details"
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={() => handleDuplicate(project)}
                        className={`${styles.actionBtn} ${styles.duplicateBtn}`}
                        title="Duplicate Project"
                      >
                        <FaCopy />
                      </button>

                      <button
                        onClick={() => handleDelete(project.id)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete Project"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Project Modal */}
      <AnimatePresence>
        {showViewModal && viewingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Project Details</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowViewModal(false)}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>
                    <FaFileAlt />
                    Project Information
                  </h3>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Title:</label>
                      <span>{viewingProject.title}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Description:</label>
                      <span>{viewingProject.description}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Category:</label>
                      <span>{viewingProject.category}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Subcategory:</label>
                      <span>{viewingProject.subcategory || "N/A"}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Budget:</label>
                      <span>
                        ${viewingProject.budget} ({viewingProject.budgetType})
                      </span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Timeline:</label>
                      <span>{viewingProject.timeframe} days</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>
                    <FaUser />
                    Client Information
                  </h3>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Name:</label>
                      <span>{viewingProject.clientName}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Email:</label>
                      <span>{viewingProject.clientEmail}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Phone:</label>
                      <span>{viewingProject.clientPhone || "N/A"}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Company:</label>
                      <span>{viewingProject.clientCompany || "N/A"}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Location:</label>
                      <span>{viewingProject.clientLocation || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {viewingProject.specialRequirements && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>
                      <FaBriefcase />
                      Special Requirements
                    </h3>
                    <div className={styles.modalField}>
                      <span>{viewingProject.specialRequirements}</span>
                    </div>
                  </div>
                )}

                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>
                    <FaTag />
                    Project Settings
                  </h3>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Status:</label>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[viewingProject.status?.toLowerCase() || "active"]
                        }`}
                      >
                        {viewingProject.status || "Active"}
                      </span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Visibility:</label>
                      <span>{viewingProject.visibility}</span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Urgent:</label>
                      <span className={viewingProject.urgent ? styles.urgentText : styles.normalText}>
                        {viewingProject.urgent ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Featured:</label>
                      <span className={viewingProject.featured ? styles.featuredText : styles.normalText}>
                        {viewingProject.featured ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingProject);
                  }}
                  className={styles.editButton}
                >
                  <FaEdit />
                  Edit Project
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className={styles.closeButton}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}