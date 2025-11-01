// app/reset-password/page.jsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetPassword.module.css";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import Nav from "../home/component/Nav/page";

// Inner component that uses useSearchParams
function ResetPasswordContent() {
  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      setMessage(
        "No email provided. Please restart the password reset process."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage(
        "Email is missing. Please restart the password reset process."
      );
      return;
    }

    if (!form.otp || !form.newPassword || !form.confirmPassword) {
      setMessage("Please fill in all fields");
      return;
    }

    if (form.otp.length !== 6) {
      setMessage("OTP must be 6 digits");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      console.log("Sending reset request:", { email, otp: form.otp });

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: form.otp,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();
      console.log("Reset password response:", data);

      if (!res.ok) {
        setMessage(data.error || "Failed to reset password");
        return;
      }

      setMessage("✅ Password reset successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("❌ An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setMessage("Email is missing");
      return;
    }

    setIsLoading(true);
    setMessage("Sending new OTP...");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("Resend OTP response:", data);

      if (data.success) {
        setMessage("✅ New OTP sent to your email!");
      } else {
        setMessage(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setMessage("❌ Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <>
        <Nav />
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.errorMessage}>
              No email provided. Please restart the password reset process from
              the login page.
            </div>
            <div className={styles.footer}>
              <a href="/login" className={styles.loginLink}>
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <FaCheckCircle className={styles.logoIcon} />
            </div>
            <h2 className={styles.title}>Reset Your Password</h2>
            <p className={styles.subtitle}>
              Enter the OTP sent to <strong>{email}</strong> and your new
              password
            </p>
            <p className={styles.note}>OTP is valid for 3 hours</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="otp" className={styles.label}>
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                className={styles.input}
                value={form.otp}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, otp: value.slice(0, 6) });
                }}
                maxLength={6}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>New Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min. 6 characters)"
                  className={styles.input}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  minLength={6}
                  required
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className={styles.input}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className={`${styles.button} ${
                isLoading ? styles.buttonLoading : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className={styles.resendContainer}>
              <p>Didn't receive OTP?</p>
              <button
                type="button"
                className={styles.resendButton}
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </div>
          </form>

          {message && (
            <div
              className={
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("failed") ||
                message.toLowerCase().includes("invalid") ||
                message.startsWith("❌")
                  ? styles.errorMessage
                  : styles.successMessage
              }
            >
              {message}
            </div>
          )}

          <div className={styles.footer}>
            <p>
              Remember your password?{" "}
              <a href="/login" className={styles.loginLink}>
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Main component with Suspense boundary
export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <>
          <Nav />
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
              </div>
            </div>
          </div>
        </>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
