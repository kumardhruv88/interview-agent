import { Mic, Brain, MessageSquare, BarChart3, Sparkles, Clock, LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Question Generation",
    description: "Personalized questions based on your role, tech stack, and experience level.",
    // Purple -> Blue -> Cyan
    gradient: "from-purple-500 via-blue-500 to-cyan-500",
    glowColor: "rgba(168, 85, 247, 0.4)", // Purple glow
  },
  {
    icon: Mic,
    title: "Voice Practice",
    description: "Speak naturally with real-time transcription.",
    // Pink -> Orange -> Yellow
    gradient: "from-pink-500 via-orange-500 to-yellow-500",
    glowColor: "rgba(236, 72, 153, 0.4)", // Pink glow
  },
  {
    icon: MessageSquare,
    title: "Instant Feedback",
    description: "Detailed AI analysis on every answer.",
    // Green -> Cyan -> Blue
    gradient: "from-emerald-400 via-cyan-500 to-blue-500",
    glowColor: "rgba(16, 185, 129, 0.4)", // Emerald glow
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress with comprehensive scoring and identify areas to focus on.",
    // Red -> Purple -> Pink
    gradient: "from-red-500 via-purple-500 to-pink-500",
    glowColor: "rgba(239, 68, 68, 0.4)", // Red glow
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description: "Get AI-powered ideal answers to learn best practices.",
    // Violet -> Indigo -> Purple
    gradient: "from-violet-500 via-indigo-500 to-purple-500",
    glowColor: "rgba(139, 92, 246, 0.4)", // Violet glow
  },
  {
    icon: Clock,
    title: "Flexible Sessions",
    description: "Practice at your own pace, pause and resume anytime.",
    // Orange -> Red -> Rose
    gradient: "from-orange-500 via-red-500 to-rose-500",
    glowColor: "rgba(249, 115, 22, 0.4)", // Orange glow
  },
];

const FeatureCard = ({ feature }: { feature: Feature }) => {
  return (
    <div className="group relative h-full">
      {/* 3. Ambient Glow Effect (Behind Card) */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-20 group-hover:opacity-60 blur-2xl transition-all duration-700 mx-auto"
        style={{ background: feature.gradient.includes('gradient') ? feature.gradient : `linear-gradient(to right, ${feature.glowColor}, transparent)` }} // Fallback/hack if class doesn't parse to simple color
      >
        <div className={`w-full h-full bg-gradient-to-r ${feature.gradient}`} />
      </div>

      {/* 1. Multicolor Gradient Border (The rotating background) */}
      <div
        className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-r ${feature.gradient} animate-border-flow opacity-60 group-hover:opacity-100 blur-[1px] transition-all duration-500`}
      />

      {/* Container to hide inner border overflow */}
      <div className="relative h-full rounded-3xl bg-black/90 p-[1px] backdrop-blur-3xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">

        {/* 2. Glassmorphism Card Body */}
        <div className="relative h-full w-full rounded-[23px] bg-black/40 backdrop-blur-xl p-8 flex flex-col items-start gap-6 overflow-hidden">

          {/* Subtle background reflection of gradient */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity duration-500`} />

          {/* Icon Container */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {/* Thin gradient ring via inset shadow or border mock */}
            <div className={`absolute inset-0 rounded-full opacity-20 bg-gradient-to-br ${feature.gradient} blur-sm`} />
            <feature.icon className="w-6 h-6 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
          </div>

          {/* Text Content */}
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 transition-all">
              {feature.title}
            </h3>
            <p className="text-base text-gray-400 font-medium leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
              {feature.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Features = () => {
  return (
    <section id="features" className="py-32 relative bg-black overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Future-Ready <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
              Interview Features
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto">
            Everything you need to master your next interview, powered by advanced AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
