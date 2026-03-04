import { CheckCircle2, BarChart3, Clock, Trophy } from "lucide-react";

interface StatsGridProps {
    stats: {
        interviewsCompleted: number;
        averageScore: number;
        timePracticed: number;
        rank: number;
        rankLabel: string;
    }
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
    const cards = [
        {
            label: "Total Interviews",
            value: stats.interviewsCompleted,
            subtext: "Total interviews completed",
            icon: CheckCircle2,
            iconColor: "text-blue-400",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20",
            trend: "Interviews"
        },
        {
            label: "Average Score",
            value: stats.averageScore,
            subtext: "Consistently scoring above 60", // Hardcoded for demo/mock
            icon: BarChart3,
            iconColor: "text-amber-400",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/20",
            trend: "Rising Star"
        },
        {
            label: "Time Practiced",
            value: stats.timePracticed,
            subtext: "Start practicing to earn your first badge!",
            icon: Clock,
            iconColor: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20",
            trend: "(mins) Keep Going"
        },
        {
            label: "Leaderboard",
            value: `#${stats.rank}`,
            subtext: "Just started — room to grow and explore!",
            icon: Trophy,
            iconColor: "text-purple-400",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
            trend: stats.rankLabel || "Beginner"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <div key={index} className={`bento-card group relative overflow-hidden bg-card border-white/5 hover:border-${card.iconColor.split('-')[1]}/50`}>
                    <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${card.bgColor} ${card.borderColor} border-b border-l transition-transform group-hover:scale-110`}>
                        <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>

                    <h3 className="text-muted-foreground text-sm font-medium mb-4">{card.label}</h3>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground tracking-tight">{card.value}</span>
                            <span className={`text-xs font-semibold ${card.iconColor} px-1.5 py-0.5 rounded-md ${card.bgColor} border ${card.borderColor}`}>{card.trend}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{card.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
