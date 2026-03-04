import { Home, FileText, LayoutTemplate, FileBarChart, Trophy, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Sidebar = ({ freeMinutesLeft, totalFreeMinutes }: { freeMinutesLeft: number, totalFreeMinutes: number }) => {
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: "Dashboard", path: "/user-dashboard" },
        { icon: FileText, label: "Recommended Jobs", path: "#", disabled: true }, // Placeholder
        { icon: LayoutTemplate, label: "Templates", path: "#", disabled: true }, // Placeholder
        { icon: FileBarChart, label: "Reports", path: "#", disabled: true }, // Placeholder
    ];

    const usagePercentage = ((totalFreeMinutes - freeMinutesLeft) / totalFreeMinutes) * 100;

    return (
        <aside className="w-64 bg-card/30 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0 left-0">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow-sm transition-all duration-300 group-hover:shadow-glow">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl text-foreground tracking-tight">InterviewAI</span>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                } ${item.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">Daily Free Plan</span>
                        <span className="text-xs text-muted-foreground">{freeMinutesLeft}m left</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2 mb-2 bg-white/10" indicatorClassName="bg-primary shadow-glow-sm" />
                    <p className="text-[10px] text-muted-foreground">Resets in 24 hours</p>
                </div>

                <Button className="w-full gradient-primary hover:opacity-90 transition-opacity text-white shadow-glow-sm border-0">
                    <Zap className="w-4 h-4 mr-2 fill-current" />
                    Upgrade to Premium
                </Button>
            </div>
        </aside>
    );
};
