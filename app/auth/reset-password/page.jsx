"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import styles from "./ResetPassword.module.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tokenValid, setTokenValid] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setMessage({ type: "error", text: "Invalid or missing reset token" });
    } else {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        setTokenValid(false);
        setMessage({ type: "error", text: data.error || "Invalid or expired reset token" });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setTokenValid(false);
      setMessage({ type: "error", text: "Failed to verify reset token" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Password reset successfully! Redirecting to login..." });
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to reset password" });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage({ type: "error", text: "Failed to reset password" });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>
              <FaLock />
            </div>
            <h1 className={styles.title}>Invalid Reset Link</h1>
            <p className={styles.subtitle}>
              The password reset link is invalid or has expired.
            </p>
          </div>
          
          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
              <span>{message.text}</span>
            </div>
          )}

          <button
            onClick={() => router.push("/auth/forgot-password")}
            className={styles.button}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <FaLock />
          </div>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>
            Enter your new password below
          </p>
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              New Password
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                minLength="6"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm New Password
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                minLength="6"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.buttonLoading}>
                <div className={styles.spinner}></div>
                Resetting...
              </div>
            ) : (
              <>
                <FaLock />
                Reset Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}