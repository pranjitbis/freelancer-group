import "./globals.css";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata = {
  title:
    "Aroliya - India's No. 1 Platform for Smart Online Services | Form Filling, Travel Bookings, AI Solutions",
  description:
    "One-stop solution for Professional Form Filling, Travel & Hotel Bookings, Virtual Assistance, E-Commerce Development, and Advanced Data & AI Solutions. India's leading online service platform.",
  keywords:
    "aroliya, form filling services, travel booking India, hotel reservation, virtual assistant services, e-commerce development, data analytics, AI solutions, web development, business solutions, online services",
  authors: [{ name: "Aroliya" }],
  creator: "Aroliya",
  publisher: "Aroliya",
  robots:
    "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",

  openGraph: {
    title: "Aroliya - India's No. 1 Platform for Smart Online Services",
    description:
      "Professional form filling, Travel & Hotel Bookings, Expert Virtual Assistant services, Complete E-Commerce Solutions, and Advanced Data & AI Solutions.",
    url: "https://www.aroliya.com",
    siteName: "Aroliya",
    images: [
      {
        url: "/icons/wmremove.gif",
        width: 1200,
        height: 630,
        alt: "Aroliya - India's Leading Online Services Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  verification: {
    google: "google5c018b3a646e13da",
  },
  category: "technology services",

  metadataBase: new URL("https://www.aroliya.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="canonical" href="https://www.aroliya.com" />

        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Aroliya" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Aroliya" />

        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <meta
          name="googlebot"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <meta name="rating" content="safe for kids" />
        <meta name="distribution" content="global" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />

        {/* Open Graph Enhanced */}
        <meta property="og:site_name" content="Aroliya" />
        <meta property="og:type" content="website" />
        <meta property="og:email" content="info@aroliya.com" />
        <meta property="og:phone_number" content="+91-9870519002" />
        <meta property="business:contact_data:country_name" content="India" />
        <meta
          property="business:contact_data:website"
          content="https://www.aroliya.com"
        />

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href
            });
          `}
        </Script>

        {/* Razorpay */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <main>{children}</main>

        {/* Enhanced Structured Data for Site Links */}
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.aroliya.com/#organization",
              "name": "Aroliya",
              "url": "https://www.aroliya.com",
              "logo": "https://www.aroliya.com/favicon.ico",
              "description": "India's No. 1 Platform for Smart Online Services - Professional Form Filling, Travel Bookings, E-Commerce Solutions, and AI Services.",
              "sameAs": [
                "https://www.facebook.com/people/Aroliya-Group/61571008499035/",
                "https://www.linkedin.com/company/aroliya-group/",
                "https://twitter.com/aroliya",
                "https://www.instagram.com/aroliya"
              ],
              "contactPoint": [{
                "@type": "ContactPoint",
                "telephone": "+91-9870519002",
                "contactType": "customer service",
                "contactOption": "TollFree",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              }],
              "knowsAbout": [
                "Form Filling Services",
                "Travel Bookings",
                "Hotel Reservations",
                "Virtual Assistant Services",
                "E-Commerce Solutions",
                "Data Analytics",
                "AI Solutions",
                "Web Development",
                "Digital Marketing"
              ],
              "makesOffer": [{
                "@type": "Offer",
                "name": "Form Filling Services",
                "description": "Professional form filling services for various applications"
              }, {
                "@type": "Offer",
                "name": "Travel Bookings",
                "description": "Flight and hotel booking services"
              }]
            }
          `}
        </Script>

        <Script
          id="website-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://www.aroliya.com/#website",
              "url": "https://www.aroliya.com",
              "name": "Aroliya",
              "description": "India's No. 1 Platform for Smart Online Services",
              "publisher": {
                "@id": "https://www.aroliya.com/#organization"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.aroliya.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "inLanguage": "en-IN"
            }
          `}
        </Script>

        {/* Breadcrumb Structured Data */}
        <Script
          id="breadcrumb-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {`
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.aroliya.com"
              }, {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": "https://www.aroliya.com/services"
              }, {
                "@type": "ListItem",
                "position": 3,
                "name": "Virtual Assistance",
                "item": "https://www.aroliya.com/services/virtual-assistance"
              }]
              }, {
                "@type": "ListItem",
                "position": 4,
                "name": "Login",
                "item": "https://www.aroliya.com/login"
              }]
            }
          `}
        </Script>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17545732712"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-17545732712');
          `}
        </Script>
      </body>
    </html>
  );
}
