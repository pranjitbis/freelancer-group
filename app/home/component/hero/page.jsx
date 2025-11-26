"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import styles from "./Hero.module.css";
import Link from "next/link";
import Image from "next/image";
import shild from "../../../../public/icons/shild.png";
import namaste from "../../../../public/icons/namaste.png";

export default function Hero() {
  return (
    <div className={styles.heroContainer}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        navigation={true}
        pagination={{ clickable: true }}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={1000}
        className={styles.swiperContainer}
      >
        <SwiperSlide>
          <div className={`${styles.slide} ${styles.slideThree}`}>
            <div className={styles.slideContent}>
              <div className={styles.welcomeSection}>
                <h2>Welcome to Aroliya – </h2>
                <p>
                  Asia’s No. 1 Platform for Smart Online Services – From online
                  form filling to travel & hotel bookings, web development, Data
                  & AI, and eCommerce solutions — Aroliya stands as your trusted
                  partner for fast, reliable, and hassle-free digital services.
                </p>

                <div className={styles.heroButtons}>
                  <Link href="#services">
                    <button className={styles.primaryBtn}>View Services</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div
            className={styles.slide}
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/hero/hero-section.jpg')",
            }}
          >
            <div className={styles.slideContent}>
              <h2>We Do the Work, You Enjoy the Results</h2>
              <p>
                Whether it's online form filling, business support, or travel
                bookings—our team takes care of it quickly, securely, and
                hassle-free.
              </p>

              <div className={styles.heroButtons}>
                <Link href="#services">
                  <button className={styles.primaryBtn}>Start Now</button>
                </Link>
                <Link href="/register">
                  <button className={styles.secondaryBtn}>Sign Up</button>
                </Link>
              </div>

              <div className={styles.trustBadge}>
                <Image
                  src={shild}
                  alt="Security shield"
                  width={30}
                  height={30}
                />
                <p>
                  Trusted - Easy - Reliable - Affordable - Innovative —
                  Encrypted data, free to submit. Help: +91-9870519002
                </p>
              </div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div
            className={`${styles.slide} ${styles.slideTwo}`}
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/hero/hero.png')",
            }}
          >
            <div className={styles.slideContent}>
              <h2>Work Smarter with Aroliya Freelancer Hub</h2>
              <p>
                Showcase your skills, get hired, and grow your career faster
                with a powerful portfolio that proves impact and builds
                credibility.
              </p>

              <div className={styles.heroButtons}>
                <Link href="/freelancer-registration">
                  <button className={styles.primaryBtn}>
                    Register as Freelancer
                  </button>
                </Link>
                <Link href="/post-job">
                  <button className={styles.outlineBtn}>Post a Job</button>
                </Link>
              </div>

              <div className={styles.trustBadge}>
                <Image
                  src={shild}
                  alt="Security shield"
                  width={25}
                  height={25}
                />
                <p>
                  sign in securely—your data is fully encrypted. For assistance,
                  call +91-9870519002.
                </p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
