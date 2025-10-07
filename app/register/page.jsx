"use client";
import { useState, useEffect } from "react";
import styles from "./Register.module.css";
import Nav from "../home/component/Nav/page";
import WhatsApp from "../whatsapp_icon/page";
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "client", // Default to client
    acceptTerms: false,
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => setIsVisible(true), []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is invalid";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("Please fix the highlighted errors.");
      return;
    }

    setIsLoading(true);
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
      setMessage(data.message || data.error);

      if (res.ok) {
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          userType: "client",
          acceptTerms: false,
        });
      }
    } catch (err) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <WhatsApp />
      <div className={styles.container}>
        <div
          className={`${styles.registerCard} ${
            isVisible ? styles.cardVisible : ""
          }`}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>Join us to get started</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* User Type Selection */}
            <div className={styles.inputGroup}>
              <label htmlFor="userType" className={styles.label}>
                Register As
              </label>
              <select
                id="userType"
                name="userType"
                className={`${styles.input} ${styles.select} ${
                  errors.userType ? styles.inputError : ""
                }`}
                value={form.userType}
                onChange={handleInputChange}
              >
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
                <option value="user">user</option>
              </select>
              {errors.userType && (
                <span className={styles.errorText}>{errors.userType}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Full Name
              </label>
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
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={`${styles.input} ${
                  errors.email ? styles.inputError : ""
                }`}
                value={form.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                className={`${styles.input} ${
                  errors.password ? styles.inputError : ""
                }`}
                value={form.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
              <div className={styles.passwordHint}>
                Must be at least 6 characters
              </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className={`${styles.input} ${
                  errors.confirmPassword ? styles.inputError : ""
                }`}
                value={form.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Terms */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxCustom}></span>I agree to the{" "}
                <a href="#" className={styles.termsLink}>
                  Terms and Conditions
                </a>
              </label>
              {errors.acceptTerms && (
                <span className={styles.errorText}>{errors.acceptTerms}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`${styles.button} ${
                isLoading ? styles.buttonLoading : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? <>Creating account...</> : "Create Account"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`${styles.message} ${
                message.includes("error")
                  ? styles.errorMessage
                  : styles.successMessage
              }`}
            >
              {message}
            </div>
          )}

          <div className={styles.footer}>
            <p>
              Already have an account?{" "}
              <a href="/login" className={styles.loginLink}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
