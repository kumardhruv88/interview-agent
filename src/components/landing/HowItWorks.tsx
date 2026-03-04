import { FileText, Mic2, Star, CheckCircle, LucideIcon } from "lucide-react";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: FileText,
    title: "Set up your interview",
    description: "Enter your job role, tech stack, and experience. Upload your resume for tailored questions.",
    gradient: "from-pink-500 to-purple-600",
  },
  {
    number: "02",
    icon: Mic2,
    title: "Practice with AI",
    description: "Answer questions using your voice. Our AI transcribes and analyzes in real-time.",
    gradient: "from-purple-500 to-blue-600",
  },
  {
    number: "03",
    icon: Star,
    title: "Get instant feedback",
    description: "Receive detailed ratings, improvement suggestions, and model answers for each question.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Track your progress",
    description: "Review history, track improvements, and focus on areas that need work.",
    gradient: "from-cyan-500 to-emerald-500",
  },
];

const StepCard = ({ step, index, isLast }: { step: Step; index: number; isLast: boolean }) => {
  return (
    <div className="relative group">

      {/* Connecting Arrow (Desktop) */}
      {!isLast && (
        <div className="absolute left-[34px] top-[80px] bottom-[-20px] w-[2px] hidden md:block z-0">
          {/* Static Line */}
          <div className="absolute inset-0 bg-white/10 w-[2px]" />
          {/* Animated Flow Line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400 to-transparent w-[2px] opacity-60 animate-flow-particle"
            style={{ backgroundSize: '100% 200%', animation: 'flow-pulse 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite', animationDelay: `${index * 0.5}s` }} />
        </div>
      )}

      <div className="relative z-10 flex items-start gap-8 p-1 rounded-3xl transition-transform duration-500 hover:-translate-y-2">

        {/* Step Indicator & Icon */}
        <div className="flex flex-col items-center flex-shrink-0">
          {/* Number */}
          <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${step.gradient} mb-3`}>
            {step.number}
          </span>

          {/* Icon Circle */}
          <div className="relative w-[68px] h-[68px] flex items-center justify-center rounded-full bg-black/50 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl group-hover:border-white/30 transition-colors duration-300">
            {/* Inner Gradient Bloom */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient} opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300`} />
            <step.icon className="w-7 h-7 text-white relative z-20 drop-shadow-md" />
          </div>

          {/* Mobile Connecting Line */}
          {!isLast && (
            <div className="w-[2px] h-16 bg-gradient-to-b from-white/10 to-transparent md:hidden mt-4" />
          )}
        </div>

        {/* Card Content */}
        <div className="flex-1 relative">
          {/* Gradient Border Layer (Behind) */}
          <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[0.5px]`} />

          {/* Glassmorphism Card */}
          <div className="relative h-full overflow-hidden rounded-2xl bg-black/40 border border-white/5 p-8 backdrop-blur-2xl shadow-lg hover:shadow-glow/20 transition-all duration-500 group-hover:bg-black/60">

            {/* Ambient Glow */}
            <div className={`absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br ${step.gradient} opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-colors">
              {step.title}
            </h3>
            <p className="text-base text-gray-400 font-medium leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 relative bg-black overflow-hidden">

      {/* Ambient background */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[128px] -translate-y-1/2 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Intelligent <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 animate-gradient">
              Workflow Automation
            </span>
          </h2>
          <p className="text-lg text-white/50">
            A seamless pipeline designed to transform your interview skills in four automated steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 md:space-y-4"> {/* Reduced vertical spacing because lines handle it */}
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} isLast={index === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};
