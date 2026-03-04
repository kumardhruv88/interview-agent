import { useState, useEffect } from "react";

interface LiquidIntroProps {
  onComplete: () => void;
}

export const LiquidIntro = ({ onComplete }: LiquidIntroProps) => {
  const [phase, setPhase] = useState<"speaking" | "fading">("speaking");
  const [displayText, setDisplayText] = useState("");
  const fullText = "Prepare like never before";

  // Typewriter effect for the robot speech
  useEffect(() => {
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        // Wait a moment then start fade out
        setTimeout(() => {
          setPhase("fading");
          setTimeout(onComplete, 1200);
        }, 800);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-1000 ${
        phase === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "hsl(0 0% 0%)" }}
    >
      {/* Liquid glass background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated liquid orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]">
          <div 
            className="absolute inset-0 rounded-full animate-liquid-morph opacity-40"
            style={{
              background: "radial-gradient(ellipse at center, hsl(200 100% 50% / 0.4) 0%, hsl(160 100% 40% / 0.3) 30%, hsl(320 100% 60% / 0.2) 60%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div 
            className="absolute inset-0 rounded-full animate-liquid-morph-reverse opacity-30"
            style={{
              background: "radial-gradient(ellipse at center, hsl(320 100% 60% / 0.4) 0%, hsl(200 100% 50% / 0.3) 40%, transparent 70%)",
              filter: "blur(60px)",
              animationDelay: "-2s",
            }}
          />
        </div>
        
        {/* Floating glass particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: `radial-gradient(circle, hsl(${200 + i * 20} 100% 50% / 0.2) 0%, transparent 70%)`,
              filter: "blur(20px)",
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Central content - AI Robot and text */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* AI Robot Avatar */}
        <div className="relative mb-12">
          {/* Outer glow ring */}
          <div className="absolute -inset-8 rounded-full animate-pulse-ring opacity-60">
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: "conic-gradient(from 0deg, hsl(320 100% 60% / 0.6), hsl(200 100% 50% / 0.4), hsl(160 100% 40% / 0.4), hsl(320 100% 60% / 0.6))",
                filter: "blur(20px)",
              }}
            />
          </div>
          
          {/* Glass container */}
          <div 
            className="relative w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(0 0% 100% / 0.1) 0%, hsl(0 0% 100% / 0.02) 100%)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid hsl(0 0% 100% / 0.15)",
              boxShadow: "0 0 60px hsl(320 100% 60% / 0.3), inset 0 0 30px hsl(0 0% 100% / 0.05)",
            }}
          >
            {/* Robot face */}
            <div className="relative">
              {/* Eyes */}
              <div className="flex gap-4 mb-2">
                <div 
                  className="w-4 h-4 rounded-full animate-blink"
                  style={{ 
                    background: "linear-gradient(135deg, hsl(200 100% 60%) 0%, hsl(320 100% 60%) 100%)",
                    boxShadow: "0 0 20px hsl(200 100% 60% / 0.8)",
                  }}
                />
                <div 
                  className="w-4 h-4 rounded-full animate-blink"
                  style={{ 
                    background: "linear-gradient(135deg, hsl(200 100% 60%) 0%, hsl(320 100% 60%) 100%)",
                    boxShadow: "0 0 20px hsl(200 100% 60% / 0.8)",
                    animationDelay: "0.1s",
                  }}
                />
              </div>
              {/* Speaking mouth - animated */}
              <div 
                className="w-10 h-1 mx-auto rounded-full animate-speak"
                style={{
                  background: "linear-gradient(90deg, hsl(200 100% 60%) 0%, hsl(320 100% 60%) 100%)",
                  boxShadow: "0 0 15px hsl(320 100% 60% / 0.6)",
                }}
              />
            </div>
          </div>
          
          {/* Orbiting particle */}
          <div className="absolute inset-0 animate-orbit">
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
              style={{
                background: "hsl(200 100% 60%)",
                boxShadow: "0 0 20px hsl(200 100% 60% / 0.8)",
              }}
            />
          </div>
        </div>

        {/* Title being spoken */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight min-h-[1.2em]"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 60%) 0%, hsl(0 0% 100%) 30%, hsl(200 100% 70%) 60%, hsl(0 0% 100%) 80%, hsl(0 0% 60%) 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer-text 3s linear infinite",
          }}
        >
          {displayText}
          <span className="animate-blink-cursor">|</span>
        </h1>

        {/* Subtitle */}
        <p 
          className="mt-6 text-lg text-muted-foreground opacity-0 animate-fade-in"
          style={{ animationDelay: "2.5s", animationFillMode: "forwards" }}
        >
          Your AI Interview Coach
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(0 0% 0%) 0%, transparent 100%)",
        }}
      />
    </div>
  );
};
