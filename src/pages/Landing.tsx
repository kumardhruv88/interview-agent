import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { LiquidIntro } from "@/components/landing/LiquidIntro";

const Landing = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setContentVisible(true);
  };

  // Check if user has seen intro before (session-based)
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
      setContentVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) {
      sessionStorage.setItem("hasSeenIntro", "true");
    }
  }, [showIntro]);

  return (
    <div className="min-h-screen bg-background">
      {showIntro && <LiquidIntro onComplete={handleIntroComplete} />}

      <div
        className={`transition-opacity duration-1000 ${contentVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        <Navbar />
        <Hero />
        <Marquee />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
