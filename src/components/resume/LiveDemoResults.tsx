import { useEffect, useState } from "react";
import { TrendingUp, CheckCircle2, AlertCircle, Target } from "lucide-react";

const demoResults = [
    {
        matchScore: 87,
        role: "Senior Frontend Developer",
        matchedSkills: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
        missingSkills: ["GraphQL", "Docker"],
        recommendations: ["Add GraphQL experience", "Highlight API development"],
    },
    {
        matchScore: 92,
        role: "Full Stack Engineer",
        matchedSkills: ["JavaScript", "Python", "PostgreSQL", "AWS"],
        missingSkills: ["Kubernetes", "CI/CD"],
        recommendations: ["Add DevOps skills", "Showcase cloud architecture"],
    },
    {
        matchScore: 78,
        role: "UI/UX Designer",
        matchedSkills: ["Figma", "Sketch", "User Research", "Prototyping"],
        missingSkills: ["Adobe XD", "Motion Design"],
        recommendations: ["Add animation portfolio", "Emphasize design systems"],
    },
];

export const LiveDemoResults = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % demoResults.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const demo = demoResults[currentIndex];

    return (
        <div className="py-12 relative">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">See It In Action</h2>
                <p className="text-muted-foreground">
                    Live demo of resume analysis results
                </p>
            </div>

            <div>
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
                    {/* Match Score Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate-float">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground">Match Score</span>
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                {demo.matchScore}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{demo.role}</p>
                        </div>
                    </div>

                    {/* Skills Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate-float-delayed">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground">Matched Skills</span>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {demo.matchedSkills.slice(0, 3).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-xs bg-green-500/10 text-green-400 rounded-full border border-green-500/20"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                +{demo.matchedSkills.length - 3} more
                            </p>
                        </div>
                    </div>

                    {/* Gaps Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate-float-slow">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground">Skill Gaps</span>
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                {demo.missingSkills.map((skill, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-orange-400"
                                    >
                                        <Target className="w-3 h-3" />
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations Banner */}
                <div className="max-w-4xl mx-auto mt-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl blur-lg" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Target className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium mb-1">Top Recommendations</p>
                                <p className="text-xs text-muted-foreground">
                                    {demo.recommendations.join(" • ")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicator Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {demoResults.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex
                            ? "bg-primary w-8"
                            : "bg-white/20 hover:bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
