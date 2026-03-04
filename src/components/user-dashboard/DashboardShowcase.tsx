import { TrendingUp, Target, Lightbulb, Award, Zap } from "lucide-react";

export const DashboardShowcase = () => {
    return (
        <section className="space-y-6">
            <h2 className="text-xl font-bold">Performance Insights</h2>

            {/* Floating Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recent Performance Card */}
                <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-xs text-purple-400 font-semibold">TRENDING</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1">
                            85<span className="text-lg text-purple-400">%</span>
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">Recent Match Score</p>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-xs text-green-400 font-semibold">+12%</span>
                        </div>
                    </div>
                </div>

                {/* Skill Progress Card */}
                <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Target className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-xs text-cyan-400 font-semibold">ACTIVE</span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">Skills Improving</h3>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                    React
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                                    TypeScript
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                                    System Design
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-3">Based on recent interviews</p>
                    </div>
                </div>

                {/* Quick Tips Card */}
                <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-xs text-amber-400 font-semibold">TIP</span>
                        </div>

                        <h3 className="text-sm font-bold text-white mb-2">Today's Focus</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Practice behavioral questions to improve communication scores by 20%
                        </p>

                        <button className="mt-4 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors">
                            View Tips
                            <Zap className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Achievements Banner */}
            <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6 hover:border-green-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <Award className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">Recent Achievement</h3>
                                <p className="text-sm text-gray-400">Completed 5 interviews this week 🎯</p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">5</div>
                                <p className="text-xs text-gray-500">Interviews</p>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400">82%</div>
                                <p className="text-xs text-gray-500">Avg Score</p>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">15</div>
                                <p className="text-xs text-gray-500">Streak</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
