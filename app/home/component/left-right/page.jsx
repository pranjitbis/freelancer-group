import styles from "./LeftToRight.module.css";
import Image from "next/image";
import {
  FaCheckCircle,
  FaStar,
  FaShieldAlt,
  FaHeadset,
  FaClock,
  FaFileAlt,
  FaPlane,
  FaUserTie,
  FaBuilding,
  FaGraduationCap,
  FaArrowRight,
  FaQuoteLeft,
} from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdTravelExplore, MdSecurity } from "react-icons/md";
import formFilling from "../../../../public/icons/form-illustration-free.png";
import travelHotel from "../../../../public/icons/travel-bookings1.jpg";
import Link from "next/link";

export default function ProfessionalServicesHero() {
  return (
    <section className={styles.uploadSection}>
      {/* Section Header */}
      <div className={styles.sectionHead}>
        <div className={styles.badgeContainer}>
          <span className={styles.trustBadge}>
            <FaShieldAlt className={styles.badgeIcon} /> Trusted by 15,000+
            Clients Worldwide
          </span>
        </div>
        <h2 className={styles.mainTitle}>
          Professional Services Made{" "}
          <span className={styles.highlight}>Simple & Efficient</span>
        </h2>
        <p className={styles.subtitle}>
          Streamline your paperwork and travel planning with our expert
          services. We deliver accuracy, save you time, and eliminate the stress
          of complex processes.
        </p>
      </div>

      {/* Row 1: Form Filling Service */}
      <div className={`${styles.row} ${styles.form}`}>
        <div className={styles.content}>
          <div className={styles.serviceBadge}>
            <FaFileAlt className={styles.badgeServiceIcon} />
            <span>Premium Form Service</span>
          </div>
          <h2> Professional Online Form Filling Services</h2>
          <p className={styles.serviceDescription}>
            Our scalable solutions are built to meet the evolving needs of
            modern businesses. We provide expert services that streamline
            operations, boost efficiency, and support sustainable growth,
            ensuring your business stays competitive and future-ready.
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaUserTie />
              </div>
              <div className={styles.featureContent}>
                <h4>Official Forms</h4>
                <p>Accurate submissions with guaranteed compliance</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaGraduationCap />
              </div>
              <div className={styles.featureContent}>
                <h4>Exam Applications</h4>
                <p>Comprehensive exam & admission form assistance</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaBuilding />
              </div>
              <div className={styles.featureContent}>
                <h4>Business Forms</h4>
                <p>Corporate and bulk form processing for companies</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <MdSecurity />
              </div>
              <div className={styles.featureContent}>
                <h4>Secure Handling</h4>
                <p>Confidential document processing with encryption</p>
              </div>
            </div>
          </div>

          <div className={styles.ctaContainer}>
            <Link href="/services/form-filling">
              <button className={`${styles.btn} ${styles.primaryBtn}`}>
                <span>Get Started Today</span>
                <FaArrowRight className={styles.btnArrow} />
              </button>
            </Link>
            <div className={styles.secondaryCta}>
              <Link href="/services/form-filling#pricing">
                View Pricing & Packages →
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.image}>
          <div className={styles.imageContainer}>
            <Image
              src={formFilling}
              alt="Professional Form Filling Services"
              priority
              className={styles.serviceImage}
              id={styles.first}
            />
            <div className={styles.floatingCard}>
              <div className={styles.cardIcon}>
                <FaFileAlt />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>10,000+</div>
                <div className={styles.cardText}>Forms Processed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Travel Booking Service */}
      <div className={`${styles.row} ${styles.reverse}`}>
        <div className={styles.content}>
          <div className={styles.serviceBadge}>
            <FaPlane className={styles.badgeServiceIcon} />
            <span>Travel Solutions</span>
          </div>
          <h2>Seamless Travel & Hotel Bookings</h2>
          <p className={styles.serviceDescription}>
            Experience stress-free travel planning with our comprehensive
            booking services. We find the best deals, ensure seamless
            experiences, and provide 24/7 support.
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <MdTravelExplore />
              </div>
              <div className={styles.featureContent}>
                <h4>Best Price Guarantee</h4>
                <p>Premium hotels and amenities at competitive rates</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaPlane />
              </div>
              <div className={styles.featureContent}>
                <h4>Flight Bookings</h4>
                <p>Effortless bookings with instant confirmation</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaHeadset />
              </div>
              <div className={styles.featureContent}>
                <h4>24/7 Support</h4>
                <p>Dedicated travel assistance anytime, anywhere</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaShieldAlt />
              </div>
              <div className={styles.featureContent}>
                <h4>Travel Insurance</h4>
                <p>Emergency support and comprehensive coverage</p>
              </div>
            </div>
          </div>

          <div className={styles.ctaContainer}>
            <Link href="/services/travel-bookings">
              <button className={`${styles.btn} ${styles.primaryBtn}`}>
                <span>Plan Your Trip</span>
                <FaArrowRight className={styles.btnArrow} />
              </button>
            </Link>
          </div>
        </div>

        <div className={styles.image}>
          <div className={styles.imageContainer}>
            <Image
              src={travelHotel}
              alt="Travel & Hotel Booking Services"
              priority
              className={styles.serviceImage}
            />
            <div className={styles.floatingCard}>
              <div className={styles.cardIcon}>
                <FaPlane />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>5,000+</div>
                <div className={styles.cardText}>Happy Travelers</div>
              </div>
            </div>
            <div className={styles.successRateBadge}>
              <IoIosCheckmarkCircle />
              <span>4.9/5 Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
