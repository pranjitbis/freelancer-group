// app\login\page.jsx
"use client";
import { useState } from "react";
import styles from "./Login.module.css";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import Nav from "../home/component/Nav/page";
import WhatsApp from "../whatsapp_icon/page";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setMessage("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        setMessage(data.error || "Invalid login credentials");
        return;
      }

      setMessage("Login successful! Redirecting...");

      // ✅ Store user data in localStorage
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("User stored:", data.user);
      }

      // ✅ Redirect according to user role with delay for better UX
      setTimeout(() => {
        console.log("Redirecting with role:", data.role);

        switch (data.role) {
          case "admin":
            router.push("/wp-admin");
            break;
          case "freelancer":
            router.push("/freelancer-dashboard");
            break;
          case "client":
            router.push("/client-dashboard");
            break;
          case "user":
            router.push("/dashboard");
            break;
          default:
            router.push("/");
            break;
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      setMessage("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await res.json();
      console.log("Forgot password response:", data);

      if (data.success) {
        setMessage("Password reset OTP has been sent to your email!");
        setShowForgotPassword(false);
        // Redirect to reset password page
        setTimeout(() => {
          router.push(
            `/reset-password?email=${encodeURIComponent(forgotPasswordEmail)}`
          );
        }, 2000);
      } else {
        setMessage(
          data.error || "Failed to send reset email. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <WhatsApp />
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <FaUser className={styles.logoIcon} />
            </div>
            <h2 className={styles.title}>
              {showForgotPassword ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className={styles.subtitle}>
              {showForgotPassword
                ? "Enter your email to receive a reset OTP"
                : "Sign in to your account"}
            </p>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={styles.input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={styles.input}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
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

              <div className={styles.forgotPassword}>
                <button
                  type="button"
                  className={styles.forgotPasswordLink}
                  onClick={() => setShowForgotPassword(true)}
                >
                  <FaLock className={styles.lockIcon} />
                  Forgot your password?
                </button>
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
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="forgotEmail" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="forgotEmail"
                  type="email"
                  placeholder="Enter your registered email"
                  className={styles.input}
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={`${styles.button} ${
                    forgotPasswordLoading ? styles.buttonLoading : ""
                  }`}
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Sending OTP...
                    </>
                  ) : (
                    "Send Reset OTP"
                  )}
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowForgotPassword(false)}
                  disabled={forgotPasswordLoading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {message && (
            <div
              className={
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("invalid") ||
                message.toLowerCase().includes("failed")
                  ? styles.errorMessage
                  : styles.successMessage
              }
            >
              {message}
            </div>
          )}

          {!showForgotPassword && (
            <div className={styles.footer}>
              <p>
                Don't have an account?{" "}
                <a href="/register" className={styles.signupLink}>
                  Sign up
                </a>
              </p>
            </div>
          )}
        </div>

        <div className={styles.backgroundAnimation}>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>
      </div>
    </>
  );
}
