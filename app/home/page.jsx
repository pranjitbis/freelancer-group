import Nav from "./component/Nav/page";
import Hero from "./component/hero/page";
import Service from "./component/service/page";
import HowItWorks from "./component/HowItWorks/page";
import TrustedCompanies from "./component/Trusted-Companies/page";
import Review from "./component/testimonials/page";
import Footer from "./footer/page";
import FAQ from "./component/faqs/page";
import Right from "./component/left-right/page";
import WhyChooseAroliya from "./WhyChooseAroliya/page";
import ServicesHeader from "./component/ServiceHeader/page";
import Support from "./component/Support/page";
import Whatsapp from "../whatsapp_icon/page";
export default function page() {
  return (
    <div>
      <Nav />
      <Hero />
      <Right />
      <Service />
      <HowItWorks />
      <ServicesHeader />
      <WhyChooseAroliya />
      <TrustedCompanies />
      <Review />
      <Support />
      <FAQ />
      <Footer />
      <Whatsapp />
    </div>
  );
}
