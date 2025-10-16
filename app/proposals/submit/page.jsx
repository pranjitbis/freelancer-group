"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./SubmitProposal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaMoneyBillWave,
  FaClock,
  FaUser,
  FaBriefcase,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDollarSign,
  FaRupeeSign,
} from "react-icons/fa";

// Loading component for Suspense fallback
function SubmitProposalLoading() {
  return (
    <div className={styles.loadingContainer}>
      <motion.div
        className={styles.professionalSpinner}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p>Loading proposal form...</p>
    </div>
  );
}

// Main component that uses useSearchParams
function SubmitProposalContent() {
  const [job, setJob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    coverLetter: "",
    bidAmount: "",
    timeline: "",
    timeframe: "",
    attachments: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [exchangeRate, setExchangeRate] = useState(83);

  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  useEffect(() => {
    if (jobId) {
      fetchCurrentUser();
      fetchJobDetails();
      fetchExchangeRate();
    } else {
      setError("No job ID provided");
      setLoading(false);
    }
  }, [jobId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchExchangeRate = async () => {
    setExchangeRate(83);
  };

  const extractJobId = (jobIdParam) => {
    if (!jobIdParam) return null;
    if (!isNaN(jobIdParam)) return parseInt(jobIdParam);

    const match = jobIdParam.toString().match(/(\d+)$/);
    if (match) return parseInt(match[1]);

    const numbers = jobIdParam.toString().match(/\d+/g);
    if (numbers && numbers.length > 0) return parseInt(numbers[0]);

    return null;
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const actualJobId = extractJobId(jobId);
      if (!actualJobId) {
        setError("Invalid job ID format");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/jobs/${actualJobId}`);

      if (!response.ok) {
        setError("Failed to fetch job details");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success && data.job) {
        setJob(data.job);
        setFormData((prev) => ({
          ...prev,
          bidAmount: data.job.budget || "",
        }));
      } else {
        setError(data.error || "Failed to load job details");
      }
    } catch (err) {
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (amount) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatINR = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const convertToINR = (usdAmount) => {
    return Math.round(usdAmount * exchangeRate);
  };

  const formatBudget = (budget) => {
    if (!budget) return { display: "Budget not specified", tooltip: "" };
    const inrAmount = convertToINR(budget);

    if (currency === "usd") {
      return {
        display: formatUSD(budget),
        tooltip: formatINR(inrAmount),
      };
    } else {
      return {
        display: formatINR(inrAmount),
        tooltip: formatUSD(budget),
      };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBidAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        bidAmount: value,
      }));
    }
  };

  const calculateTimeframe = (timelineDate) => {
    if (!timelineDate) return 0;

    const today = new Date();
    const targetDate = new Date(timelineDate);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!job) {
      setError("Job information is not available");
      return;
    }

    if (!currentUser) {
      setError("Please log in to submit a proposal");
      return;
    }

    if (!formData.coverLetter.trim()) {
      setError("Cover letter is required");
      return;
    }

    if (!formData.bidAmount || parseFloat(formData.bidAmount) <= 0) {
      setError("Please enter a valid bid amount");
      return;
    }

    if (!formData.timeline) {
      setError("Please provide an estimated timeline");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const timeframe = calculateTimeframe(formData.timeline);

      let bidAmountUSD = parseFloat(formData.bidAmount);
      if (currency === "inr") {
        bidAmountUSD = parseFloat(formData.bidAmount) / exchangeRate;
      }

      const proposalData = {
        jobId: job.id,
        freelancerId: currentUser.id,
        coverLetter: formData.coverLetter.trim(),
        bidAmount: bidAmountUSD,
        timeframe: timeframe,
        timeline: formData.timeline.trim(),
        attachments: formData.attachments.trim(),
        status: "submitted",
      };

      console.log("📤 Submitting proposal:", proposalData);

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit proposal");
      }

      if (data.success) {
        setSuccess("Proposal submitted successfully! Redirecting...");
        setTimeout(() => {
          router.push("/freelancer-dashboard/proposals");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to submit proposal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.professionalSpinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className={styles.errorContainer}>
        <motion.div
          className={styles.errorContent}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2>Unable to Load Job</h2>
          <p>{error}</p>
          <motion.button
            onClick={() => router.push("/freelancer-hub")}
            className={styles.backButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Back to Jobs
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const budget = job
    ? formatBudget(job.budget)
    : { display: "N/A", tooltip: "" };

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.nav
        className={styles.nav}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.navContent}>
          <motion.button
            onClick={() => router.back()}
            className={styles.backButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Back
          </motion.button>

          <div className={styles.navCenter}>
            <h1>Submit Proposal</h1>
            <p>Apply for this job opportunity</p>
          </div>

          <div className={styles.currencyToggle}>
            <button
              className={`${styles.currencyButton} ${
                currency === "usd" ? styles.active : ""
              }`}
              onClick={() => setCurrency("usd")}
            >
              <FaDollarSign />
              <span>USD</span>
            </button>
            <button
              className={`${styles.currencyButton} ${
                currency === "inr" ? styles.active : ""
              }`}
              onClick={() => setCurrency("inr")}
            >
              <FaRupeeSign />
              <span>INR</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content - Two Columns */}
      <div className={styles.content}>
        {/* Left Column - Job Details */}
        {job && (
          <motion.div
            className={styles.jobSection}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Job Details</h2>

              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <div className={styles.jobMeta}>
                  <span className={styles.metaItem}>
                    <FaClock /> Posted recently
                  </span>
                  <span className={styles.metaItem}>
                    <FaUser /> {job._count?.proposals || 0} proposals
                  </span>
                </div>
              </div>

              {/* Budget Display */}
              <div className={styles.budgetCard}>
                <div className={styles.budgetHeader}>
                  <FaMoneyBillWave className={styles.budgetIcon} />
                  <span>Client Budget</span>
                </div>
                <div className={styles.budgetAmount} title={budget.tooltip}>
                  {budget.display}
                </div>
              </div>

              {/* Skills */}
              {job.skills && (
                <div className={styles.skillsSection}>
                  <h4>Required Skills</h4>
                  <div className={styles.skillsList}>
                    {typeof job.skills === "string"
                      ? job.skills.split(",").map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill.trim()}
                          </span>
                        ))
                      : job.skills.map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className={styles.descriptionSection}>
                <h4>Job Description</h4>
                <div className={styles.description}>
                  {job.description ? (
                    job.description
                      .split("\n")
                      .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                  ) : (
                    <p>No description provided.</p>
                  )}
                </div>
              </div>

              {/* Client Info */}
              {job.user && (
                <div className={styles.clientSection}>
                  <h4>About the Client</h4>
                  <div className={styles.clientInfo}>
                    <div className={styles.clientHeader}>
                      <div className={styles.clientAvatar}>
                        {job.user.avatar ? (
                          <img src={job.user.avatar} alt={job.user.name} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            <FaUser />
                          </div>
                        )}
                      </div>
                      <div className={styles.clientDetails}>
                        <h5>{job.user.name}</h5>
                        <div className={styles.rating}>
                          <FaStar className={styles.starIcon} />
                          <span>{job.user.avgRating || "New"}</span>
                          <span>({job.user.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Right Column - Proposal Form */}
        <motion.div
          className={styles.formSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Submit Proposal</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className={styles.errorMessage}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FaExclamationTriangle />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    className={styles.successMessage}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FaCheckCircle />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cover Letter */}
              <div className={styles.formGroup}>
                <label htmlFor="coverLetter">
                  Cover Letter <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  placeholder="Explain why you're the best fit for this job. Describe your relevant experience and approach..."
                  rows={6}
                  className={styles.textarea}
                  required
                  maxLength={2000}
                />
                <div className={styles.charCount}>
                  {formData.coverLetter.length}/2000 characters
                </div>
              </div>

              {/* Bid Amount */}
              <div className={styles.formGroup}>
                <label htmlFor="bidAmount">
                  Your Bid Amount <span className={styles.required}>*</span>
                </label>
                <div className={styles.bidInputWrapper}>
                  <div className={styles.currencySymbol}>
                    {currency === "usd" ? <FaDollarSign /> : <FaRupeeSign />}
                  </div>
                  <input
                    type="text"
                    id="bidAmount"
                    name="bidAmount"
                    value={formData.bidAmount}
                    onChange={handleBidAmountChange}
                    placeholder="0.00"
                    className={styles.bidInput}
                    required
                  />
                </div>
                <div className={styles.budgetNote}>
                  Client budget: {budget.display}
                </div>
              </div>

              {/* Timeline */}
              <div className={styles.formGroup}>
                <label htmlFor="timeline">
                  Estimated Completion Date{" "}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className={styles.input}
                  min={getMinDate()}
                  required
                />
                <div className={styles.timelineNote}>
                  {formData.timeline && (
                    <span>
                      Estimated timeframe:{" "}
                      {calculateTimeframe(formData.timeline)} days
                    </span>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className={styles.formGroup}>
                <label htmlFor="attachments">Work Samples (Optional)</label>
                <input
                  type="text"
                  id="attachments"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                  placeholder="Links to portfolio, GitHub, previous work..."
                  className={styles.input}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={styles.submitButton}
                disabled={submitting || !job || !currentUser}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
              >
                {submitting ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Submit Proposal
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SubmitProposalPage() {
  return (
    <Suspense fallback={<SubmitProposalLoading />}>
      <SubmitProposalContent />
    </Suspense>
  );
}
