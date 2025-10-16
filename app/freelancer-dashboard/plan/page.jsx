"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FaCreditCard,
  FaExclamationTriangle,
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
  const [showNoConnectsError, setShowNoConnectsError] = useState(false);
  const router = useRouter();

  // Professional color scheme - no gradients
  const colors = {
    primary: "#2563eb",
    primaryLight: "#eff6ff",
    secondary: "#7c3aed",
    accent: "#059669",
    accentLight: "#ecfdf5",
    premium: "#d97706",
    premiumLight: "#fffbeb",
    dark: "#1e293b",
    light: "#f8fafc",
    border: "#e2e8f0",
    success: "#059669",
    warning: "#d97706",
    error: "#dc2626",
    gray: "#6b7280",
  };

  const exchangeRates = {
    INR: 1,
    USD: 0.01133,
  };

  const basePlans = [
    {
      id: "free",
      name: "Starter",
      price: 0,
      connects: 5,
      features: [
        "5 connects per month",
        "1 connect per proposal",
        "Basic profile visibility",
        "Standard email support",
        "Access to basic job posts",
        "Email notifications",
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
      bgColor: colors.primaryLight,
    },
    {
      id: "premium",
      name: "Professional",
      price: 999,
      connects: 20,
      features: [
        "20 connects per month",
        "1 connect per proposal",
        "Enhanced profile visibility",
        "Priority 24/7 support",
        "Access to all job posts",
        "Featured proposals",
        "Advanced analytics dashboard",
        "Higher search ranking",
        "Premium profile badge",
        "Early access to features",
        "Credit card payments supported",
      ],
      limitations: [],
      popular: true,
      bestFor: "Serious professionals seeking growth",
      icon: FaCrown,
      color: colors.premium,
      bgColor: colors.premiumLight,
    },
  ];

  const plans = basePlans.map((plan) => {
    let displayPrice = plan.price;
    if (currency === "USD" && plan.price > 0) {
      displayPrice = Math.round(plan.price * exchangeRates.USD * 100) / 100;
    }
    return {
      ...plan,
      displayPrice,
      currency: currency,
    };
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (userPlan && userPlan.connects - userPlan.usedConnects <= 0) {
      setShowNoConnectsError(true);
    } else {
      setShowNoConnectsError(false);
    }
  }, [userPlan]);

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
    } finally {
      setHistoryLoading(false);
    }
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
          alert("Plan updated to Starter successfully!");
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
        let razorpayAmount;
        if (currency === "INR") {
          razorpayAmount = plan.price;
        } else {
          razorpayAmount = plan.displayPrice;
        }

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
          description: `Professional Plan - ${plan.connects} connects monthly`,
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
                  connects: 20,
                  usedConnects: 0,
                }));
                setShowNoConnectsError(false);
                alert("🎉 Professional plan activated successfully!");
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

        if (razorpayCurrency === "USD") {
          options.method = {
            netbanking: false,
            card: true,
            upi: false,
            wallet: false,
          };
        }

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

  const getAvailableConnects = () => {
    if (!userPlan) return 5;
    return userPlan.connects - userPlan.usedConnects;
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
          
          <div className={styles.headerControls}>
            <div className={styles.currencySelector}>
              <FaGlobe className={styles.globeIcon} />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={styles.currencySelect}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Choose Your Plan</h1>
            <p className={styles.heroSubtitle}>
              Select the perfect plan that matches your freelance journey and accelerate your success
            </p>
          </div>
        </section>

        {/* Current Plan Status */}
        <section className={styles.currentPlanSection}>
          <div className={styles.currentPlanCard}>
            <div className={styles.planStatusHeader}>
              <div className={styles.planInfo}>
                <div 
                  className={styles.planIcon}
                  style={{ 
                    backgroundColor: userPlan?.planType === "premium" ? colors.premiumLight : colors.primaryLight,
                    color: userPlan?.planType === "premium" ? colors.premium : colors.primary
                  }}
                >
                  {userPlan?.planType === "premium" ? <FaCrown /> : <FaSeedling />}
                </div>
                <div className={styles.planDetails}>
                  <h2 className={styles.planName}>
                    {userPlan?.planType?.charAt(0).toUpperCase() + userPlan?.planType?.slice(1)} Plan
                  </h2>
                  <p className={styles.planDescription}>
                    {getAvailableConnects() === 0
                      ? "No connects remaining. Upgrade to continue submitting proposals."
                      : userPlan?.planType === "premium"
                      ? "Premium features unlocked"
                      : "Upgrade to unlock premium features"}
                  </p>
                </div>
              </div>
              
              <div className={styles.planStats}>
                <div className={styles.connectsCount}>
                  <span className={styles.availableConnects}>
                    {getAvailableConnects()}
                  </span>
                  <span className={styles.connectsLabel}>Available Connects</span>
                </div>
                
                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${getConnectUsagePercentage()}%`,
                        backgroundColor: userPlan?.planType === "premium" ? colors.premium : colors.primary
                      }}
                    ></div>
                  </div>
                  <div className={styles.progressText}>
                    {userPlan?.usedConnects || 0} of {userPlan?.connects || 5} used ({getConnectUsagePercentage()}%)
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.planActions}>
              <div className={styles.resetInfo}>
                <FaCalendar className={styles.calendarIcon} />
                <span>Resets in {getDaysUntilReset()} days</span>
              </div>
              
              {(userPlan?.planType === "free" || getAvailableConnects() === 0) && (
                <button
                  className={styles.upgradeButton}
                  onClick={() =>
                    document
                      .getElementById("plans-section")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <FaCrown />
                  {getAvailableConnects() === 0 ? "Recharge Now" : "Upgrade Plan"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Plans Comparison */}
        <section id="plans-section" className={styles.plansSection}>
          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${styles.planCard} ${
                  plan.popular ? styles.popular : ""
                }`}
              >
                {plan.popular && (
                  <div 
                    className={styles.popularBadge}
                    style={{ backgroundColor: plan.color }}
                  >
                    <FaStar />
                    Most Popular
                  </div>
                )}

                <div className={styles.planHeader}>
                  <div 
                    className={styles.planIcon}
                    style={{ 
                      backgroundColor: plan.bgColor,
                      color: plan.color
                    }}
                  >
                    <plan.icon />
                  </div>
                  
                  <h3 className={styles.planName}>{plan.name}</h3>
                  
                  <div className={styles.connectsDisplay}>
                    <span 
                      className={styles.connectsCount}
                      style={{ color: plan.color }}
                    >
                      {plan.connects}
                    </span>
                    <span className={styles.connectsLabel}>Connects / Month</span>
                  </div>
                  
                  <div className={styles.priceSection}>
                    {plan.price === 0 ? (
                      <div className={styles.freePrice}>
                        <span className={styles.priceAmount}>Free</span>
                        <span className={styles.pricePeriod}>Forever</span>
                      </div>
                    ) : (
                      <div className={styles.paidPrice}>
                        <div className={styles.priceLine}>
                          <span className={styles.currencySymbol}>
                            {currency === "INR" ? <FaRupeeSign /> : <FaDollarSign />}
                          </span>
                          <span className={styles.priceAmount}>
                            {plan.displayPrice}
                          </span>
                        </div>
                        <span className={styles.pricePeriod}>per month</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.planDescription}>
                  <p>{plan.bestFor}</p>
                </div>

                <div className={styles.featuresSection}>
                  <h4 className={styles.featuresTitle}>Features</h4>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, index) => (
                      <li key={index} className={styles.featureItem}>
                        <FaCheck className={styles.featureIcon} style={{ color: colors.success }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className={styles.limitationsSection}>
                    <h4 className={styles.limitationsTitle}>Limitations</h4>
                    <ul className={styles.limitationsList}>
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className={styles.limitationItem}>
                          <FaTimes className={styles.limitationIcon} style={{ color: colors.error }} />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.planAction}>
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading || userPlan?.planType === plan.id}
                    className={`${styles.selectButton} ${
                      plan.popular ? styles.popularButton : ""
                    } ${
                      userPlan?.planType === plan.id ? styles.currentButton : ""
                    }`}
                    style={{
                      backgroundColor: userPlan?.planType === plan.id 
                        ? colors.gray 
                        : plan.popular 
                        ? plan.color 
                        : colors.primary
                    }}
                  >
                    {loading && selectedPlan?.id === plan.id ? (
                      <span className={styles.buttonLoading}>
                        <FaSync className={styles.spinningIcon} />
                        Processing...
                      </span>
                    ) : userPlan?.planType === plan.id ? (
                      <span className={styles.buttonCurrent}>
                        <FaCheck />
                        Current Plan
                      </span>
                    ) : plan.price === 0 ? (
                      "Continue with Starter"
                    ) : (
                      <span className={styles.buttonUpgrade}>
                        <FaCrown />
                        Upgrade to Professional
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connect History */}
        <section className={styles.historySection}>
          <div className={styles.historyCard}>
            <div className={styles.historyHeader}>
              <h3 className={styles.historyTitle}>
                <FaHistory />
                Connect History
              </h3>
              <p className={styles.historySubtitle}>
                Track your connect usage and proposal activities
              </p>
            </div>

            {historyLoading ? (
              <div className={styles.loadingHistory}>
                <div className={styles.spinner}></div>
                <p>Loading history...</p>
              </div>
            ) : connectHistory.length === 0 ? (
              <div className={styles.emptyHistory}>
                <FaHistory className={styles.emptyIcon} />
                <h4>No connect history yet</h4>
                <p>
                  Your connect usage will appear here once you start submitting proposals
                </p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {connectHistory.map((item, index) => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyIcon}>
                      <FaPaperPlane />
                    </div>
                    <div className={styles.historyContent}>
                      <div className={styles.historyDescription}>
                        {item.description}
                      </div>
                      <div className={styles.historyMeta}>
                        <span className={styles.historyDate}>
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${styles.connectChange} ${
                        item.amount > 0 ? styles.positive : styles.negative
                      }`}
                    >
                      {item.amount > 0 ? "+" : ""}
                      {item.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}