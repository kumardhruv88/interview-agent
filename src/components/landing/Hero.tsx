import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/dynamic-male-robot-micro-bg.png"
          alt="Dynamic AI Robot Background - Micro"
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Refined gradient for enhanced visibility while maintaining text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-background/20" />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Animated background orb - Subtle enhancement */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-15 pointer-events-none">
        <div className="absolute inset-0 gradient-orb rounded-full animate-rotate-slow blur-3xl" />
      </div>

      {/* Mesh gradient overlay - Enhanced */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">


          {/* Main Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.9] mb-8 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Ace every interview</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-500 animate-gradient">
              with AI coaching
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-gray-200 max-w-xl mb-12 leading-relaxed animate-fade-in-up opacity-0 font-medium tracking-wide"
            style={{ animationDelay: "0.3s" }}
          >
            "Attention is all you need"
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.4s" }}
          >
            <Button variant="pill" size="lg" asChild className="group shadow-[0_0_30px_rgba(235,5,255,0.3)] hover:shadow-[0_0_50px_rgba(235,5,255,0.5)] transition-all duration-300">
              <Link to="/dashboard">
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white hover:border-white/20">
              <Play className="h-4 w-4" />
              Watch demo
            </Button>
          </div>

          {/* Stats Row */}
          <div
            className="flex items-center gap-8 sm:gap-16 mt-20 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="text-center group cursor-default">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-primary transition-colors">10K+</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider group-hover:text-white/70">Interviews</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center group cursor-default">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-primary transition-colors">95%</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider group-hover:text-white/70">Success Rate</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center group cursor-default">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-primary transition-colors">4.9</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider group-hover:text-white/70">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
