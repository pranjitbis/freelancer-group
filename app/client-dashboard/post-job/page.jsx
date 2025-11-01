"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./PostJob.module.css";
import Banner from "../components/page";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUpload,
  FaDollarSign,
  FaCalendar,
  FaTag,
  FaPaperPlane,
  FaBriefcase,
  FaFileAlt,
  FaCode,
  FaPalette,
  FaChartLine,
  FaPenFancy,
  FaVideo,
  FaDatabase,
  FaUserTie,
} from "react-icons/fa";

export default function PostJob() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    skills: [],
    budget: "",
    deadline: "",
    experienceLevel: "intermediate",
    currentSkill: "",
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }
  }, [router]);

  const categories = [
    { value: "web-development", label: "Web Development", icon: <FaCode /> },
    {
      value: "mobile-development",
      label: "Mobile Development",
      icon: <FaCode />,
    },
    { value: "graphic-design", label: "Graphic Design", icon: <FaPalette /> },
    {
      value: "digital-marketing",
      label: "Digital Marketing",
      icon: <FaChartLine />,
    },
    {
      value: "writing-translation",
      label: "Writing & Translation",
      icon: <FaPenFancy />,
    },
    { value: "video-animation", label: "Video & Animation", icon: <FaVideo /> },
    { value: "data-science", label: "Data Science", icon: <FaDatabase /> },
    { value: "business", label: "Business Consulting", icon: <FaUserTie /> },
  ];

  const experienceLevels = [
    {
      value: "entry",
      label: "Entry Level",
      description: "0-2 years experience",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "2-5 years experience",
    },
    { value: "expert", label: "Expert", description: "5+ years experience" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addSkill = () => {
    if (
      formData.currentSkill.trim() &&
      !formData.skills.includes(formData.currentSkill.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill.trim()],
        currentSkill: "",
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.budget || formData.budget < 50)
      newErrors.budget = "Budget must be at least $50";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    if (formData.skills.length === 0)
      newErrors.skills = "At least one skill is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          budget: parseFloat(formData.budget),
          status: "active",
        }),
      });

      if (response.ok) {
        router.push("/client-dashboard/my-jobs");
      } else {
        const error = await response.json();
        setErrors({ submit: error.error });
      }
    } catch (error) {
      setErrors({ submit: "Failed to post job" });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.loadingSpinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Banner />
      <motion.div
        className={styles.postJob}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div className={styles.headerContent}>
            <motion.div
              className={styles.headerIcon}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaBriefcase />
            </motion.div>
            <div className={styles.headerText}>
              <h1>Post a New Job</h1>
              <p>
                Find the perfect talent for your project and bring your ideas to
                life
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className={styles.progressContainer}
          variants={itemVariants}
        >
          <div className={styles.progressSteps}>
            {[1, 2, 3].map((step) => (
              <div key={step} className={styles.step}>
                <div
                  className={`${styles.stepCircle} ${
                    currentStep >= step ? styles.active : ""
                  }`}
                >
                  {step}
                </div>
                <span className={styles.stepLabel}>
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Details"}
                  {step === 3 && "Review"}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={styles.formStep}
              >
                <motion.div
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label className={styles.label}>
                    <FaFileAlt className={styles.labelIcon} />
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Need a React Developer for E-commerce Website"
                    className={`${styles.input} ${
                      errors.title ? styles.error : ""
                    }`}
                  />
                  <AnimatePresence>
                    {errors.title && (
                      <motion.span
                        className={styles.errorText}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label className={styles.label}>
                    <FaFileAlt className={styles.labelIcon} />
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the project in detail, including requirements, deliverables, timeline expectations, and any specific instructions..."
                    className={`${styles.textarea} ${
                      errors.description ? styles.error : ""
                    }`}
                    rows="8"
                  />
                  <div className={styles.charCount}>
                    {formData.description.length} characters
                    {formData.description.length > 5000 && (
                      <span className={styles.charWarning}>
                        (Detailed description - freelancers appreciate thorough
                        project details!)
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.description && (
                      <motion.span
                        className={styles.errorText}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.description}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className={styles.formActions}
                  variants={itemVariants}
                >
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className={styles.nextBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next: Details →
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={styles.formStep}
              >
                <div className={styles.formRow}>
                  <motion.div
                    className={styles.formGroup}
                    variants={itemVariants}
                  >
                    <label className={styles.label}>
                      <FaCode className={styles.labelIcon} />
                      Category *
                    </label>
                    <div className={styles.categoryGrid}>
                      {categories.map((cat) => (
                        <motion.div
                          key={cat.value}
                          className={`${styles.categoryCard} ${
                            formData.category === cat.value
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              category: cat.value,
                            }))
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={styles.categoryIcon}>{cat.icon}</div>
                          <span>{cat.label}</span>
                        </motion.div>
                      ))}
                    </div>
                    <AnimatePresence>
                      {errors.category && (
                        <motion.span
                          className={styles.errorText}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {errors.category}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <div className={styles.formRow}>
                  <motion.div
                    className={styles.formGroup}
                    variants={itemVariants}
                  >
                    <label className={styles.label}>
                      <FaUserTie className={styles.labelIcon} />
                      Experience Level
                    </label>
                    <div className={styles.experienceGrid}>
                      {experienceLevels.map((level) => (
                        <motion.div
                          key={level.value}
                          className={`${styles.experienceCard} ${
                            formData.experienceLevel === level.value
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              experienceLevel: level.value,
                            }))
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <h4>{level.label}</h4>
                          <p>{level.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className={styles.formActions}
                  variants={itemVariants}
                >
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className={styles.backBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className={styles.nextBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next: Final Details →
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={styles.formStep}
              >
                <div className={styles.formRow}>
                  <motion.div
                    className={styles.formGroup}
                    variants={itemVariants}
                  >
                    <label className={styles.label}>
                      <FaDollarSign className={styles.labelIcon} />
                      Budget ($) *
                    </label>
                    <div className={styles.budgetInput}>
                      <div className={styles.inputWithIcon}>
                        <FaDollarSign className={styles.inputIcon} />
                        <input
                          type="number"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          placeholder="500"
                          min="50"
                          step="50"
                          className={`${styles.input} ${
                            errors.budget ? styles.error : ""
                          }`}
                        />
                      </div>
                      <div className={styles.budgetSuggestions}>
                        <span>Suggested: </span>
                        {[100, 500, 1000, 2500].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            className={styles.budgetChip}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                budget: amount,
                              }))
                            }
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.budget && (
                        <motion.span
                          className={styles.errorText}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {errors.budget}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    className={styles.formGroup}
                    variants={itemVariants}
                  >
                    <label className={styles.label}>
                      <FaCalendar className={styles.labelIcon} />
                      Deadline *
                    </label>
                    <div className={styles.inputWithIcon}>
                      <FaCalendar className={styles.inputIcon} />
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className={`${styles.input} ${
                          errors.deadline ? styles.error : ""
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.deadline && (
                        <motion.span
                          className={styles.errorText}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {errors.deadline}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <motion.div
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label className={styles.label}>
                    <FaTag className={styles.labelIcon} />
                    Required Skills *
                  </label>
                  <div className={styles.skillsInput}>
                    <div className={styles.skillsTags}>
                      <AnimatePresence>
                        {formData.skills.map((skill, index) => (
                          <motion.span
                            key={skill}
                            className={styles.skillTag}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className={styles.removeSkill}
                            >
                              ×
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className={styles.skillInputWrapper}>
                      <FaTag className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formData.currentSkill}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            currentSkill: e.target.value,
                          }))
                        }
                        onKeyPress={handleKeyPress}
                        placeholder="Add required skills (React, Node.js, UI/UX...)"
                        className={styles.input}
                      />
                      <motion.button
                        type="button"
                        onClick={addSkill}
                        className={styles.addSkillBtn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {errors.skills && (
                        <motion.span
                          className={styles.errorText}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {errors.skills}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Job Preview Section */}
                <motion.div
                  className={styles.jobPreview}
                  variants={itemVariants}
                >
                  <h3>Job Preview</h3>
                  <div className={styles.previewContent}>
                    <div className={styles.previewSection}>
                      <strong>Title:</strong>
                      <p>{formData.title || "No title provided"}</p>
                    </div>
                    <div className={styles.previewSection}>
                      <strong>Description:</strong>
                      <p className={styles.previewDescription}>
                        {formData.description || "No description provided"}
                      </p>
                      <div className={styles.descriptionStats}>
                        <span>{formData.description.length} characters</span>
                        <span>
                          {
                            formData.description
                              .split(/\s+/)
                              .filter((word) => word.length > 0).length
                          }{" "}
                          words
                        </span>
                      </div>
                    </div>
                    <div className={styles.previewSection}>
                      <strong>Category:</strong>
                      <p>
                        {categories.find(
                          (cat) => cat.value === formData.category
                        )?.label || "Not selected"}
                      </p>
                    </div>
                    <div className={styles.previewSection}>
                      <strong>Skills:</strong>
                      <div className={styles.previewSkills}>
                        {formData.skills.length > 0 ? (
                          formData.skills.map((skill) => (
                            <span key={skill} className={styles.previewSkill}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span>No skills added</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className={styles.formActions}
                  variants={itemVariants}
                >
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className={styles.backBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitBtn}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className={styles.spinner}></div>
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Post Job & Start Hiring
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {errors.submit && (
              <motion.div
                className={styles.submitError}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {errors.submit}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </>
  );
}
