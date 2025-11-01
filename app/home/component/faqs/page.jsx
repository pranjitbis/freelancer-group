"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./FAQ.module.css";

const FAQ = () => {
  const [activeTab, setActiveTab] = useState("client");
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const generalFAQs = [
    {
      question: "What is Aroliya?",
      answer:
        "Aroliya is a digital platform offering services like online form filling, virtual assistants, e-commerce support, travel & hotel booking, and a freelancer–client job portal.",
    },
    {
      question: "Is Aroliya free to use?",
      answer:
        "Yes, browsing services is free. Charges apply only when you use a paid service or hire a freelancer.",
    },
    {
      question: "How can I contact Aroliya support?",
      answer:
        "You can reach us via our website contact form, email, or WhatsApp for quick support.",
    },
    {
      question: "Can I trust Aroliya with my personal data?",
      answer:
        "Yes. We follow strict privacy policies and secure servers to protect user data.",
    },
    {
      question: "Do you provide services across India?",
      answer:
        "Yes, our services are available online to users from all over India.",
    },
  ];

  const clientFAQs = [
    {
      question: "How can I hire a freelancer on Aroliya?",
      answer:
        "Register as a client, post your project/job, and receive applications from freelancers. You can select the best match.",
    },
    {
      question: "How do payments work?",
      answer:
        "Clients deposit project fees into Aroliya's escrow system. Funds are released to freelancers only after client approval.",
    },
    {
      question: "Can I post multiple jobs at once?",
      answer:
        "Yes, clients can post multiple jobs depending on their project needs.",
    },
    {
      question: "How can I ensure the quality of freelancers?",
      answer:
        "Freelancers are rated and reviewed after each project. You can check profiles, ratings, and portfolios before hiring.",
    },
    {
      question: "Do I need to pay for posting a job?",
      answer:
        "Basic job posting is free. Featured job postings and premium options are available at a small fee.",
    },
  ];

  const freelancerFAQs = [
    {
      question: "How can I register as a freelancer on Aroliya?",
      answer:
        "Simply sign up through the 'Freelancer Registration' page and create your profile.",
    },
    {
      question: "Is there a membership fee?",
      answer:
        "We offer Basic (Free) and Premium (Paid) memberships. Premium members get priority listing and more job opportunities.",
    },
    {
      question: "How do I get paid for my work?",
      answer:
        "Payments are managed through Aroliya's secure wallet. Clients deposit funds, and payments are released once the work is approved.",
    },
    {
      question: "Can freelancers apply for multiple jobs?",
      answer:
        "Yes, freelancers can apply for unlimited jobs (depending on their membership type).",
    },
    {
      question: "What kind of jobs are available?",
      answer:
        "Jobs related to form filling, virtual assistance, e-commerce solutions, travel booking support, content creation, data analysis, and more.",
    },
  ];

  // Determine which FAQs to show based on active tab
  let currentFAQs = [];
  if (activeTab === "general") {
    currentFAQs = generalFAQs;
  } else if (activeTab === "client") {
    currentFAQs = clientFAQs;
  } else {
    currentFAQs = freelancerFAQs;
  }

  return (
    <section className={styles.faqSection} id="faq">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.subtitle}>
            Find answers to common questions about our services and freelance
            opportunities
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "general" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "client" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("client")}
          >
            For Clients
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "freelancer" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("freelancer")}
          >
            For Freelancers
          </button>
        </div>

        {/* Freelancer Registration CTA */}
        {activeTab === "freelancer" && (
          <div className={styles.ctaSection}>
            <div className={styles.ctaContent}>
              <h3>Ready to Join Our Team?</h3>
              <p>
                Register as a freelancer and start working on exciting projects
              </p>
              <Link
                href="/freelancer-registration"
                className={styles.ctaButton}
              >
                Register as Freelancer
              </Link>
            </div>
          </div>
        )}

        {/* FAQ Items */}
        <div className={styles.faqGrid} data-aos="zoom-out-up">
          {currentFAQs.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${
                openQuestion === index ? styles.active : ""
              }`}
            >
              <button
                className={styles.question}
                onClick={() => toggleQuestion(index)}
                aria-expanded={openQuestion === index}
              >
                <span className={styles.questionText}>{faq.question}</span>
                <span className={styles.icon}>
                  {openQuestion === index ? "−" : "+"}
                </span>
              </button>

              <div
                className={styles.answer}
                aria-hidden={openQuestion !== index}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;