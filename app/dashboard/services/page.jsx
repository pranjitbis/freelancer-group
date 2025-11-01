"use client";
import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";
import {
  FiUsers,
  FiEdit,
  FiMonitor,
  FiShoppingCart,
  FiGlobe,
  FiBarChart2,
  FiCreditCard,
  FiArrowRight,
  FiStar,
  FiCheck,
  FiPlus,
  FiMinus,
  FiInfo,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

export default function ServicesPage() {
  const [user, setUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (selectedService && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: "",
        requirements: "",
        price: selectedService.actualPrice,
        quantity: 1,
        category: "",
        subcategory: "",
        urgency: "standard",
        duration: "",
        experienceLevel: "",
      });
    }
  }, [selectedService, user]);

  // Service-specific options
  const serviceOptions = {
    "Freelancer Services": {
      categories: [
        "Web Development",
        "Mobile App Development",
        "Graphic Design",
        "Content Writing",
        "Digital Marketing",
        "Data Entry",
        "Video Editing",
      ],
      experienceLevels: ["Beginner", "Intermediate", "Expert"],
      durations: ["1-2 weeks", "2-4 weeks", "1-3 months", "3+ months"],
    },
    "Online Form Filling": {
      categories: [
        "Government Exams",
        "Job Applications",
        "College Admissions",
        "Banking Forms",
        "Passport/Visa",
        "Insurance Forms",
        "Tax Filing",
      ],
      urgencyOptions: [
        { value: "urgent", label: "Urgent (24-48 hours)" },
        { value: "priority", label: "Priority (3-5 days)" },
        { value: "standard", label: "Standard (1 week)" },
      ],
    },
    "Virtual Assistant": {
      categories: [
        "Administrative Tasks",
        "Email Management",
        "Calendar Management",
        "Data Entry",
        "Customer Support",
        "Social Media Management",
        "Research Tasks",
      ],
      durations: [, "1 weeks", "2 weeks", "1 months"],
      experienceLevels: ["Beginner", "Intermediate", "Expert"],
    },
    "E-Commerce Solutions": {
      categories: [
        "Product Listing",
        "Inventory Management",
        "Order Processing",
        "Customer Service",
        "Store Setup",
        "Marketing",
        "Analytics",
      ],
      platforms: [
        "Shopify",
        "WooCommerce",
        "Amazon",
        "Etsy",
        "Magento",
        "Custom",
      ],
    },
    "Travel & Hotel Booking": {
      categories: [
        "Flight Booking",
        "Hotel Reservation",
        "Tour Packages",
        "Visa Assistance",
        "Transportation",
        "Event Tickets",
        "Travel Insurance",
      ],
      tripTypes: ["Business", "Leisure", "Family", "Solo", "Group"],
      classes: ["Economy", "Business", "First Class", "Premium Economy"],
    },
    "Data & AI Solution": {
      categories: [
        "Data Analysis",
        "Dashboard Creation",
        "Machine Learning",
        "Predictive Analytics",
        "Data Visualization",
        "AI Integration",
        "Custom Solutions",
      ],
      tools: ["Power BI", "Tableau", "Python", "R", "Excel", "Custom"],
      complexityLevels: ["Basic", "Intermediate", "Advanced", "Enterprise"],
    },
  };

  const services = [
    {
      icon: <FiEdit size={40} color="#f59e0b" />,
      title: "Online Form Filling",
      features: [
        "Exam & Job Applications",
        "Education & Admission Forms",
        "Banking & Financial Forms",
        "Travel & Other Services",
      ],
      price: "₹299",
      actualPrice: 299,
      rating: 4.7,
      reviews: 89,
      buttonText: "Submit Request",
      popular: true,
    },
    {
      icon: <FiMonitor size={40} color="#3b82f6" />, // blue for tech/web
      title: "Web Development",
      features: [
        "Custom website & web app development",
        "Responsive and mobile-friendly design",
        "E-commerce solutions & payment integration",
        "SEO optimization and fast performance",
      ],
      price: "Custom",
      actualPrice: 999,
      rating: 5.0,
      reviews: 245,
      buttonText: "Build Your Website",
      popular: true,
    },

    {
      icon: <FiShoppingCart size={40} color="#ef4444" />,
      title: "E-Commerce Solutions",
      features: [
        "Managing Catalogs and Products",
        "Managing Orders and Inventory",
        "Helping Sellers Grow Sales",
        "Customer Support Outsourcing",
      ],
      price: "₹499",
      actualPrice: 499,
      rating: 4.6,
      reviews: 72,
      buttonText: "Get Started",
      popular: false,
    },
    {
      icon: <FiGlobe size={40} color="#3b82f6" />,
      title: "Travel & Hotel Booking",
      features: [
        "Domestic & International flights",
        "Train Tickets with PNR updates",
        "Bus Tickets — Verified operators",
        "Hotel Stays — Curated properties",
      ],
      price: "₹599",
      actualPrice: 599,
      rating: 4.8,
      reviews: 203,
      buttonText: "Book Now",
      popular: true,
    },
    {
      icon: <FiBarChart2 size={40} color="#9333ea" />,
      title: "Data & AI Solution",
      features: [
        "Power BI, Tableau, Looker dashboards",
        "Custom Data Visualizations",
        "Business Data Analysis",
        "AI dashboards for insights",
      ],
      price: "₹699",
      actualPrice: 699,
      rating: 4.9,
      reviews: 98,
      buttonText: "Get Started",
      popular: false,
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    requirements: "",
    quantity: 1,
    price: services[0].actualPrice,
    category: "",
    subcategory: "",
    urgency: "standard",
    duration: "",
    resume: "",
    experienceLevel: "",
  });

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowServiceForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "range") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const incrementQuantity = () => {
    setFormData((prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  };

  const decrementQuantity = () => {
    if (formData.quantity > 1) {
      setFormData((prev) => ({
        ...prev,
        quantity: prev.quantity - 1,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resume) {
      alert("Please upload a resume");
      return;
    }

    if (!selectedService) {
      alert("No service selected");
      return;
    }

    try {
      // 1️⃣ Upload resume file
      const uploadData = new FormData();
      uploadData.append("resume", formData.resume);

      const uploadRes = await fetch("/api/uploadServiceRs", {
        method: "POST",
        body: uploadData,
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadResult.error || "Upload failed");

      const resumeUrl = uploadResult.url;

      // 2️⃣ Create Razorpay order
      const amount = formData.price * formData.quantity;
      const amountInPaise = amount * 100;

      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      const order = await orderRes.json();
      if (!order.id) throw new Error("Failed to create Razorpay order");

      // 3️⃣ Open Razorpay payment window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Aroliya",
        description: selectedService.title,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 4️⃣ Save order to backend
            const saveRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                requirements: formData.requirements,
                quantity: formData.quantity,
                category: formData.category,
                subcategory: formData.subcategory,
                urgency: formData.urgency,
                urgency: formData.price,
                duration: formData.duration,
                resume: resumeUrl,
                experienceLevel: formData.experienceLevel,
                service: selectedService?.title || "",
                paymentId: response.razorpay_payment_id,
                status: "Pending",
              }),
            });

            const savedOrder = await saveRes.json();
            if (savedOrder.id) {
              setNotification({
                message: "User deleted successfully!",
                type: "success",
              });
              setTimeout(() => setNotification(null), 3000);

              setShowServiceForm(false);
              setSelectedService(null);
            } else {
              setNotification({
                message: "Failed to save order!",
                type: "error",
              });
              setTimeout(() => setNotification(null), 3000);
            }
          } catch (err) {
            console.error(err);
            alert("Error saving order to database");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#4361ee" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Form submission error:", err);
      alert(err.message);
    }
  };
  // Render service-specific form fields
  const renderServiceSpecificFields = () => {
    if (!selectedService) return null;

    const serviceType = selectedService.title;
    const options = serviceOptions[serviceType] || {};

    switch (serviceType) {
      case "Freelancer Services":
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="category">Service Category *</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {options.categories?.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="experienceLevel">Experience Level</label>
              <div className={styles.selectWrapper}>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select experience level</option>
                  {options.experienceLevels?.map((level, idx) => (
                    <option key={idx} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duration">Project Duration</label>
              <div className={styles.selectWrapper}>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                >
                  <option value="">Select duration</option>
                  {options.durations?.map((duration, idx) => (
                    <option key={idx} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>
          </>
        );

      case "Online Form Filling":
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="category">Form Type *</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select form type</option>
                  {options.categories?.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="urgency">Urgency *</label>
              <div className={styles.selectWrapper}>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  required
                >
                  {options.urgencyOptions?.map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>
          </>
        );

      case "Virtual Assistant":
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="category">Task Type *</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select task type</option>
                  {options.categories?.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="experienceLevel">VA Experience Level</label>
              <div className={styles.selectWrapper}>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select experience level</option>
                  {options.experienceLevels?.map((level, idx) => (
                    <option key={idx} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duration">Service Duration</label>
              <div className={styles.selectWrapper}>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                >
                  <option value="">Select duration</option>
                  {options.durations?.map((duration, idx) => (
                    <option key={idx} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>
          </>
        );

      case "E-Commerce Solutions":
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="category">Service Needed *</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select service</option>
                  {options.categories?.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subcategory">E-commerce Platform</label>
              <div className={styles.selectWrapper}>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select platform</option>
                  {options.platforms?.map((platform, idx) => (
                    <option key={idx} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>
          </>
        );

      case "Travel & Hotel Booking":
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="category">Service Type *</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select service type</option>
                  {options.categories?.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subcategory">Trip Type</label>
              <div className={styles.selectWrapper}>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select trip type</option>
                  {options.tripTypes?.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="experienceLevel">Travel Class</label>
              <div className={styles.selectWrapper}>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select class</option>
                  {options.classes?.map((cls, idx) => (
                    <option key={idx} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>
          </>
        );

      case "Data & AI Solution":
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="category">Service Type *</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select service type</option>
                  {options.categories?.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subcategory">Tool/Platform</label>
              <div className={styles.selectWrapper}>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select tool/platform</option>
                  {options.tools?.map((tool, idx) => (
                    <option key={idx} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="experienceLevel">Complexity Level</label>
              <div className={styles.selectWrapper}>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select complexity</option>
                  {options.complexityLevels?.map((level, idx) => (
                    <option key={idx} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.selectArrow} />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.servicesContent}>
      <div className={styles.servicesHeader}>
        <h2>Our Professional Services</h2>
        <p>
          Choose from our wide range of professional services.{" "}
          <strong>Demo prices shown (₹199+)</strong>
        </p>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service, index) => (
          <div
            key={index}
            className={`${styles.serviceCard} ${
              service.popular ? styles.popular : ""
            }`}
          >
            {service.popular && (
              <div className={styles.popularBadge}>
                <FiStar size={14} />
                Most Popular
              </div>
            )}

            <div className={styles.serviceIcon}>{service.icon}</div>

            <h3>{service.title}</h3>

            <div className={styles.servicePrice}>{service.price}</div>

            <div className={styles.serviceRating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={14}
                    color={
                      i < Math.floor(service.rating) ? "#f59e0b" : "#d1d5db"
                    }
                    fill={i < Math.floor(service.rating) ? "#f59e0b" : "none"}
                  />
                ))}
              </div>
              <span>
                {service.rating} ({service.reviews} reviews)
              </span>
            </div>

            <ul className={styles.serviceFeatures}>
              {service.features.map((feature, i) => (
                <li key={i}>
                  <FiCheck size={16} color="#10b981" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={styles.serviceButton}
              onClick={() => handleServiceClick(service)}
            >
              <FiCreditCard size={18} />
              {service.buttonText}
              <FiArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Service Form Modal */}
      {showServiceForm && selectedService && (
        <div className={styles.modalOverlay}>
          <div className={styles.serviceFormModal}>
            <div className={styles.modalHeader}>
              <h3>Purchase {selectedService.title}</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowServiceForm(false);
                  setSelectedService(null);
                }}
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.serviceForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="resume" className={styles.fieldLabel}>
                  Upload Resume
                </label>
                <div className={styles.fileInputContainer}>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    className={styles.fileInput}
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <div className={styles.rangeValue}>
                  Service Price: ₹{formData.price}
                </div>
                <div className={styles.rangeContainer}>
                  <input
                    type="range"
                    id="price"
                    name="price"
                    className={styles.rangeSlider}
                    min={selectedService?.actualPrice ?? 0}
                    max={10000}
                    step={100}
                    value={formData.price}
                    onChange={handleInputChange}
                    style={{
                      "--slider-progress": `${
                        ((formData.price -
                          (selectedService?.actualPrice ?? 0)) /
                          (10000 - (selectedService?.actualPrice ?? 0))) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className={styles.rangeLabels}>
                  <span className={styles.rangeMinMax}>
                    ₹{selectedService?.actualPrice ?? 0}
                  </span>
                  <span className={styles.rangeMinMax}>₹10000</span>
                </div>
              </div>
              {/* Service-specific fields */}
              {renderServiceSpecificFields()}

              <div className={styles.formGroup}>
                <label htmlFor="quantity">Quantity</label>
                <div className={styles.quantitySelector}>
                  <button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={decrementQuantity}
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className={styles.quantityValue}>
                    {formData.quantity}
                  </span>
                  <button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={incrementQuantity}
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="requirements">
                  Specific Requirements *
                  <span className={styles.helpText}>
                    <FiInfo size={12} />
                    Please provide detailed information about what you need
                  </span>
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your requirements in detail..."
                />
              </div>

              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span>Unit Price:</span>
                  <span>₹{selectedService.actualPrice}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Quantity:</span>
                  <span>{formData.quantity}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Total Amount:</span>
                  <span className={styles.totalPrice}>
                    ₹{formData.price * formData.quantity}
                  </span>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowServiceForm(false);
                    setSelectedService(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  <FiCreditCard size={18} />
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {notification && (
        <div className={styles.notification}>
          {notification.type === "success" && <FiCheckCircle size={20} />}
          {notification.type === "error" && <FiXCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
