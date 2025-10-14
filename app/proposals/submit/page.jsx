"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaDollarSign,
  FaClock,
  FaUser,
  FaBriefcase,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaFileAlt,
  FaStar,
  FaShieldAlt,
  FaUserTie,
  FaInfoCircle,
  FaUsers,
} from "react-icons/fa";
import { IoTime, IoDocumentText } from "react-icons/io5";
import styles from "./SubmitProposal.module.css";

export default function SubmitProposalPage() {
  const [job, setJob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasExistingProposal, setHasExistingProposal] = useState(false);
  const [proposalStats, setProposalStats] = useState({
    totalProposals: 0,
    userHasProposal: false,
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId");

  // Proposal form state
  const [proposal, setProposal] = useState({
    bidAmount: "",
    timeframe: 30,
    coverLetter: "",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log("🔐 Fetching current user...");
        const userResponse = await fetch("/api/auth/verify");

        if (userResponse.ok) {
          const data = await userResponse.json();
          console.log("✅ User data received:", data);

          if (data.success && data.user) {
            setCurrentUser(data.user);
            // Check if user already has a proposal for this job
            if (data.user.id && jobId) {
              await checkExistingProposal(data.user.id, jobId);
            }
          } else {
            throw new Error("No user data received");
          }
        } else {
          const errorData = await userResponse.json();
          console.error("❌ User fetch failed:", errorData);
          throw new Error(errorData.error || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("🚨 Error fetching user:", error);
        setError("Please log in to submit a proposal");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    };

    if (jobId) {
      fetchCurrentUser();
      fetchJobDetails();
    } else {
      setError("No job specified");
      setLoading(false);
    }
  }, [jobId, router]);

  // Check if user already has a proposal for this job
  const checkExistingProposal = async (userId, jobId) => {
    try {
      console.log(
        "🔍 Checking existing proposal for user:",
        userId,
        "job:",
        jobId
      );
      const response = await fetch(
        `/api/proposals?userId=${userId}&jobId=${jobId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Existing proposal check:", data);

        if (data.hasExistingProposal) {
          setHasExistingProposal(true);
          setError("You have already submitted a proposal for this job");
        }
      } else {
        console.error("❌ Failed to check existing proposal");
      }
    } catch (error) {
      console.error("🚨 Error checking existing proposal:", error);
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching job details for ID:", jobId);

      const response = await fetch(`/api/jobs/${jobId}`);
      console.log("📡 Job API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Job data received:", data);
        setJob(data.job);

        // Get proposal stats for this job
        await fetchProposalStats(jobId);

        // Pre-fill bid amount with 90% of job budget
        if (data.job && data.job.budget) {
          setProposal((prev) => ({
            ...prev,
            bidAmount: Math.round(data.job.budget * 0.9).toString(),
          }));
        }
      } else {
        const errorData = await response.json();
        console.error("❌ Job fetch failed:", errorData);
        throw new Error(errorData.error || "Failed to fetch job details");
      }
    } catch (err) {
      console.error("🚨 Error fetching job:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProposalStats = async (jobId) => {
    try {
      console.log("📊 Fetching proposal stats for job:", jobId);
      const response = await fetch(`/api/proposals?jobId=${jobId}`);

      if (response.ok) {
        const data = await response.json();
        console.log("📈 Proposal stats:", data);

        if (data.success) {
          setProposalStats({
            totalProposals: data.proposals?.length || 0,
            userHasProposal: hasExistingProposal,
          });
        }
      } else {
        console.error("❌ Failed to fetch proposal stats");
      }
    } catch (error) {
      console.error("🚨 Error fetching proposal stats:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setProposal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateProposal = () => {
    if (!currentUser) {
      return "Please log in to submit a proposal";
    }

    if (hasExistingProposal) {
      return "You have already submitted a proposal for this job";
    }

    if (!proposal.bidAmount || parseFloat(proposal.bidAmount) <= 0) {
      return "Please enter a valid bid amount";
    }

    if (job && parseFloat(proposal.bidAmount) > job.budget * 2) {
      return "Bid amount seems too high for this project";
    }

    if (!proposal.timeframe || proposal.timeframe < 1) {
      return "Please enter a valid timeframe";
    }

    if (!proposal.coverLetter.trim() || proposal.coverLetter.length < 50) {
      return "Cover letter should be at least 50 characters long";
    }

    if (proposal.coverLetter.length > 2000) {
      return "Cover letter is too long (max 2000 characters)";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateProposal();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const proposalData = {
        jobId: parseInt(jobId),
        coverLetter: proposal.coverLetter,
        bidAmount: parseFloat(proposal.bidAmount),
        timeframe: parseInt(proposal.timeframe),
        freelancerId: currentUser.id,
      };

      console.log("🚀 Submitting proposal:", proposalData);

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      const result = await response.json();
      console.log("📨 Proposal submission response:", result);

      if (response.ok) {
        setSuccess(result.message || "Proposal submitted successfully!");
        setHasExistingProposal(true);

        // Redirect to proposals page after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/proposals");
        }, 2000);
      } else {
        // Handle specific error cases
        if (result.code === "DUPLICATE_PROPOSAL") {
          setHasExistingProposal(true);
          setError("You have already submitted a proposal for this job");
        } else if (result.code === "INSUFFICIENT_CONNECTS") {
          setError(`Insufficient connects: ${result.details}`);
        } else {
          const errorMessage = result.details
            ? `${result.error}: ${result.details}`
            : result.error || "Failed to submit proposal";
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error("🚨 Proposal submission error:", err);
      setError("Failed to submit proposal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSavings = () => {
    if (!job || !proposal.bidAmount) return 0;
    const savings = job.budget - parseFloat(proposal.bidAmount);
    return savings > 0 ? savings : 0;
  };

  const getBidRecommendation = () => {
    if (!job) return "";
    const budget = job.budget;
    const bid = parseFloat(proposal.bidAmount) || 0;

    if (bid === 0) return "";
    if (bid < budget * 0.7) return "Your bid is significantly below budget";
    if (bid < budget * 0.9)
      return "Competitive bid - good chance of acceptance";
    if (bid <= budget) return "Fair bid within client's budget";
    if (bid <= budget * 1.2)
      return "Premium bid - justify with exceptional value";
    return "Bid exceeds budget - may need strong justification";
  };

  const getCompetitionLevel = () => {
    const count = proposalStats.totalProposals;
    if (count === 0)
      return {
        level: "Low",
        color: "#10b981",
        description: "Be the first to apply!",
      };
    if (count < 3)
      return {
        level: "Medium",
        color: "#f59e0b",
        description: "Good chance of getting hired",
      };
    if (count < 6)
      return {
        level: "High",
        color: "#f97316",
        description: "Competitive - make your proposal stand out",
      };
    return {
      level: "Very High",
      color: "#ef4444",
      description: "Highly competitive - focus on quality",
    };
  };

  // FIXED: Safe skills display function
  const getJobSkills = () => {
    if (!job || !job.skills) return [];

    if (Array.isArray(job.skills)) {
      return job.skills;
    } else if (typeof job.skills === "string") {
      return job.skills.split(",").map((skill) => skill.trim());
    }

    return [];
  };

  const viewExistingProposal = () => {
    router.push("/dashboard/proposals");
  };

  const goToLogin = () => {
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
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
        <div className={styles.errorContent}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2>Unable to Load Job</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push("/find-work")}
            className={styles.backButton}
          >
            <FaArrowLeft /> Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const jobSkills = getJobSkills();
  const competition = getCompetitionLevel();

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerContent}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <FaArrowLeft /> Back to Job
          </button>
          <div className={styles.headerMain}>
            <h1>Submit Proposal</h1>
            <div className={styles.userBadge}>
              <FaUserTie />
              <span>{currentUser?.name || "Please Log In"}</span>
            </div>
          </div>
          <div className={styles.jobReference}>{job?.title}</div>
        </div>
      </motion.header>

      <div className={styles.content}>
        {/* Left Column - Proposal Form */}
        <div className={styles.mainContent}>
          <motion.div
            className={styles.formCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.cardHeader}>
              <h2>
                <IoDocumentText /> Proposal Details
              </h2>
              <p>Create a compelling proposal to win this project</p>

              {/* Competition Info */}
              {job && (
                <div className={styles.competitionInfo}>
                  <FaUsers className={styles.competitionIcon} />
                  <div className={styles.competitionText}>
                    <span
                      className={styles.competitionLevel}
                      style={{ color: competition.color }}
                    >
                      {competition.level} Competition
                    </span>
                    <span className={styles.competitionDescription}>
                      {competition.description}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Login Required Warning */}
            <AnimatePresence>
              {!currentUser && (
                <motion.div
                  className={styles.loginRequiredWarning}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FaInfoCircle className={styles.warningIcon} />
                  <div className={styles.warningContent}>
                    <h4>Login Required</h4>
                    <p>
                      You need to be logged in to submit a proposal. Please log
                      in to continue.
                    </p>
                    <div className={styles.existingProposalActions}>
                      <button
                        onClick={goToLogin}
                        className={styles.loginButton}
                      >
                        Log In Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Existing Proposal Warning */}
            <AnimatePresence>
              {hasExistingProposal && (
                <motion.div
                  className={styles.existingProposalWarning}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FaInfoCircle className={styles.warningIcon} />
                  <div className={styles.warningContent}>
                    <h4>Proposal Already Submitted</h4>
                    <p>
                      You have already submitted a proposal for this job. You
                      cannot submit multiple proposals for the same job.
                    </p>
                    <div className={styles.existingProposalActions}>
                      <button
                        onClick={viewExistingProposal}
                        className={styles.viewProposalButton}
                      >
                        View Your Proposal
                      </button>
                      <button
                        onClick={() => router.push("/find-work")}
                        className={styles.findWorkButton}
                      >
                        Find Other Jobs
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className={styles.proposalForm}>
              {/* Bid Amount */}
              <div className={styles.formGroup}>
                <label htmlFor="bidAmount">
                  <FaDollarSign /> Your Bid Amount ($)
                </label>
                <div className={styles.inputWithRecommendation}>
                  <input
                    type="number"
                    id="bidAmount"
                    value={proposal.bidAmount}
                    onChange={(e) =>
                      handleInputChange("bidAmount", e.target.value)
                    }
                    min="1"
                    step="1"
                    placeholder="Enter your proposed amount"
                    required
                    className={styles.formInput}
                    disabled={hasExistingProposal || !currentUser}
                  />
                  {proposal.bidAmount && job && (
                    <div className={styles.bidInfo}>
                      <span className={styles.budgetComparison}>
                        Client Budget: ${job.budget?.toLocaleString()}
                      </span>
                      {calculateSavings() > 0 && (
                        <span className={styles.savings}>
                          Client Saves: ${calculateSavings().toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {proposal.bidAmount && (
                  <div className={styles.recommendation}>
                    <FaLightbulb />
                    {getBidRecommendation()}
                  </div>
                )}
              </div>

              {/* Timeframe */}
              <div className={styles.formGroup}>
                <label htmlFor="timeframe">
                  <FaClock /> Estimated Timeline (Days)
                </label>
                <input
                  type="number"
                  id="timeframe"
                  value={proposal.timeframe}
                  onChange={(e) =>
                    handleInputChange("timeframe", e.target.value)
                  }
                  min="1"
                  max="365"
                  required
                  className={styles.formInput}
                  disabled={hasExistingProposal || !currentUser}
                />
                <div className={styles.timeframeHelp}>
                  How many days do you need to complete this project?
                </div>
              </div>

              {/* Cover Letter */}
              <div className={styles.formGroup}>
                <label htmlFor="coverLetter">
                  <FaFileAlt /> Cover Letter
                </label>
                <div className={styles.coverLetterContainer}>
                  <textarea
                    id="coverLetter"
                    value={proposal.coverLetter}
                    onChange={(e) =>
                      handleInputChange("coverLetter", e.target.value)
                    }
                    placeholder={`Dear ${job?.user?.name || "Client"},

I'm excited to submit my proposal for your "${job?.title}" project. 

[Explain why you're a good fit, your relevant experience, and your approach to the project...]

Looking forward to the opportunity to work with you.`}
                    rows="8"
                    required
                    className={styles.formTextarea}
                    disabled={hasExistingProposal || !currentUser}
                  />
                  <div className={styles.characterCount}>
                    {proposal.coverLetter.length}/2000 characters
                    {proposal.coverLetter.length > 1800 && (
                      <span className={styles.characterWarning}>
                        Approaching limit
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.coverLetterTips}>
                  <FaLightbulb />
                  <div>
                    <strong>Tips for a great cover letter:</strong>
                    <ul>
                      <li>Address the client by name</li>
                      <li>Show you understand their needs</li>
                      <li>Highlight relevant experience</li>
                      <li>Explain your approach</li>
                      <li>Be professional and enthusiastic</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Error and Success Messages */}
              <AnimatePresence>
                {error && !hasExistingProposal && (
                  <motion.div
                    className={styles.errorMessage}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FaExclamationTriangle />
                    {error}
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
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={
                  submitting || success || hasExistingProposal || !currentUser
                }
                className={`${styles.submitButton} ${
                  submitting ? styles.submitting : ""
                } ${success ? styles.success : ""} ${
                  hasExistingProposal || !currentUser ? styles.disabled : ""
                }`}
                whileHover={{
                  scale:
                    submitting || success || hasExistingProposal || !currentUser
                      ? 1
                      : 1.05,
                }}
                whileTap={{
                  scale:
                    submitting || success || hasExistingProposal || !currentUser
                      ? 1
                      : 0.95,
                }}
              >
                {submitting ? (
                  <>
                    <motion.div
                      className={styles.submitSpinner}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Submitting Proposal...
                  </>
                ) : success ? (
                  <>
                    <FaCheckCircle />
                    Proposal Submitted!
                  </>
                ) : hasExistingProposal ? (
                  <>
                    <FaCheckCircle />
                    Proposal Already Submitted
                  </>
                ) : !currentUser ? (
                  <>
                    <FaUser />
                    Please Log In
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Submit Proposal
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Right Column - Job Summary & Profile */}
        <div className={styles.sidebar}>
          {/* Job Summary */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3>Job Summary</h3>
            {job && (
              <div className={styles.jobSummary}>
                <div className={styles.summaryItem}>
                  <strong>Project:</strong>
                  <span>{job.title}</span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>Client:</strong>
                  <span>{job.user?.name || "Unknown Client"}</span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>Client Budget:</strong>
                  <span>${job.budget?.toLocaleString()}</span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>Category:</strong>
                  <span>{job.category}</span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>Proposals Received:</strong>
                  <span>
                    <FaUsers className={styles.proposalIcon} />
                    {proposalStats.totalProposals} applicants
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>Competition Level:</strong>
                  <span style={{ color: competition.color }}>
                    {competition.level}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>Deadline:</strong>
                  <span>{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
                {jobSkills.length > 0 && (
                  <div className={styles.summaryItem}>
                    <strong>Skills Required:</strong>
                    <div className={styles.skillsList}>
                      {jobSkills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Your Profile Summary */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3>Your Profile</h3>
            <div className={styles.profileSummary}>
              {currentUser ? (
                <>
                  <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{currentUser.name}</strong>
                      <p>
                        {currentUser.role === "freelancer"
                          ? "Freelancer"
                          : "Client"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.profileStats}>
                    <div className={styles.stat}>
                      <FaUser />
                      <span>{currentUser.role || "User"}</span>
                    </div>
                    <div className={styles.stat}>
                      <FaBriefcase />
                      <span>Active Member</span>
                    </div>
                  </div>
                  {hasExistingProposal && (
                    <div className={styles.proposalStatus}>
                      <FaCheckCircle className={styles.statusIcon} />
                      <span>Already applied to this job</span>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.loginPrompt}>
                  <FaUser className={styles.loginIcon} />
                  <p>Please log in to see your profile</p>
                  <button
                    onClick={goToLogin}
                    className={styles.loginButtonSmall}
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Proposal Tips */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>
              <FaLightbulb /> Proposal Tips
            </h3>
            <div className={styles.tipsList}>
              <div className={styles.tip}>
                <strong>Be Specific</strong>
                <p>Reference specific requirements from the job description</p>
              </div>
              <div className={styles.tip}>
                <strong>Show Value</strong>
                <p>Explain how your skills will benefit the client</p>
              </div>
              <div className={styles.tip}>
                <strong>Set Expectations</strong>
                <p>Be clear about deliverables and timeline</p>
              </div>
              <div className={styles.tip}>
                <strong>Ask Questions</strong>
                <p>Show engagement by asking relevant questions</p>
              </div>
            </div>
          </motion.div>

          {/* Safety Reminder */}
          <motion.div
            className={styles.safetyCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <FaShieldAlt className={styles.safetyIcon} />
            <h4>Stay Safe</h4>
            <p>
              Always communicate and pay through the platform. Never share
              personal payment information.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
