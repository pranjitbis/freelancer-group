"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./EditJob.module.css";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaBriefcase,
  FaFileAlt,
  FaTags,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUserTie,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function EditJob() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const params = useParams();

  const jobId = params.id;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    skills: [],
    budget: "",
    deadline: "",
    experienceLevel: "intermediate",
    status: "active"
  });

  const [newSkill, setNewSkill] = useState("");

  const categories = [
    "Web Development",
    "Mobile Development",
    "Design & Creative",
    "Writing & Translation",
    "Digital Marketing",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Business",
    "Data Science"
  ];

  const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" }
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchJob(jobId);
    }
  }, [jobId]);

  const fetchJob = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/jobs/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }

      const data = await response.json();
      
      if (data.job) {
        setJob(data.job);
        // Format date for input field
        const deadlineDate = new Date(data.job.deadline).toISOString().split('T')[0];
        
        setFormData({
          title: data.job.title || "",
          description: data.job.description || "",
          category: data.job.category || "",
          skills: data.job.skills || [],
          budget: data.job.budget?.toString() || "",
          deadline: deadlineDate,
          experienceLevel: data.job.experienceLevel || "intermediate",
          status: data.job.status || "active"
        });
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please log in to update jobs");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          budget: parseFloat(formData.budget)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/client-dashboard/my-jobs");
      } else {
        throw new Error(data.error || "Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.editJob}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.editJob}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push("/client-dashboard/my-jobs")}
        >
          <FaArrowLeft />
          Back to My Jobs
        </button>
        <h1>Edit Job</h1>
        <p>Update your job posting details</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <FaTimes />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className={styles.editForm}>
        <div className={styles.formGrid}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title">
              <FaBriefcase />
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Senior React Developer Needed"
              required
            />
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label htmlFor="category">
              <FaTags />
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div className={styles.formGroup}>
            <label htmlFor="budget">
              <FaMoneyBillWave />
              Budget ($) *
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="e.g., 1000"
              min="1"
              step="0.01"
              required
            />
          </div>

          {/* Deadline */}
          <div className={styles.formGroup}>
            <label htmlFor="deadline">
              <FaCalendarAlt />
              Deadline *
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Experience Level */}
          <div className={styles.formGroup}>
            <label htmlFor="experienceLevel">
              <FaUserTie />
              Experience Level
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
            >
              {experienceLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className={styles.formGroup}>
            <label htmlFor="status">
              <FaBriefcase />
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">
            <FaFileAlt />
            Job Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the job requirements, responsibilities, and what you're looking for in a candidate..."
            rows="6"
            required
          />
        </div>

        {/* Skills */}
        <div className={styles.formGroup}>
          <label>
            <FaTags />
            Required Skills
          </label>
          <div className={styles.skillsInput}>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a skill and press Enter"
            />
            <button type="button" onClick={addSkill} className={styles.addSkillBtn}>
              Add
            </button>
          </div>
          <div className={styles.skillsList}>
            {formData.skills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className={styles.removeSkill}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.push("/client-dashboard/my-jobs")}
            className={styles.cancelButton}
            disabled={saving}
          >
            <FaTimes />
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving}
          >
            <FaSave />
            {saving ? "Updating..." : "Update Job"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}