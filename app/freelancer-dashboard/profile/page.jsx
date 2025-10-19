"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaDollarSign,
  FaMapMarkerAlt,
  FaGlobe,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaLink,
  FaUpload,
  FaSave,
  FaEdit,
  FaCheck,
  FaTimes,
  FaFilePdf,
  FaTrash,
  FaStar,
  FaAward,
  FaCalendar,
  FaCamera,
  FaImage,
} from "react-icons/fa";
import styles from "./FreelancerProfile.module.css";

export default function FreelancerProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    skills: "",
    experience: "",
    education: "",
    hourlyRate: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    portfolio: "",
    available: true,
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/auth/login");
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/freelancer/profile?userId=${currentUser.id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
          if (data.profile) {
            setFormData({
              title: data.profile.title || "",
              bio: data.profile.bio || "",
              skills: data.profile.skills || "",
              experience: data.profile.experience || "",
              education: data.profile.education || "",
              hourlyRate: data.profile.hourlyRate || "",
              location: data.profile.location || "",
              website: data.profile.website || "",
              github: data.profile.github || "",
              linkedin: data.profile.linkedin || "",
              twitter: data.profile.twitter || "",
              portfolio: data.profile.portfolio || "",
              available: data.profile.available !== false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/freelancer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setProfile(data.profile);
        setIsEditing(false);
        fetchProfile();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("userId", currentUser.id);

      const response = await fetch("/api/freelancer/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Resume uploaded successfully!");
        setProfile((prev) => ({
          ...prev,
          resumeUrl: data.resumeUrl,
        }));
      } else {
        setError(data.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError("Failed to upload resume");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("userId", currentUser.id);

      const response = await fetch("/api/freelancer/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile image updated successfully!");
        setProfile((prev) => ({
          ...prev,
          profileImage: data.imageUrl,
        }));
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const deleteResume = async () => {
    if (!confirm("Are you sure you want to delete your resume?")) return;

    try {
      const response = await fetch("/api/freelancer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
          resumeUrl: null,
        }),
      });

      if (response.ok) {
        setSuccess("Resume deleted successfully!");
        setProfile((prev) => ({
          ...prev,
          resumeUrl: null,
        }));
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("Failed to delete resume");
    }
  };

  const deleteProfileImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) return;

    try {
      const response = await fetch("/api/freelancer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
          profileImage: null,
        }),
      });

      if (response.ok) {
        setSuccess("Profile image removed successfully!");
        setProfile((prev) => ({
          ...prev,
          profileImage: null,
        }));
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
      setError("Failed to remove profile image");
    }
  };

  const getSkillsArray = () => {
    if (!formData.skills) return [];
    return formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    const fields = [
      formData.title,
      formData.bio,
      formData.skills,
      formData.experience,
      formData.hourlyRate,
      profile?.resumeUrl,
      profile?.profileImage,
    ];

    fields.forEach((field) => {
      if (field) completed++;
    });

    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerContent}>
          <h1>Freelancer Profile</h1>
          <p>Build your professional profile to attract clients</p>
        </div>
        <div className={styles.headerActions}>
          {!isEditing ? (
            <motion.button
              onClick={() => setIsEditing(true)}
              className={styles.primaryButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEdit />
              Edit Profile
            </motion.button>
          ) : (
            <div className={styles.editActions}>
              <motion.button
                onClick={() => setIsEditing(false)}
                className={styles.secondaryButton}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaTimes />
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSaveProfile}
                disabled={saving}
                className={styles.primaryButton}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
              >
                {saving ? (
                  <>
                    <div className={styles.buttonSpinner} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.header>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FaCheck />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FaTimes />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.content}>
        {/* Left Column - Profile Form */}
        <div className={styles.mainContent}>
          <motion.div
            className={styles.profileCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={styles.cardHeader}>
              <h2>
                <FaUser /> Basic Information
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.profileForm}>
              {/* Profile Image Upload */}
              <div className={styles.formGroup}>
                <label>Profile Image</label>
                <div className={styles.imageUploadSection}>
                  <div className={styles.imagePreview}>
                    {profile?.profileImage ? (
                      <>
                        <img
                          src={profile.profileImage}
                          alt="Profile"
                          className={styles.profileImage}
                        />
                        {isEditing && (
                          <button
                            type="button"
                            onClick={deleteProfileImage}
                            className={styles.removeImageButton}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <FaUser className={styles.placeholderIcon} />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className={styles.imageUploadControls}>
                      <motion.button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className={styles.imageUploadButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <>
                            <div className={styles.buttonSpinner} />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaCamera />
                            {profile?.profileImage
                              ? "Change Image"
                              : "Upload Image"}
                          </>
                        )}
                      </motion.button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage || !isEditing}
                        className={styles.hiddenFileInput}
                      />
                      <p className={styles.uploadHelpText}>
                        JPG, PNG or GIF • Max 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Title */}
              <div className={styles.formGroup}>
                <label htmlFor="title">
                  <FaBriefcase /> Professional Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Senior Full Stack Developer"
                  disabled={!isEditing}
                  className={styles.formInput}
                />
                <div className={styles.helpText}>
                  Your professional headline (appears in search results)
                </div>
              </div>

              {/* Bio/Description */}
              <div className={styles.formGroup}>
                <label htmlFor="bio">
                  <FaUser /> Professional Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Describe your expertise, experience, and what you can offer to clients..."
                  rows="4"
                  disabled={!isEditing}
                  className={styles.formTextarea}
                />
                <div className={styles.helpText}>
                  Write a compelling bio that showcases your skills and
                  experience
                </div>
              </div>

              {/* Skills */}
              <div className={styles.formGroup}>
                <label htmlFor="skills">
                  <FaAward /> Skills & Technologies
                </label>
                <textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="React, Node.js, Python, UI/UX Design, Project Management..."
                  rows="3"
                  disabled={!isEditing}
                  className={styles.formTextarea}
                />
                <div className={styles.helpText}>
                  Separate skills with commas. These will be displayed as tags.
                </div>

                {/* Skills Preview */}
                {getSkillsArray().length > 0 && (
                  <div className={styles.skillsPreview}>
                    {getSkillsArray().map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className={styles.formGroup}>
                <label htmlFor="experience">
                  <FaBriefcase /> Work Experience
                </label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  placeholder="Describe your work experience, previous projects, and achievements..."
                  rows="4"
                  disabled={!isEditing}
                  className={styles.formTextarea}
                />
                <div className={styles.helpText}>
                  Highlight your most relevant experience and accomplishments
                </div>
              </div>

              {/* Education */}
              <div className={styles.formGroup}>
                <label htmlFor="education">
                  <FaGraduationCap /> Education & Certifications
                </label>
                <textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
                  placeholder="Your educational background, degrees, and relevant certifications..."
                  rows="3"
                  disabled={!isEditing}
                  className={styles.formTextarea}
                />
              </div>

              {/* Hourly Rate */}
              <div className={styles.formGroup}>
                <label htmlFor="hourlyRate">
                  <FaDollarSign /> Hourly Rate ($)
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    handleInputChange("hourlyRate", e.target.value)
                  }
                  placeholder="50"
                  min="0"
                  step="5"
                  disabled={!isEditing}
                  className={styles.formInput}
                />
                <div className={styles.helpText}>
                  Your preferred hourly rate for projects
                </div>
              </div>

              {/* Location */}
              <div className={styles.formGroup}>
                <label htmlFor="location">
                  <FaMapMarkerAlt /> Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="City, Country"
                  disabled={!isEditing}
                  className={styles.formInput}
                />
              </div>

              {/* Social Links */}
              <div className={styles.formGroup}>
                <label>
                  <FaGlobe /> Social & Portfolio Links
                </label>
                <div className={styles.socialInputs}>
                  <div className={styles.inputWithIcon}>
                    <FaLink className={styles.inputIcon} />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      disabled={!isEditing}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.inputWithIcon}>
                    <FaGithub className={styles.inputIcon} />
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={formData.github}
                      onChange={(e) =>
                        handleInputChange("github", e.target.value)
                      }
                      disabled={!isEditing}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.inputWithIcon}>
                    <FaLinkedin className={styles.inputIcon} />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={formData.linkedin}
                      onChange={(e) =>
                        handleInputChange("linkedin", e.target.value)
                      }
                      disabled={!isEditing}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.inputWithIcon}>
                    <FaTwitter className={styles.inputIcon} />
                    <input
                      type="url"
                      placeholder="Twitter URL"
                      value={formData.twitter}
                      onChange={(e) =>
                        handleInputChange("twitter", e.target.value)
                      }
                      disabled={!isEditing}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.inputWithIcon}>
                    <FaLink className={styles.inputIcon} />
                    <input
                      type="url"
                      placeholder="Portfolio URL"
                      value={formData.portfolio}
                      onChange={(e) =>
                        handleInputChange("portfolio", e.target.value)
                      }
                      disabled={!isEditing}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) =>
                      handleInputChange("available", e.target.checked)
                    }
                    disabled={!isEditing}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    Available for new projects
                  </span>
                </label>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Column - Resume & Preview */}
        <div className={styles.sidebar}>
          {/* Resume Upload */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3>
              <FaFilePdf /> Resume
            </h3>
            <div className={styles.resumeSection}>
              {profile?.resumeUrl ? (
                <div className={styles.resumeUploaded}>
                  <FaFilePdf className={styles.resumeIcon} />
                  <div className={styles.resumeInfo}>
                    <span className={styles.resumeName}>Resume.pdf</span>
                    <span className={styles.resumeStatus}>Uploaded</span>
                  </div>
                  <div className={styles.resumeActions}>
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewButton}
                    >
                      View
                    </a>
                    {isEditing && (
                      <button
                        onClick={deleteResume}
                        className={styles.deleteButton}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.resumeUpload}>
                  <FaUpload className={styles.uploadIcon} />
                  <p>Upload your resume (PDF only, max 5MB)</p>
                  {isEditing && (
                    <motion.label
                      htmlFor="resume-upload"
                      className={styles.uploadButton}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {uploading ? (
                        <>
                          <div className={styles.buttonSpinner} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaFilePdf />
                          Choose PDF File
                        </>
                      )}
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                        disabled={uploading || !isEditing}
                        className={styles.hiddenFileInput}
                      />
                    </motion.label>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Profile Preview */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Profile Preview</h3>
            <div className={styles.profilePreview}>
              <div className={styles.previewHeader}>
                <div className={styles.previewAvatar}>
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className={styles.previewImage}
                    />
                  ) : (
                    currentUser?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={styles.previewInfo}>
                  <h4>{formData.title || "Your Professional Title"}</h4>
                  <p>{currentUser?.name}</p>
                  {formData.location && (
                    <div className={styles.previewLocation}>
                      <FaMapMarkerAlt />
                      {formData.location}
                    </div>
                  )}
                </div>
              </div>

              {formData.hourlyRate && (
                <div className={styles.previewRate}>
                  <FaDollarSign />${formData.hourlyRate}/hour
                </div>
              )}

              {formData.bio && (
                <div className={styles.previewBio}>
                  <p>{formData.bio.substring(0, 150)}...</p>
                </div>
              )}

              {getSkillsArray().length > 0 && (
                <div className={styles.previewSkills}>
                  <h5>Skills</h5>
                  <div className={styles.previewSkillsList}>
                    {getSkillsArray()
                      .slice(0, 6)
                      .map((skill, index) => (
                        <span key={index} className={styles.previewSkillTag}>
                          {skill}
                        </span>
                      ))}
                    {getSkillsArray().length > 6 && (
                      <span className={styles.moreSkills}>
                        +{getSkillsArray().length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.previewStatus}>
                <div
                  className={`${styles.availability} ${
                    formData.available ? styles.available : styles.unavailable
                  }`}
                >
                  <div className={styles.statusDot}></div>
                  {formData.available ? "Available for work" : "Not available"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Completion */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Profile Strength</h3>
            <div className={styles.profileStrength}>
              <div className={styles.strengthMeter}>
                <div
                  className={styles.strengthFill}
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
              <div className={styles.strengthText}>
                {calculateProfileCompletion()}% Complete
              </div>
              <div className={styles.strengthTips}>
                <p>Complete your profile to get more visibility:</p>
                <ul>
                  {!formData.title && <li>Add a professional title</li>}
                  {!formData.bio && <li>Write a compelling bio</li>}
                  {!formData.skills && <li>Add your skills</li>}
                  {!profile?.resumeUrl && <li>Upload your resume</li>}
                  {!profile?.profileImage && <li>Add a profile image</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
