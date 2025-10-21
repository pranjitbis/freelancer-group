"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaLock,
  FaBell,
  FaShieldAlt,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
} from "react-icons/fa";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const router = useRouter();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    skills: "",
    location: "",
    website: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    proposalAlerts: true,
    messageAlerts: true,
    paymentAlerts: true,
    marketingEmails: false,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] =
    useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchUserProfile(data.user.id);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`/api/users/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileForm({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.profile.phone || "",
            bio: data.profile.bio || "",
            skills: data.profile.skills || "",
            location: data.profile.location || "",
            website: data.profile.website || "",
          });
        } else {
          setProfileForm({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: "",
            bio: "",
            skills: "",
            location: "",
            website: "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return "";
    if (password.length < 6) return "weak";

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (strength <= 2) return "weak";
    if (strength === 3) return "medium";
    return "strong";
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...profileForm,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("success", "Profile updated successfully!");
      } else {
        showMessage("error", result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showMessage("error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("success", "Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength("");
      } else {
        showMessage("error", result.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      showMessage("error", "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setForgotPasswordStep(2);
        startResendTimer();

        let successMessage =
          "✅ " + (result.message || "OTP sent successfully!");

        // Add debug information in development
        if (result.debugOtp) {
          successMessage += `\n🔑 OTP: ${result.debugOtp}`;
         
        }

        if (result.previewUrl) {
          successMessage += `\n📧 Preview: ${result.previewUrl}`;
          console.log("📧 Email preview:", result.previewUrl);
          // You can also show this as a clickable link
        }

      } else if (response.status === 429) {
        // Rate limit error
        showMessage(
          "error",
          "⏳ " + (result.error || "Please wait before requesting another OTP")
        );
      } else {
        let errorMessage = "❌ " + (result.error || "Failed to send OTP");

      

        if (result.previewUrl) {
          errorMessage += `\n📧 Preview: ${result.previewUrl}`;
        }

        showMessage("error", errorMessage);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showMessage(
        "error",
        "❌ Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showMessage("error", "Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          otp,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setForgotPasswordStep(3);
        showMessage("success", "OTP verified successfully!");
      } else {
        showMessage("error", result.error || "Invalid OTP");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      showMessage("error", "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          otp,
          password: newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("success", "Password reset successfully!");
        setForgotPasswordStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
        closeForgotPassword();
      } else {
        showMessage("error", result.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showMessage("error", "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        startResendTimer();
        showMessage("success", "New OTP sent to your email!");
      } else {
        showMessage("error", result.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showMessage("error", "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...notifications,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("success", "Notification preferences updated!");
      } else {
        showMessage("error", result.error || "Failed to update notifications");
      }
    } catch (error) {
      console.error("Notification update error:", error);
      showMessage("error", "Failed to update notifications");
    } finally {
      setLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setForgotPasswordStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResendTimer(0);
    setOtpError("");
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>
            Manage your account preferences and security
          </p>
        </div>
      </header>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotPasswordStep > 1 && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {forgotPasswordStep === 2 && "Verify OTP"}
                {forgotPasswordStep === 3 && "Reset Password"}
              </h3>
              <button
                className={styles.closeButton}
                onClick={closeForgotPassword}
              >
                &times;
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Step 2: OTP Verification */}
              {forgotPasswordStep === 2 && (
                <div className={styles.otpSection}>
                  <div className={styles.otpIcon}>
                    <FaEnvelope />
                  </div>
                  <p className={styles.otpText}>
                    Enter the 6-digit code sent to your email
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(value);
                      setOtpError(
                        value.length === 6 ? "" : "OTP must be 6 digits"
                      );
                    }}
                    className={`${styles.otpInput} ${
                      otpError ? styles.error : ""
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {otpError && (
                    <span className={styles.errorText}>{otpError}</span>
                  )}
                  <div className={styles.resendSection}>
                    <button
                      type="button"
                      className={styles.resendButton}
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                    >
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    className={styles.modalActionButton}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {forgotPasswordStep === 3 && (
                <div className={styles.passwordSection}>
                  <div className={styles.formGroup}>
                    <label htmlFor="newPassword" className={styles.label}>
                      New Password
                    </label>
                    <div className={styles.passwordInput}>
                      <input
                        type={showForgotNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordStrength(
                            checkPasswordStrength(e.target.value)
                          );
                        }}
                        className={styles.input}
                        required
                        minLength={6}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() =>
                          setShowForgotNewPassword(!showForgotNewPassword)
                        }
                      >
                        {showForgotNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {newPassword && (
                      <div
                        className={`${styles.passwordStrength} ${styles[passwordStrength]}`}
                      >
                        Password strength: {passwordStrength}
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label
                      htmlFor="confirmNewPassword"
                      className={styles.label}
                    >
                      Confirm New Password
                    </label>
                    <div className={styles.passwordInput}>
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={styles.input}
                        required
                        minLength={6}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() =>
                          setShowForgotConfirmPassword(
                            !showForgotConfirmPassword
                          )
                        }
                      >
                        {showForgotConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {confirmNewPassword &&
                      newPassword !== confirmNewPassword && (
                        <span className={styles.errorText}>
                          Passwords do not match
                        </span>
                      )}
                  </div>

                  <button
                    onClick={handleResetPassword}
                    className={styles.modalActionButton}
                    disabled={
                      loading ||
                      newPassword !== confirmNewPassword ||
                      newPassword.length < 6
                    }
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.settingsContainer}>
        {/* Sidebar Navigation */}
        <div className={styles.sidebar}>
          <button
            className={`${styles.tab} ${
              activeTab === "profile" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser />
            <span>Profile</span>
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "password" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("password")}
          >
            <FaLock />
            <span>Password</span>
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "notifications" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <FaBell />
            <span>Notifications</span>
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "security" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <FaShieldAlt />
            <span>Security</span>
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className={styles.input}
                      required
                      disabled
                    />
                    <small className={styles.helpText}>
                      Email cannot be changed
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="location" className={styles.label}>
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bio" className={styles.label}>
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    className={styles.textarea}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="skills" className={styles.label}>
                    Skills
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={profileForm.skills}
                    onChange={handleProfileChange}
                    className={styles.input}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                  <small className={styles.helpText}>
                    Separate skills with commas
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="website" className={styles.label}>
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={profileForm.website}
                    onChange={handleProfileChange}
                    className={styles.input}
                    placeholder="https://example.com"
                  />
                </div>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? (
                    <div className={styles.buttonLoading}>
                      <div className={styles.spinner}></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Password Settings */}
          {activeTab === "password" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Change Password</h2>

              <form onSubmit={handlePasswordUpdate} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword" className={styles.label}>
                    Current Password
                  </label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    New Password
                  </label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        handlePasswordChange(e);
                        setPasswordStrength(
                          checkPasswordStrength(e.target.value)
                        );
                      }}
                      className={styles.input}
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordForm.newPassword && (
                    <div
                      className={`${styles.passwordStrength} ${styles[passwordStrength]}`}
                    >
                      Password strength: {passwordStrength}
                    </div>
                  )}
                  <small className={styles.helpText}>
                    Password must be at least 6 characters long
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm New Password
                  </label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword &&
                    passwordForm.newPassword !==
                      passwordForm.confirmPassword && (
                      <span className={styles.errorText}>
                        Passwords do not match
                      </span>
                    )}
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={
                      loading ||
                      passwordForm.newPassword !==
                        passwordForm.confirmPassword ||
                      passwordForm.newPassword.length < 6
                    }
                  >
                    {loading ? (
                      <div className={styles.buttonLoading}>
                        <div className={styles.spinner}></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <FaLock />
                        Update Password
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={styles.forgotButton}
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>

              <div className={styles.securityTips}>
                <h3>Password Security Tips</h3>
                <ul>
                  <li>Use a combination of letters, numbers, and symbols</li>
                  <li>Avoid using personal information</li>
                  <li>Don't reuse passwords across different sites</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>

              <form onSubmit={handleNotificationUpdate} className={styles.form}>
                <div className={styles.notificationGroup}>
                  <h3 className={styles.notificationTitle}>
                    Email Notifications
                  </h3>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationInfo}>
                      <h4>Email Notifications</h4>
                      <p>Receive important updates via email</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notifications.emailNotifications}
                        onChange={handleNotificationChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationInfo}>
                      <h4>Proposal Alerts</h4>
                      <p>Get notified about new proposals and updates</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="proposalAlerts"
                        checked={notifications.proposalAlerts}
                        onChange={handleNotificationChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationInfo}>
                      <h4>Message Alerts</h4>
                      <p>Notifications for new messages</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="messageAlerts"
                        checked={notifications.messageAlerts}
                        onChange={handleNotificationChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationInfo}>
                      <h4>Payment Alerts</h4>
                      <p>Notifications for payment updates</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="paymentAlerts"
                        checked={notifications.paymentAlerts}
                        onChange={handleNotificationChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationInfo}>
                      <h4>Marketing Emails</h4>
                      <p>Receive promotional offers and updates</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={notifications.marketingEmails}
                        onChange={handleNotificationChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? (
                    <div className={styles.buttonLoading}>
                      <div className={styles.spinner}></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <FaSave />
                      Save Preferences
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Security Settings</h2>

              <div className={styles.securityCards}>
                <div className={styles.securityCard}>
                  <div className={styles.securityIcon}>
                    <FaShieldAlt />
                  </div>
                  <div className={styles.securityInfo}>
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className={styles.securityButton}>Enable 2FA</button>
                </div>

                <div className={styles.securityCard}>
                  <div className={styles.securityIcon}>
                    <FaLock />
                  </div>
                  <div className={styles.securityInfo}>
                    <h3>Login Activity</h3>
                    <p>Review your recent login sessions</p>
                  </div>
                  <button className={styles.securityButton}>
                    View Activity
                  </button>
                </div>

                <div className={styles.securityCard}>
                  <div className={styles.securityIcon}>
                    <FaUser />
                  </div>
                  <div className={styles.securityInfo}>
                    <h3>Account Recovery</h3>
                    <p>Set up recovery options for your account</p>
                  </div>
                  <button className={styles.securityButton}>
                    Set Up Recovery
                  </button>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <h3 className={styles.dangerTitle}>Danger Zone</h3>
                <div className={styles.dangerItem}>
                  <div>
                    <h4>Delete Account</h4>
                    <p>
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button className={styles.dangerButton}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
