"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaTimes,
  FaRocket,
  FaCrown,
  FaArrowLeft,
  FaDollarSign,
  FaPaperPlane,
  FaSync,
  FaHistory,
  FaCalendar,
  FaFire,
  FaRupeeSign,
  FaGlobe,
  FaStar,
  FaBolt,
  FaShieldAlt,
  FaChartLine,
  FaUsers,
  FaGem,
  FaSeedling,
  FaAward,
  FaMedal,
  FaBusinessTime,
} from "react-icons/fa";
import styles from "./Plans.module.css";

export default function PlansPage() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [connectHistory, setConnectHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const router = useRouter();

  // Professional color scheme with elegant borders
  const colors = {
    primary: "#2563eb", // Royal Blue
    primaryDark: "#1d4ed8",
    secondary: "#7c3aed", // Purple
    accent: "#059669", // Emerald
    premium: "#d97706", // Amber
    dark: "#1e293b",
    light: "#f8fafc",
    border: "#e2e8f0",
    borderHover: "#cbd5e1",
    gradient: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    premiumGradient: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
    success: "#059669",
    warning: "#d97706",
    error: "#dc2626",
  };

  // Currency conversion rates
  const exchangeRates = {
    INR: 1,
    USD: 0.012,
  };

  // Enhanced plans data with professional icons and colors
  const basePlans = [
    {
      id: "free",
      name: "Starter Plan",
      price: 0,
      connects: 10,
      features: [
        { text: "10 connects per month", icon: FaRocket, color: colors.primary },
        { text: "1 connect per proposal", icon: FaPaperPlane, color: colors.primary },
        { text: "Basic profile visibility", icon: FaUsers, color: colors.primary },
        { text: "Standard email support", icon: FaShieldAlt, color: colors.primary },
        { text: "Access to basic job posts", icon: FaBusinessTime, color: colors.primary },
        { text: "Email notifications", icon: FaCheck, color: colors.success },
      ],
      limitations: [
        "No featured proposals",
        "Limited analytics",
        "Basic search ranking",
        "No priority support",
      ],
      popular: false,
      bestFor: "Beginners exploring the platform",
      icon: FaSeedling,
      color: colors.primary,
      borderColor: colors.primary,
      badgeColor: colors.primary,
    },
    {
      id: "premium",
      name: "Professional Plan",
      price: 1,
      connects: 100,
      features: [
        { text: "100 connects per month", icon: FaBolt, color: colors.premium },
        { text: "1 connect per proposal", icon: FaPaperPlane, color: colors.premium },
        { text: "Enhanced profile visibility", icon: FaChartLine, color: colors.premium },
        { text: "Priority 24/7 support", icon: FaShieldAlt, color: colors.premium },
        { text: "Access to all job posts", icon: FaGem, color: colors.premium },
        { text: "Featured proposals", icon: FaStar, color: colors.premium },
        { text: "Advanced analytics dashboard", icon: FaChartLine, color: colors.premium },
        { text: "Higher search ranking", icon: FaAward, color: colors.premium },
        { text: "Premium profile badge", icon: FaMedal, color: colors.premium },
        { text: "Early access to features", icon: FaRocket, color: colors.premium },
      ],
      limitations: [],
      popular: true,
      bestFor: "Serious professionals seeking growth",
      icon: FaCrown,
      color: colors.premium,
      borderColor: colors.premium,
      badgeColor: colors.premium,
    },
  ];

  const plans = basePlans.map((plan) => ({
    ...plan,
    displayPrice:
      currency === "INR"
        ? plan.price
        : Math.round(plan.price * exchangeRates[currency]),
    currency: currency,
  }));

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchUserPlan(data.user.id);
        fetchConnectHistory(data.user.id);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchUserPlan = async (userId) => {
    try {
      const response = await fetch(`/api/users/plan?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.plan);
      } else {
        await fetch("/api/users/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, planType: "free" }),
        });
        const newResponse = await fetch(`/api/users/plan?userId=${userId}`);
        if (newResponse.ok) {
          const newData = await newResponse.json();
          setUserPlan(newData.plan);
        }
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  const fetchConnectHistory = async (userId) => {
    try {
      setHistoryLoading(true);
      const response = await fetch(
        `/api/users/connect-history?userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setConnectHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching connect history:", error);
      const mockHistory = [
        {
          id: 1,
          type: "usage",
          amount: -1,
          description: "Submitted proposal for E-commerce Website",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: "purchase",
          amount: 50,
          description: "Added extra connects pack",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setConnectHistory(mockHistory);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const formatPrice = (price, currency) => {
    if (currency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  const getCurrencySymbol = () => {
    return currency === "INR" ? <FaRupeeSign /> : <FaDollarSign />;
  };

  const handleSelectPlan = async (plan) => {
    if (!user) {
      alert("Please log in to select a plan");
      router.push("/auth/login");
      return;
    }

    if (plan.id === "free") {
      setLoading(true);
      try {
        const response = await fetch("/api/users/plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            planType: "free",
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setUserPlan(result.plan);
          alert("Plan updated to Free successfully!");
          router.refresh();
        } else {
          alert(result.error || "Failed to update plan");
        }
      } catch (error) {
        console.error("Plan update error:", error);
        alert("Failed to update plan");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setSelectedPlan(plan);

      try {
        const razorpayCurrency = currency === "INR" ? "INR" : "USD";
        const razorpayAmount =
          currency === "INR" ? plan.price : plan.displayPrice;

        const response = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: razorpayAmount,
            planType: plan.id,
            userId: user.id,
            currency: razorpayCurrency,
          }),
        });

        const orderData = await response.json();

        if (!orderData.success) {
          throw new Error(orderData.error || "Failed to create payment order");
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Freelance Platform",
          description: `Premium Plan - ${plan.connects} connects monthly`,
          order_id: orderData.order.id,
          handler: async function (response) {
            try {
              const verifyResponse = await fetch("/api/payments/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  planType: plan.id,
                  userId: user.id,
                  currency: razorpayCurrency,
                  amount: razorpayAmount,
                }),
              });

              const verifyResult = await verifyResponse.json();

              if (verifyResponse.ok) {
                setUserPlan((prev) => ({
                  ...prev,
                  planType: "premium",
                  connects: 100,
                  usedConnects: 0,
                }));
                alert("🎉 Premium plan activated successfully!");
                router.refresh();
              } else {
                alert(verifyResult.error || "Payment verification failed");
              }
            } catch (verifyError) {
              console.error("Payment verification error:", verifyError);
              alert("Payment verification failed");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: colors.primary,
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("Payment error:", error);
        alert(error.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    }
  };

  const getDaysUntilReset = () => {
    if (!userPlan?.expiresAt) return 30;
    const resetDate = new Date(userPlan.expiresAt);
    const today = new Date();
    const diffTime = resetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getConnectUsagePercentage = () => {
    if (!userPlan) return 0;
    return Math.round((userPlan.usedConnects / userPlan.connects) * 100);
  };

  const getHistoryIcon = (type) => {
    switch (type) {
      case "usage":
        return <FaPaperPlane />;
      case "purchase":
        return <FaDollarSign />;
      case "reset":
        return <FaSync />;
      case "plan_change":
        return <FaRocket />;
      default:
        return <FaHistory />;
    }
  };

  const getHistoryColor = (type) => {
    switch (type) {
      case "usage":
        return colors.error;
      case "purchase":
        return colors.success;
      case "reset":
        return colors.primary;
      case "plan_change":
        return colors.warning;
      default:
        return "#6b7280";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardHoverVariants = {
    rest: {
      scale: 1,
      y: 0,
      borderColor: colors.border,
    },
    hover: {
      scale: 1.02,
      y: -5,
      borderColor: colors.borderHover,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Checking authentication...
        </motion.p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Navigation Bar */}
      <motion.nav className={styles.navbar} variants={itemVariants}>
        <div className={styles.navContent}>
          <motion.button
            onClick={() => router.back()}
            className={styles.backButton}
            whileHover={{ scale: 1.02, backgroundColor: colors.primary }}
            whileTap={{ scale: 0.98 }}
          >
            <FaArrowLeft /> Back to Dashboard
          </motion.button>
          
          <div className={styles.navControls}>
            <motion.div
              className={styles.currencySelector}
              whileHover={{ scale: 1.05 }}
            >
              <FaGlobe className={styles.globeIcon} />
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className={styles.currencySelect}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <div className={styles.content}>
        {/* Page Header */}
        <motion.section className={styles.pageHeader} variants={itemVariants}>
          <div className={styles.headerContent}>
            <h1>Choose Your Plan</h1>
            <p>Select the perfect plan that matches your freelance journey</p>
          </div>
        </motion.section>

        {/* Current Plan & Connects */}
        <section className={styles.currentPlanSection}>
          <motion.div
            className={styles.currentPlanCard}
            variants={itemVariants}
            whileHover={{ 
              borderColor: colors.borderHover,
              boxShadow: "0 8px 25px -8px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div className={styles.planHeader}>
              <div className={styles.planInfo}>
                <div className={styles.planTitle}>
                  <motion.div
                    className={`${styles.planIconWrapper} ${
                      userPlan?.planType === "premium" ? styles.premium : styles.free
                    }`}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    {userPlan?.planType === "premium" ? (
                      <FaCrown />
                    ) : (
                      <FaSeedling />
                    )}
                  </motion.div>
                  <div>
                    <h2>
                      {userPlan?.planType?.charAt(0).toUpperCase() +
                        userPlan?.planType?.slice(1)}{" "}
                      Plan
                    </h2>
                    <p>
                      {userPlan?.planType === "premium"
                        ? "Premium features unlocked 🎉"
                        : "Upgrade to unlock premium features"}
                    </p>
                  </div>
                </div>
                <div className={styles.planStats}>
                  <div className={styles.connectsOverview}>
                    <div className={styles.connectsCount}>
                      <motion.span
                        className={styles.availableConnects}
                        key={userPlan ? userPlan.connects - userPlan.usedConnects : 10}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {userPlan
                          ? userPlan.connects - userPlan.usedConnects
                          : 10}
                      </motion.span>
                      <span className={styles.connectsLabel}>
                        Connects Available
                      </span>
                    </div>
                    <div className={styles.connectsProgress}>
                      <div className={styles.progressBar}>
                        <motion.div
                          className={styles.progressFill}
                          initial={{ width: 0 }}
                          animate={{ width: `${getConnectUsagePercentage()}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{
                            background:
                              userPlan?.planType === "premium"
                                ? colors.premiumGradient
                                : colors.gradient,
                          }}
                        ></motion.div>
                      </div>
                      <div className={styles.connectsText}>
                        {userPlan?.usedConnects || 0} of{" "}
                        {userPlan?.connects || 10} used (
                        {getConnectUsagePercentage()}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.planActions}>
                <div className={styles.resetInfo}>
                  <FaCalendar className={styles.calendarIcon} />
                  <span>Resets in {getDaysUntilReset()} days</span>
                </div>
                {userPlan?.planType === "free" && (
                  <motion.button
                    className={styles.upgradeButton}
                    onClick={() =>
                      document
                        .getElementById("plans-section")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                    whileHover={{ scale: 1.05, boxShadow: `0 4px 15px ${colors.premium}40` }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaCrown /> Upgrade to Pro
                  </motion.button>
                )}
              </div>
            </div>

            <div className={styles.planFeatures}>
              <h4>Current Plan Features:</h4>
              <div className={styles.featuresGrid}>
                {plans
                  .find((plan) => plan.id === (userPlan?.planType || "free"))
                  ?.features.slice(0, 4)
                  .map((feature, index) => (
                    <motion.div
                      key={index}
                      className={styles.featureItem}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <feature.icon className={styles.featureCheck} style={{ color: feature.color }} />
                      <span>{feature.text}</span>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Available Plans */}
        <section id="plans-section" className={styles.plansSection}>
          <motion.div
            className={styles.plansGrid}
            variants={containerVariants}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`${styles.planCard} ${
                  plan.popular ? styles.popular : ""
                } ${userPlan?.planType === plan.id ? styles.currentPlan : ""}`}
                variants={itemVariants}
                custom={index}
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={cardHoverVariants}
                onHoverStart={() => setHoveredPlan(plan.id)}
                onHoverEnd={() => setHoveredPlan(null)}
                style={{
                  borderColor: plan.borderColor,
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              >
                {plan.popular && (
                  <motion.div
                    className={styles.popularBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    style={{ backgroundColor: plan.badgeColor }}
                  >
                    <FaCrown /> Most Popular
                  </motion.div>
                )}

                {userPlan?.planType === plan.id && (
                  <motion.div
                    className={styles.currentBadge}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaCheck /> Current Plan
                  </motion.div>
                )}

                <div className={styles.planHeader}>
                  <motion.div
                    className={styles.planIcon}
                    style={{ color: plan.color }}
                    animate={{
                      rotate: hoveredPlan === plan.id ? [0, -5, 5, 0] : 0,
                      scale: hoveredPlan === plan.id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <plan.icon />
                  </motion.div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.connectsHighlight}>
                    <motion.span
                      className={styles.connectsCount}
                      animate={{
                        scale: hoveredPlan === plan.id ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ 
                        background: plan.id === 'premium' ? colors.premiumGradient : colors.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {plan.connects}
                    </motion.span>
                    <span className={styles.connectsLabel}>
                      Connects / Month
                    </span>
                  </div>
                  <div className={styles.planPrice}>
                    {plan.price === 0 ? (
                      <motion.span 
                        className={styles.free}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Free Forever
                      </motion.span>
                    ) : (
                      <>
                        <span className={styles.currencySymbol}>
                          {getCurrencySymbol()}
                        </span>
                        <span className={styles.amount}>
                          {plan.displayPrice.toLocaleString()}
                        </span>
                        <span className={styles.period}>/month</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.bestFor}>
                  <FaFire className={styles.fireIcon} />
                  <span>{plan.bestFor}</span>
                </div>

                <div className={styles.features}>
                  <h4>What's included:</h4>
                  <ul>
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        className={styles.featureItem}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <feature.icon className={styles.featureIcon} style={{ color: feature.color }} />
                        <span>{feature.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className={styles.limitations}>
                    <h4>Limitations:</h4>
                    <ul>
                      {plan.limitations.map((limitation, idx) => (
                        <motion.li
                          key={idx}
                          className={styles.limitationItem}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <FaTimes className={styles.limitationIcon} />
                          {limitation}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                <motion.button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading || userPlan?.planType === plan.id}
                  className={`${styles.selectButton} ${
                    plan.popular ? styles.popularButton : ""
                  } ${
                    userPlan?.planType === plan.id ? styles.currentButton : ""
                  }`}
                  whileHover={
                    !loading && userPlan?.planType !== plan.id
                      ? { 
                          scale: 1.05,
                          boxShadow: plan.popular 
                            ? `0 8px 25px ${colors.premium}40`
                            : `0 8px 25px ${colors.primary}40`
                        }
                      : {}
                  }
                  whileTap={
                    !loading && userPlan?.planType !== plan.id
                      ? { scale: 0.95 }
                      : {}
                  }
                  style={{
                    background:
                      plan.popular && userPlan?.planType !== plan.id
                        ? colors.premiumGradient
                        : userPlan?.planType === plan.id
                        ? "#64748b"
                        : colors.gradient,
                  }}
                >
                  {loading && selectedPlan?.id === plan.id ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <FaSync className={styles.spinningIcon} /> Processing...
                    </motion.span>
                  ) : userPlan?.planType === plan.id ? (
                    <>
                      <FaCheck /> Current Plan
                    </>
                  ) : plan.price === 0 ? (
                    "Continue with Starter"
                  ) : (
                    <>
                      <FaCrown />
                      Upgrade to Professional
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Connect History */}
        <section className={styles.historySection}>
          <motion.div
            className={styles.historyCard}
            variants={itemVariants}
            whileHover={{ 
              borderColor: colors.borderHover,
              boxShadow: "0 8px 25px -8px rgba(0, 0, 0, 0.1)"
            }}
          >
            <div className={styles.historyHeader}>
              <h3>
                <FaHistory /> Connect History
              </h3>
              <p>Track your connect usage and activities</p>
            </div>

            {historyLoading ? (
              <div className={styles.loadingHistory}>
                <motion.div
                  className={styles.spinner}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <p>Loading history...</p>
              </div>
            ) : connectHistory.length === 0 ? (
              <motion.div
                className={styles.emptyHistory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FaHistory className={styles.emptyIcon} />
                <h4>No connect history yet</h4>
                <p>
                  Your connect usage will appear here once you start submitting
                  proposals
                </p>
              </motion.div>
            ) : (
              <div className={styles.historyList}>
                <AnimatePresence>
                  {connectHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className={styles.historyItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <motion.div
                        className={styles.historyIcon}
                        style={{ backgroundColor: getHistoryColor(item.type) }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {getHistoryIcon(item.type)}
                      </motion.div>
                      <div className={styles.historyContent}>
                        <div className={styles.historyDescription}>
                          {item.description}
                        </div>
                        <div className={styles.historyMeta}>
                          <span className={styles.historyDate}>
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        className={`${styles.connectChange} ${
                          item.amount > 0 ? styles.positive : styles.negative
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {item.amount > 0 ? "+" : ""}
                        {item.amount}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}