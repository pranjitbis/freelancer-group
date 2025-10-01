"use client";

import Head from "next/head";
import {
  FaChartBar,
  FaProjectDiagram,
  FaUsers,
  FaCloud,
  FaLaptopCode,
  FaLock,
  FaDatabase,
  FaChartPie,
} from "react-icons/fa";
import Footer from "@/app/home/footer/page";
import styles from "./DataVisualization.module.css";
import Image from "next/image";
import Nav from "@/app/home/component/Nav/page";
import WhatsApp from '../../whatsapp_icon/page'
import {
  FaChartLine,
  FaShoppingCart,
  FaHospital,
  FaBullhorn,
  FaTruck,
  FaGraduationCap,
} from "react-icons/fa";
import data from "../../../public/icons/data-visualization.png";
import Link from "next/link";
const DataVisualization = () => {
  const features = [
    {
      icon: <FaChartBar />,
      title: "Interactive Dashboards",
      desc: "Turn complex data into interactive dashboards with real-time filtering and drill-down capabilities.",
    },
    {
      icon: <FaProjectDiagram />,
      title: "Predictive Analytics",
      desc: "Leverage AI-driven insights to forecast business trends and improve decision-making.",
    },
    {
      icon: <FaUsers />,
      title: "User-Centric Reports",
      desc: "Generate easy-to-understand visual reports tailored for executives, managers, and teams.",
    },
    {
      icon: <FaCloud />,
      title: "Cloud Integration",
      desc: "Connect directly with cloud platforms like AWS, Azure, and Google Cloud for real-time data.",
    },
    {
      icon: <FaLaptopCode />,
      title: "Customizable Solutions",
      desc: "Tailor visualizations to your industry needs with flexible, modular components.",
    },
    {
      icon: <FaLock />,
      title: "Enterprise-Grade Security",
      desc: "Protect sensitive information with encryption, compliance (GDPR, HIPAA), and role-based access.",
    },
  ];

  const useCases = [
    "Finance & Investment Analysis",
    "E-commerce & Retail Sales Tracking",
    "Healthcare Data Insights",
    "Marketing Campaign Performance",
    "Logistics & Supply Chain Monitoring",
    "Education & Learning Analytics",
    "Real-time IoT Device Monitoring",
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹599/mo",
      features: [
        "Up to 3 Dashboards",
        "Basic Chart Types",
        "Data Import from CSV & Excel",
        "Email Support",
        "20+ Chart Types",
      ],
    },
    {
      name: "Professional",
      price: "$1500/mo",
      features: [
        "Unlimited Dashboards",
        "20+ Chart Types",
        "Database & API Integration",
        "Team Collaboration Tools",
        "Priority Support",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Custom Development",
        "Dedicated Account Manager",
        "On-premise Deployment",
        "Advanced Security Compliance",
        "24/7 Premium Support",
      ],
    },
  ];

  const testimonials = [
    {
      text: "“This platform transformed how we understand customer behavior. Our decision-making is now data-driven.”",
      author: "Amit Gupta – Retail Analytics Head",
    },
    {
      text: "“Real-time dashboards helped us cut reporting time by 70% and focus on strategy.”",
      author: "Lisa Wong – Marketing Director",
    },
    {
      text: "“Their enterprise-grade solution integrated seamlessly with our existing ERP system.”",
      author: "David Miller – CIO, Logistics Corp",
    },
    {
      text: "“Predictive analytics allowed us to forecast sales accurately and optimize inventory.”",
      author: "Priya Sharma – Supply Chain Manager",
    },
    {
      text: "“Visual dashboards made it easy for executives to understand complex KPIs.”",
      author: "Rohan Verma – CEO, FinTech Solutions",
    },
    {
      text: "“The platform automated our reporting processes, saving hundreds of man-hours monthly.”",
      author: "Emily Johnson – Operations Lead",
    },
    {
      text: "“We gained actionable insights into customer trends and engagement patterns.”",
      author: "Arjun Patel – E-Commerce Head",
    },
    {
      text: "“The analytics tool provided granular data that helped us improve campaign ROI.”",
      author: "Sara Lee – Marketing Analyst",
    },
    {
      text: "“Integration with multiple data sources was smooth, allowing unified reporting across departments.”",
      author: "Karan Mehta – IT Manager",
    },
    {
      text: "“Our decision-making process has become faster and more confident thanks to visual insights.”",
      author: "Michael Brown – Business Analyst",
    },
    {
      text: "“The solution helped identify bottlenecks in operations and suggested actionable improvements.”",
      author: "Ananya Reddy – Operations Head",
    },
    {
      text: "“Custom dashboards allowed executives to monitor metrics that matter most to them.”",
      author: "Vikram Singh – Strategy Director",
    },
    {
      text: "“The real-time reporting feature made our client presentations more data-backed and persuasive.”",
      author: "Sofia Martinez – Client Relations Manager",
    },
    {
      text: "“We now detect anomalies in sales data immediately, reducing losses and errors.”",
      author: "Ravi Kumar – Analytics Lead",
    },
    {
      text: "“The platform’s visualization tools made our complex datasets understandable at a glance.”",
      author: "Emily Davis – Data Scientist",
    },
    {
      text: "“Cross-team collaboration improved because everyone had access to the same metrics.”",
      author: "Arjun Desai – Product Manager",
    },
    {
      text: "“We can now track KPIs in real-time and take proactive actions immediately.”",
      author: "Priya Nair – Operations Director",
    },
    {
      text: "“The insights gained helped us tailor marketing strategies more effectively.”",
      author: "Michael Chen – Digital Marketing Lead",
    },
    {
      text: "“Reporting dashboards reduced dependency on manual Excel reports significantly.”",
      author: "Rajesh Kumar – Finance Head",
    },
    {
      text: "“This tool has become integral to our quarterly business reviews and planning.”",
      author: "Sophia Williams – Strategy Analyst",
    },
  ];

  return (
    <>
      <Head>
        <title>
          Data Visualization Solutions | Transform Data into Insights
        </title>
        <meta
          name="description"
          content="Professional data visualization solutions with interactive dashboards, predictive analytics, industry use cases, and enterprise security."
        />
      </Head>
      <Nav />

      <WhatsApp />
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>Turn Data Into Decisions</h1>
            <p>
              Explore trends, track performance, and unlock insights with our
              professional data visualization solutions.
            </p>
            <div className={styles.heroBtns}>
              <Link href="/register">
                {" "}
                <button className={styles.btnPrimary}>Get Started</button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image src={data} alt="ss" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHead}>
          <h2>Key Features</h2>
          <p>
            From dashboards to big data, we provide the right tools to visualize
            and act on insights.
          </p>
        </div>
        <div className={styles.grid}>
          {features.map((f, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industries We Serve */}
      <section className={styles.industries}>
        <div className={styles.sectionHead}>
          <h2>Industries We Serve</h2>
          <p>
            Our solutions empower diverse industries with tailored dashboards,
            insights, and predictive analytics — helping them make data-driven
            decisions.
          </p>
        </div>
        <div className={styles.industriesGrid}>
          <div className={styles.industryCard}>
            <span className={styles.industryIcon}>
              <FaChartLine />
            </span>
            <h3>Finance & Investment</h3>
            <ul className={styles.industryList}>
              <li>Real-time portfolio tracking</li>
              <li>Risk & compliance monitoring</li>
              <li>Predictive investment insights</li>
            </ul>
          </div>

          <div className={styles.industryCard}>
            <span className={styles.industryIcon}>
              <FaShoppingCart />
            </span>
            <h3>E-commerce & Retail</h3>
            <ul className={styles.industryList}>
              <li>Sales & revenue dashboards</li>
              <li>Customer behavior analytics</li>
              <li>Inventory & demand forecasting</li>
            </ul>
          </div>

          <div className={styles.industryCard}>
            <span className={styles.industryIcon}>
              <FaHospital />
            </span>
            <h3>Healthcare</h3>
            <ul className={styles.industryList}>
              <li>Patient health analytics</li>
              <li>Clinical data dashboards</li>
              <li>Compliance & secure access</li>
            </ul>
          </div>

          <div className={styles.industryCard}>
            <span className={styles.industryIcon}>
              <FaBullhorn />
            </span>
            <h3>Marketing & Media</h3>
            <ul className={styles.industryList}>
              <li>Campaign performance tracking</li>
              <li>Customer engagement insights</li>
              <li>ROI-driven reporting</li>
            </ul>
          </div>

          <div className={styles.industryCard}>
            <span className={styles.industryIcon}>
              <FaTruck />
            </span>
            <h3>Logistics & Supply Chain</h3>
            <ul className={styles.industryList}>
              <li>Real-time shipment tracking</li>
              <li>Supplier performance dashboards</li>
              <li>Route optimization analytics</li>
            </ul>
          </div>

          <div className={styles.industryCard}>
            <span className={styles.industryIcon}>
              <FaGraduationCap />
            </span>
            <h3>Education & E-Learning</h3>
            <ul className={styles.industryList}>
              <li>Student performance analytics</li>
              <li>Course engagement dashboards</li>
              <li>Institutional data insights</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing}>
        <div className={styles.sectionHead}>
          <h2>Pricing Plans</h2>
          <p>
            Flexible packages designed for startups, growing teams, and
            enterprises.
          </p>
        </div>
        <div className={styles.grids}>
          {pricingPlans.map((plan, index) => (
            <div key={index} className={styles.priceCard}>
              <h3>{plan.name}</h3>
              <p className={styles.price}>{plan.price}</p>
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>✔ {feature}</li>
                ))}
              </ul>
              <Link href="/register">
                <button className={styles.btnPrimary}>Choose Plan</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHead}>
          <h2>What Our Clients Say</h2>
        </div>
        <div className={styles.slider}>
          <div className={styles.slideTrack}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.testimonial}>
                <p>{t.text}</p>
                <h4>{t.author}</h4>
              </div>
            ))}
            {/* Duplicate for smooth infinite scroll */}
            {testimonials.map((t, i) => (
              <div key={`dup-${i}`} className={styles.testimonial}>
                <p>{t.text}</p>
                <h4>{t.author}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.cta}>
        <h2>Ready to Visualize Smarter?</h2>
        <p>
          Let’s help you transform raw data into actionable business insights.
        </p>
        <Link href="/contact">
          {" "}
          <button className={styles.btnPrimary}>Contact Us</button>
        </Link>
      </section>
      <Footer />
    </>
  );
};

export default DataVisualization;
