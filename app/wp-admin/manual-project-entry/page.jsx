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
} from "react-icons/fa";
import { FiChevronRight, FiChevronLeft, FiEye, FiCopy } from "react-icons/fi";
import styles from "./ManualProjectEntry.module.css";

export default function ManualProjectEntry() {
  const [activeTab, setActiveTab] = useState("create"); // "create", "history", "edit"
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Project Details
    title: "",
    description: "",
    category: "",
    subcategory: "",
    skills: [],
    budgetType: "fixed",
    budget: "",
    timeframe: "",
    experienceLevel: "intermediate",

    // Step 2: Client Information
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    clientLocation: "",
    clientWebsite: "",

    // Step 3: Additional Requirements
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
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
  ];

  const budgetTypes = [
    { value: "fixed", label: "Fixed Price" },
    { value: "hourly", label: "Hourly Rate" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "draft", label: "Draft" },
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
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("subcategory", formData.subcategory);
      formDataToSend.append("skills", JSON.stringify(formData.skills));
      formDataToSend.append("budgetType", formData.budgetType);
      formDataToSend.append("budget", formData.budget.toString());
      formDataToSend.append("timeframe", formData.timeframe.toString());
      formDataToSend.append("experienceLevel", formData.experienceLevel);
      formDataToSend.append("clientName", formData.clientName);
      formDataToSend.append("clientEmail", formData.clientEmail);
      formDataToSend.append("clientPhone", formData.clientPhone || "");
      formDataToSend.append("clientCompany", formData.clientCompany || "");
      formDataToSend.append("clientLocation", formData.clientLocation || "");
      formDataToSend.append("clientWebsite", formData.clientWebsite || "");
      formDataToSend.append(
        "specialRequirements",
        formData.specialRequirements || ""
      );
      formDataToSend.append("visibility", formData.visibility);
      formDataToSend.append("urgent", formData.urgent.toString());
      formDataToSend.append("featured", formData.featured.toString());

      // Append files
      if (formData.attachments) {
        formData.attachments.forEach((file) => {
          formDataToSend.append("attachments", file);
        });
      }

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
      fetchProjects(); // Refresh the projects list
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
      title: project.title,
      description: project.description,
      category: project.category,
      subcategory: project.subcategory || "",
      skills: JSON.parse(project.skills || "[]"),
      budgetType: project.budgetType.toLowerCase(),
      budget: project.budget.toString(),
      timeframe: project.timeframe.toString(),
      experienceLevel: project.experienceLevel.toLowerCase(),
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      clientPhone: project.clientPhone || "",
      clientCompany: project.clientCompany || "",
      clientLocation: project.clientLocation || "",
      clientWebsite: project.clientWebsite || "",
      attachments: [],
      specialRequirements: project.specialRequirements || "",
      visibility: project.visibility.toLowerCase(),
      urgent: project.urgent,
      featured: project.featured,
    });
    setActiveTab("create");
    setCurrentStep(1);
  };

  // Duplicate project
  const handleDuplicate = (project) => {
    setFormData({
      title: `${project.title} (Copy)`,
      description: project.description,
      category: project.category,
      subcategory: project.subcategory || "",
      skills: JSON.parse(project.skills || "[]"),
      budgetType: project.budgetType.toLowerCase(),
      budget: project.budget.toString(),
      timeframe: project.timeframe.toString(),
      experienceLevel: project.experienceLevel.toLowerCase(),
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      clientPhone: project.clientPhone || "",
      clientCompany: project.clientCompany || "",
      clientLocation: project.clientLocation || "",
      clientWebsite: project.clientWebsite || "",
      attachments: [],
      specialRequirements: project.specialRequirements || "",
      visibility: project.visibility.toLowerCase(),
      urgent: project.urgent,
      featured: project.featured,
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
              >
                <h2 className={styles.sectionTitle}>
                  <FaFileAlt className={styles.sectionIcon} />
                  Project Details
                </h2>

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
                    <select
                      value={formData.budgetType}
                      onChange={(e) =>
                        handleInputChange("budgetType", e.target.value)
                      }
                      className={styles.select}
                    >
                      {budgetTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
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
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Timeframe (days) *</label>
                    <input
                      type="number"
                      value={formData.timeframe}
                      onChange={(e) =>
                        handleInputChange("timeframe", e.target.value)
                      }
                      className={styles.input}
                      placeholder="30"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) =>
                        handleInputChange("experienceLevel", e.target.value)
                      }
                      className={styles.select}
                    >
                      {experienceLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
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
              >
                <h2 className={styles.sectionTitle}>
                  <FaUser className={styles.sectionIcon} />
                  Client Information
                </h2>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Client Name *</label>
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

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Client Email *</label>
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

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
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

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Company</label>
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

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Location</label>
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

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Website</label>
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
              </motion.div>
            )}

            {/* Step 3: Additional Requirements */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className={styles.sectionTitle}>
                  <FaBriefcase className={styles.sectionIcon} />
                  Additional Requirements
                </h2>

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
                        Upload project files, images, or documents
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
                                  {(file.size / 1024).toFixed(2)} KB
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
                <FiChevronLeft size={18} />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className={`${styles.navButton} ${styles.nextButton}`}
                >
                  Next
                  <FiChevronRight size={18} />
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
                  placeholder="Search projects..."
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
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <div className={styles.projectStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[project.status?.toLowerCase()]
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.projectDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Client:</span>
                      <span className={styles.detailValue}>
                        {project.clientName}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Budget:</span>
                      <span className={styles.detailValue}>
                        ${project.budget} ({project.budgetType})
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Timeline:</span>
                      <span className={styles.detailValue}>
                        {project.timeframe} days
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Created:</span>
                      <span className={styles.detailValue}>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className={styles.projectActions}>
                    <div className={styles.compactActions}>
                      <button
                        onClick={() => handleEdit(project)}
                        className={`${styles.compactBtn} ${styles.compactEdit}`}
                        title="Edit Project"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleView(project)}
                        className={`${styles.compactBtn} ${styles.compactView}`}
                        title="View Details"
                      >
                        <FiEye />
                      </button>

                      <button
                        onClick={() => handleDuplicate(project)}
                        className={`${styles.compactBtn} ${styles.compactDuplicate}`}
                        title="Duplicate Project"
                      >
                        <FiCopy />
                      </button>

                      <button
                        onClick={() => handleDelete(project.id)}
                        className={`${styles.compactBtn} ${styles.compactDelete}`}
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
    </div>
  );
}
