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
} from "react-icons/fa";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState({ type: "", text: "" });
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

      if (response.ok) {
        showMessage("success", "Password reset link sent to your email!");
      } else {
        showMessage("error", result.error || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showMessage("error", "Failed to send reset link");
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
                      onChange={handlePasswordChange}
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
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={loading}
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
