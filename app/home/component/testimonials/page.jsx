import React from "react";
import styles from "./testimonials.module.css";
import two from "../../../../public/testimonials-images/two.jpg";
import three from "../../../../public/testimonials-images/three.jpg";
import four from "../../../../public/testimonials-images/four.jpg";
import five from "../../../../public/testimonials-images/five.jpg";
import six from "../../../../public/testimonials-images/six.jpg";

import Image from "next/image";

export default function Testimonials() {
  const data = [
    {
      image: two,
      name: "Rajesh Kumar",
      service: "Virtual Assistant Services",
      description:
        "Exceptionally organized support that keeps operations moving. Tasks, emails, and schedules handled with precision and proactive follow-ups.",
      rating: 5,
      company: "TechStart Inc.",
    },

    {
      image: four,
      name: "Arjun Patel",
      service: "Travel & Hotel Booking",
      description:
        "Hassle-free bookings with great deals found fast. Reliable planning that saves time, money, and last-minute headaches.",
      rating: 4,
      company: "Global Ventures",
    },
    {
      image: five,
      name: "Rohit Gupta",
      service: "Data Visualization Services",
      description:
        "Clear, actionable dashboards that turn complex data into instant insights—better decisions in less time.",
      rating: 4.5,
      company: "DataDrive Analytics",
    },
    {
      image: six,
      name: "Vikram Singh",
      service: "Machine Learning Solutions",
      description:
        "Accurate predictions and automated workflows that unlock patterns and deliver tangible business impact.",
      rating: 5,
      company: "InnovateAI",
    },
    {
      image: two,
      name: "Anand Reddy",
      service: "Virtual Assistant Services",
      description:
        "Outstanding organizational skills and attention to detail. Made our daily operations seamless and efficient.",
      rating: 5,
      company: "StartUp India",
    },
    {
      image: three,
      name: "Mohammed Khan",
      service: "E-Commerce Solutions",
      description:
        "Transformed our online store with innovative solutions. Customer satisfaction increased by 40% in just 3 months.",
      rating: 4.5,
      company: "DesiStyles",
    },
  ];

  const reviewData = [
    {
      client: "Happy Clients",
      nums: "10k+",
    },
    {
      client: "Clients satisfaction",
      nums: "100%",
    },
    {
      client: "Years of our experience",
      nums: "5 Years+",
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFullStar = starValue <= Math.floor(rating);
      const isHalfStar = starValue - rating === 0.5;

      return (
        <span
          key={i}
          className={`${styles.star} ${
            isFullStar ? styles.full : isHalfStar ? styles.half : styles.empty
          }`}
        >
          ★
        </span>
      );
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header} data-aos="zoom-out-up">
          <h2 className={styles.title}>What Our Clients Say</h2>
          <p className={styles.subtitle}>
            Trusted by professionals and businesses across India and worldwide
          </p>
        </div>

        {/* Horizontal Scrolling Cards */}
        <div className={styles.scrollContainer}>
          <div className={styles.scrollWrapper}>
            <div className={styles.horizontalScroll}>
              {[...data, ...data].map((item, index) => (
                <div key={index} className={styles.card}>
                  {/* Rating */}
                  <div className={styles.rating}>
                    {renderStars(item.rating)}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className={styles.quote}>
                    "{item.description}"
                  </blockquote>

                  {/* Client Info */}
                  <div className={styles.client}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        className={styles.image}
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.clientInfo}>
                      <h3 className={styles.clientName}>{item.name}</h3>
                      <p className={styles.clientService}>{item.service}</p>
                    </div>
                  </div>

                  <div className={styles.decorativeQuote}>"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
