"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./unauthorized.module.css";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.unauthorizedContainer}>
      <div className={styles.unauthorizedContent}>
        <div className={styles.errorIcon}>🚫</div>
        <h1 className={styles.title}>Access Denied</h1>
        <p className={styles.message}>
          You don't have permission to access this page. This might be because:
        </p>
        <ul className={styles.reasonsList}>
          <li>Your session has expired</li>
          <li>You're not logged in</li>
          <li>You don't have the required permissions</li>
          <li>Your token is invalid or expired</li>
        </ul>
        <div className={styles.actions}>
          <button
            onClick={() => router.push("/auth/login")}
            className={styles.loginButton}
          >
            Login Again
          </button>
          <button
            onClick={() => router.push("/")}
            className={styles.homeButton}
          >
            Go Home
          </button>
        </div>
        <p className={styles.redirectMessage}>
          You will be automatically redirected to the login page in 5 seconds...
        </p>
      </div>
    </div>
  );
}