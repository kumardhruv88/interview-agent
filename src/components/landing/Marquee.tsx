const companies = [
  "Google",
  "Meta",
  "Apple",
  "Amazon",
  "Microsoft",
  "Netflix",
  "Stripe",
  "Airbnb",
  "Uber",
  "Spotify",
  "Slack",
  "Figma",
];

export const Marquee = () => {
  return (
    <section className="py-20 border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-widest">
          Trusted by candidates interviewing at
        </p>
      </div>
      
      {/* Marquee container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Scrolling content */}
        <div className="flex animate-marquee">
          {[...companies, ...companies].map((company, index) => (
            <div
              key={`${company}-${index}`}
              className="flex-shrink-0 mx-12"
            >
              <span className="text-2xl font-bold text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors duration-300 whitespace-nowrap">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
