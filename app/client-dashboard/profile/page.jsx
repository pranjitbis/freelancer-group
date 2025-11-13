"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";
import {
  FaUser,
  FaBuilding,
  FaEnvelope,
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    avatar: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  // Enhanced date formatting function
  const formatMemberSince = (dateInput) => {
    if (!dateInput) return "Not available";

    try {
      let date;
      
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
        
        if (isNaN(date.getTime())) {
          const timestamp = Date.parse(dateInput);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp);
          } else {
            return "Not available";
          }
        }
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return "Not available";
      }

      if (isNaN(date.getTime())) {
        return "Not available";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Not available";
    }
  };

  // Fetch user data from API to ensure we have createdAt
  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`/api/client/profile?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.user;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const userObj = JSON.parse(userData);
          console.log("User data from localStorage:", userObj);
          
          // If createdAt is missing, fetch from API
          if (!userObj.createdAt && userObj.id) {
            console.log("CreatedAt missing, fetching from API...");
            const freshUserData = await fetchUserData(userObj.id);
            if (freshUserData) {
              // Update localStorage with complete user data
              const completeUser = { ...userObj, ...freshUserData };
              localStorage.setItem("user", JSON.stringify(completeUser));
              setUser(completeUser);
              setFormData({
                name: completeUser.name || "",
                email: completeUser.email || "",
                businessName: completeUser.businessName || "",
                avatar: null,
              });
              if (completeUser.avatar) {
                setPreviewUrl(completeUser.avatar);
              }
              return;
            }
          }
          
          // Use existing data if we have createdAt
          setUser(userObj);
          setFormData({
            name: userObj.name || "",
            email: userObj.email || "",
            businessName: userObj.businessName || "",
            avatar: null,
          });
          if (userObj.avatar) {
            setPreviewUrl(userObj.avatar);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    initializeUser();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage({
          type: "error",
          text: "Please select an image file (JPG, PNG, GIF)",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 5MB" });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const submitData = new FormData();
      submitData.append("userId", user.id.toString());
      submitData.append("name", formData.name);
      submitData.append("businessName", formData.businessName);
      if (formData.avatar) {
        submitData.append("avatar", formData.avatar);
      }

      const response = await fetch("/api/client/profile", {
        method: "PUT",
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        // Update local storage with complete user data including createdAt
        const updatedUser = { 
          ...user, 
          ...result.user,
          createdAt: user.createdAt || result.user.createdAt 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: null,
    }));
    setPreviewUrl("");
  };

  // Debug: Log user data to see what's available
  useEffect(() => {
    if (user) {
      console.log("Current user data:", {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        createdAt: user.createdAt,
        role: user.role
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Profile Settings</h1>
          <p className={styles.subtitle}>
            Manage your account information and business profile
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.profileCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Avatar Upload Section */}
            <div className={styles.avatarSection}>
              <h3 className={styles.sectionTitle}>Profile Picture</h3>
              <div className={styles.avatarContainer}>
                <div className={styles.avatarPreview}>
                  {previewUrl ? (
                    <div className={styles.avatarWithOverlay}>
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className={styles.avatarImage}
                      />
                      <div className={styles.avatarOverlay}>
                        <FaCamera className={styles.cameraIcon} />
                      </div>
                    </div>
                  ) : user.avatar ? (
                    <div className={styles.avatarWithOverlay}>
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className={styles.avatarImage}
                      />
                      <div className={styles.avatarOverlay}>
                        <FaCamera className={styles.cameraIcon} />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <FaUser className={styles.placeholderIcon} />
                    </div>
                  )}
                </div>

                <div className={styles.avatarControls}>
                  <label
                    htmlFor="avatar-upload"
                    className={styles.uploadButton}
                  >
                    <FaCamera />
                    <span>Change Photo</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />

                  <p className={styles.uploadHint}>JPG, PNG or GIF • Max 5MB</p>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    <FaUser className={styles.labelIcon} />
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="businessName" className={styles.label}>
                    <FaBuilding className={styles.labelIcon} />
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your business name"
                  />
                  <p className={styles.fieldHint}>
                    This will be visible to freelancers
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    <FaEnvelope className={styles.labelIcon} />
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    className={styles.inputDisabled}
                    disabled
                  />
                  <p className={styles.disabledHint}>
                    Email address cannot be changed
                  </p>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div
                className={`${styles.message} ${
                  message.type === "success" ? styles.success : styles.error
                }`}
              >
                <div className={styles.messageIcon}>
                  {message.type === "success" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaExclamationTriangle />
                  )}
                </div>
                <div className={styles.messageContent}>
                  <p className={styles.messageText}>{message.text}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actionSection}>
              <button
                type="submit"
                disabled={isLoading}
                className={`${styles.submitButton} ${
                  isLoading ? styles.loading : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Profile
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Profile Summary Card */}
        <div className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Profile Summary</h3>
            <div className={styles.summaryContent}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Member Since</span>
                <span className={styles.summaryValue}>
                  {formatMemberSince(user.createdAt)}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Account Type</span>
                <span className={styles.summaryValue}>
                  {user.role === "client" ? "Client" : "User"}
                </span>
              </div>
              {user.businessName && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Business</span>
                  <span className={styles.summaryValue}>
                    {user.businessName}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}