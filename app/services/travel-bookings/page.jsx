// components/TravelBookings.jsx
"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "./TravelBookings.module.css";
import Image from "next/image";
import Footer from "@/app/home/footer/page";
import Link from "next/link";
import WhatsApp from '../../whatsapp_icon/page'
import {
  FaPlane,
  FaHotel,
  FaUmbrellaBeach,
  FaCheck,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaArrowRight,
  FaStar,
  FaChevronRight,
  FaSearch,
  FaGlobe,
  FaRegSmileBeam,
  FaCar,
  FaPassport,
  FaMountain,
  FaBriefcase,
  FaShieldAlt,
} from "react-icons/fa";
import Nav from "@/app/home/component/Nav/page";
import {
  MdDirectionsBoat,
  MdTour,
  MdAirplaneTicket,
  MdSupportAgent,
} from "react-icons/md";
import { IoIosAirplane, IoMdBed, IoMdTrain, IoMdCard } from "react-icons/io";
import "aos/dist/aos.css"; // Import AOS styles
import AOS from "aos";
const TravelBookings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);

      const elements = document.querySelectorAll(`.${styles.fadeInUp}`);
      elements.forEach((el) => {
        const position = el.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.85) {
          el.classList.add(styles.visible);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const travelServices = [
    {
      id: "flights",
      title: "Premium Flight Bookings",
      icon: <IoIosAirplane className={styles.serviceIcon} />,
      description:
        "Book domestic and international flights easily with exclusive deals, flexible schedules, and real-time availability worldwide.",
      features: [
        "Best price guarantee on all airlines",
        "Flexible date and route options",
        "Multi-city and round-the-world itineraries",
        "24/7 customer support",
        "Advanced seat selection and upgrades",
        "Real-time flight status updates",
      ],
    },
    {
      id: "hotels",
      title: "Luxury Hotel Reservations",
      icon: <IoMdBed className={styles.serviceIcon} />,
      description:
        "Find your perfect stay from boutique hotels to 5-star resorts worldwide. Comfort, convenience, and personalized experiences guaranteed.",
      features: [
        "500,000+ properties worldwide",
        "Free cancellation and flexible booking policies",
        "Exclusive discounts and special offers",
        "Verified guest reviews & ratings",
        "Map-based search and neighborhood guides",
        "Custom room requests and amenities",
        "24/7 concierge support",
      ],
    },
    {
      id: "trains",
      title: "Reliable Train Bookings",
      icon: <IoMdTrain className={styles.serviceIcon} />,
      description:
        "Plan your train journeys efficiently with real-time seat availability and hassle-free bookings across India and international routes.",
      features: [
        "Domestic and international train options",
        "Real-time seat availability",
        "Flexible travel dates and routes",
        "Class selection: Sleeper, AC, First Class",
        "PNR and ticket management",
        "Online cancellations and rescheduling",
        "24/7 customer support",
      ],
    },
    {
      id: "cruises",
      title: "Luxury Cruise Bookings",
      icon: <MdDirectionsBoat className={styles.serviceIcon} />,
      description:
        "Experience world-class cruise journeys along stunning coastlines and rivers. Comfort, entertainment, and unique excursions await.",
      features: [
        "International and domestic cruise options",
        "Cabin upgrades and suites",
        "All-inclusive dining and beverages",
        "Onboard entertainment and activities",
        "Shore excursions with local guides",
        "Family-friendly & adult-only options",
        "Personal concierge & 24/7 service",
      ],
    },
    {
      id: "carRental",
      title: "Premium Car Rentals",
      icon: <FaCar className={styles.serviceIcon} />,
      description:
        "Rent cars effortlessly from economy to luxury vehicles. Enjoy convenient pickup, drop-off, and flexible rental terms worldwide.",
      features: [
        "Wide selection from budget to luxury cars",
        "Flexible rental durations",
        "Airport and city pickup/drop-off",
        "GPS & additional amenities included",
        "Insurance options available",
        "24/7 roadside assistance",
        "Special deals for long-term rentals",
      ],
    },
    {
      id: "visaAssistance",
      title: "Visa & Travel Documentation",
      icon: <FaPassport className={styles.serviceIcon} />,
      description:
        "Smooth visa processing and travel documentation guidance for hassle-free journeys across the globe.",
      features: [
        "Visa application guidance for multiple countries",
        "Document verification & submission support",
        "Fast-track and express processing",
        "Travel advisory & updates",
        "Multi-entry & business visa support",
        "Embassy and consulate coordination",
        "24/7 urgent support",
      ],
    },
  ];
  const processSteps = [
    {
      step: 1,
      title: "Plan Your Trip",
      description: "Tell us your travel preferences and requirements",
      icon: <IoMdCard className={styles.stepIcon} />,
    },
    {
      step: 2,
      title: "Get Customized Options",
      description: "Receive tailored travel itineraries and quotes",
      icon: <FaEnvelope className={styles.stepIcon} />,
    },
    {
      step: 3,
      title: "Book & Confirm",
      description: "Secure your booking with easy payment options",
      icon: <FaCheck className={styles.stepIcon} />,
    },
    {
      step: 4,
      title: "Travel & Enjoy",
      description: "Enjoy your trip with 24/7 support during travel",
      icon: <FaUmbrellaBeach className={styles.stepIcon} />,
    },
  ];

  const popularDestinations = [
    {
      name: "Bali, Indonesia",
      image:
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=870&q=80",
      price: "$899",
      duration: "7 days",
      rating: 4.8,
    },
    {
      name: "Paris, France",
      image:
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?auto=format&fit=crop&w=870&q=80",
      price: "$1,299",
      duration: "5 days",
      rating: 4.7,
    },
    {
      name: "Tokyo, Japan",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=870&q=80",
      price: "$1,599",
      duration: "8 days",
      rating: 4.9,
    },
    {
      name: "Santorini, Greece",
      image:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=870&q=80",
      price: "$1,199",
      duration: "6 days",
      rating: 4.8,
    },
  ];

  const testimonials = [
    {
      content:
        "The team helped us plan our dream honeymoon to Bali. Everything was perfect from flights to accommodations!",
      author: "Sarah & Michael",
      trip: "Bali Honeymoon",
      rating: 5,
    },
    {
      content:
        "Their attention to detail and local knowledge made our family trip to Japan stress-free and unforgettable.",
      author: "The Johnson Family",
      trip: "Japan Adventure",
      rating: 5,
    },
    {
      content:
        "I've used their services for both business and leisure travel. Always reliable with the best deals!",
      author: "Robert Chen",
      trip: "Frequent Traveler",
      rating: 4.5,
    },
    {
      content:
        "Our Goa beach vacation was beautifully arranged. The resort and activities were top class!",
      author: "Ananya Sharma",
      trip: "Goa Beaches",
      rating: 5,
    },
    {
      content:
        "From booking flights to arranging temple visits, our Varanasi trip was seamless and memorable.",
      author: "Ravi Kumar",
      trip: "Varanasi Spiritual Tour",
      rating: 4.5,
    },
    {
      content:
        "The Kerala backwaters houseboat experience was magical. Everything was well coordinated!",
      author: "Priya & Arjun Mehta",
      trip: "Kerala Backwaters",
      rating: 5,
    },
    {
      content:
        "We had a great experience during our Rajasthan heritage tour. The guides were professional and friendly.",
      author: "Neha Verma",
      trip: "Rajasthan Heritage Tour",
      rating: 4.5,
    },
    {
      content:
        "Our family trip to Himachal was stress-free. The hotel and transport arrangements were excellent!",
      author: "Amit Patel",
      trip: "Himachal Family Vacation",
      rating: 5,
    },
    {
      content:
        "The Ladakh adventure trip was thrilling. From flights to camps, everything was perfect.",
      author: "Karan Singh",
      trip: "Ladakh Adventure",
      rating: 5,
    },
    {
      content:
        "Our Maldives honeymoon was picture-perfect. They arranged everything with care and detail.",
      author: "Sneha & Rohan Gupta",
      trip: "Maldives Honeymoon",
      rating: 5,
    },
    {
      content:
        "We booked a South India temple tour. The guides were knowledgeable and very accommodating.",
      author: "Lakshmi Iyer",
      trip: "South India Temple Tour",
      rating: 4.5,
    },
    {
      content:
        "The Shimla–Manali package was affordable and well organized. Our kids had a great time!",
      author: "Vikas Deshmukh",
      trip: "Shimla–Manali Family Trip",
      rating: 4,
    },
    {
      content:
        "Thanks for arranging our Dubai trip. The desert safari and city tour were amazing!",
      author: "Pooja Nair",
      trip: "Dubai Holiday",
      rating: 5,
    },
    {
      content:
        "Our Singapore family vacation was smooth from visa to return flight. Highly recommend them!",
      author: "Rahul & Kavita Jain",
      trip: "Singapore Family Trip",
      rating: 5,
    },
    {
      content:
        "We had a memorable Darjeeling–Sikkim tour. The hotel views were breathtaking!",
      author: "Manoj Das",
      trip: "Darjeeling–Sikkim Trip",
      rating: 4.5,
    },
    {
      content:
        "Our honeymoon in Mauritius was unforgettable. The team ensured a hassle-free experience.",
      author: "Ayesha & Imran Khan",
      trip: "Mauritius Honeymoon",
      rating: 5,
    },
    {
      content:
        "The Andaman Islands trip was wonderful. Scuba diving and beaches were perfectly arranged.",
      author: "Deepak Reddy",
      trip: "Andaman Islands",
      rating: 5,
    },
    {
      content:
        "Booked our Europe tour with them. Everything from Schengen visa to hotels was smooth!",
      author: "Shalini & Vivek Rao",
      trip: "Europe Tour",
      rating: 4.5,
    },
    {
      content:
        "Our spiritual trip to Kedarnath and Badrinath was well organized. Transport and stays were comfortable.",
      author: "Suresh Joshi",
      trip: "Char Dham Yatra",
      rating: 4.5,
    },
    {
      content:
        "The Thailand trip was exciting and budget-friendly. Hotels and transfers were well managed.",
      author: "Meera Kulkarni",
      trip: "Thailand Vacation",
      rating: 4,
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration in ms
      once: false, // allow animation to happen every time you scroll
      mirror: true, // animation triggers when scrolling up as well
    });
  }, []);

  return (
    <>
      <Head>
        <title>
          Professional Travel Booking Services | Your Travel Partner
        </title>
        <meta
          name="description"
          content="Expert travel booking services for flights, hotels, tour packages, and visa assistance. Plan your perfect trip with our professional travel consultants."
        />
      </Head>

      <Nav />
      <WhatsApp />

      <div className={styles.travelBookingContainer}>
        {/* Header */}

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroContent}>
            {/* Left side: Text */}
            <div className={styles.heroText}>
              <h1 className={`${styles.heroTitle} ${styles.fadeInUp}`}>
                Discover Your Next{" "}
                <span className={styles.highlight}>Adventure</span>
              </h1>
              <p className={`${styles.heroDescription} ${styles.fadeInUp}`}>
                Expert travel planning services for flights, hotels, tours, and
                visa assistance. Your journey begins with us.
              </p>

              <div className={`${styles.heroStats} ${styles.fadeInUp}`}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>50K+</span>
                  <span className={styles.statLabel}>Happy Travelers</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>100+</span>
                  <span className={styles.statLabel}>Destinations</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>15+</span>
                  <span className={styles.statLabel}>Years Experience</span>
                </div>
              </div>
            </div>

            {/* Right side: Image instead of form */}
            <div className={`${styles.heroImage} ${styles.fadeInUp}`}>
              <Image
                src="/icons/Tour-Travels.png"
                alt="Travel bookings"
                width={500}
                height={400}
                className={styles.heroImg}
              />
            </div>
          </div>
        </section>
        {/* Services Section */}
        <section id="services" className={styles.servicesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Travel Services</h2>
            <p className={styles.sectionSubtitle}>
              Comprehensive travel solutions for all your needs
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {travelServices.map((service) => (
              <div
                key={service.id}
                data-aos="fade-up"
                className={styles.serviceCard}
              >
                <div className={styles.serviceIconContainer}>
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className={styles.serviceFeatures}>
                  {service.features.slice(0, 4).map((feature, index) => (
                    <li key={index}>
                      <FaCheck className={styles.checkmark} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="https://expedia.com/affiliate/Taymxbh">
                  <button className={styles.serviceButton}>
                    Explore <FaChevronRight />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="process" className={styles.processSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              A simple and seamless process to plan your dream trip
            </p>
          </div>

          <div className={styles.processSteps}>
            {processSteps.map((step, index) => (
              <div
                key={index}
                className={`${styles.processCard} ${styles.fadeInUp}`}
              >
                <div className={styles.stepIconWrapper}>
                  <div className={styles.stepIcon}>{step.icon}</div>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Testimonials Section */}
        <section id="testimonials" className={styles.testimonialsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What Our Travelers Say</h2>
            <p className={styles.sectionSubtitle}>
              Hear from travelers who have explored the world with us
            </p>
          </div>

          <div className={styles.slider}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialRating}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.floor(testimonial.rating)
                          ? styles.starFilled
                          : styles.starEmpty
                      }
                    />
                  ))}
                  <span>{testimonial.rating}</span>
                </div>
                <div className={styles.testimonialContent}>
                  <p>"{testimonial.content}"</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorImage}>
                    <FaRegSmileBeam />
                  </div>
                  <div className={styles.authorInfo}>
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.trip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Call to Action Section */}
        <section id="contact" className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Plan Your Next Adventure?</h2>
            <p>
              Contact our travel experts today and get the best deals for your
              dream vacation
            </p>
            <div className={styles.ctaButtons}>
              <a href="tel:+919870519002">
                {" "}
                <button className={styles.ctaButtonPrimary}>
                  <FaPhoneAlt /> Get Free Consultation
                </button>
              </a>

              <a href="mailto:info@aroliya.com">
                <button className={styles.ctaButtonSecondary}>
                  <FaEnvelope /> Send Message
                </button>
              </a>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default TravelBookings;
