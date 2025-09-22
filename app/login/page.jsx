"use client";
import { useState } from "react";
import styles from "./Login.module.css";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import Nav from "../home/component/Nav/page";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.email || !form.password) {
    setMessage("Please fill in all fields");
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (!res.ok) {
      setMessage(data.error || "Invalid login");
      return;
    }

    setMessage(data.message || "Login successful");

    // ✅ Redirect according to role
    if (data.role === "admin") {
      router.push("/wp-admin");
    } else {
      router.push("/dashboard");
    }
  } catch (error) {
    console.error(error);
    setMessage("An error occurred. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <Nav />
      <div className={styles.container}>
        <div
          className={styles.loginCard}
        >
          <div className={styles.header}>
            <div className={styles.logo}>
              <FaUser className={styles.logoIcon} />
            </div>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>Sign in to your account</p>
          </div>

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
                  id={styles.password}
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

          {message && (
            <div
              className={
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("invalid")
                  ? styles.errorMessage
                  : styles.successMessage
              }
            >
              {message}
            </div>
          )}

          <div className={styles.footer}>
            <p>
              Don't have an account?{" "}
              <a href="/register" className={styles.signupLink}>
                Sign up
              </a>
            </p>
          </div>
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
