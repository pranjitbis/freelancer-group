"use client";
import { useState, useEffect } from "react";
import Nav from "../../home/component/Nav/page.jsx";
import Footer from "@/app/home/footer/page.jsx";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaDollarSign,
  FaCheckCircle,
  FaPaperPlane,
  FaEnvelope,
  FaUser,
  FaCode,
  FaGraduationCap,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaFileAlt,
} from "react-icons/fa";
import { MdWork, MdReviews, MdPerson } from "react-icons/md";
import styles from "./FreelancerProfile.module.css";

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    fetchUserData();
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${params.id}`);

      if (!response.ok) {
        throw new Error(`Failed to load user: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load user data");
      }

      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendProposal = async (proposalData) => {
    if (!currentUser) {
      alert("Please log in to send proposals");
      router.push("/login");
      return;
    }

    if (currentUser.id === user.id) {
      alert("You cannot send a proposal to yourself!");
      return;
    }

    if (currentUser.role !== "client") {
      alert("Only clients can send proposals");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/proposals/client-to-freelancer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: currentUser.id,
          freelancerId: user.id,
          projectTitle: proposalData.projectTitle,
          projectDescription: proposalData.projectDescription,
          coverLetter: proposalData.coverLetter,
          bidAmount: parseFloat(proposalData.bidAmount),
          timeframe: parseInt(proposalData.timeframe),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProposalSuccess(true);
        setTimeout(() => {
          setShowProposalModal(false);
          setProposalSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to send proposal");
      }
    } catch (error) {
      console.error("Error sending proposal:", error);
      alert(error.message || "Failed to send proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    if (!currentUser) {
      alert("Please log in to send messages");
      router.push("/login");
      return;
    }

    if (currentUser.id === user.id) {
      alert("You cannot message yourself!");
      return;
    }

    try {
      // First, create or get conversation
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: currentUser.role === "client" ? currentUser.id : user.id,
          freelancerId:
            currentUser.role === "freelancer" ? currentUser.id : user.id,
        }),
      });

      const conversationData = await conversationResponse.json();

      if (!conversationData.success) {
        throw new Error(
          conversationData.error || "Failed to create conversation"
        );
      }

      // Send the message
      const messageResponse = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversationData.conversation.id,
          senderId: currentUser.id,
          content: messageData.message,
          messageType: "TEXT",
        }),
      });

      const messageDataResult = await messageResponse.json();

      if (messageDataResult.success) {
        alert(
          "Message sent successfully! The user will respond to you shortly."
        );
      } else {
        throw new Error(messageDataResult.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading professional profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <h2>Profile Not Available</h2>
        <p>The user profile is currently unavailable.</p>
        <button onClick={() => router.push("/hire-freelancer")}>
          Browse Professionals
        </button>
      </div>
    );
  }

  const isFreelancer = user.role === "freelancer";
  const canSendProposal =
    currentUser && currentUser.role === "client" && isFreelancer;

  return (
    <>
      <Nav />
      <div className={styles.container}>
        {/* Success Message */}
        <AnimatePresence>
          {proposalSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={styles.successBanner}
            >
              <FaCheckCircle className={styles.successIcon} />
              <div>
                <h4>Proposal Sent Successfully!</h4>
                <p>
                  Your project proposal has been sent to {user.name}. They will
                  review it and respond to you shortly.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <motion.section
          className={styles.headerSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.headerContent}>
            <div className={styles.profileMain}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className={styles.userBadge}>
                  <span
                    className={`${styles.roleBadge} ${
                      isFreelancer ? styles.freelancer : styles.client
                    }`}
                  >
                    {isFreelancer ? "Freelancer" : "Client"}
                  </span>
                  {user.hasPremiumPlan && (
                    <div className={styles.premiumBadge}>
                      <FaCheckCircle />
                      <span>Premium Member</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.profileInfo}>
                <div className={styles.nameSection}>
                  <h1>{user.name}</h1>
                  {user.hasPremiumPlan && (
                    <FaCheckCircle className={styles.verifiedIcon} />
                  )}
                </div>

                {user.profile?.title && (
                  <p className={styles.title}>{user.profile.title}</p>
                )}

                <div className={styles.statsSection}>
                  {user.avgRating !== "0" && (
                    <div className={styles.stat}>
                      <FaStar />
                      <span>{user.avgRating}</span>
                      <span>({user.reviewCount} reviews)</span>
                    </div>
                  )}
                  {user.completedProjects > 0 && (
                    <div className={styles.stat}>
                      <FaBriefcase />
                      <span>{user.completedProjects} projects</span>
                    </div>
                  )}
                </div>

                <div className={styles.detailsGrid}>
                  {user.profile?.location && (
                    <div className={styles.detailItem}>
                      <FaMapMarkerAlt />
                      <span>{user.profile.location}</span>
                    </div>
                  )}
                  {user.profile?.hourlyRate && (
                    <div className={styles.detailItem}>
                      <FaDollarSign />
                      <span>${user.profile.hourlyRate}/hour</span>
                    </div>
                  )}
                  {user.profile?.responseTime && (
                    <div className={styles.detailItem}>
                      <FaClock />
                      <span>{user.profile.responseTime}</span>
                    </div>
                  )}
                  {user.memberSince && (
                    <div className={styles.detailItem}>
                      <FaCalendarAlt />
                      <span>
                        Member since {new Date(user.memberSince).getFullYear()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              {canSendProposal && (
                <motion.button
                  className={styles.primaryButton}
                  onClick={() => setShowProposalModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaFileAlt />
                  Send Proposal
                </motion.button>
              )}
              <motion.button
                className={styles.secondaryButton}
                onClick={() =>
                  handleSendMessage({
                    message: `Hi ${user.name}! I came across your profile and I'm interested in discussing a potential collaboration. Could you let me know your availability?`,
                  })
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEnvelope />
                Send Message
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Navigation Tabs */}
        <motion.nav
          className={styles.tabNavigation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { id: "overview", label: "Professional Overview", icon: MdPerson },
            { id: "experience", label: "Experience", icon: MdWork },
            { id: "reviews", label: "Reviews", icon: MdReviews },
            { id: "skills", label: "Skills", icon: FaCode },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent />
                {tab.label}
              </button>
            );
          })}
        </motion.nav>

        {/* Main Content */}
        <div className={styles.contentSection}>
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <OverviewTab user={user} isFreelancer={isFreelancer} />
            )}
            {activeTab === "experience" && <ExperienceTab user={user} />}
            {activeTab === "reviews" && <ReviewsTab user={user} />}
            {activeTab === "skills" && <SkillsTab user={user} />}
          </AnimatePresence>
        </div>

        {/* Proposal Modal */}
        <AnimatePresence>
          {showProposalModal && (
            <ProposalModal
              user={user}
              onClose={() => setShowProposalModal(false)}
              onSubmit={handleSendProposal}
              loading={isSubmitting}
              success={proposalSuccess}
            />
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}

// Overview Tab Component
function OverviewTab({ user, isFreelancer }) {
  const hasSocialLinks =
    user.profile?.website ||
    user.profile?.github ||
    user.profile?.linkedin ||
    user.profile?.twitter;

  return (
    <motion.div
      className={styles.tabContent}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className={styles.overviewGrid}>
        {/* Bio Section */}
        {user.profile?.bio && (
          <section className={styles.card}>
            <h3>Professional Summary</h3>
            <p className={styles.bio}>{user.profile.bio}</p>
          </section>
        )}

        {/* Stats Section */}
        {(user.completedProjects > 0 || user.reviewCount > 0) && (
          <section className={styles.card}>
            <h3>Professional Stats</h3>
            <div className={styles.statsGrid}>
              {user.completedProjects > 0 && (
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {user.completedProjects}
                  </div>
                  <div className={styles.statLabel}>Projects Completed</div>
                </div>
              )}
              {user.reviewCount > 0 && (
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{user.avgRating}</div>
                  <div className={styles.statLabel}>Average Rating</div>
                </div>
              )}
              {user.profile?.experience && (
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {user.profile.experience}
                  </div>
                  <div className={styles.statLabel}>Years Experience</div>
                </div>
              )}
              {user.hasPremiumPlan && (
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>
                    <FaCheckCircle />
                  </div>
                  <div className={styles.statLabel}>Premium Verified</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Social Links */}
        {hasSocialLinks && (
          <section className={styles.card}>
            <h3>Connect & Portfolio</h3>
            <div className={styles.socialLinks}>
              {user.profile?.website && (
                <a
                  href={user.profile.website}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGlobe />
                  <span>Website</span>
                  <FaExternalLinkAlt />
                </a>
              )}
              {user.profile?.github && (
                <a
                  href={user.profile.github}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub />
                  <span>GitHub</span>
                  <FaExternalLinkAlt />
                </a>
              )}
              {user.profile?.linkedin && (
                <a
                  href={user.profile.linkedin}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin />
                  <span>LinkedIn</span>
                  <FaExternalLinkAlt />
                </a>
              )}
              {user.profile?.twitter && (
                <a
                  href={user.profile.twitter}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter />
                  <span>Twitter</span>
                  <FaExternalLinkAlt />
                </a>
              )}
            </div>
          </section>
        )}

        {/* Skills Preview */}
        {user.skills && user.skills.length > 0 && (
          <section className={styles.card}>
            <h3>Core Competencies</h3>
            <div className={styles.skillsPreview}>
              {user.skills.slice(0, 8).map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
              {user.skills.length > 8 && (
                <span className={styles.moreSkills}>
                  +{user.skills.length - 8} more
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

// Experience Tab Component
function ExperienceTab({ user }) {
  const hasEducation = user.profile?.education;
  const hasExperience = user.profile?.experience;

  if (!hasEducation && !hasExperience) {
    return (
      <div className={styles.emptyState}>
        <MdWork className={styles.emptyIcon} />
        <h4>No Experience Information</h4>
        <p>This professional hasn't added their experience details yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.tabContent}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className={styles.experienceGrid}>
        {/* Experience Section */}
        {hasExperience && (
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <FaBriefcase />
              <h3>Professional Experience</h3>
            </div>
            <div className={styles.experienceContent}>
              <p>{user.profile.experience}</p>
            </div>
          </section>
        )}

        {/* Education Section */}
        {hasEducation && (
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <FaGraduationCap />
              <h3>Education</h3>
            </div>
            <div className={styles.educationContent}>
              <p>{user.profile.education}</p>
            </div>
          </section>
        )}

        {/* Portfolio Section */}
        {user.profile?.portfolio && (
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <FaExternalLinkAlt />
              <h3>Portfolio</h3>
            </div>
            <div className={styles.portfolioContent}>
              <a
                href={user.profile.portfolio}
                className={styles.portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Portfolio <FaExternalLinkAlt />
              </a>
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

// Reviews Tab Component
function ReviewsTab({ user }) {
  if (!user.reviews || user.reviews.length === 0) {
    return (
      <div className={styles.emptyState}>
        <MdReviews className={styles.emptyIcon} />
        <h4>No Reviews Yet</h4>
        <p>This user hasn't received any reviews yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.tabContent}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className={styles.reviewsHeader}>
        <div className={styles.ratingSummary}>
          <div className={styles.averageRating}>
            <div className={styles.ratingNumber}>{user.avgRating}</div>
            <div className={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={
                    star <= Math.floor(user.avgRating)
                      ? styles.filledStar
                      : styles.emptyStar
                  }
                />
              ))}
            </div>
            <div className={styles.totalReviews}>
              {user.reviewCount} reviews
            </div>
          </div>
        </div>
      </div>

      <div className={styles.reviewsList}>
        {user.reviews.map((review, index) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <div className={styles.reviewerAvatar}>
                  {review.reviewer?.avatar ? (
                    <img
                      src={review.reviewer.avatar}
                      alt={review.reviewer.name}
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div>
                  <h4>{review.reviewer?.name || "User"}</h4>
                  {review.project && (
                    <div className={styles.projectName}>
                      {review.project.title}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.reviewRating}>
                <FaStar />
                <span>{review.rating}.0</span>
              </div>
            </div>

            {review.comment && (
              <p className={styles.reviewComment}>{review.comment}</p>
            )}

            <div className={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Skills Tab Component
function SkillsTab({ user }) {
  if (!user.skills || user.skills.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FaCode className={styles.emptyIcon} />
        <h4>No Skills Listed</h4>
        <p>This user hasn't added their skills yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.tabContent}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className={styles.skillsContainer}>
        <div className={styles.skillsGrid}>
          {user.skills.map((skill, index) => (
            <div key={index} className={styles.skillItem}>
              <span className={styles.skillName}>{skill}</span>
              {user.hasPremiumPlan && (
                <FaCheckCircle className={styles.skillVerified} />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Proposal Modal Component
function ProposalModal({ user, onClose, onSubmit, loading, success }) {
  const [formData, setFormData] = useState({
    projectTitle: "",
    projectDescription: "",
    coverLetter: "",
    bidAmount: "",
    timeframe: "30",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.projectTitle.trim() ||
      !formData.projectDescription.trim() ||
      !formData.coverLetter.trim() ||
      !formData.bidAmount
    ) {
      alert("Please fill in all required fields");
      return;
    }
    await onSubmit(formData);
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
          <h2>Send Proposal to {user.name}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {success ? (
          <div className={styles.successContent}>
            <FaCheckCircle className={styles.successIconLarge} />
            <h3>Proposal Sent Successfully!</h3>
            <p>
              Your project proposal has been sent to {user.name}. They will
              review it and respond to you shortly.
            </p>
            <button className={styles.primaryButton} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.proposalForm}>
            <div className={styles.formGroup}>
              <label>Project Title *</label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                placeholder="e.g., E-commerce Website Development"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Project Description *</label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                placeholder="Describe your project requirements, goals, and deliverables..."
                rows="4"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Cover Letter *</label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Introduce yourself and explain why you think this freelancer is the right fit for your project..."
                rows="5"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Budget ($) *</label>
                <input
                  type="number"
                  name="bidAmount"
                  value={formData.bidAmount}
                  onChange={handleChange}
                  placeholder="Enter your budget"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Timeline (days) *</label>
                <select
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="7">1 week</option>
                  <option value="14">2 weeks</option>
                  <option value="30">1 month</option>
                  <option value="60">2 months</option>
                  <option value="90">3 months</option>
                </select>
              </div>
            </div>

            <div className={styles.proposalSummary}>
              <h4>Proposal Summary</h4>
              <div className={styles.summaryItem}>
                <span>Freelancer:</span>
                <span>{user.name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Project:</span>
                <span>{formData.projectTitle || "Not specified"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Budget:</span>
                <span>${formData.bidAmount || "0"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Timeline:</span>
                <span>{formData.timeframe} days</span>
              </div>
            </div>

            <div className={styles.modalActions}>
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
                className={styles.primaryButton}
                disabled={
                  loading ||
                  !formData.projectTitle ||
                  !formData.projectDescription ||
                  !formData.coverLetter ||
                  !formData.bidAmount
                }
              >
                {loading ? (
                  <>
                    <div className={styles.spinnerSmall}></div>
                    Sending Proposal...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Proposal
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
