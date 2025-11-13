"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./PostJob.module.css";
import Banner from "../components/page";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  FaCheck,
  FaClock,
  FaMapMarkerAlt,
  FaGlobe,
  FaIndustry,
  FaTools,
  FaEye,
  FaEdit,
  FaInfoCircle,
  FaLightbulb,
  FaRocket,
  FaShieldAlt,
  FaUsers,
  FaStar,
  FaRegClock,
  FaCheckCircle,
  FaExchangeAlt,
  FaRupeeSign,
  FaSync,
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
    projectType: "one-time",
    locationType: "remote",
    duration: "",
    clientLocation: "",
    companyName: "",
    projectScope: "",
    confidentiality: "standard",
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(83.5);
  const [isConverting, setIsConverting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }
    fetchExchangeRate();
  }, [router]);

  // Fetch current exchange rate
  const fetchExchangeRate = async () => {
    try {
      setIsConverting(true);
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.rates.INR || 83.5);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rate, using default:", error);
      setExchangeRate(83.5); // Fallback rate
    } finally {
      setIsConverting(false);
    }
  };

  const categories = [
    {
      value: "web-development",
      label: "Web Development",
      icon: <FaCode />,
      description: "Website and web application development",
    },
    {
      value: "mobile-development",
      label: "Mobile Development",
      icon: <FaCode />,
      description: "iOS and Android app development",
    },
    {
      value: "graphic-design",
      label: "Graphic Design",
      icon: <FaPalette />,
      description: "Logo, branding, and visual design",
    },
    {
      value: "digital-marketing",
      label: "Digital Marketing",
      icon: <FaChartLine />,
      description: "SEO, social media, and advertising",
    },
    {
      value: "writing-translation",
      label: "Writing & Translation",
      icon: <FaPenFancy />,
      description: "Content writing and translation services",
    },
    {
      value: "video-animation",
      label: "Video & Animation",
      icon: <FaVideo />,
      description: "Video production and animation",
    },
    {
      value: "data-science",
      label: "Data Science",
      icon: <FaDatabase />,
      description: "Data analysis and machine learning",
    },
    {
      value: "business",
      label: "Business Consulting",
      icon: <FaUserTie />,
      description: "Business strategy and consulting",
    },
  ];

  const experienceLevels = [
    {
      value: "entry",
      label: "Entry Level",
      description: "0-2 years of professional experience",
      icon: <FaUsers />,
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "2-5 years of professional experience",
      icon: <FaUserTie />,
    },
    {
      value: "expert",
      label: "Expert",
      description: "5+ years of professional experience",
      icon: <FaRocket />,
    },
  ];

  const projectTypes = [
    {
      value: "one-time",
      label: "One-time Project",
      description: "Single deliverable project",
    },
    {
      value: "ongoing",
      label: "Ongoing Work",
      description: "Long-term collaboration",
    },
    {
      value: "complex",
      label: "Complex Project",
      description: "Multi-phase complex project",
    },
  ];

  const locationTypes = [
    { value: "remote", label: "Remote", description: "Work from anywhere" },
    {
      value: "onsite",
      label: "On-site",
      description: "Work at client location",
    },
    {
      value: "hybrid",
      label: "Hybrid",
      description: "Combination of remote and on-site",
    },
  ];

  const confidentialityLevels = [
    {
      value: "standard",
      label: "Standard",
      description: "Basic project details visible",
    },
    {
      value: "confidential",
      label: "Confidential",
      description: "Limited details until hired",
    },
    {
      value: "nda-required",
      label: "NDA Required",
      description: "Non-disclosure agreement needed",
    },
  ];

  const stepHeaders = {
    1: {
      title: "Project Overview",
      subtitle: "Define your project goals and requirements",
      icon: <FaFileAlt />,
    },
    2: {
      title: "Project Details",
      subtitle: "Specify skills, timeline, and budget",
      icon: <FaTools />,
    },
    3: {
      title: "Review & Publish",
      subtitle: "Verify details and publish your job",
      icon: <FaRocket />,
    },
  };

  // Currency conversion functions
  const convertToUSD = (inrAmount) => {
    return (inrAmount / exchangeRate).toFixed(2);
  };

  const convertToINR = (usdAmount) => {
    return Math.round(usdAmount * exchangeRate);
  };

  const toggleCurrency = () => {
    if (formData.budget) {
      const currentBudget = parseFloat(formData.budget);
      if (!isNaN(currentBudget)) {
        if (currency === "USD") {
          // Convert USD to INR
          setFormData((prev) => ({
            ...prev,
            budget: convertToINR(currentBudget),
          }));
        } else {
          // Convert INR to USD
          setFormData((prev) => ({
            ...prev,
            budget: convertToUSD(currentBudget),
          }));
        }
      }
    }
    setCurrency((prev) => (prev === "USD" ? "INR" : "USD"));
  };

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
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim())
      newErrors.description = "Project description is required";
    if (!formData.category) newErrors.category = "Please select a category";

    // REMOVED BUDGET VALIDATION - No minimum budget required
    if (!formData.budget) newErrors.budget = "Please enter a project budget";

    if (!formData.deadline) newErrors.deadline = "Project deadline is required";
    if (formData.skills.length === 0)
      newErrors.skills = "At least one skill is required";
    if (!formData.duration) newErrors.duration = "Project duration is required";
    if (!formData.projectScope)
      newErrors.projectScope = "Project scope is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Convert budget to USD for storage if it's in INR
      const budgetToStore =
        currency === "INR"
          ? convertToUSD(parseFloat(formData.budget))
          : parseFloat(formData.budget);

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          budget: budgetToStore,
          budgetCurrency: "USD", // Always store in USD
          originalBudget: formData.budget,
          originalCurrency: currency,
          exchangeRate: exchangeRate,
          userId: user.id,
          status: "active",
          postedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        router.push("/client-dashboard/my-jobs?success=true");
      } else {
        const error = await response.json();
        setErrors({ submit: error.error });
      }
    } catch (error) {
      setErrors({ submit: "Failed to post job. Please try again." });
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

  // Format currency for display
  const formatCurrency = (amount, curr = currency) => {
    if (!amount) return "";
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return "";

    return new Intl.NumberFormat(curr === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: curr === "USD" ? 2 : 0,
      maximumFractionDigits: curr === "USD" ? 2 : 0,
    }).format(numericAmount);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return currency === "USD" ? <FaDollarSign /> : <FaRupeeSign />;
  };

  // Get quick budget suggestions based on current currency
  const getBudgetSuggestions = () => {
    const baseAmounts = [100, 500, 1000, 2500, 5000, 10000, 25000];
    if (currency === "USD") {
      return baseAmounts;
    } else {
      return baseAmounts.map((amount) => Math.round(amount * exchangeRate));
    }
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
            <div className={styles.headerText}>
              <h1>Post a New Job</h1>
              <p>
                Find the perfect talent for your project. Post your job and get
                qualified proposals within hours.
              </p>
            </div>
            <div className={styles.headerActions}>
              <motion.button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`${styles.previewToggle} ${
                  showPreview ? styles.active : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showPreview ? <FaEdit /> : <FaEye />}
                {showPreview ? "Edit Job" : "Preview Job"}
              </motion.button>
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
                  {currentStep > step ? <FaCheck /> : step}
                </div>
                <span className={styles.stepLabel}>
                  {stepHeaders[step].title}
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

        <div className={styles.contentWrapper}>
          {/* Main Form */}
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
                  {/* Step Header */}
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIcon}>{stepHeaders[1].icon}</div>
                    <div className={styles.stepHeaderText}>
                      <h2>{stepHeaders[1].title}</h2>
                      <p>{stepHeaders[1].subtitle}</p>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <motion.div
                      className={styles.formGroup}
                      variants={itemVariants}
                    >
                      <label className={styles.label}>
                        Job Title *
                        <span className={styles.labelHint}>
                          Be specific about the role
                        </span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior React Developer for SaaS Platform"
                        className={`${styles.input} ${
                          errors.title ? styles.error : ""
                        }`}
                      />
                      <div className={styles.inputHint}>
                        <FaLightbulb />
                        Example: "Full-stack Developer for E-commerce Website"
                      </div>
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
                        Project Description *
                        <span className={styles.labelHint}>
                          Detailed projects attract better proposals
                        </span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the project objectives, key requirements, expected deliverables, and any specific technologies or methodologies you prefer..."
                        className={`${styles.textarea} ${
                          errors.description ? styles.error : ""
                        }`}
                        rows="8"
                      />
                      <div className={styles.textareaInfo}>
                        <div className={styles.charCount}>
                          {formData.description.length}/5000 characters
                        </div>
                        <div className={styles.inputHint}>
                          <FaInfoCircle />
                          Include project goals, technical requirements, and
                          success metrics
                        </div>
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
                  </div>

                  <motion.div
                    className={styles.formActions}
                    variants={itemVariants}
                  >
                    <div className={styles.actionInfo}>
                      <FaInfoCircle />
                      <span>Step 1 of 3 - Basic project information</span>
                    </div>
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className={styles.nextBtn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue to Project Details →
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
                  {/* Step Header */}
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIcon}>{stepHeaders[2].icon}</div>
                    <div className={styles.stepHeaderText}>
                      <h2>{stepHeaders[2].title}</h2>
                      <p>{stepHeaders[2].subtitle}</p>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                      <h3>Project Category & Skills</h3>
                      <p>Select the category that best matches your project</p>
                    </div>

                    <motion.div
                      className={styles.formGroup}
                      variants={itemVariants}
                    >
                      <label className={styles.label}>Project Category *</label>
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
                            <div className={styles.categoryIcon}>
                              {cat.icon}
                            </div>
                            <div className={styles.categoryContent}>
                              <h4>{cat.label}</h4>
                              <p>{cat.description}</p>
                            </div>
                            <div className={styles.checkmark}>
                              <FaCheck />
                            </div>
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

                    <div className={styles.sectionHeader}>
                      <h3>Experience Requirements</h3>
                      <p>Define the expertise level you're looking for</p>
                    </div>

                    <motion.div
                      className={styles.formGroup}
                      variants={itemVariants}
                    >
                      <label className={styles.label}>
                        Required Experience Level
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
                            <div className={styles.experienceIcon}>
                              {level.icon}
                            </div>
                            <div className={styles.experienceContent}>
                              <h4>{level.label}</h4>
                              <p>{level.description}</p>
                            </div>
                            <div className={styles.checkmark}>
                              <FaCheck />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <div className={styles.sectionHeader}>
                      <h3>Project Setup</h3>
                      <p>Define project parameters and location</p>
                    </div>

                    <div className={styles.formRow}>
                      <motion.div
                        className={styles.formGroup}
                        variants={itemVariants}
                      >
                        <label className={styles.label}>Project Type</label>
                        <div className={styles.optionGrid}>
                          {projectTypes.map((type) => (
                            <motion.div
                              key={type.value}
                              className={`${styles.optionCard} ${
                                formData.projectType === type.value
                                  ? styles.selected
                                  : ""
                              }`}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  projectType: type.value,
                                }))
                              }
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <h4>{type.label}</h4>
                              <p>{type.description}</p>
                              <div className={styles.checkmark}>
                                <FaCheck />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        className={styles.formGroup}
                        variants={itemVariants}
                      >
                        <label className={styles.label}>Work Location</label>
                        <div className={styles.optionGrid}>
                          {locationTypes.map((location) => (
                            <motion.div
                              key={location.value}
                              className={`${styles.optionCard} ${
                                formData.locationType === location.value
                                  ? styles.selected
                                  : ""
                              }`}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  locationType: location.value,
                                }))
                              }
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <h4>{location.label}</h4>
                              <p>{location.description}</p>
                              <div className={styles.checkmark}>
                                <FaCheck />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {formData.locationType !== "remote" && (
                      <motion.div
                        className={styles.formGroup}
                        variants={itemVariants}
                      >
                        <label className={styles.label}>
                          Work Location Address
                        </label>
                        <input
                          type="text"
                          name="clientLocation"
                          value={formData.clientLocation}
                          onChange={handleInputChange}
                          placeholder="Enter city and country for on-site work"
                          className={styles.input}
                        />
                      </motion.div>
                    )}
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
                      ← Back to Overview
                    </motion.button>
                    <div className={styles.actionInfo}>
                      <FaInfoCircle />
                      <span>Step 2 of 3 - Project specifications</span>
                    </div>
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className={styles.nextBtn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue to Final Details →
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
                  {/* Step Header */}
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIcon}>{stepHeaders[3].icon}</div>
                    <div className={styles.stepHeaderText}>
                      <h2>{stepHeaders[3].title}</h2>
                      <p>{stepHeaders[3].subtitle}</p>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                      <h3>Budget & Timeline</h3>
                      <p>Set your budget and project deadlines</p>
                    </div>

                    <div className={styles.formRow}>
                      <motion.div
                        className={styles.formGroup}
                        variants={itemVariants}
                      >
                        <label className={styles.label}>
                          <div className={styles.currencyHeader}>
                            <span>Project Budget ({currency}) *</span>
                            <motion.button
                              type="button"
                              onClick={toggleCurrency}
                              className={styles.currencyToggle}
                              disabled={isConverting}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isConverting ? (
                                <FaSync className={styles.spinner} />
                              ) : (
                                <FaExchangeAlt />
                              )}
                              {currency === "USD" ? "USD → INR" : "INR → USD"}
                            </motion.button>
                          </div>
                          <span className={styles.labelHint}>
                            Total project budget - No minimum required
                          </span>
                        </label>
                        <div className={styles.budgetInput}>
                          <div className={styles.inputWithIcon}>
                            <span> {getCurrencySymbol()}</span>{" "}
                            <input
                              type="number"
                              name="budget"
                              value={formData.budget}
                              onChange={handleInputChange}
                              placeholder={
                                currency === "USD"
                                  ? "Enter amount"
                                  : "Enter amount"
                              }
                              min="0"
                              step={currency === "USD" ? "1" : "1"}
                              className={`${styles.input} ${
                                errors.budget ? styles.error : ""
                              }`}
                            />
                          </div>
                          <div className={styles.budgetSuggestions}>
                            <span>Quick select: </span>
                            {getBudgetSuggestions().map((amount) => (
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
                                {formatCurrency(amount)}
                              </button>
                            ))}
                          </div>
                          {formData.budget && (
                            <div className={styles.conversionNote}>
                              ≈{" "}
                              {formatCurrency(
                                currency === "USD"
                                  ? convertToINR(parseFloat(formData.budget))
                                  : convertToUSD(parseFloat(formData.budget)),
                                currency === "USD" ? "INR" : "USD"
                              )}
                            </div>
                          )}
                        </div>
                        <div className={styles.inputHint}>
                          <FaInfoCircle />
                          Set any budget amount that works for your project
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
                          Project Deadline *
                          <span className={styles.labelHint}>
                            Expected completion date
                          </span>
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

                    <div className={styles.formRow}>
                      <motion.div
                        className={styles.formGroup}
                        variants={itemVariants}
                      >
                        <label className={styles.label}>
                          Project Duration *
                          <span className={styles.labelHint}>
                            Estimated timeline
                          </span>
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="e.g., 3-6 months, 2 weeks, 6+ months"
                          className={`${styles.input} ${
                            errors.duration ? styles.error : ""
                          }`}
                        />
                        <AnimatePresence>
                          {errors.duration && (
                            <motion.span
                              className={styles.errorText}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              {errors.duration}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        className={styles.formGroup}
                        variants={itemVariants}
                      >
                        <label className={styles.label}>
                          Company Name
                          <span className={styles.labelHint}>
                            Optional - for business clients
                          </span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Your company or organization name"
                          className={styles.input}
                        />
                      </motion.div>
                    </div>

                    <div className={styles.sectionHeader}>
                      <h3>Project Requirements</h3>
                      <p>Define skills and project scope</p>
                    </div>

                    <motion.div
                      className={styles.formGroup}
                      variants={itemVariants}
                    >
                      <label className={styles.label}>
                        Required Skills & Technologies *
                        <span className={styles.labelHint}>
                          Add relevant skills and technologies
                        </span>
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
                            placeholder="Add skills like React, Node.js, UI/UX Design, Python..."
                            className={styles.input}
                          />
                          <motion.button
                            type="button"
                            onClick={addSkill}
                            className={styles.addSkillBtn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Add Skill
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

                    <motion.div
                      className={styles.formGroup}
                      variants={itemVariants}
                    >
                      <label className={styles.label}>
                        Project Scope & Deliverables *
                        <span className={styles.labelHint}>
                          Detailed scope helps freelancers understand
                          requirements
                        </span>
                      </label>
                      <textarea
                        name="projectScope"
                        value={formData.projectScope}
                        onChange={handleInputChange}
                        placeholder="Describe specific deliverables, milestones, success criteria, and any technical requirements..."
                        className={`${styles.textarea} ${
                          errors.projectScope ? styles.error : ""
                        }`}
                        rows="6"
                      />
                      <div className={styles.inputHint}>
                        <FaInfoCircle />
                        Be specific about what you expect to be delivered and
                        when
                      </div>
                      <AnimatePresence>
                        {errors.projectScope && (
                          <motion.span
                            className={styles.errorText}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {errors.projectScope}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      className={styles.formGroup}
                      variants={itemVariants}
                    >
                      <label className={styles.label}>
                        Project Confidentiality
                        <span className={styles.labelHint}>
                          Control visibility of project details
                        </span>
                      </label>
                      <div className={styles.optionGrid}>
                        {confidentialityLevels.map((level) => (
                          <motion.div
                            key={level.value}
                            className={`${styles.optionCard} ${
                              formData.confidentiality === level.value
                                ? styles.selected
                                : ""
                            }`}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                confidentiality: level.value,
                              }))
                            }
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={styles.confidentialityHeader}>
                              <FaShieldAlt />
                              <h4>{level.label}</h4>
                            </div>
                            <p>{level.description}</p>
                            <div className={styles.checkmark}>
                              <FaCheck />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Inline Preview Section */}
                  <div className={styles.inlinePreview}>
                    <div className={styles.previewHeader}>
                      <h3>Job Preview</h3>
                      <p>This is how your job will appear to freelancers</p>
                    </div>
                    <JobPreview
                      formData={formData}
                      categories={categories}
                      experienceLevels={experienceLevels}
                      projectTypes={projectTypes}
                      currency={currency}
                      formatCurrency={formatCurrency}
                    />
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
                      ← Back to Details
                    </motion.button>
                    <div className={styles.actionInfo}>
                      <FaInfoCircle />
                      <span>Step 3 of 3 - Final review and submission</span>
                    </div>
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
                          Publishing Job...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          Publish Job Post
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
                  <FaInfoCircle />
                  {errors.submit}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Sidebar Preview */}
          <AnimatePresence>
            {showPreview && currentStep !== 3 && (
              <motion.div
                className={styles.jobPreviewSidebar}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.previewHeader}>
                  <h3>Job Preview</h3>
                  <p>This is how your job will appear to freelancers</p>
                </div>
                <JobPreview
                  formData={formData}
                  categories={categories}
                  experienceLevels={experienceLevels}
                  projectTypes={projectTypes}
                  currency={currency}
                  formatCurrency={formatCurrency}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

// Job Preview Component
function JobPreview({
  formData,
  categories,
  experienceLevels,
  projectTypes,
  currency,
  formatCurrency,
}) {
  return (
    <div className={styles.previewContent}>
      <div className={styles.previewCard}>
        <div className={styles.previewHeaderSection}>
          <div className={styles.previewTitle}>
            <h4>{formData.title || "Your Job Title"}</h4>
            <span className={styles.budgetPreview}>
              {formatCurrency
                ? formatCurrency(formData.budget)
                : `$${formData.budget || "0"}`}
            </span>
          </div>

          <div className={styles.previewMeta}>
            <div className={styles.metaItem}>
              <FaRegClock />
              <span>Posted just now</span>
            </div>
            <div className={styles.metaItem}>
              <FaMapMarkerAlt />
              <span>
                {formData.locationType === "remote"
                  ? "Remote"
                  : formData.clientLocation || "Location not specified"}
              </span>
            </div>
            <div className={styles.metaItem}>
              <FaIndustry />
              <span>
                {categories.find((c) => c.value === formData.category)?.label ||
                  "Category not selected"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.previewBody}>
          <div className={styles.previewSection}>
            <h5>Project Description</h5>
            <p className={styles.previewDescription}>
              {formData.description || "No description provided"}
            </p>
          </div>

          <div className={styles.previewSection}>
            <h5>Required Skills</h5>
            <div className={styles.skillsList}>
              {formData.skills.length > 0 ? (
                formData.skills.map((skill, index) => (
                  <span key={index} className={styles.skillChip}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className={styles.noSkills}>No skills added</span>
              )}
            </div>
          </div>

          <div className={styles.previewDetails}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <FaUserTie className={styles.detailIcon} />
                <div>
                  <span className={styles.detailLabel}>Experience Level</span>
                  <span className={styles.detailValue}>
                    {experienceLevels.find(
                      (e) => e.value === formData.experienceLevel
                    )?.label || "Not specified"}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <FaBriefcase className={styles.detailIcon} />
                <div>
                  <span className={styles.detailLabel}>Project Type</span>
                  <span className={styles.detailValue}>
                    {projectTypes.find((p) => p.value === formData.projectType)
                      ?.label || "Not specified"}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <FaClock className={styles.detailIcon} />
                <div>
                  <span className={styles.detailLabel}>Duration</span>
                  <span className={styles.detailValue}>
                    {formData.duration || "Not specified"}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <FaCalendar className={styles.detailIcon} />
                <div>
                  <span className={styles.detailLabel}>Deadline</span>
                  <span className={styles.detailValue}>
                    {formData.deadline
                      ? new Date(formData.deadline).toLocaleDateString()
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {formData.companyName && (
            <div className={styles.companySection}>
              <FaCheckCircle className={styles.companyIcon} />
              <span className={styles.companyText}>
                Verified Company: {formData.companyName}
              </span>
            </div>
          )}
        </div>

        <div className={styles.previewFooter}>
          <div className={styles.estimatedProposals}>
            <FaStar className={styles.proposalIcon} />
            <span>Estimated 15-25 proposals</span>
          </div>
          <button className={styles.applyButton}>Apply Now</button>
        </div>
      </div>
    </div>
  );
}
