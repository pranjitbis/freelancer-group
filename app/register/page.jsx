"use client";
import { useState, useEffect } from "react";
import styles from "./Register.module.css";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaCheck,
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaAward,
  FaClock,
  FaHeadset,
  FaArrowLeft,
  FaSync,
} from "react-icons/fa";
import Nav from "../home/component/Nav/page";
import WhatsApp from "../whatsapp_icon/page";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "client",
    acceptTerms: false,
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("form"); // 'form', 'otp', 'success'
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => setIsVisible(true), []);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.userType) newErrors.userType = "Please select a user type";
    if (!form.acceptTerms)
      newErrors.acceptTerms = "You must accept the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all digits are filled
    if (value && index === 5) {
      const otpString = newOtp.join("");
      if (otpString.length === 6) {
        setTimeout(() => verifyOTP(), 100);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const sendOTP = async (email) => {
    try {
      setOtpLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("OTP sent to your email! Check your inbox.");
        setResendTimer(60); // 60 seconds timer
        return true;
      } else {
        setMessage(data.error || "Failed to send OTP. Please try again.");
        return false;
      }
    } catch (error) {
      setMessage("Failed to send OTP. Please try again.");
      return false;
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendTimer > 0) return;

    const success = await sendOTP(form.email);
    if (success) {
      setOtp(["", "", "", "", "", ""]); // Clear OTP fields
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("Please fix the errors below.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // First, check if user already exists
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setMessage(
          checkData.error || "Failed to check user. Please try again."
        );
        setIsLoading(false);
        return;
      }

      if (checkData.exists) {
        setMessage(
          "User already exists with this email. Please login instead."
        );
        setIsLoading(false);
        return;
      }

      // Send OTP
      const otpSent = await sendOTP(form.email);
      if (otpSent) {
        setStep("otp");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setMessage("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: otpString,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("OTP verified successfully! Creating your account...");
        // OTP verified, now register the user
        await registerUser();
      } else {
        setMessage(data.error || "Invalid OTP. Please try again.");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          userType: form.userType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ FIX: Store the complete user data including createdAt in localStorage
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("✅ User data stored in localStorage:", data.user);
        }

        setStep("success");
        setMessage("Account created successfully! Redirecting to login...");

        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setMessage(data.error || "Registration failed. Please try again.");
        setStep("form");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Registration failed. Please try again.");
      setStep("form");
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setMessage("");

    try {
      // Get the selected user type from the form
      const selectedUserType = form.userType;

      console.log(`Starting Google registration as: ${selectedUserType}`);

      // ✅ FIX: Store user type in localStorage so Google callback can use it
      localStorage.setItem("pendingUserType", selectedUserType);

      // Redirect to Google OAuth with user type parameter
      window.location.href = `/api/auth/google?userType=${selectedUserType}`;
    } catch (error) {
      console.error("Google registration error:", error);
      setMessage("An error occurred during Google registration.");
      setGoogleLoading(false);
    }
  };

  const goBackToForm = () => {
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setMessage("");
  };
useEffect(() => {
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userTypeFromUrl = urlParams.get('userType');
  
  if (userTypeFromUrl && ['client', 'freelancer', 'user'].includes(userTypeFromUrl)) {
    setForm(prev => ({
      ...prev,
      userType: userTypeFromUrl
    }));
  }
}, []);
  return (
    <>
      <Nav />
      <WhatsApp />
      <div className={styles.container}>
        <div className={styles.registerWrapper}>
          {/* Left Side - Brand & Features Section */}
          <div className={styles.brandSection}>
            <div className={styles.brandContent}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <FaShieldAlt className={styles.brandLogoIcon} />
                </div>
                <span className={styles.brandName}>Aroliya</span>
              </div>

              <div className={styles.brandText}>
                <h1 className={styles.brandTitle}>
                  Join Our Professional Community
                </h1>
                <p className={styles.brandSubtitle}>
                  Create your account and unlock a world of opportunities.
                  Connect with professionals, grow your business, and achieve
                  your goals with our secure platform.
                </p>
              </div>

              <div className={styles.features}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <FaShieldAlt />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Enterprise-Grade Security</h3>
                    <p>
                      Your data is protected with bank-level encryption and
                      security protocols
                    </p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <FaRocket />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Fast & Reliable</h3>
                    <p>Lightning-fast platform with 99.9% uptime guarantee</p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <FaUsers />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Global Community</h3>
                    <p>
                      Join thousands of professionals and businesses worldwide
                    </p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <FaAward />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Trusted Platform</h3>
                    <p>Rated 4.8/5 by our community of users and businesses</p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <FaClock />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock customer support for all your needs</p>
                  </div>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>50K+</div>
                  <div className={styles.statLabel}>Active Users</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>10K+</div>
                  <div className={styles.statLabel}>Projects Completed</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>99.9%</div>
                  <div className={styles.statLabel}>Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className={styles.formSection}>
            <div
              className={`${styles.registerCard} ${
                isVisible ? styles.cardVisible : ""
              }`}
            >
              {/* Header Section */}
              <div className={styles.header}>
                <div className={styles.headerContent}>
                  {step === "otp" && (
                    <button
                      type="button"
                      className={styles.backButton}
                      onClick={goBackToForm}
                    >
                      <FaArrowLeft />
                    </button>
                  )}
                  <h2 className={styles.title}>
                    {step === "form" && "Create Your Account"}
                    {step === "otp" && "Verify Your Email"}
                    {step === "success" && "Registration Successful!"}
                  </h2>
                  <p className={styles.subtitle}>
                    {step === "form" &&
                      "Join our community and get started today"}
                    {step === "otp" &&
                      `We sent a 6-digit code to ${form.email}`}
                    {step === "success" &&
                      "Your account has been created successfully"}
                  </p>
                </div>
              </div>

              {/* Success Screen */}
              {step === "success" && (
                <div className={styles.successSection}>
                  <div className={styles.successIcon}>
                    <FaCheck />
                  </div>
                  <h3 className={styles.successTitle}>Welcome to YourBrand!</h3>
                  <p className={styles.successMessage}>
                    Your account has been created successfully. You will be
                    redirected to the login page shortly.
                  </p>
                  <div className={styles.successActions}>
                    <button
                      className={styles.loginButton}
                      onClick={() => (window.location.href = "/login")}
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Verification Screen */}
              {step === "otp" && (
                <div className={styles.otpSection}>
                  <div className={styles.otpInstructions}>
                    <p>
                      Enter the 6-digit verification code sent to your email
                      address.
                    </p>
                  </div>

                  <div className={styles.otpInputs}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={styles.otpInput}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <div className={styles.otpActions}>
                    <button
                      type="button"
                      className={styles.verifyButton}
                      onClick={verifyOTP}
                      disabled={isLoading || otp.join("").length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <div className={styles.spinner}></div>
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>

                    <div className={styles.resendSection}>
                      <p className={styles.resendText}>
                        Didn't receive the code?{" "}
                        {resendTimer > 0 ? (
                          <span className={styles.resendTimer}>
                            Resend in {resendTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={styles.resendButton}
                            onClick={resendOTP}
                            disabled={otpLoading}
                          >
                            {otpLoading ? (
                              <>
                                <FaSync className={styles.resendSpinner} />
                                Sending...
                              </>
                            ) : (
                              "Resend OTP"
                            )}
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Form Screen */}
              {step === "form" && (
                <>
                  {/* Google Registration Button */}
                  <div className={styles.socialSection}>
                    <button
                      type="button"
                      className={styles.googleButton}
                      onClick={handleGoogleRegister}
                      disabled={googleLoading || isLoading}
                    >
                      {googleLoading ? (
                        <div className={styles.buttonSpinner}></div>
                      ) : (
                        <>
                          <svg
                            className={styles.googleIcon}
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                          >
                            <path
                              fill="#4285F4"
                              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"
                            />
                            <path
                              fill="#34A853"
                              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z"
                            />
                          </svg>
                        </>
                      )}
                      <span className={styles.googleButtonText}>
                        {googleLoading
                          ? "Signing up with Google..."
                          : "Sign up with Google"}
                      </span>
                    </button>

                    <div className={styles.divider}>
                      <span className={styles.dividerText}>
                        or sign up with email
                      </span>
                    </div>
                  </div>

                  {/* Registration Form */}
                  <form onSubmit={handleSubmit} className={styles.form}>
                    {/* User Type Selection */}
                    <div className={styles.inputGroup}>
                      <label htmlFor="userType" className={styles.label}>
                        I want to join as
                      </label>
                      <div className={styles.roleSelection}>
                        {[
                          {
                            value: "client",
                            label: "Client",
                            description: "Hire professionals for your projects",
                          },
                          {
                            value: "freelancer",
                            label: "Freelancer",
                            description: "Offer your services and skills",
                          },
                          {
                            value: "user",
                            label: "User",
                            description: "Explore and learn from the community",
                          },
                        ].map((role) => (
                          <div key={role.value} className={styles.roleOption}>
                            <input
                              type="radio"
                              id={role.value}
                              name="userType"
                              value={role.value}
                              checked={form.userType === role.value}
                              onChange={handleInputChange}
                              className={styles.roleRadio}
                            />
                            <label
                              htmlFor={role.value}
                              className={styles.roleLabel}
                            >
                              <span className={styles.roleTitle}>
                                {role.label}
                              </span>
                              <span className={styles.roleDescription}>
                                {role.description}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.userType && (
                        <span className={styles.errorText}>
                          {errors.userType}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div className={styles.inputGroup}>
                      <label htmlFor="name" className={styles.label}>
                        Full Name
                      </label>
                      <div className={styles.inputContainer}>
                        <FaUser className={styles.inputIcon} />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          className={`${styles.input} ${
                            errors.name ? styles.inputError : ""
                          }`}
                          value={form.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.name && (
                        <span className={styles.errorText}>{errors.name}</span>
                      )}
                    </div>

                    {/* Email */}
                    <div className={styles.inputGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email Address
                      </label>
                      <div className={styles.inputContainer}>
                        <FaEnvelope className={styles.inputIcon} />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          className={`${styles.input} ${
                            errors.email ? styles.inputError : ""
                          }`}
                          value={form.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.email && (
                        <span className={styles.errorText}>{errors.email}</span>
                      )}
                    </div>

                    {/* Password */}
                    <div className={styles.inputGroup}>
                      <label htmlFor="password" className={styles.label}>
                        Password
                      </label>
                      <div className={styles.inputContainer}>
                        <FaLock className={styles.inputIcon} />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password"
                          className={`${styles.input} ${
                            errors.password ? styles.inputError : ""
                          }`}
                          value={form.password}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.password && (
                        <span className={styles.errorText}>
                          {errors.password}
                        </span>
                      )}
                      <div className={styles.passwordHint}>
                        Must be at least 6 characters long
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className={styles.inputGroup}>
                      <label htmlFor="confirmPassword" className={styles.label}>
                        Confirm Password
                      </label>
                      <div className={styles.inputContainer}>
                        <FaLock className={styles.inputIcon} />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className={`${styles.input} ${
                            errors.confirmPassword ? styles.inputError : ""
                          }`}
                          value={form.confirmPassword}
                          onChange={handleInputChange}
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
                      {errors.confirmPassword && (
                        <span className={styles.errorText}>
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className={styles.termsGroup}>
                      <label className={styles.termsLabel}>
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={form.acceptTerms}
                          onChange={handleInputChange}
                          className={styles.termsCheckbox}
                        />
                        <span className={styles.checkmark}>
                          <FaCheck className={styles.checkIcon} />
                        </span>
                        I agree to the{" "}
                        <a href="/terms" className={styles.termsLink}>
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className={styles.termsLink}>
                          Privacy Policy
                        </a>
                      </label>
                      {errors.acceptTerms && (
                        <span className={styles.errorText}>
                          {errors.acceptTerms}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`${styles.submitButton} ${
                        isLoading ? styles.buttonLoading : ""
                      }`}
                      disabled={isLoading || googleLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className={styles.spinner}></div>
                          Sending OTP...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Status Message */}
              {message && (
                <div
                  className={`${styles.message} ${
                    message.toLowerCase().includes("error") ||
                    message.toLowerCase().includes("failed") ||
                    message.toLowerCase().includes("invalid") ||
                    message.toLowerCase().includes("expired")
                      ? styles.errorMessage
                      : styles.successMessage
                  }`}
                >
                  <div className={styles.messageIcon}>
                    {message.toLowerCase().includes("error") ||
                    message.toLowerCase().includes("failed") ||
                    message.toLowerCase().includes("invalid") ||
                    message.toLowerCase().includes("expired")
                      ? "⚠"
                      : "✓"}
                  </div>
                  {message}
                </div>
              )}

              {/* Footer */}
              {step === "form" && (
                <div className={styles.footer}>
                  <p className={styles.footerText}>
                    Already have an account?{" "}
                    <a href="/login" className={styles.loginLink}>
                      Sign in here
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
