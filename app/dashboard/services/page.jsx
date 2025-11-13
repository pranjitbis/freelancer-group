"use client";
import { useState, useEffect } from "react";
import styles from "./service.module.css";
import {
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
  FiDollarSign,
  FiUpload,
  FiFileText,
  FiRefreshCw,
  FiGlobe as FiWorld,
} from "react-icons/fi";

export default function ServicesPage() {
  const [user, setUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(83); // 1 USD = 83 INR
  const [loadingRate, setLoadingRate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userCountry, setUserCountry] = useState("IN");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    fetchExchangeRate();
    detectUserCountry();
  }, []);

  const detectUserCountry = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      setUserCountry(data.country_code || "IN");
    } catch (error) {
      console.error("Error detecting country:", error);
      setUserCountry("IN");
    }
  };

  const fetchExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.rates.INR || 83);
      } else {
        setExchangeRate(83);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(83);
    }
    setLoadingRate(false);
  };

  const convertPrice = (price, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return price;

    if (fromCurrency === "INR" && toCurrency === "USD") {
      return price / exchangeRate;
    } else if (fromCurrency === "USD" && toCurrency === "INR") {
      return price * exchangeRate;
    }
    return price;
  };

  const formatPrice = (price) => {
    if (currency === "USD") {
      return `$${price.toFixed(2)}`;
    }
    return `₹${Math.round(price)}`;
  };

  const services = [
    {
      icon: <FiEdit size={40} color="#2563eb" />,
      title: "Online Form Filling",
      features: [
        "Exam & Job Applications",
        "Education & Admission Forms",
        "Banking & Financial Forms",
        "Travel & Other Services",
      ],
      price: 299,
      actualPrice: 299,
      rating: 4.7,
      reviews: 89,
      buttonText: "Submit Request",
      popular: true,
      requiresResume: true,
      requiresDocuments: true,
    },
    {
      icon: <FiMonitor size={40} color="#2563eb" />,
      title: "Web Development",
      features: [
        "Custom website & web app development",
        "Responsive and mobile-friendly design",
        "E-commerce solutions & payment integration",
        "SEO optimization and fast performance",
      ],
      price: 999,
      actualPrice: 999,
      rating: 5.0,
      reviews: 245,
      buttonText: "Build Your Website",
      popular: true,
      requiresResume: false,
      requiresDocuments: false,
    },
    {
      icon: <FiShoppingCart size={40} color="#2563eb" />,
      title: "E-Commerce Solutions",
      features: [
        "Managing Catalogs and Products",
        "Managing Orders and Inventory",
        "Helping Sellers Grow Sales",
        "Customer Support Outsourcing",
      ],
      price: 499,
      actualPrice: 499,
      rating: 4.6,
      reviews: 72,
      buttonText: "Get Started",
      popular: false,
      requiresResume: false,
      requiresDocuments: false,
    },
    {
      icon: <FiGlobe size={40} color="#2563eb" />,
      title: "Travel & Hotel Booking",
      features: [
        "Domestic & International flights",
        "Train Tickets with PNR updates",
        "Bus Tickets — Verified operators",
        "Hotel Stays — Curated properties",
      ],
      price: 599,
      actualPrice: 599,
      rating: 4.8,
      reviews: 203,
      buttonText: "Book Now",
      popular: true,
      requiresResume: false,
      requiresDocuments: true,
    },
    {
      icon: <FiBarChart2 size={40} color="#2563eb" />,
      title: "Data & AI Solution",
      features: [
        "Power BI, Tableau, Looker dashboards",
        "Custom Data Visualizations",
        "Business Data Analysis",
        "AI dashboards for insights",
      ],
      price: 699,
      actualPrice: 699,
      rating: 4.9,
      reviews: 98,
      buttonText: "Get Started",
      popular: false,
      requiresResume: true,
      requiresDocuments: false,
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    requirements: "",
    quantity: 1,
    price: 0,
    displayPrice: 0,
    basePrice: 0,
    resume: null,
    documents: [],
  });

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);

    const displayPrice =
      currency === "USD"
        ? convertPrice(service.actualPrice, "INR", "USD")
        : service.actualPrice;

    setFormData((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      price: service.actualPrice, // Always store base price in INR
      displayPrice:
        currency === "USD"
          ? Number(displayPrice.toFixed(2))
          : Math.round(displayPrice),
      basePrice: service.actualPrice,
      quantity: 1,
      resume: null,
      documents: [],
    }));
    setShowServiceForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (files) {
      if (name === "resume") {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      } else if (name === "documents") {
        setFormData((prev) => ({
          ...prev,
          documents: Array.from(files),
        }));
      }
    } else if (type === "number") {
      const numValue = Number(value);
      setFormData((prev) => {
        const updated = { ...prev, [name]: numValue };

        if (name === "price") {
          updated.displayPrice =
            currency === "USD"
              ? convertPrice(numValue, "INR", "USD")
              : numValue;
        }

        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (newPrice) => {
    if (currency === "USD") {
      const inrPrice = newPrice * exchangeRate;
      setFormData((prev) => ({
        ...prev,
        price: inrPrice,
        displayPrice: newPrice,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        price: newPrice,
        displayPrice: newPrice,
      }));
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

  const calculateDisplayTotal = () => {
    return formData.displayPrice * formData.quantity;
  };

  const calculateINRTotal = () => {
    return formData.price * formData.quantity;
  };

  const getPaymentAmount = () => {
    const totalInINR = calculateINRTotal();
    return Math.round(totalInINR * 100);
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const uploadFile = async (file, endpoint) => {
    const formData = new FormData();
    formData.append(endpoint === "resume" ? "resume" : "document", file);

    const response = await fetch(
      `/api/upload${endpoint === "resume" ? "ServiceRs" : "Documents"}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.url;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (selectedService?.requiresResume && !formData.resume) {
      setNotification({
        message: "Please upload your resume",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      setUploading(false);
      return;
    }

    if (selectedService?.requiresDocuments && formData.documents.length === 0) {
      setNotification({
        message: "Please upload required documents",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      setUploading(false);
      return;
    }

    try {
      let resumeUrl = "";
      let documentUrls = [];

      // Upload resume if required
      if (selectedService?.requiresResume && formData.resume) {
        try {
          setNotification({
            message: "Uploading resume...",
            type: "info",
          });
          resumeUrl = await uploadFile(formData.resume, "resume");
        } catch (error) {
          console.error("Resume upload error:", error);
          setNotification({
            message:
              error.message || "Failed to upload resume. Please try again.",
            type: "error",
          });
          setTimeout(() => setNotification(null), 3000);
          setUploading(false);
          return;
        }
      }

      // Upload documents if required
      if (selectedService?.requiresDocuments && formData.documents.length > 0) {
        try {
          setNotification({
            message: "Uploading documents...",
            type: "info",
          });
          for (const document of formData.documents) {
            const docUrl = await uploadFile(document, "documents");
            documentUrls.push(docUrl);
          }
        } catch (error) {
          console.error("Document upload error:", error);
          setNotification({
            message:
              error.message || "Failed to upload documents. Please try again.",
            type: "error",
          });
          setTimeout(() => setNotification(null), 3000);
          setUploading(false);
          return;
        }
      }

      const amount = getPaymentAmount();
      const displayTotal = calculateDisplayTotal();
      const inrTotal = calculateINRTotal();

      // Use the new payment API that supports USD
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: displayTotal,
          planType: selectedService.title,
          userId: user?.id || "guest",
          currency: currency,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await orderRes.json();
      const order = orderData.order;

      if (!order.id) throw new Error("Failed to create Razorpay order");

      // Initialize Razorpay
      const isRazorpayLoaded = await initializeRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Aroliya",
        description: `${selectedService.title} - ${formatPrice(displayTotal)}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const saveRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                requirements: formData.requirements,
                quantity: formData.quantity,
                price: formData.price,
                displayPrice: formData.displayPrice,
                basePrice: selectedService.actualPrice,
                resume: resumeUrl,
                documents: documentUrls,
                service: selectedService?.title || "",
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                status: "Pending",
                totalAmount: inrTotal,
                displayAmount: displayTotal,
                displayCurrency: currency,
                paymentCurrency: order.currency,
                exchangeRate: exchangeRate,
                userCountry: userCountry,
                paymentMethod: response.razorpay_payment_method || "card",
                razorpayOrderData: order,
              }),
            });

            if (saveRes.ok) {
              setNotification({
                message: "Order placed successfully!",
                type: "success",
              });
              setTimeout(() => setNotification(null), 3000);
              setShowServiceForm(false);
              setSelectedService(null);
            } else {
              throw new Error("Failed to save order to database");
            }
          } catch (err) {
            console.error(err);
            setNotification({
              message: "Error saving order to database",
              type: "error",
            });
            setTimeout(() => setNotification(null), 3000);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#2563eb",
          hide_topbar: false,
        },
        notes: {
          display_currency: currency,
          display_amount: displayTotal.toFixed(2),
          exchange_rate: exchangeRate.toString(),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Form submission error:", err);
      setNotification({
        message: err.message || "Payment processing failed",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  // Custom INR Icon Component
  const InrIcon = ({ size = 16 }) => (
    <span
      style={{
        fontSize: size,
        fontWeight: "bold",
        color: "currentColor",
      }}
    >
      ₹
    </span>
  );

  const handleRefreshRate = () => {
    fetchExchangeRate();
    setNotification({
      message: "Exchange rate updated",
      type: "info",
    });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);

    if (selectedService && showServiceForm) {
      const basePrice = selectedService.actualPrice;

      if (newCurrency === "USD") {
        const usdPrice = convertPrice(basePrice, "INR", "USD");
        setFormData((prev) => ({
          ...prev,
          price: basePrice,
          displayPrice: Number(usdPrice.toFixed(2)),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          price: basePrice,
          displayPrice: basePrice,
        }));
      }
    }
  };

  return (
    <div className={styles.servicesPage}>
      {/* Enhanced Header Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1>Professional Services</h1>
              <p>
                Choose from our wide range of professional services designed to
                meet your business needs
              </p>
            </div>

            {/* Enhanced Currency Section */}
            <div className={styles.currencySection}>
              <div className={styles.currencyCard}>
                <div className={styles.currencyHeader}>
                  <FiWorld size={20} />
                  <span>Payment Preferences</span>
                </div>

                <div className={styles.currencyToggle}>
                  <button
                    className={`${styles.currencyBtn} ${
                      currency === "INR" ? styles.active : ""
                    }`}
                    onClick={() => handleCurrencyChange("INR")}
                  >
                    <InrIcon size={16} />
                    INR
                  </button>
                  <button
                    className={`${styles.currencyBtn} ${
                      currency === "USD" ? styles.active : ""
                    }`}
                    onClick={() => handleCurrencyChange("USD")}
                  >
                    <FiDollarSign size={16} />
                    USD
                  </button>
                </div>

                <div className={styles.exchangeRateInfo}>
                  <span className={styles.rateText}>
                    1 USD = ₹{exchangeRate.toFixed(2)}
                  </span>
                  <button
                    className={styles.refreshRateBtn}
                    onClick={handleRefreshRate}
                    disabled={loadingRate}
                  >
                    <FiRefreshCw
                      size={14}
                      className={loadingRate ? styles.spinning : ""}
                    />
                  </button>
                </div>

                <div className={styles.paymentMethodsInfo}>
                  <span className={styles.paymentLabel}>
                    Available Methods:
                  </span>
                  <span className={styles.paymentDescription}>
                    {currency === "INR"
                      ? "Cards, UPI, Net Banking, Wallet"
                      : "International Cards (Visa, MasterCard, Amex)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Our Services</h2>
            <p>Professional solutions tailored to your specific requirements</p>
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

                <div className={styles.cardHeader}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <div className={styles.serviceInfo}>
                    <h3>{service.title}</h3>
                    <div className={styles.servicePrice}>
                      {formatPrice(
                        currency === "USD"
                          ? convertPrice(service.price, "INR", "USD")
                          : service.price
                      )}
                      {currency === "USD" && (
                        <span className={styles.originalPrice}>
                          ₹{service.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.serviceRating}>
                  <div className={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        color={
                          i < Math.floor(service.rating) ? "#f59e0b" : "#d1d5db"
                        }
                        fill={
                          i < Math.floor(service.rating) ? "#f59e0b" : "none"
                        }
                      />
                    ))}
                  </div>
                  <span className={styles.ratingText}>
                    {service.rating} ({service.reviews} reviews)
                  </span>
                </div>

                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, i) => (
                    <li key={i}>
                      <FiCheck size={16} color="#10b981" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Requirements Info */}
                <div className={styles.requirementsInfo}>
                  {service.requiresResume && (
                    <div className={styles.requirementTag}>
                      <FiFileText size={12} />
                      <span>Resume Required</span>
                    </div>
                  )}
                  {service.requiresDocuments && (
                    <div className={styles.requirementTag}>
                      <FiFileText size={12} />
                      <span>Documents Required</span>
                    </div>
                  )}
                </div>

                <button
                  className={styles.serviceButton}
                  onClick={() => handleServiceClick(service)}
                >
                  <FiCreditCard size={18} />
                  <span>{service.buttonText}</span>
                  <FiArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Form Modal */}
      {showServiceForm && selectedService && (
        <div className={styles.modalOverlay}>
          <div className={styles.serviceFormModal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <div className={styles.serviceHeader}>
                  {selectedService.icon}
                  <div>
                    <h3>{selectedService.title}</h3>
                    <p>Complete your order details</p>
                    <div className={styles.currencyNote}>
                      Displaying prices in {currency}
                      {currency === "USD" &&
                        ` (1 USD = ₹${exchangeRate.toFixed(2)})`}
                    </div>
                  </div>
                </div>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowServiceForm(false);
                  setSelectedService(null);
                }}
                disabled={uploading}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.serviceForm}>
              <div className={styles.formGrid}>
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
                    disabled={uploading}
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
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                  disabled={uploading}
                />
              </div>

              {/* Resume Upload - Only for services that require it */}
              {selectedService.requiresResume && (
                <div className={styles.formGroup}>
                  <label htmlFor="resume">
                    Upload Resume/CV *
                    <span className={styles.helpText}>
                      <FiInfo size={12} />
                      PDF, DOC, DOCX files only (Max 5MB)
                    </span>
                  </label>
                  <div className={styles.fileUpload}>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleInputChange}
                      className={styles.fileInput}
                      required
                      disabled={uploading}
                    />
                    <label htmlFor="resume" className={styles.fileLabel}>
                      <FiUpload size={20} className={styles.uploadFiles} />
                      <span>Choose Resume File</span>
                      {formData.resume && (
                        <span className={styles.fileName}>
                          {formData.resume.name}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Documents Upload - Only for services that require it */}
              {selectedService.requiresDocuments && (
                <div className={styles.formGroup}>
                  <label htmlFor="documents">
                    Upload Required Documents *
                    <span className={styles.helpText}>
                      <FiInfo size={12} />
                      Upload all necessary documents (PDF, JPG, PNG)
                    </span>
                  </label>
                  <div className={styles.fileUpload}>
                    <input
                      type="file"
                      id="documents"
                      name="documents"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleInputChange}
                      className={styles.fileInput}
                      multiple
                      required
                      disabled={uploading}
                    />
                    <label htmlFor="documents" className={styles.fileLabel}>
                      <FiUpload size={20} className={styles.uploadFiles} />
                      <span>Choose Documents</span>
                    </label>
                  </div>

                  {formData.documents.length > 0 && (
                    <div className={styles.documentsList}>
                      {formData.documents.map((doc, index) => (
                        <div key={index} className={styles.documentItem}>
                          <FiFileText size={16} />
                          <span>{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className={styles.removeDocBtn}
                            disabled={uploading}
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Input */}
              <div className={styles.formGroup}>
                <label htmlFor="price">
                  Service Price *
                  <span className={styles.helpText}>
                    <FiInfo size={12} />
                    {currency === "USD" ? "Price in USD" : "Price in INR"}
                  </span>
                </label>
                <div className={styles.priceInputContainer}>
                  <div className={styles.priceInputWrapper}>
                    <div className={styles.icons}>
                      {currency === "INR" ? (
                        <InrIcon size={20} />
                      ) : (
                        <FiDollarSign size={20} />
                      )}
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.displayPrice}
                      onChange={(e) =>
                        handlePriceChange(Number(e.target.value))
                      }
                      min={currency === "USD" ? 1 : selectedService.actualPrice}
                      step={currency === "USD" ? 0.01 : 1}
                      className={styles.priceInput}
                      required
                      disabled={uploading}
                    />
                  </div>
                  <div className={styles.priceNote}>
                    Base price:{" "}
                    {formatPrice(
                      currency === "USD"
                        ? convertPrice(
                            selectedService.actualPrice,
                            "INR",
                            "USD"
                          )
                        : selectedService.actualPrice
                    )}
                    {currency === "USD" && ` (₹${selectedService.actualPrice})`}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className={styles.formGroup}>
                <label htmlFor="quantity">Quantity</label>
                <div className={styles.quantitySelector}>
                  <button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={decrementQuantity}
                    disabled={uploading}
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
                    disabled={uploading}
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div className={styles.formGroup}>
                <label htmlFor="requirements">
                  Project Requirements *
                  <span className={styles.helpText}>
                    <FiInfo size={12} />
                    Please provide detailed information about your project
                  </span>
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your project requirements in detail..."
                  disabled={uploading}
                />
              </div>

              {/* Price Summary */}
              <div className={styles.priceSummary}>
                <h4>Order Summary</h4>
                <div className={styles.priceRow}>
                  <span>Unit Price:</span>
                  <span>{formatPrice(formData.displayPrice)}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Quantity:</span>
                  <span>{formData.quantity}</span>
                </div>
                <div className={styles.priceDivider}></div>
                <div className={styles.priceRow}>
                  <span className={styles.totalLabel}>Total Amount:</span>
                  <span className={styles.totalPrice}>
                    {formatPrice(calculateDisplayTotal())}
                  </span>
                </div>
                {currency === "USD" && (
                  <div className={styles.conversionNote}>
                    Payment will be processed in USD
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowServiceForm(false);
                    setSelectedService(null);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={uploading}
                >
                  <FiCreditCard size={18} />
                  {uploading
                    ? "Processing..."
                    : `Pay ${formatPrice(calculateDisplayTotal())}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            {notification.type === "success" && <FiCheck size={20} />}
            {notification.type === "error" && <FiX size={20} />}
            {notification.type === "info" && <FiInfo size={20} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
