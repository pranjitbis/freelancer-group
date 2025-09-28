import React from "react";
import styles from "./HowItWorks.module.css";

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Choose Service",
      description:
        "Select the service you need from our comprehensive list of offerings.",
      ctaText: "Start in 2 minutes →",
    },
    {
      number: "2",
      title: "Fill Details",
      description:
        "Provide the necessary information and upload any required documents.",
      ctaText: "Fill Form Now →",
    },
    {
      number: "3",
      title: "Get Confirmation",
      description:
        "Receive confirmation and updates on your form submission status.",
      ctaText: "Get Help Now →",
    },
  ];

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container} data-aos="zoom-in-down">
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionSubtitle}>
          Simple 3-step process to get your forms filled professionally
        </p>

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={index} data-aos="zoom-in-down" className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
