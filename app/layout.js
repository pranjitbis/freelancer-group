import "./globals.css";
import Script from "next/script";

// Google Analytics ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata = {
  title: "Aroliya - Travel Bookings, E-Commerce, AI & Virtual Assistants",
  description:
    "One-stop for Form Filling, Travel & Hotel Bookings, Virtual Assistance, E-Commerce, and Advanced Data & AI Solutions.",
  keywords:
    "aroliya, form filling services, travel booking, web development, hotel reservation, virtual assistant freelancer, e-commerce development, data analytics, AI solutions, business solutions",
  authors: [{ name: "Aroliya" }],
  creator: "Aroliya",
  publisher: "Aroliya",
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    title: "Aroliya - Travel Bookings, E-Commerce, AI & Virtual Assistants",
    description:
      "Professional form filling, Travel & Hotel Bookings, Expert Virtual Assistant services, Complete E-Commerce Solutions, and Advanced Data & AI Solutions.",
    url: "https://www.aroliya.com",
    siteName: "Aroliya",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aroliya - Premium Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aroliya - Travel Bookings, E-Commerce, AI & Virtual Assistants",
    description:
      "Your one-stop solution for premium services including Travel, E-Commerce, AI & Virtual Assistants.",
    images: ["/twitter-image.jpg"],
    creator: "@aroliya",
  },
  verification: {
    google: "google5c018b3a646e13da",
  },
  category: "technology services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Dynamic Canonical URL - Will be set per page */}
        <link rel="canonical" href="https://www.aroliya.com" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Aroliya" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Aroliya" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta property="og:site_name" content="Aroliya" />
        <meta property="og:type" content="website" />
        <meta property="og:email" content="contact@aroliya.com" />
        <meta property="og:phone_number" content="+91-9870519002" />

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>

        {/* Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <main>{children}</main>
        <Script type="application/ld+json" strategy="afterInteractive">
          {`
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aroliya",
    "url": "https://www.aroliya.com",
    "logo": "https://www.aroliya.com/logo.png",
    "description": "Professional form filling, Travel & Hotel Bookings, Expert Virtual Assistant services, Complete E-Commerce Solutions, and Advanced Data & AI Solutions.",
    "sameAs": [
      "https://www.facebook.com/aroliya",
      "https://www.linkedin.com/aroliya",
      "https://www.twitter.com/aroliya",
      "https://www.instagram.com/aroliya"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9870519002",
      "contactType": "customer service",
      "email": "contact@aroliya.com",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "India"
    },
    "knowsAbout": [
      "Form Filling Services",
      "Travel Bookings",
      "Hotel Reservations",
      "Virtual Assistant",
      "E-Commerce Solutions",
      "Data Analytics",
      "AI Solutions",
      "Web Development"
    ]
  }
  `}
        </Script>
      </body>
    </html>
  );
}
