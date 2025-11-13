"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiLoader, FiCheckCircle, FiXCircle } from "react-icons/fi";
import styles from "./AccessTokenPage.module.css";

export default function AccessTokenPage() {
  const params = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processAccess = async () => {
      try {
        const { token } = params;

        console.log("🔑 Processing access token:", token);

        if (!token) {
          setStatus("error");
          setMessage("No access token provided");
          return;
        }

        // Call the API to process the token
        const response = await fetch(`/api/admin/access/${token}`);
        console.log("📡 API Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Access granted:", data);

          if (data.success) {
            setStatus("success");
            setMessage(`Access granted! Redirecting to dashboard...`);

            // Wait a moment then redirect
            setTimeout(() => {
              if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
              } else {
                window.location.href = "/dashboard";
              }
            }, 1500);
          } else {
            setStatus("error");
            setMessage(data.error || "Access failed");
          }
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("❌ Access failed:", errorData);
          setStatus("error");
          setMessage(
            errorData.error || `HTTP ${response.status}: Access failed`
          );
        }
      } catch (error) {
        console.error("💥 Access processing error:", error);
        setStatus("error");
        setMessage(`Network error: ${error.message}`);
      }
    };

    processAccess();
  }, [params]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <FiLoader className={styles.loadingSpinner} size={48} />
            <h2 className={styles.title}>Processing Access</h2>
            <p className={styles.message}>Verifying your access token...</p>
            <p className={styles.tokenPreview}>
              Token: {params.token?.substring(0, 20)}...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <FiCheckCircle className={styles.successIcon} size={48} />
            <h2 className={styles.title}>Access Granted!</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles.redirectText}>
              Redirecting to dashboard...
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <FiXCircle className={styles.errorIcon} size={48} />
            <h2 className={styles.title}>Access Failed</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => (window.location.href = "/admin")}
                className={`${styles.button} ${styles.primaryButton}`}
              >
                Return to Admin Panel
              </button>
              <button
                onClick={() => window.location.reload()}
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
