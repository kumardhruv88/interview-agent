import { SkillGapAnalysis } from '@/utils/ai';
import { Trophy, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AnalysisResultProps {
    result: SkillGapAnalysis;
}

const GlassCard = ({
    title,
    icon: Icon,
    gradient,
    children,
    className = "",
    delay = 0
}: {
    title: string;
    icon?: any;
    gradient: string;
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => (
    <div
        className={`relative group h-full opacity-0 animate-fade-in-up ${className}`}
        style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
        {/* Animated Gradient Border Layer */}
        <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${gradient} opacity-30 blur-[2px] group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Ambient Outer Glow */}
        <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-r ${gradient} opacity-0 blur-xl group-hover:opacity-10 transition-opacity duration-700`} />

        {/* Glass Content Container */}
        <div className="relative h-full flex flex-col bg-[#050505]/95 backdrop-blur-3xl rounded-2xl border border-white/10 p-5 overflow-hidden transition-transform duration-500 group-hover:-translate-y-1">

            {/* Subtle Inner Highlight Reflected from Gradient */}
            <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r ${gradient} opacity-20`} />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
                {Icon && (
                    <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-sm`} />
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                )}
                <h3 className="text-base font-bold text-white tracking-wide uppercase">{title}</h3>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 text-gray-400 leading-snug flex flex-col justify-center">
                {children}
            </div>
        </div>
    </div>
);

export const AnalysisResult = ({ result }: AnalysisResultProps) => {
    // Combine Partial and Missing skills for the "Weak" card
    const weakSkills = [
        ...result.partialSkills.map(s => ({ name: s, type: 'partial', explanation: undefined })),
        ...result.missingSkills.map(s => ({ name: s.skill, type: 'missing', explanation: s.explanation }))
    ];

    return (
        <div className="space-y-6">
            {/* Top Row: Match Score */}
            <div className="w-full h-auto">
                <GlassCard
                    title="Match Score"
                    icon={Trophy}
                    gradient="from-yellow-500 via-amber-500 to-orange-500"
                    delay={0.1}
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500">
                                {result.matchScore}%
                            </span>
                            <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-semibold uppercase tracking-wider">
                                {result.matchScore >= 80 ? 'Excellent Match' : result.matchScore >= 60 ? 'Moderate Match' : 'Needs Improvement'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${result.matchScore}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                                {result.summary}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Bottom Row: Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Matched Skills */}
                <GlassCard
                    title="Matched Skills"
                    icon={CheckCircle}
                    gradient="from-green-400 via-emerald-500 to-teal-500"
                    delay={0.2}
                >
                    <div className="flex flex-wrap gap-2 content-start min-h-[150px]">
                        {result.matchedSkills.length > 0 ? (
                            result.matchedSkills.map((skill, idx) => (
                                <div
                                    key={idx}
                                    className="group/chip relative px-3 py-1.5 rounded-full bg-green-500/5 border border-green-500/20 text-green-300 text-xs font-medium transition-all hover:bg-green-500/10 hover:border-green-500/40 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] cursor-default"
                                >
                                    {skill}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No exact matches found.</p>
                        )}
                    </div>
                </GlassCard>

                {/* Partial / Weak Skills */}
                <GlassCard
                    title="Partial Match / Weak Skills"
                    icon={AlertTriangle}
                    gradient="from-amber-500 via-orange-500 to-red-500"
                    delay={0.3}
                >
                    <div className="flex flex-wrap gap-2 content-start min-h-[150px]">
                        {weakSkills.length > 0 ? (
                            weakSkills.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "group/chip relative px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-default",
                                        item.type === 'partial'
                                            ? "bg-amber-500/5 border-amber-500/20 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/40 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                            : "bg-red-500/5 border-red-500/20 text-red-300 hover:bg-red-500/10 hover:border-red-500/40 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                    )}
                                    title={item.type === 'missing' ? item.explanation : undefined}
                                >
                                    {item.name}
                                    {item.type === 'missing' && <span className="sr-only"> (Missing)</span>}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No critical gaps identified.</p>
                        )}
                    </div>
                </GlassCard>

            </div>
        </div>
    );
};
