"use client";
import { useEffect, useState } from "react";
import styles from "./job.module.css";
import { MdMessage, MdSearch, MdCalendarToday, MdClose } from "react-icons/md";

export default function Home() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLetter(null);
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("/api/job");
        const data = await res.json();
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/formSubmit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "Pending" ? "Done" : "Pending",
        }),
      });

      if (res.ok) {
        setForms((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: currentStatus === "Pending" ? "Done" : "Pending",
                }
              : f
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(search.toLowerCase()) ||
      form.email.toLowerCase().includes(search.toLowerCase()) ||
      (form.phone && form.phone.includes(search)) ||
      (form.serviceCategory &&
        form.serviceCategory.toLowerCase().includes(search.toLowerCase())) ||
      (form.message &&
        form.message.toLowerCase().includes(search.toLowerCase()));

    const matchesDate = dateFilter
      ? new Date(form.createdAt).toISOString().split("T")[0] === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Form Submissions</h1>
        <p className={styles.subtitle}>
          Manage and review all form submissions in one place
        </p>
      </header>

      {/* Search & Date Filters */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, phone, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.dateContainer}>
          <MdCalendarToday className={styles.dateIcon} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {filteredForms.length === 0 ? (
          <div className={styles.emptyState}>
            <MdMessage size={48} />
            <h3>No submissions found</h3>
            <p>Try adjusting your search or date filter</p>
          </div>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Service Category</th>
                <th>Details</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((submission) => (
                <tr key={submission.id}>
                  <td data-label="ID">{submission.id}</td>
                  <td data-label="Full Name">{submission.name}</td>
                  <td data-label="Email">{submission.email}</td>
                  <td data-label="Phone">{submission.phone || "N/A"}</td>
                  <td data-label="Service">{submission.serviceCategory}</td>
                  <td data-label="Details">
                    <button
                      className={styles.letterBtn}
                      onClick={() => handleViewLetter(submission.letter)}
                      disabled={!submission.letter}
                    >
                      <MdMessage />
                      {submission.letter ? "View Message" : "No Message"}
                    </button>
                  </td>
                  <td data-label="Time">
                    {new Date(submission.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour12: true,
                    })}
                  </td>
                  <td>
                    {submission.resumeUrl ? (
                      <a href={submission.resumeUrl} download>
                        <button className={styles.download}>Download</button>
                      </a>
                    ) : (
                      "No resume"
                    )}
                  </td>
                  <td data-label="Status">
                    <button
                      className={`${styles.statusButton} ${
                        submission.status === "Done"
                          ? styles.done
                          : styles.pending
                      }`}
                      onClick={() =>
                        toggleStatus(submission.id, submission.status)
                      }
                    >
                      {submission.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal placed outside the table to prevent multiple renders */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <MdMessage className={styles.modalIcon} />
                <h2>Cover Letter</h2>
              </div>
              <button
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label="Close modal"
              >
                <MdClose />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.messageContainer}>
                {selectedLetter ? (
                  <p className={styles.messageText}>{selectedLetter}</p>
                ) : (
                  <div className={styles.noMessage}>
                    <MdMessage className={styles.noMessageIcon} />
                    <p>No cover letter provided by the user.</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={closeModal}>
                Close
              </button>
              {selectedLetter && (
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLetter);
                    // You could add a toast notification here
                  }}
                >
                  Copy Text
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
