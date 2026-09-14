import CouponBanner from "@/components/CouponBanner";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import TransformationSection from "@/components/TransformationSection";
import WhatsInsideSection from "@/components/WhatsInsideSection";
import ShowTheProductSection from "@/components/ShowTheProductSection";
import LookInsideSection from "@/components/LookInsideSection";
import WhoItsForSection from "@/components/WhoItsForSection";
import ProductValueStackSection from "@/components/ProductValueStackSection";
import FAQ from "@/components/FAQ";
import TestimonialsSection from "@/components/TestimonialsSection";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <>
      <CouponBanner />
      <Navbar />
      <Hero />
      <ProblemSection />
      <TransformationSection />
      <WhatsInsideSection />
      <ShowTheProductSection />
      <LookInsideSection />
      <WhoItsForSection />
      <ProductValueStackSection />
      <FAQ />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}