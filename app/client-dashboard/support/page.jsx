"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.css";

const Chat = () => {
  const [isBotpressReady, setIsBotpressReady] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  // Initialize Botpress Webchat
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
    script.async = true;

    script.onload = () => {
      if (window.botpress) {
        window.botpress.init({
          botId: "f5993cb4-7338-458f-b8b6-1fcb1a1405db",
          clientId: "302eba1a-ae05-4f77-bd9d-dea09aae925f",
          selector: "#webchat",
          configuration: {
            version: "v2",
            botName: "Aroliya Support",
            color: "#2563eb",
            variant: "solid",
            themeMode: "light",
            fontFamily: "Inter, sans-serif",
            radius: 4, // Fixed: Changed from 8 to 4 (max allowed value)
            feedbackEnabled: false,
            enableFullscreen: true,
            soundEnabled: false,
            hideWidget: false,
            composerPlaceholder: "Type your message...",
            showConversationsButton: false,
            enableReset: true,
            enableTranscriptDownload: false,
            // Removed botAvatar and userAvatar as they might also cause issues
            // Use CSS to style the avatars instead
          },
        });

        window.botpress.on("webchat:ready", () => {
          window.botpress.open();
          setIsBotpressReady(true);

          // Professional styling for Botpress
          const style = document.createElement("style");
          // Replace the entire style content with this:
          style.textContent = `
  /* Hide all possible Botpress attribution elements */
  .bpw-powered-by,
  .bpw-composer-footer,
  .bpw-watermark,
  [class*="powered"],
  [class*="botpress"],
  [class*="watermark"],
  a[href*="botpress"],
  a[href*="botpress.com"],
  .bpw-composer > div:last-child,
  .bpw-composer > a,
  .bpw-composer > span {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }

  /* Adjust composer height to account for removed footer */
  .bpw-composer {
    min-height: auto !important;
    padding-bottom: 16px !important;
  }

  .bpw-widget-widget {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    border-radius: 0 !important;
    font-family: 'Inter', sans-serif !important;
  }

  .bpw-header-container {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    color: white !important;
    border-radius: 0 !important;
    padding: 16px 20px !important;
  }

  .bpw-chat-container {
    height: calc(100% - 80px) !important;
    border-radius: 0 !important;
    background: #fafafa !important;
  }

  .bpw-composer {
    border-top: 1px solid #e5e7eb !important;
    padding: 16px 20px !important;
    background: white !important;
  }

  .bpw-composer-textarea {
    border: 1px solid #d1d5db !important;
    border-radius: 8px !important;
    padding: 12px 16px !important;
    font-family: 'Inter', sans-serif !important;
  }

  .bpw-composer-textarea:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
  }

  .bpw-send-button {
    background: #2563eb !important;
    border-radius: 8px !important;
  }

  .bpw-message-list {
    padding: 20px !important;
  }

  .bpw-from-bot .bpw-chat-bubble {
    background: white !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 12px !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }

  .bpw-from-user .bpw-chat-bubble {
    background: #2563eb !important;
    border-radius: 12px !important;
    color: white !important;
  }
  
  .bpw-bot-avatar {
    border-radius: 8px !important;
  }
  
  .bpw-user-avatar {
    border-radius: 8px !important;
  }
`;
          document.head.appendChild(style);
        });

        // Error handling
        window.botpress.on("webchat:error", (error) => {
          console.error("Botpress error:", error);
        });
      }
    };

    script.onerror = () => {
      console.error("Failed to load Botpress script");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleClose = () => {
    if (window.botpress) {
      window.botpress.close();
    }
  };

  const handleMinimize = () => {
    if (window.botpress) {
      window.botpress.close();
    }
  };

  const handleEmailClick = () => {
    window.open(
      "mailto:Info@aroliya.com?subject=Inquiry%20from%20Website&body=Hello%20Aroliya%20Team,",
      "_blank"
    );
  };

  const handlePhoneClick = () => {
    window.open("tel:+919870519002", "_blank");
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("Info@aroliya.com");
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy email: ", err);
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText("+91-9870519002");
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy phone: ", err);
    }
  };

  const businessHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#2563eb" />
                <path d="M16 8L22 12L16 16L10 12L16 8Z" fill="white" />
                <path
                  d="M22 12L22 20L16 24L10 20L10 12L16 16L22 12Z"
                  fill="white"
                  fillOpacity="0.8"
                />
                <path
                  d="M16 16L16 24L10 20L16 16Z"
                  fill="white"
                  fillOpacity="0.6"
                />
              </svg>
            </div>
            <div className={styles.brandInfo}>
              <h1 className={styles.companyName}>Aroliya Solutions</h1>
              <p className={styles.companyTagline}>Premium Support Services</p>
            </div>
          </div>

          <div className={styles.headerControls}>
            <div className={styles.statusIndicator}>
              <div
                className={`${styles.statusDot} ${
                  isBotpressReady ? styles.online : styles.offline
                }`}
              ></div>
              <span>{isBotpressReady ? "Live Support" : "Connecting..."}</span>
            </div>
            <div className={styles.controls}>
              <button
                className={styles.controlBtn}
                onClick={handleMinimize}
                title="Minimize"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button
                className={styles.controlBtn}
                onClick={handleClose}
                title="Close"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${
            activeTab === "chat" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("chat")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Chat Support
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "contact" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("contact")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          Contact Info
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeTab === "chat" && (
          <div className={styles.chatSection}>
            <div className={styles.chatHeader}>
              <h3>How can we help you today?</h3>
              <p>Our AI assistant is here to help with any questions</p>
            </div>
            <div id="webchat" className={styles.botpressContainer}></div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className={styles.contactSection}>
            <div className={styles.contactHeader}>
              <h3>Get in Touch</h3>
              <p>Multiple ways to reach our support team</p>
            </div>

            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className={styles.contactInfo}>
                  <h4>Email Us</h4>
                  <p>Send us an email and we'll respond within 24 hours</p>
                  <div className={styles.contactActions}>
                    <button
                      className={styles.primaryAction}
                      onClick={handleEmailClick}
                    >
                      Send Email
                    </button>
                    <button
                      className={styles.secondaryAction}
                      onClick={handleCopyEmail}
                    >
                      Copy Address
                    </button>
                  </div>
                  <div className={styles.contactDetail}>Info@aroliya.com</div>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className={styles.contactInfo}>
                  <h4>Call Us</h4>
                  <p>
                    Speak directly with our support team during business hours
                  </p>
                  <div className={styles.contactActions}>
                    <button
                      className={styles.primaryAction}
                      onClick={handlePhoneClick}
                    >
                      Call Now
                    </button>
                    <button
                      className={styles.secondaryAction}
                      onClick={handleCopyPhone}
                    >
                      Copy Number
                    </button>
                  </div>
                  <div className={styles.contactDetail}>+91-9870519002</div>
                </div>
              </div>
            </div>

            <div className={styles.businessHours}>
              <h4>Business Hours</h4>
              <div className={styles.hoursList}>
                {businessHours.map((schedule, index) => (
                  <div key={index} className={styles.hoursItem}>
                    <span className={styles.day}>{schedule.day}</span>
                    <span className={styles.hours}>{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
