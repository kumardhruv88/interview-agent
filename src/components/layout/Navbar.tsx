import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      // Small timeout to allow page transition before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "glass glass-border py-3"
        : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow-sm transition-all duration-300 group-hover:shadow-glow">
              <Mic className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              InterviewAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, "features")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, "pricing")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Pricing
            </a>
            <Link
              to="/resume-analyzer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Resume Analyzer
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button variant="pill" size="sm" className="gap-2" asChild>
                <Link to="/dashboard">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="pill" size="sm" asChild>
                  <Link to="/dashboard">Start for free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-6 pb-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={(e) => scrollToSection(e, "features")}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={(e) => scrollToSection(e, "how-it-works")}
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={(e) => scrollToSection(e, "pricing")}
              >
                Pricing
              </a>
              <Link
                to="/resume-analyzer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Resume Analyzer
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {user ? (
                  <Button variant="pill" size="sm" className="gap-2" asChild>
                    <Link to="/dashboard">
                      Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" asChild>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button variant="pill" size="sm" asChild>
                      <Link to="/dashboard">Start for free</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
