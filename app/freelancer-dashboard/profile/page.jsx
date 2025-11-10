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
  FaCheck,
  FaTimes,
  FaFilePdf,
  FaTrash,
  FaStar,
  FaAward,
  FaCalendar,
  FaCamera,
  FaIdCard,
  FaReceipt,
  FaDownload,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import styles from "./FreelancerProfile.module.css";

export default function FreelancerProfilePage() {
  const [profileImage, setProfileImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
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
    panNumber: "",
    gstNumber: "",
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
          // Set name and email from user data
          setFormData(prev => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || ""
          }));
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
        console.log("Fetched profile data:", data);

        if (data.success) {
          setProfile(data.profile);
          if (data.profile) {
            setFormData(prev => ({
              ...prev,
              name: currentUser.name || "",
              email: currentUser.email || "",
              phoneNumber: data.profile.phoneNumber || "",
              title: data.profile.title || "",
              bio: data.profile.bio || "",
              skills: data.profile.skills || "",
              experience: data.profile.experience || "",
              education: data.profile.education || "",
              hourlyRate: data.profile.hourlyRate?.toString() || "",
              location: data.profile.location || "",
              website: data.profile.website || "",
              github: data.profile.github || "",
              linkedin: data.profile.linkedin || "",
              twitter: data.profile.twitter || "",
              portfolio: data.profile.portfolio || "",
              available: data.profile.available !== false,
              panNumber: data.profile.panNumber || "",
              gstNumber: data.profile.gstNumber || "",
            }));

            if (data.profile.avatar || data.profile.user?.avatar) {
              setProfileImage(data.profile.avatar || data.profile.user.avatar);
            }
          }
        }
      } else {
        console.error("Failed to fetch profile:", response.status);
        setError("Failed to load profile data");
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
      const submitData = {
        userId: currentUser.id,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        title: formData.title || null,
        bio: formData.bio || null,
        skills: formData.skills || null,
        experience: formData.experience || null,
        education: formData.education || null,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : null,
        location: formData.location || null,
        website: formData.website || null,
        github: formData.github || null,
        linkedin: formData.linkedin || null,
        twitter: formData.twitter || null,
        portfolio: formData.portfolio || null,
        available: formData.available,
        profileImage: profileImage || null,
        panNumber: formData.panNumber || null,
        gstNumber: formData.gstNumber || null,
      };

      console.log("Saving profile data:", submitData);

      const response = await fetch("/api/freelancer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log("Save response:", data);

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setProfile(data.profile);
        // Update current user with new name
        if (data.user) {
          setCurrentUser(prev => ({ ...prev, name: data.user.name }));
        }
        await fetchProfile();
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

      console.log("Uploading resume...", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const response = await fetch("/api/freelancer/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Resume upload response:", data);

      if (response.ok) {
        setSuccess("Resume uploaded successfully!");
        setProfile((prev) => ({
          ...prev,
          resumeUrl: data.resumeUrl,
        }));
        // Refresh profile data
        await fetchProfile();
      } else {
        setError(data.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError("Failed to upload resume: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

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

      console.log("Uploading image...", {
        userId: currentUser.id,
        fileName: file.name,
        fileSize: file.size,
      });

      const response = await fetch("/api/freelancer/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response:", { status: response.status, data });

      if (response.ok) {
        setSuccess("Profile image updated successfully!");
        setProfileImage(data.imageUrl);
        setProfile((prev) => ({
          ...prev,
          avatar: data.imageUrl,
        }));
        // Refresh the profile data
        await fetchProfile();
      } else {
        throw new Error(
          data.error || `Upload failed with status ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
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
          resumeUrl: null, // Explicitly set to null
        }),
      });

      const data = await response.json();
      console.log("Delete resume response:", data);

      if (response.ok) {
        setSuccess("Resume deleted successfully!");
        setProfile((prev) => ({
          ...prev,
          resumeUrl: null,
        }));
        await fetchProfile(); // Refresh the profile data
      } else {
        throw new Error(data.error || "Failed to delete resume");
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("Failed to delete resume: " + error.message);
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
          profileImage: null, // This will set avatar to null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile image removed successfully!");
        setProfileImage(null);
        setProfile((prev) => ({
          ...prev,
          avatar: null,
        }));
        await fetchProfile(); // Refresh the profile
      } else {
        throw new Error(data.error || "Failed to remove profile image");
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
      setError("Failed to remove profile image: " + error.message);
    }
  };

  const handleDownloadResume = async () => {
    if (!profile?.resumeUrl) return;

    try {
      const response = await fetch(profile.resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Resume_${currentUser.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setError("Failed to download resume");
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
      formData.name,
      formData.title,
      formData.bio,
      formData.skills,
      formData.experience,
      formData.hourlyRate,
      profile?.resumeUrl,
      profileImage,
    ];

    fields.forEach((field) => {
      if (field && field.toString().trim() !== "") completed++;
    });

    return Math.round((completed / fields.length) * 100);
  };

  // Fixed image error handler
  const handleImageError = (e) => {
    e.target.style.display = "none";
    const nextSibling = e.target.nextElementSibling;
    if (nextSibling) {
      nextSibling.style.display = "flex";
    }
  };

  // Fixed preview image error handler
  const handlePreviewImageError = (e) => {
    e.target.style.display = "none";
    const nextSibling = e.target.nextElementSibling;
    if (nextSibling) {
      nextSibling.style.display = "flex";
    }
  };

  // Validate PAN Number
  const validatePAN = (pan) => {
    if (!pan) return true;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  // Validate GST Number
  const validateGST = (gst) => {
    if (!gst) return true;
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
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
              <div className={styles.profileStatus}>
                <span className={styles.completionRate}>
                  {calculateProfileCompletion()}% Complete
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.profileForm}>
              {/* Profile Image Upload */}
              <div className={styles.formGroup}>
                <label>Profile Image</label>
                <div className={styles.imageUploadSection}>
                  <div className={styles.imagePreview}>
                    {profileImage ? (
                      <div className={styles.imageWithDelete}>
                        <img
                          src={profileImage}
                          alt="Profile"
                          className={styles.profileImage}
                          onError={handleImageError}
                        />
                        <button
                          type="button"
                          onClick={deleteProfileImage}
                          className={styles.removeImageButton}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <FaUser className={styles.placeholderIcon} />
                      </div>
                    )}
                  </div>
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
                          {profileImage ? "Change Image" : "Upload Image"}
                        </>
                      )}
                    </motion.button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className={styles.hiddenFileInput}
                    />
                    <p className={styles.uploadHelpText}>
                      JPG, PNG or GIF • Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className={styles.formGroup}>
                <label htmlFor="name">
                  <FaUser /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={styles.formInput}
                  required
                />
                <div className={styles.helpText}>
                  Your full name as you want clients to see it
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">
                  <FaEnvelope /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  className={styles.formInput}
                  disabled
                />
                <div className={styles.helpText}>
                  Email cannot be changed from profile
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">
                  <FaPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  placeholder="+1 234 567 8900"
                  className={styles.formInput}
                />
                <div className={styles.helpText}>
                  Your contact number for client communications
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
                  className={styles.formInput}
                />
              </div>

              {/* Tax Information */}
              <div className={styles.formGroup}>
                <label>
                  <FaIdCard /> Tax Information (For Indian Freelancers)
                </label>
                <div className={styles.taxInputs}>
                  <div className={styles.inputWithIcon}>
                    <FaIdCard className={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="PAN Card Number"
                      value={formData.panNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "panNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      className={`${styles.formInput} ${
                        formData.panNumber && !validatePAN(formData.panNumber)
                          ? styles.inputError
                          : ""
                      }`}
                      maxLength="10"
                    />
                  </div>
                  {formData.panNumber && !validatePAN(formData.panNumber) && (
                    <div className={styles.validationError}>
                      Please enter a valid PAN number (e.g., ABCDE1234F)
                    </div>
                  )}

                  <div className={styles.inputWithIcon}>
                    <FaReceipt className={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="GST Number (Optional)"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "gstNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      className={`${styles.formInput} ${
                        formData.gstNumber && !validateGST(formData.gstNumber)
                          ? styles.inputError
                          : ""
                      }`}
                      maxLength="15"
                    />
                  </div>
                  {formData.gstNumber && !validateGST(formData.gstNumber) && (
                    <div className={styles.validationError}>
                      Please enter a valid GST number
                    </div>
                  )}
                </div>
                <div className={styles.helpText}>
                  Required for Indian freelancers to receive payments and issue
                  invoices
                </div>
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
                    <button
                      onClick={deleteResume}
                      className={styles.deleteButton}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.resumeUpload}>
                  <FaUpload className={styles.uploadIcon} />
                  <p>Upload your resume (PDF only, max 5MB)</p>
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
                      disabled={uploading}
                      className={styles.hiddenFileInput}
                    />
                  </motion.label>
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
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      onError={handlePreviewImageError}
                    />
                  ) : (
                    <div className={styles.previewAvatarPlaceholder}>
                      {formData.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className={styles.previewInfo}>
                  <h4>{formData.title || "Your Professional Title"}</h4>
                  <p>{formData.name || "Your Name"}</p>
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

              {/* Tax Information Preview */}
              {(formData.panNumber || formData.gstNumber) && (
                <div className={styles.previewTaxInfo}>
                  <h5>Tax Information</h5>
                  {formData.panNumber && (
                    <div className={styles.taxDetail}>
                      <FaIdCard />
                      <span>PAN: {formData.panNumber}</span>
                    </div>
                  )}
                  {formData.gstNumber && (
                    <div className={styles.taxDetail}>
                      <FaReceipt />
                      <span>GST: {formData.gstNumber}</span>
                    </div>
                  )}
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
                  {!formData.name && <li>Add your full name</li>}
                  {!formData.title && <li>Add a professional title</li>}
                  {!formData.bio && <li>Write a compelling bio</li>}
                  {!formData.skills && <li>Add your skills</li>}
                  {!profile?.resumeUrl && <li>Upload your resume</li>}
                  {!profileImage && <li>Add a profile image</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}