// app/services/travel-bookings/page.jsx
"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "./TravelBookings.module.css";
import Footer from "@/app/home/footer/page";
import Link from "next/link";
import WhatsApp from "../../whatsapp_icon/page";
import {
  FaPlane,
  FaHotel,
  FaUmbrellaBeach,
  FaCheck,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
  FaStar,
  FaChevronRight,
  FaSearch,
  FaGlobe,
  FaRegSmileBeam,
  FaPassport,
  FaMountain,
  FaMapMarkerAlt,
  FaHeart,
  FaClock,
  FaBuilding,
  FaCity,
  FaTree,
  FaWater,
  FaCrown,
  FaShieldAlt,
  FaHeadset,
  FaAward,
} from "react-icons/fa";
import Nav from "@/app/home/component/Nav/page";
import {
  MdDirectionsBoat,
  MdFamilyRestroom,
  MdBusinessCenter,
  MdSecurity,
  MdSupportAgent,
} from "react-icons/md";
import {
  IoIosAirplane,
  IoMdBed,
  IoMdTrain,
  IoMdCard,
  IoMdPeople,
  IoMdTime,
  IoMdBusiness,
  IoMdRibbon,
} from "react-icons/io";

const TravelBookings = () => {
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate] = useState(83);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const toggleCurrency = () => {
    setCurrency(currency === "INR" ? "USD" : "INR");
  };

  const convertPrice = (price) => {
    if (currency === "USD") {
      const numericPrice = parseInt(price.replace(/[^0-9]/g, ""));
      if (!isNaN(numericPrice)) {
        const usdAmount = numericPrice / exchangeRate;
        return `$${usdAmount.toFixed(0)}`;
      }
      return price;
    }
    return price;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const travelServices = [
    {
      id: "flights",
      title: "Premium Flight Reservations",
      icon: <IoIosAirplane className={styles.serviceIcon} />,
      description:
        "Exclusive access to premium airline partnerships with flexible booking options and priority services.",
      features: [
        { text: "Best price guarantee", included: true },
        { text: "24/7 flight concierge", included: true },
        { text: "Real-time flight updates", included: true },
        { text: "Flexible date options", included: true },
        { text: "Priority boarding access", included: true },
        { text: "Seat selection & upgrades", included: true },
      ],
      price: "Starting from ₹2,499",
    },
    {
      id: "hotels",
      title: "Luxury Accommodation Curations",
      icon: <IoMdBed className={styles.serviceIcon} />,
      description:
        "Handpicked luxury properties from boutique hotels to 5-star resorts with exclusive amenities.",
      features: [
        { text: "500,000+ premium properties", included: true },
        { text: "Complimentary room upgrades", included: true },
        { text: "Early check-in privileges", included: true },
        { text: "Exclusive member rates", included: true },
        { text: "Personalized room preferences", included: true },
        { text: "24/7 hotel concierge", included: true },
      ],
      price: "Starting from ₹1,299",
    },
    {
      id: "packages",
      title: "Bespoke Travel Experiences",
      icon: <FaUmbrellaBeach className={styles.serviceIcon} />,
      description:
        "Tailored end-to-end travel experiences combining luxury accommodations, premium flights, and exclusive activities.",
      features: [
        { text: "Customized itineraries", included: true },
        { text: "Exclusive experiences access", included: true },
        { text: "Private guided tours", included: true },
        { text: "Seamless transfers", included: true },
        { text: "Premium dining reservations", included: true },
        { text: "Personal travel concierge", included: true },
      ],
      price: "Packages from ₹15,999",
    },
    {
      id: "trains",
      title: "Rail Journey Excellence",
      icon: <IoMdTrain className={styles.serviceIcon} />,
      description:
        "Premium train travel experiences with luxury class options and personalized service.",
      features: [
        { text: "Domestic & international routes", included: true },
        { text: "Real-time seat availability", included: true },
        { text: "First-class compartment options", included: true },
        { text: "Priority boarding service", included: true },
        { text: "Flexible cancellation policies", included: true },
        { text: "Multi-city itineraries", included: true },
      ],
      price: "Starting from ₹199",
    },
    {
      id: "cruises",
      title: "Luxury Cruise Expeditions",
      icon: <MdDirectionsBoat className={styles.serviceIcon} />,
      description:
        "World-class cruise experiences with premium cabin selections and exclusive shore excursions.",
      features: [
        { text: "Global cruise partnerships", included: true },
        { text: "Suite cabin upgrades", included: true },
        { text: "All-inclusive dining packages", included: true },
        { text: "Private shore excursions", included: true },
        { text: "Onboard credit amenities", included: true },
        { text: "Dedicated cruise consultant", included: true },
      ],
      price: "Starting from ₹25,999",
    },
    {
      id: "visa",
      title: "Visa Concierge Services",
      icon: <FaPassport className={styles.serviceIcon} />,
      description:
        "Comprehensive visa processing and documentation support for seamless international travel.",
      features: [
        { text: "Multi-country visa management", included: true },
        { text: "Document verification services", included: true },
        { text: "Embassy coordination support", included: true },
        { text: "Express processing options", included: true },
        { text: "Travel insurance assistance", included: true },
        { text: "24/7 status tracking", included: true },
      ],
      price: "Starting from ₹1,999",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Personal Consultation",
      description:
        "Begin with an in-depth consultation to understand your travel preferences, requirements, and aspirations.",
      icon: <FaHeadset className={styles.stepIcon} />,
      features: [
        { text: "Travel preference assessment", included: true },
        { text: "Destination discussions", included: true },
        { text: "Budget planning session", included: true },
        { text: "Special requirement identification", included: true },
        { text: "Travel style analysis", included: true },
        { text: "Itinerary concept development", included: true },
      ],
    },
    {
      step: 2,
      title: "Custom Itinerary Design",
      description:
        "Receive meticulously crafted travel proposals with premium options tailored to your specific needs.",
      icon: <IoMdRibbon className={styles.stepIcon} />,
      features: [
        { text: "Personalized itinerary creation", included: true },
        { text: "Premium option presentations", included: true },
        { text: "Accommodation selections", included: true },
        { text: "Activity recommendations", included: true },
        { text: "Budget optimization analysis", included: true },
        { text: "Detailed day-by-day planning", included: true },
      ],
    },
    {
      step: 3,
      title: "Secure Reservation & Confirmation",
      description:
        "Complete your booking with our secure payment gateway and receive instant confirmations.",
      icon: <MdSecurity className={styles.stepIcon} />,
      features: [
        { text: "Secure payment processing", included: true },
        { text: "Instant booking confirmations", included: true },
        { text: "Document delivery", included: true },
        { text: "Travel insurance coordination", included: true },
        { text: "Final itinerary confirmation", included: true },
        { text: "Pre-travel briefing session", included: true },
      ],
    },
    {
      step: 4,
      title: "Journey Execution & Support",
      description:
        "Experience seamless travel with 24/7 concierge support and on-ground assistance throughout your journey.",
      icon: <FaCrown className={styles.stepIcon} />,
      features: [
        { text: "24/7 travel concierge", included: true },
        { text: "On-ground assistance", included: true },
        { text: "Real-time itinerary adjustments", included: true },
        { text: "Emergency contact availability", included: true },
        { text: "Experience quality monitoring", included: true },
        { text: "Post-travel feedback collection", included: true },
      ],
    },
  ];

  const popularDestinations = [
    {
      name: "Bali, Indonesia",
      icon: <FaTree className={styles.destinationIcon} />,
      price: "₹62,999",
      duration: "7 Days / 6 Nights",
      rating: 4.8,
      type: "Tropical Paradise",
      highlights: [
        { text: "Private Villa Accommodations", included: true },
        { text: "Cultural Temple Tours", included: true },
        { text: "Luxury Spa Experiences", included: true },
        { text: "Beachfront Dining", included: true },
        { text: "Waterfall Adventures", included: true },
        { text: "Traditional Cooking Classes", included: true },
      ],
    },
    {
      name: "Paris, France",
      icon: <FaBuilding className={styles.destinationIcon} />,
      price: "₹89,999",
      duration: "5 Days / 4 Nights",
      rating: 4.7,
      type: "Romantic Getaway",
      highlights: [
        { text: "Eiffel Tower Premium Access", included: true },
        { text: "Michelin Star Dining", included: true },
        { text: "Louvre Private Tour", included: true },
        { text: "Seine River Cruise", included: true },
        { text: "Versailles Palace Visit", included: true },
        { text: "Montmartre Art Experience", included: true },
      ],
    },
    {
      name: "Tokyo, Japan",
      icon: <FaCity className={styles.destinationIcon} />,
      price: "₹1,09,999",
      duration: "8 Days / 7 Nights",
      rating: 4.9,
      type: "Urban Luxury Experience",
      highlights: [
        { text: "Cherry Blossom Viewing", included: true },
        { text: "Traditional Tea Ceremonies", included: true },
        { text: "Premium Shopping Districts", included: true },
        { text: "Robot Restaurant Show", included: true },
        { text: "Mount Fuji Excursion", included: true },
        { text: "Sushi Making Classes", included: true },
      ],
    },
    {
      name: "Santorini, Greece",
      icon: <FaWater className={styles.destinationIcon} />,
      price: "₹84,999",
      duration: "6 Days / 5 Nights",
      rating: 4.8,
      type: "Island Luxury Escape",
      highlights: [
        { text: "Caldera View Suites", included: true },
        { text: "Private Sunset Yacht Tour", included: true },
        { text: "Wine Tasting Experiences", included: true },
        { text: "Aegean Sea Adventures", included: true },
        { text: "Ancient Ruins Exploration", included: true },
        { text: "Greek Cooking Lessons", included: true },
      ],
    },
    {
      name: "Dubai, UAE",
      icon: <FaBuilding className={styles.destinationIcon} />,
      price: "₹54,999",
      duration: "6 Days / 5 Nights",
      rating: 4.7,
      type: "Modern Luxury Destination",
      highlights: [
        { text: "Burj Khalifa Sky Deck", included: true },
        { text: "Desert Safari Premium", included: true },
        { text: "Gold Souk Shopping", included: true },
        { text: "Palm Jumeirah Access", included: true },
        { text: "Fountain Show Experience", included: true },
        { text: "Luxury Mall Shopping", included: true },
      ],
    },
    {
      name: "Swiss Alps",
      icon: <FaMountain className={styles.destinationIcon} />,
      price: "₹75,999",
      duration: "7 Days / 6 Nights",
      rating: 4.9,
      type: "Alpine Luxury Retreat",
      highlights: [
        { text: "Mountain Resort Stays", included: true },
        { text: "Ski-in/Ski-out Access", included: true },
        { text: "Cable Car Experiences", included: true },
        { text: "Swiss Chocolate Tours", included: true },
        { text: "Lake Geneva Cruises", included: true },
        { text: "Alpine Hiking Adventures", included: true },
      ],
    },
  ];

  const travelTypes = [
    {
      type: "Family Luxury Vacations",
      icon: <MdFamilyRestroom className={styles.travelTypeIcon} />,
      description:
        "Tailored family experiences with child-friendly luxury accommodations and activities for all ages.",
      price: "Packages from ₹35,999",
      features: [
        { text: "Family-friendly luxury resorts", included: true },
        { text: "Kid-friendly activity planning", included: true },
        { text: "Childcare services availability", included: true },
        { text: "Family suite accommodations", included: true },
        { text: "Educational experiences", included: true },
        { text: "Multi-generational planning", included: true },
      ],
    },
    {
      type: "Honeymoon & Romance",
      icon: <FaHeart className={styles.travelTypeIcon} />,
      description:
        "Intimate romantic escapes with private villas, couple experiences, and premium amenities.",
      price: "Packages from ₹49,999",
      features: [
        { text: "Private villa accommodations", included: true },
        { text: "Romantic dining experiences", included: true },
        { text: "Couple spa treatments", included: true },
        { text: "Sunset cruise arrangements", included: true },
        { text: "Flower decoration services", included: true },
        { text: "Photography coordination", included: true },
      ],
    },
    {
      type: "Business & Corporate Travel",
      icon: <IoMdBusiness className={styles.travelTypeIcon} />,
      description:
        "Efficient corporate travel solutions with premium accommodations and business-class services.",
      price: "Custom corporate pricing",
      features: [
        { text: "Business class arrangements", included: true },
        { text: "Executive accommodations", included: true },
        { text: "Meeting room reservations", included: true },
        { text: "Corporate transportation", included: true },
        { text: "Expense management support", included: true },
        { text: "Dedicated account manager", included: true },
      ],
    },
    {
      type: "Adventure & Expedition",
      icon: <FaMountain className={styles.travelTypeIcon} />,
      description:
        "Thrilling adventure experiences with luxury accommodations and expert guided expeditions.",
      price: "Packages from ₹27,999",
      features: [
        { text: "Expert adventure guides", included: true },
        { text: "Luxury adventure camps", included: true },
        { text: "Safety equipment provision", included: true },
        { text: "Photography documentation", included: true },
        { text: "Recovery wellness services", included: true },
        { text: "Small group experiences", included: true },
      ],
    },
    {
      type: "Cultural & Heritage Tours",
      icon: <FaCity className={styles.travelTypeIcon} />,
      description:
        "Immersive cultural experiences with expert guides and premium heritage accommodations.",
      price: "Packages from ₹32,999",
      features: [
        { text: "Local expert guides", included: true },
        { text: "Heritage site access", included: true },
        { text: "Cultural immersion activities", included: true },
        { text: "Traditional accommodation stays", included: true },
        { text: "Local cuisine experiences", included: true },
        { text: "Historical context education", included: true },
      ],
    },
    {
      type: "Wellness & Spa Retreats",
      icon: <FaTree className={styles.travelTypeIcon} />,
      description:
        "Rejuvenating wellness journeys with luxury spa treatments and holistic experiences.",
      price: "Packages from ₹38,999",
      features: [
        { text: "Luxury spa treatments", included: true },
        { text: "Wellness activity programs", included: true },
        { text: "Healthy cuisine options", included: true },
        { text: "Meditation yoga sessions", included: true },
        { text: "Personal wellness coaching", included: true },
        { text: "Tranquil environment stays", included: true },
      ],
    },
  ];

  const testimonials = [
    {
      content:
        "The attention to detail in planning our Bali honeymoon was exceptional. From private villa upgrades to exclusive temple tours, every moment was perfectly curated.",
      author: "Sarah & Michael Thompson",
      trip: "Bali Luxury Honeymoon Experience",
      rating: 5,
      features: [
        { text: "Private Villa Accommodation", included: true },
        { text: "Cultural Temple Tours", included: true },
        { text: "Luxury Spa Treatments", included: true },
        { text: "Beachfront Dining", included: true },
        { text: "Personal Concierge", included: true },
        { text: "24/7 Support", included: true },
      ],
    },
    {
      content:
        "Our multi-generational family trip to Japan was flawlessly executed. The private guides, luxury ryokan stays, and customized itinerary exceeded all expectations.",
      author: "The Johnson Family",
      trip: "Japan Premium Cultural Journey",
      rating: 5,
      features: [
        { text: "Private Expert Guides", included: true },
        { text: "Luxury Ryokan Stays", included: true },
        { text: "Cultural Experiences", included: true },
        { text: "Family Activities", included: true },
        { text: "Seamless Logistics", included: true },
        { text: "Multi-generational Planning", included: true },
      ],
    },
    {
      content:
        "As frequent business travelers, we appreciate the seamless service and premium accommodations. Their corporate travel program has transformed our business trips.",
      author: "Robert Chen, CEO TechGlobal",
      trip: "Corporate Travel Management",
      rating: 4.5,
      features: [
        { text: "Business Class Flights", included: true },
        { text: "Executive Hotels", included: true },
        { text: "Meeting Coordination", included: true },
        { text: "Expense Management", included: true },
        { text: "Dedicated Support", included: true },
        { text: "Time Optimization", included: true },
      ],
    },
    {
      content:
        "The Maldives overwater villa experience was absolutely breathtaking. Private transfers, personalized service, and exclusive dining made it unforgettable.",
      author: "Sneha & Rohan Gupta",
      trip: "Maldives Ultimate Luxury Escape",
      rating: 5,
      features: [
        { text: "Overwater Villa Stay", included: true },
        { text: "Private Transfers", included: true },
        { text: "Exclusive Dining", included: true },
        { text: "Marine Activities", included: true },
        { text: "Personalized Service", included: true },
        { text: "Luxury Amenities", included: true },
      ],
    },

    // ------------------------- Indian Testimonials Below -------------------------

    {
      content:
        "Our honeymoon in Kashmir was beyond magical. The houseboat experience and private shikara ride made it so romantic.",
      author: "Aarav & Diya Mehta",
      trip: "Kashmir Romantic Honeymoon",
      rating: 5,
      features: [
        { text: "Luxury Houseboat Stay", included: true },
        { text: "Private Shikara Ride", included: true },
        { text: "Candlelight Dinner", included: true },
        { text: "Mountain View Suite", included: true },
        { text: "24/7 Assistance", included: true },
        { text: "Curated Local Experiences", included: true },
      ],
    },
    {
      content:
        "The Goa luxury resort package gave us the perfect mix of relaxation and adventure. Highly recommended!",
      author: "Ritika & Kunal Sharma",
      trip: "Goa Beach Luxury Escape",
      rating: 5,
      features: [
        { text: "Private Beach Access", included: true },
        { text: "Water Sports", included: true },
        { text: "Luxury Spa", included: true },
        { text: "Gourmet Dining", included: true },
        { text: "Nightlife Experience", included: true },
        { text: "Personal Guide", included: true },
      ],
    },
    {
      content:
        "We booked a Rajasthan royal heritage tour — the palaces and cultural shows were simply stunning.",
      author: "Vikram Singh Rajput",
      trip: "Rajasthan Royal Heritage Journey",
      rating: 4.8,
      features: [
        { text: "Palace Stays", included: true },
        { text: "Camel Safari", included: true },
        { text: "Folk Music Evenings", included: true },
        { text: "Heritage Dining", included: true },
        { text: "Custom Itinerary", included: true },
        { text: "24/7 Support", included: true },
      ],
    },
    {
      content:
        "Kerala backwaters were so peaceful. The private houseboat and authentic cuisine made it a once-in-a-lifetime trip.",
      author: "Manoj & Priya Nair",
      trip: "Kerala Backwater Retreat",
      rating: 5,
      features: [
        { text: "Private Houseboat Stay", included: true },
        { text: "Traditional Meals", included: true },
        { text: "Ayurvedic Spa", included: true },
        { text: "Cultural Performances", included: true },
        { text: "Scenic Cruise", included: true },
        { text: "Local Guide", included: true },
      ],
    },
    {
      content:
        "Our corporate incentive trip to Dubai was perfectly handled. From desert safaris to luxury dining, everything was top-notch.",
      author: "Ankit Jain, HR Manager",
      trip: "Dubai Corporate Luxury Tour",
      rating: 4.9,
      features: [
        { text: "Business Class Flights", included: true },
        { text: "5-Star Hotels", included: true },
        { text: "Desert Safari", included: true },
        { text: "Luxury Dining", included: true },
        { text: "Team Activities", included: true },
        { text: "Travel Insurance", included: true },
      ],
    },
    {
      content:
        "We celebrated our anniversary in Udaipur and it was pure magic. The lake view suite and private dinner were amazing.",
      author: "Neha & Rajat Kapoor",
      trip: "Udaipur Romantic Getaway",
      rating: 5,
      features: [
        { text: "Lake View Suite", included: true },
        { text: "Private Boat Dinner", included: true },
        { text: "Spa for Two", included: true },
        { text: "Cultural Tour", included: true },
        { text: "Custom Itinerary", included: true },
        { text: "24/7 Concierge", included: true },
      ],
    },
    {
      content:
        "The Ladakh adventure tour was well organized — from bike rides to stays in mountain camps, everything felt safe and exciting.",
      author: "Aditya & Sanya Verma",
      trip: "Ladakh Adventure Expedition",
      rating: 5,
      features: [
        { text: "Guided Bike Tour", included: true },
        { text: "Mountain Camps", included: true },
        { text: "Safety Equipment", included: true },
        { text: "Meal Plan", included: true },
        { text: "Local Support Team", included: true },
        { text: "Emergency Backup", included: true },
      ],
    },
    {
      content:
        "Our Thailand family trip was fantastic — kids loved the theme parks and we enjoyed the private beach villa.",
      author: "The Patel Family",
      trip: "Thailand Family Vacation",
      rating: 4.7,
      features: [
        { text: "Private Villa", included: true },
        { text: "Theme Park Access", included: true },
        { text: "Island Tour", included: true },
        { text: "Family-friendly Meals", included: true },
        { text: "Dedicated Tour Guide", included: true },
        { text: "Airport Transfers", included: true },
      ],
    },
    {
      content:
        "The Singapore and Bali combo was beautifully arranged. Smooth transfers, curated hotels, and memorable excursions.",
      author: "Rohit & Kavya Deshmukh",
      trip: "Singapore–Bali Premium Package",
      rating: 5,
      features: [
        { text: "Multi-city Transfers", included: true },
        { text: "Luxury Hotels", included: true },
        { text: "Excursions Included", included: true },
        { text: "Travel Insurance", included: true },
        { text: "Concierge Support", included: true },
        { text: "Personal Driver", included: true },
      ],
    },
  ];

  const StarRating = ({ rating }) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
          />
        ))}
      </div>
    );
  };

  const FeatureItem = ({ feature }) => (
    <div className={styles.featureItem}>
      {feature.included ? (
        <FaCheck className={styles.checkmark} />
      ) : (
        <FaTimes className={styles.crossmark} />
      )}
      <span>{feature.text}</span>
    </div>
  );

  const nextReview = () => {
    setCurrentReviewIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <>
      <Head>
        <title>
          Premium Travel & Hotel Booking Services | Luxury Travel Experiences
        </title>
        <meta
          name="description"
          content="Premium travel booking services for luxury flights, hotels, and bespoke vacation packages. Experience world-class travel planning with our expert consultants."
        />
      </Head>

      <Nav />
      <WhatsApp />

      <div className={styles.travelBookingContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroBadge}>
                <FaAward className={styles.badgeIcon} />
                Premium Travel Services
              </div>
              <h1 className={styles.heroTitle}>
                Curate Your Perfect{" "}
                <span className={styles.highlight}>Journey</span>
              </h1>
              <p className={styles.heroDescription}>
                Experience bespoke travel planning with our premium concierge
                service. From luxury accommodations to exclusive experiences, we
                craft unforgettable journeys.
              </p>

              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>50K+</span>
                  <span className={styles.statLabel}>Elite Travelers</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>100+</span>
                  <span className={styles.statLabel}>Luxury Destinations</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>15+</span>
                  <span className={styles.statLabel}>Years Excellence</span>
                </div>
              </div>

              <div className={styles.heroCta}>
                <a href="tel:+919870519002">
                  <button className={styles.ctaButtonPrimary}>
                    <FaPhoneAlt /> Begin Your Journey
                  </button>
                </a>
                <a href="#services">
                  <button className={styles.ctaButtonSecondary}>
                    Explore Services
                  </button>
                </a>
              </div>
            </div>

            <div className={styles.heroGraphics}>
              <div className={styles.graphicCard}>
                <div className={styles.graphicIconWrapper}>
                  <IoIosAirplane className={styles.graphicIcon} />
                </div>
                <h4>Premium Flights</h4>
                <p>First Class & Business</p>
              </div>
              <div className={styles.graphicCard}>
                <div className={styles.graphicIconWrapper}>
                  <IoMdBed className={styles.graphicIcon} />
                </div>
                <h4>Luxury Stays</h4>
                <p>5-Star Properties</p>
              </div>
              <div className={styles.graphicCard}>
                <div className={styles.graphicIconWrapper}>
                  <FaUmbrellaBeach className={styles.graphicIcon} />
                </div>
                <h4>Bespoke Packages</h4>
                <p>Tailored Experiences</p>
              </div>
              <div className={styles.graphicCard}>
                <div className={styles.graphicIconWrapper}>
                  <FaPassport className={styles.graphicIcon} />
                </div>
                <h4>Visa Concierge</h4>
                <p>Seamless Processing</p>
              </div>
            </div>
          </div>
        </section>
        {/* Services Section */}
        <section id="services" className={styles.servicesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Our Services</div>
            <h2 className={styles.sectionTitle}>Premium Travel Solutions</h2>
            <p className={styles.sectionSubtitle}>
              Experience world-class travel services tailored to your luxury
              preferences
            </p>

            <div className={styles.currencyToggle}>
              <button
                onClick={toggleCurrency}
                className={styles.currencyButton}
              >
                Show Prices in {currency === "INR" ? "USD" : "INR"}
              </button>
              <span className={styles.currencyNote}>
                Currently displaying in {currency}
              </span>
            </div>
          </div>

          <div className={styles.servicesGrid}>
            {travelServices.map((service, index) => (
              <div
                key={service.id}
                className={styles.serviceCard}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={styles.serviceIconContainer}>
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className={styles.servicePrice}>
                  {service.id === "hotels" ? (
                    <>
                      {convertPrice(service.price)}
                      {currency === "INR" ? "" : ""}
                    </>
                  ) : (
                    convertPrice(service.price)
                  )}
                </div>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <FeatureItem feature={feature} />
                    </li>
                  ))}
                </ul>
                <Link href="https://expedia.com/affiliate/Taymxbh">
                  <button className={styles.serviceButton}>
                    Explore Premium Options <FaChevronRight />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
        {/* Travel Types Section */}
        <section className={styles.travelTypesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Experiences</div>
            <h2 className={styles.sectionTitle}>Curated Travel Experiences</h2>
            <p className={styles.sectionSubtitle}>
              Bespoke journeys designed for every type of luxury traveler
            </p>
          </div>

          <div className={styles.travelTypesGrid}>
            {travelTypes.map((type, index) => (
              <div
                key={index}
                className={styles.travelTypeCard}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={styles.travelTypeIconContainer}>
                  {type.icon}
                </div>
                <h3>{type.type}</h3>
                <p>{type.description}</p>
                <div className={styles.travelTypePrice}>
                  {type.price === "Custom corporate pricing"
                    ? type.price
                    : convertPrice(type.price)}
                </div>
                <ul className={styles.travelTypeFeatures}>
                  {type.features.map((feature, index) => (
                    <li key={index}>
                      <FeatureItem feature={feature} />
                    </li>
                  ))}
                </ul>
                <button className={styles.travelTypeButton}>
                  Discover Experiences <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        </section>
        {/* Popular Destinations */}
        <section className={styles.destinationsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Destinations</div>
            <h2 className={styles.sectionTitle}>
              Exclusive Global Destinations
            </h2>
            <p className={styles.sectionSubtitle}>
              Discover the world's most sought-after luxury travel destinations
            </p>
          </div>

          <div className={styles.destinationsGrid}>
            {popularDestinations.map((destination, index) => (
              <div
                key={index}
                className={styles.destinationCard}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={styles.destinationIconContainer}>
                  {destination.icon}
                  <div className={styles.destinationType}>
                    {destination.type}
                  </div>
                </div>
                <div className={styles.destinationInfo}>
                  <h3>{destination.name}</h3>
                  <ul className={styles.destinationHighlights}>
                    {destination.highlights.map((highlight, idx) => (
                      <li key={idx}>
                        <FeatureItem feature={highlight} />
                      </li>
                    ))}
                  </ul>
                  <div className={styles.destinationMeta}>
                    <div className={styles.duration}>
                      <FaClock />
                      {destination.duration}
                    </div>
                    <div className={styles.rating}>
                      <StarRating rating={destination.rating} />
                      <span>{destination.rating}</span>
                    </div>
                  </div>
                  <div className={styles.destinationPrice}>
                    {convertPrice(destination.price)}
                    <span>per person</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* How It Works */}
        <section id="process" className={styles.processSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Process</div>
            <h2 className={styles.sectionTitle}>The Premium Experience</h2>
            <p className={styles.sectionSubtitle}>
              Our seamless process ensures your luxury journey is perfectly
              crafted
            </p>
          </div>

          <div className={styles.processSteps}>
            {processSteps.map((step, index) => (
              <div
                key={index}
                className={styles.processCard}
                data-aos="fade-up"
                data-aos-delay={index * 200}
              >
                <div className={styles.stepNumber}>{step.step}</div>
                <div className={styles.stepIconWrapper}>
                  <div className={styles.stepIcon}>{step.icon}</div>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                <ul className={styles.stepFeatures}>
                  {step.features.map((feature, index) => (
                    <li key={index}>
                      <FeatureItem feature={feature} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        {/* Testimonials Section */}
        <section id="testimonials" className={styles.testimonialsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Testimonials</div>
            <h2 className={styles.sectionTitle}>Elite Traveler Experiences</h2>
            <p className={styles.sectionSubtitle}>
              Hear from our discerning clients who have experienced premium
              travel with us
            </p>
          </div>

          <div className={styles.reviewsContainer}>
            <button className={styles.navButton} onClick={prevReview}>
              <FaChevronRight style={{ transform: "rotate(180deg)" }} />
            </button>

            <div className={styles.reviewsSlider}>
              <div
                className={styles.reviewsTrack}
                style={{
                  transform: `translateX(-${currentReviewIndex * (100 / 2)}%)`,
                  transition: "transform 0.6s ease-in-out",
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className={styles.testimonialSlide}>
                    <div className={styles.testimonialCard}>
                      <div className={styles.testimonialRating}>
                        <StarRating rating={testimonial.rating} />
                        <span>{testimonial.rating}</span>
                      </div>
                      <div className={styles.testimonialContent}>
                        <p>"{testimonial.content}"</p>
                      </div>
                      <ul className={styles.testimonialFeatures}>
                        {testimonial.features.map((feature, idx) => (
                          <li key={idx}>
                            <FeatureItem feature={feature} />
                          </li>
                        ))}
                      </ul>
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
                  </div>
                ))}
              </div>
            </div>

            <button className={styles.navButton} onClick={nextReview}>
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.reviewIndicators}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${
                  index === currentReviewIndex ? styles.active : ""
                }`}
                onClick={() => setCurrentReviewIndex(index)}
              />
            ))}
          </div>
        </section>
        {/* Call to Action Section */}
        <section id="contact" className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Craft Your Luxury Journey?</h2>
            <p>
              Connect with our premium travel consultants to begin designing
              your bespoke experience. Expect exceptional service and
              unparalleled attention to detail.
            </p>
            <div className={styles.ctaButtons}>
              <a href="tel:+919870519002">
                <button className={styles.ctaButtonPrimary}>
                  <FaPhoneAlt /> Schedule Consultation
                </button>
              </a>
              <a href="mailto:info@aroliya.com">
                <button className={styles.ctaButtonSecondary}>
                  <FaEnvelope className={styles.emailsend} /> Inquire Now
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
