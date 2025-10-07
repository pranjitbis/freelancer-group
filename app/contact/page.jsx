"use client";
import { useState } from "react";
import styles from "./Contact.module.css";
import Head from "next/head";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FcServices } from "react-icons/fc";
import Image from "next/image";
import contactImage from "../../public/icons/contact.gif";
import Nav from "../home/component/Nav/page";
import Footer from "../home/footer/page";
export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setIsSubmitted(true);

    // Reset form after submission
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Contact Aroliya | Get in Touch</title>
        <meta
          name="description"
          content="Contact Aroliya for freelancing, travel booking, AI solutions, virtual assistant services, and online form filling."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <main className={styles.main}>
        <section className={styles.contactSection}>
          <div className={styles.container}>
            <div className={styles.contactGrid}>
              <div className={styles.contactForm}>
                <h2>Send us a Message</h2>
                {isSubmitted ? (
                  <div className={styles.successMessage}>
                    <h3>Thank you for your message!</h3>
                    <p>We'll get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                      Send Message
                    </button>
                  </form>
                )}
              </div>
              <div className={styles.contactInfo}>
                <Image src={contactImage} alt="err" />
                <h2>Contact Information</h2>
                <p>
                  Feel free to reach out to us for any questions about our
                  services or to discuss your project requirements.
                </p>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <FaPhoneAlt />
                  </div>
                  <div className={styles.contactDetails}>
                    <p>+91 9870519002</p>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <MdEmail />
                  </div>
                  <div className={styles.contactDetails}>
                    <p>info@aroliya.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
