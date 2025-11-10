"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaCheck,
  FaTimes,
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
  FaCreditCard,
  FaShieldAlt,
  FaDownload,
  FaFileInvoice,
  FaRocket,
  FaChartLine,
  FaUsers,
  FaLightbulb,
  FaInfinity,
} from "react-icons/fa";
import styles from "./Plans.module.css";
import Banner from "../components/page.jsx";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [plans, setPlans] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [recentPurchase, setRecentPurchase] = useState(null);
  const router = useRouter();

  const colors = {
    primary: "#2563eb",
    primaryLight: "#eff6ff",
    premium: "#d97706",
    premiumLight: "#fffbeb",
    success: "#059669",
    error: "#dc2626",
    gray: "#6b7280",
    dark: "#1e293b",
  };

  const exchangeRates = {
    INR: 1,
    USD: 0.012,
  };

  const basePlans = [
    {
      id: "free",
      name: "Starter",
      price: 0,
      connects: 2,
      features: [
        "2 connects per month",
        "1 connect per proposal",
        "Basic profile visibility",
        "Standard email support",
        "Access to basic job posts",
        "Email notifications",
        "10% fee per project",
      ],
      limitations: [
        "No featured proposals",
        "Limited analytics",
        "Basic search ranking",
        "No priority support",
      ],
      popular: false,
      bestFor: "Beginners exploring the platform",
      icon: "FaLightbulb",
      color: colors.primary,
      bgColor: colors.primaryLight,
    },
    {
      id: "premium",
      name: "Professional",
      price: 999,
      connects: 10,
      features: [
        "10 connects per month",
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
        "10% fee per project",
      ],
      limitations: [],
      popular: true,
      bestFor: "Serious professionals seeking growth",
      icon: "FaRocket",
      color: colors.premium,
      bgColor: colors.premiumLight,
    },
  ];

  // Update plans when currency changes
  useEffect(() => {
    const updatedPlans = basePlans.map((plan) => {
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
    setPlans(updatedPlans);
  }, [currency]);

  // Update selectedPlan when currency changes
  useEffect(() => {
    if (selectedPlan) {
      const updatedSelectedPlan = plans.find(
        (plan) => plan.id === selectedPlan.id
      );
      if (updatedSelectedPlan) {
        setSelectedPlan(updatedSelectedPlan);
      }
    }
  }, [plans, selectedPlan?.id]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

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

  const calculateTotalAmount = (plan) => {
    if (currency === "USD") {
      return plan.displayPrice;
    }

    const basePrice = plan.price;
    const gstRate = 0.18;
    const gstAmount = Math.round(basePrice * gstRate);
    return basePrice + gstAmount;
  };

  const generateInvoiceData = (plan, paymentId = null) => {
    const basePrice = plan.price;
    const gstRate = 0.18;
    const gstAmount = Math.round(basePrice * gstRate);
    const totalAmount = basePrice + gstAmount;

    return {
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toLocaleDateString(),
      planName: plan.name,
      connects: plan.connects,
      basePrice,
      gstRate: gstRate * 100,
      gstAmount,
      totalAmount,
      currency: currency,
      paymentId: paymentId || `PAY-${Date.now()}`,
      customerName: user?.name || "Customer",
      customerEmail: user?.email || "customer@example.com",
    };
  };

  const downloadInvoice = () => {
    if (!invoiceData) return;

    const invoiceContent = `
FREELANCE PLATFORM - INVOICE
=============================

Invoice No: ${invoiceData.invoiceNumber}
Invoice Date: ${invoiceData.invoiceDate}

BILL TO:
${invoiceData.customerName}
${invoiceData.customerEmail}

PLAN DETAILS:
-------------
Plan: ${invoiceData.planName}
Connects: ${invoiceData.connects} per month
Billing Period: Monthly

PRICE BREAKDOWN:
----------------
Base Price: ${formatCurrency(invoiceData.basePrice)}
GST (${invoiceData.gstRate}%): ${formatCurrency(invoiceData.gstAmount)}
-------------------------------------
Total Amount: ${formatCurrency(invoiceData.totalAmount)}

Payment ID: ${invoiceData.paymentId}
Status: Paid

Thank you for your business!
This is a computer-generated invoice and does not require a signature.
    `;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowInvoiceModal(false);
  };

  const handleViewInvoice = () => {
    if (!recentPurchase) return;

    const invoice = generateInvoiceData(
      recentPurchase.plan,
      recentPurchase.paymentId
    );
    setInvoiceData(invoice);
    setShowInvoiceModal(true);
  };

  const handleUpgradeClick = (plan) => {
    if (plan.price === 0) {
      handleSelectPlan(plan);
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayNow = async () => {
    if (!selectedPlan || !razorpayLoaded) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotalAmount(selectedPlan);
      const razorpayAmount = totalAmount;

      let description = `${selectedPlan.name} Plan - ${selectedPlan.connects} connects monthly`;

      if (currency === "INR") {
        description += ` (including 18% GST)`;
      }

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: razorpayAmount,
          planType: selectedPlan.id,
          userId: user.id,
          currency: currency,
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
        description: description,
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
                planType: selectedPlan.id,
                userId: user.id,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResponse.ok) {
              const newPlan = {
                planType: "premium",
                connects: 20,
                usedConnects: 0,
              };

              setUserPlan(newPlan);
              setShowNoConnectsError(false);
              setShowPaymentModal(false);

              setRecentPurchase({
                plan: selectedPlan,
                paymentId: response.razorpay_payment_id,
                date: new Date().toISOString(),
              });

              alert(
                "🎉 Professional plan activated successfully! You can download your invoice from the download button."
              );
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
          name: user.name || "Customer",
          email: user.email || "customer@example.com",
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

      if (currency === "USD") {
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
      alert(error.message || "Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount, curr = currency) => {
    return new Intl.NumberFormat(curr === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const PlanIcon = ({ iconName, ...props }) => {
    const icons = {
      FaLightbulb: FaLightbulb,
      FaRocket: FaRocket,
      FaCrown: FaCrown,
    };

    const IconComponent = icons[iconName] || FaRocket;
    return <IconComponent {...props} />;
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
      <Banner className={styles.banner} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerMain}>
            <div className={styles.headerText}>
              <h1 className={styles.pageTitle}>Choose Your Plan</h1>
              <p className={styles.pageSubtitle}>
                Select the perfect plan to grow your freelance business
              </p>
            </div>

            <div className={styles.headerControls}>
              {userPlan?.planType === "premium" && recentPurchase && (
                <button
                  className={styles.invoiceButton}
                  onClick={handleViewInvoice}
                >
                  <FaDownload />
                  Download Invoice
                </button>
              )}

              {/* Currency Toggle */}
              <div className={styles.currencyToggle}>
                <button
                  className={`${styles.toggleButton} ${
                    currency === "INR" ? styles.active : ""
                  }`}
                  onClick={() => setCurrency("INR")}
                >
                  <FaRupeeSign />
                  INR
                </button>
                <button
                  className={`${styles.toggleButton} ${
                    currency === "USD" ? styles.active : ""
                  }`}
                  onClick={() => setCurrency("USD")}
                >
                  <FaDollarSign />
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Current Plan Status */}
        <section className={styles.currentPlanSection}>
          <div className={styles.currentPlanCard}>
            <div className={styles.planStatusHeader}>
              <div className={styles.planInfo}>
                <div
                  className={styles.planIcon}
                  style={{
                    backgroundColor:
                      userPlan?.planType === "premium"
                        ? colors.premiumLight
                        : colors.primaryLight,
                    color:
                      userPlan?.planType === "premium"
                        ? colors.premium
                        : colors.primary,
                  }}
                >
                  {userPlan?.planType === "premium" ? (
                    <FaRocket />
                  ) : (
                    <FaLightbulb />
                  )}
                </div>
                <div className={styles.planDetails}>
                  <h2 className={styles.planName}>
                    {userPlan?.planType?.charAt(0).toUpperCase() +
                      userPlan?.planType?.slice(1)}{" "}
                    Plan
                  </h2>
                  <p className={styles.planDescription}>
                    {getAvailableConnects() === 0
                      ? "No connects remaining. Upgrade to continue submitting proposals."
                      : userPlan?.planType === "premium"
                      ? "Premium features unlocked"
                      : "Upgrade to unlock premium features"}
                  </p>

                  {recentPurchase && (
                    <div className={styles.recentPurchase}>
                      <FaCheck style={{ color: colors.success }} />
                      <span>
                        Plan activated successfully! Download your invoice
                        above.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.planStats}>
                <div className={styles.connectsCount}>
                  <span className={styles.availableConnects}>
                    {getAvailableConnects()}
                  </span>
                  <span className={styles.connectsLabel}>
                    Available Connects
                  </span>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${getConnectUsagePercentage()}%`,
                        backgroundColor:
                          userPlan?.planType === "premium"
                            ? colors.premium
                            : colors.primary,
                      }}
                    ></div>
                  </div>
                  <div className={styles.progressText}>
                    {userPlan?.usedConnects || 0} of {userPlan?.connects || 5}{" "}
                    used ({getConnectUsagePercentage()}%)
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.planActions}>
              <div className={styles.resetInfo}>
                <FaCalendar className={styles.calendarIcon} />
                <span>Resets in {getDaysUntilReset()} days</span>
              </div>

              {(userPlan?.planType === "free" ||
                getAvailableConnects() === 0) && (
                <button
                  className={styles.upgradeButton}
                  onClick={() =>
                    document
                      .getElementById("plans-section")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <FaRocket />
                  {getAvailableConnects() === 0
                    ? "Recharge Now"
                    : "Upgrade Plan"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Plans Comparison Section */}
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
                      color: plan.color,
                    }}
                  >
                    <PlanIcon iconName={plan.icon} />
                  </div>

                  <h3 className={styles.planName}>{plan.name}</h3>

                  <div className={styles.connectsDisplay}>
                    <span
                      className={styles.connectsCount}
                      style={{ color: plan.color }}
                    >
                      {plan.connects}
                    </span>
                    <span className={styles.connectsLabel}>
                      Connects / Month
                    </span>
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
                            {currency === "INR" ? (
                              <FaRupeeSign />
                            ) : (
                              <FaDollarSign />
                            )}
                          </span>
                          <span className={styles.priceAmount}>
                            {plan.displayPrice}
                          </span>
                        </div>
                        <span className={styles.pricePeriod}>per month</span>
                        {currency === "INR" && (
                          <div className={styles.gstNote}>
                            +18% GST applicable
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.planDescription}>
                  <p>{plan.bestFor}</p>
                </div>

                <div className={styles.featuresSection}>
                  <h4 className={styles.featuresTitle}>What's Included</h4>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, index) => (
                      <li key={index} className={styles.featureItem}>
                        <FaCheck
                          className={styles.featureIcon}
                          style={{ color: colors.success }}
                        />
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
                          <FaTimes
                            className={styles.limitationIcon}
                            style={{ color: colors.error }}
                          />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.planActionsRow}>
                  <button
                    onClick={() => handleUpgradeClick(plan)}
                    disabled={loading || userPlan?.planType === plan.id}
                    className={`${styles.selectButton} ${
                      plan.popular ? styles.popularButton : ""
                    } ${
                      userPlan?.planType === plan.id ? styles.currentButton : ""
                    }`}
                    style={{
                      backgroundColor:
                        userPlan?.planType === plan.id
                          ? colors.gray
                          : plan.popular
                          ? plan.color
                          : colors.primary,
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
                        <FaRocket />
                        Upgrade to Professional
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connect History Section */}
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
                  Your connect usage will appear here once you start submitting
                  proposals
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className={styles.modalOverlay}>
          <div className={styles.paymentModal}>
            <div className={styles.modalHeader}>
              <h2>Upgrade to {selectedPlan.name}</h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowPaymentModal(false);
                  setLoading(false);
                }}
                disabled={loading}
              >
                &times;
              </button>
            </div>

            <div className={styles.paymentContent}>
              <div className={styles.paymentSummary}>
                <div className={styles.planSummary}>
                  <div className={styles.planIcon}>
                    <PlanIcon iconName={selectedPlan.icon} />
                  </div>
                  <div className={styles.planDetails}>
                    <h3>{selectedPlan.name} Plan</h3>
                    <p>{selectedPlan.connects} connects per month</p>
                  </div>
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Monthly Price:</span>
                    <span>{formatCurrency(selectedPlan.displayPrice)}</span>
                  </div>
                  {currency === "INR" && (
                    <div className={styles.priceRow}>
                      <span>GST (18%):</span>
                      <span>
                        {formatCurrency(Math.round(selectedPlan.price * 0.18))}
                      </span>
                    </div>
                  )}
                  <div className={styles.totalRow}>
                    <span>Total Amount:</span>
                    <span className={styles.totalAmount}>
                      {formatCurrency(calculateTotalAmount(selectedPlan))}
                    </span>
                  </div>
                </div>

                <div className={styles.featurePreview}>
                  <h4>You'll get:</h4>
                  <ul>
                    {selectedPlan.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>
                        <FaCheck style={{ color: colors.success }} />
                        {feature}
                      </li>
                    ))}
                    {selectedPlan.features.length > 3 && (
                      <li>
                        + {selectedPlan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className={styles.paymentSecurity}>
                <FaShieldAlt />
                <span>Secure payment powered by Razorpay</span>
              </div>

              {loading && (
                <div className={styles.paymentLoading}>
                  <FaSync className={styles.spinningIcon} />
                  <span>Preparing payment...</span>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.payNowButton}
                onClick={handlePayNow}
                disabled={loading || !razorpayLoaded}
              >
                {loading ? (
                  <>
                    <FaSync className={styles.spinningIcon} />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Pay {formatCurrency(calculateTotalAmount(selectedPlan))} Now
                  </>
                )}
              </button>

              <button
                className={styles.cancelButton}
                onClick={() => setShowPaymentModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <div className={styles.modalOverlay}>
          <div className={styles.invoiceModal}>
            <div className={styles.modalHeader}>
              <h2>Invoice</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowInvoiceModal(false)}
              >
                &times;
              </button>
            </div>

            <div className={styles.invoiceContent}>
              <div className={styles.invoiceHeader}>
                <h3>FREELANCE PLATFORM</h3>
                <p>INVOICE</p>
              </div>

              <div className={styles.invoiceDetails}>
                <div className={styles.invoiceRow}>
                  <span>Invoice No:</span>
                  <span>{invoiceData.invoiceNumber}</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Invoice Date:</span>
                  <span>{invoiceData.invoiceDate}</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Payment ID:</span>
                  <span>{invoiceData.paymentId}</span>
                </div>
              </div>

              <div className={styles.customerDetails}>
                <h4>Bill To:</h4>
                <p>{invoiceData.customerName}</p>
                <p>{invoiceData.customerEmail}</p>
              </div>

              <div className={styles.planDetails}>
                <h4>Plan Details:</h4>
                <div className={styles.invoiceRow}>
                  <span>Plan:</span>
                  <span>{invoiceData.planName}</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Connects:</span>
                  <span>{invoiceData.connects} per month</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Billing Period:</span>
                  <span>Monthly</span>
                </div>
              </div>

              <div className={styles.priceBreakdown}>
                <h4>Price Breakdown:</h4>
                <div className={styles.priceRow}>
                  <span>Base Price:</span>
                  <span>{formatCurrency(invoiceData.basePrice)}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>GST ({invoiceData.gstRate}%):</span>
                  <span>{formatCurrency(invoiceData.gstAmount)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total Amount:</span>
                  <span className={styles.totalAmount}>
                    {formatCurrency(invoiceData.totalAmount)}
                  </span>
                </div>
              </div>

              <div className={styles.invoiceFooter}>
                <p>
                  Status: <strong>Paid</strong>
                </p>
                <p>Thank you for your business!</p>
                <p className={styles.footerNote}>
                  This is a computer-generated invoice and does not require a
                  signature.
                </p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.downloadInvoiceButton}
                onClick={downloadInvoice}
              >
                <FaDownload />
                Download Invoice
              </button>
              <button
                className={styles.closeModalButton}
                onClick={() => setShowInvoiceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}