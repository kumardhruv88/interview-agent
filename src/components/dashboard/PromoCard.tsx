import { X, Clock, Gift } from "lucide-react";
import { useState } from "react";

export const PromoCard = ({ freeMinutes }: { freeMinutes: number }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="rounded-3xl p-6 text-white shadow-glow relative overflow-hidden mb-8 group animate-fade-in relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-90 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

            <div className="absolute top-0 right-0 p-4 z-20">
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/60 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-1.5 rounded-full backdrop-blur-sm"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="relative z-10 flex items-start gap-5">
                <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                    <Gift className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-bold text-xs tracking-wider bg-white/20 px-2 py-0.5 rounded-md uppercase border border-white/20 backdrop-blur-md">Daily Free Offer</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight text-white shadow-black/10 drop-shadow-sm">Get {freeMinutes} Minutes FREE Interview Practice Daily!</h2>
                    <p className="text-white/80 max-w-xl mb-5 text-sm leading-relaxed font-medium">
                        Perfect your skills with our AI-powered mock interviews - completely free, every single day.
                        No credit card required.
                    </p>

                    <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-sm">
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-sm font-semibold">{freeMinutes} min daily</span>
                    </div>
                </div>
            </div>

            {/* Abstract Background pattern */}
            <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-primary/40 rounded-full blur-3xl group-hover:bg-primary/50 transition-colors duration-700"></div>
            <div className="absolute top-12 right-12 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl group-hover:bg-cyan-400/40 transition-colors duration-700"></div>
        </div>
    );
};
