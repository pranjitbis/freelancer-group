"use client";
import { useEffect, useState } from "react";
import { FiMail, FiUser, FiPhone, FiLayers, FiEye, FiX } from "react-icons/fi";
import styles from "./WebDevDashboard.module.css";

export default function WebDevDashboard() {
  const [data, setData] = useState([]);
  const [viewData, setViewData] = useState(null); // 🔥 modal state

  useEffect(() => {
    fetch("/api/webdev")
      .then((res) => res.json())
      .then((res) => res.success && setData(res.leads));
  }, []);

  const updateStatus = async (id, currentStatus) => {
    const next =
      currentStatus === "Pending"
        ? "InProgress"
        : currentStatus === "InProgress"
        ? "Completed"
        : "Pending";

    const res = await fetch("/api/webdev", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });

    const result = await res.json();
    if (result.success) {
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: next } : item))
      );
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.title}>📊 Web Development Leads Dashboard</h2>
        <p className={styles.sub}>All captured inquiries from your website</p>

        <div className={styles.table}>
          <div className={styles.headerRow}>
            <span>Name</span>
            <span>Email</span>
            <span>Service</span>
            <span>Message</span>
            <span>Date</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {data.map((d, i) => (
            <div className={styles.row} key={i}>
              <span>
                <FiUser /> {d.name}
              </span>
              <span>
                <FiMail /> {d.email}
              </span>
              <span>
                <FiLayers /> {d.serviceCategory || "Web Development"}
              </span>
              <span>{d.message.slice(0, 25)}...</span>
              <span>{new Date(d.createdAt).toLocaleDateString()}</span>

              <span
                className={`${styles.status} ${d.status}`}
                onClick={() => updateStatus(d.id, d.status)}
              >
                {d.status}
              </span>

              {/* 🔥 VIEW BUTTON */}
              <button className={styles.viewBtn} onClick={() => setViewData(d)}>
                <FiEye /> View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 MODAL VIEW MESSAGE */}
      {viewData && (
        <div
          className={styles.modalBackground}
          onClick={() => setViewData(null)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setViewData(null)}
            >
              <FiX />
            </button>

            <h3>Lead Details</h3>
            <p>
              <b>Name:</b> {viewData.name}
            </p>
            <p>
              <b>Email:</b> {viewData.email}
            </p>
            <p>
              <b>Service:</b> {viewData.serviceCategory}
            </p>
            <p>
              <b>Phone:</b> {viewData.phone || "Not Provided"}
            </p>

            <div className={styles.fullMessageBox}>
              <b>Message:</b>
              <p>{viewData.message}</p>
            </div>

            <p className={styles.modalDate}>
              Submitted on {new Date(viewData.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
