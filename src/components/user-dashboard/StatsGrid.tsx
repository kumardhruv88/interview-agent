import { Card, CardContent } from "@/components/ui/card";
import { Activity, Trophy, Clock, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { getInterviewStats, getPerformanceLabel } from "@/utils/interviewStats";
import { useAuth } from "@/contexts/AuthContext";

export const StatsGrid = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalInterviews: 0,
        minutesPracticed: 0,
        averageScore: 0,
        leaderboardRank: 0,
        leaderboardLabel: "Beginner Mode"
    });

    useEffect(() => {
        // Load stats on mount
        const loadStats = async () => {
            const interviewStats = await getInterviewStats(user);
            setStats(interviewStats);
        };
        loadStats();

        // Refresh stats when window gets focus (after completing interview)
        const handleFocus = async () => {
            const updatedStats = await getInterviewStats(user);
            setStats(updatedStats);
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user]);

    const statCards = [
        {
            title: "Total Interviews",
            value: stats.totalInterviews.toString(),
            subtext: "Total interviews completed",
            icon: Target,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
            progress: Math.min(stats.totalInterviews * 10, 100)
        },
        {
            title: "Average Score",
            value: stats.averageScore.toString(),
            subtext: getPerformanceLabel(stats.averageScore),
            icon: Activity,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            border: "border-yellow-400/20",
            progress: stats.averageScore
        },
        {
            title: "Time Practiced",
            value: `${stats.minutesPracticed} (mins)`,
            subtext: "Keep Going",
            icon: Clock,
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/20",
            progress: Math.min(stats.minutesPracticed / 2, 100) // Scale to 100%
        },
        {
            title: "Leaderboard",
            value: `#${stats.leaderboardRank}`,
            subtext: stats.leaderboardLabel,
            icon: Trophy,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20",
            progress: Math.max(100 - stats.leaderboardRank * 5, 20)
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
                <Card key={index} className={`bg-black/40 border ${stat.border} backdrop-blur-sm hover:bg-white/5 transition-all duration-300`}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                    <span className={`text-xs ${stat.color} font-medium`}>{stat.subtext}</span>
                                </div>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            {/* Progress bar */}
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${stat.bg.replace('/10', '/50')}`}
                                    style={{ width: `${stat.progress}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
