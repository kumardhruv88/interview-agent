import { ArrowUpRight, Code2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ActionCards = () => {
    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                Interview Type
                <span className="text-xs font-normal text-muted-foreground bg-white/5 px-2 py-1 rounded-full border border-white/5">Select One</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Yourself Card */}
                <div className="bento-card group relative overflow-hidden bg-card border-white/5 hover:border-cyan-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                        <div className="bg-cyan-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors border border-cyan-500/20">
                            <Code2 className="w-7 h-7 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Test Yourself</h3>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-sm">
                            Realistic interview, get scored, no hints during. Simulate the pressure of a real technical interview.
                        </p>

                        <div className="flex justify-end">
                            <Link to="/interview/new?mode=test">
                                <Button className="bg-white/5 text-foreground border border-white/10 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all shadow-sm gap-2 rounded-xl group-hover:translate-x-1 duration-300">
                                    Start <ArrowUpRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Practice with Help Card */}
                <div className="bento-card group relative overflow-hidden bg-card border-white/5 hover:border-purple-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                        <div className="bg-purple-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                            <UserCheck className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Practice with Help</h3>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-sm">
                            AI guides you through answers, corrects mistakes in real-time. Best for learning and improving confidence.
                        </p>

                        <div className="flex justify-end">
                            <Link to="/interview/new?mode=practice">
                                <Button className="bg-white/5 text-foreground border border-white/10 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all shadow-sm gap-2 rounded-xl group-hover:translate-x-1 duration-300">
                                    Start <ArrowUpRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
