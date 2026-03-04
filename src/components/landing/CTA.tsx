import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Animated background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20">
        <div className="absolute inset-0 gradient-orb rounded-full animate-rotate-slow blur-3xl" />
      </div>
      
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="text-gradient">Ready to ace</span>
            <br />
            <span className="text-foreground">your interview?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            Join thousands of job seekers who have improved their interview skills with AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="pill" size="xl" asChild className="group">
              <Link to="/dashboard">
                Start for free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
