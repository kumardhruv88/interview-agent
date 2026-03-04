import { Zap, MessageSquare, Check, FileText, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const DashboardPreview = () => {
    return (
        <div className="relative w-full max-w-5xl mx-auto mt-20 perspective-1000">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-purple-500/10 to-blue-500/20 blur-[100px] rounded-full opacity-50 z-0" />

            {/* Main Container - Angled for 3D effect */}
            <div
                className="relative z-10 bg-card/40 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-2xl transform rotate-x-6 transition-all duration-700 hover:rotate-x-0"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className="flex flex-col md:flex-row gap-4 h-[500px] overflow-hidden rounded-2xl bg-black/40">

                    {/* Left Panel - Job Details */}
                    <div className="w-full md:w-1/3 bg-sidebar-background/50 border-r border-white/5 p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Job Details</h3>
                            <div className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <FileText className="h-4 w-4 text-white/40" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-1">Product Designer</h2>
                                <p className="text-sm text-white/60">TechFlow • Full-time</p>
                            </div>
                            <div className="space-y-2.5">
                                <div className="h-px w-full bg-white/10" />
                                <p className="text-xs text-white/40 leading-relaxed line-clamp-4">
                                    We are looking for a talented Product Designer to join our team. You will be responsible for creating intuitive and beautiful user experiences for our core product.
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                                    <User className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">Alex Morgan</div>
                                    <div className="text-xs text-white/40 truncate">alex.morgan@example.com</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Chat Interface */}
                    <div className="flex-1 flex flex-col relative bg-gradient-to-br from-white/[0.02] to-transparent">
                        {/* Chat Header */}
                        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-white/70">Interview in progress</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/50">
                                    08:45
                                </div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-6 space-y-6 overflow-hidden">
                            {/* AI Message */}
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-sm text-white/80 leading-relaxed shadow-sm">
                                        Hello, Alex! I'm excited to help you prepare. To start, could you tell me about a challenging project you managed recently?
                                    </div>
                                    <div className="text-[10px] text-white/30 ml-1">AI Coach • Just now</div>
                                </div>
                            </div>

                            {/* User Message */}
                            <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-zinc-700/50 border border-white/10 flex-shrink-0 flex items-center justify-center">
                                    <User className="h-4 w-4 text-white/60" />
                                </div>
                                <div className="space-y-1">
                                    <div className="p-4 rounded-2xl rounded-tr-none bg-primary/10 border border-primary/20 text-sm text-white/90 leading-relaxed shadow-[0_0_15px_rgba(235,5,255,0.1)]">
                                        Hi! I'd love to share that. In my previous role at TechFlow, I led a redesign of our core mobile app...
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis (Mock) */}
                            <div className="my-4 mx-8 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 items-start animate-fade-in-up">
                                <Zap className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-blue-300">Analysis</div>
                                    <div className="text-xs text-blue-200/70 leading-relaxed">
                                        Great start! You're clearly creating context. Remember to focus on your specific contributions using the STAR method.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5">
                            <div className="flex gap-3">
                                <div className="flex-1 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 text-sm text-white/30">
                                    Type your answer...
                                </div>
                                <div className="w-12 h-12 bg-primary hover:bg-primary/90 transition-colors rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20">
                                    <Send className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Floating Elements (Notifications) */}

            {/* 1. Communication Skills Score */}
            <FloatingCard
                className="absolute -left-24 top-[40%] animate-float"
                delay="0s"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">Communication</div>
                        <div className="mt-1 h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-green-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </FloatingCard>

            {/* 2. Job Imported Success */}
            <FloatingCard
                className="absolute -right-24 top-[20%] animate-float"
                delay="2s"
            >
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="text-sm font-medium text-white/90">Job details imported</div>
                </div>
            </FloatingCard>

            {/* 3. CV Uploaded */}
            <FloatingCard
                className="absolute -left-20 bottom-[15%] animate-float"
                delay="1.5s"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">CV Uploaded</div>
                        <div className="text-xs text-white/50">resume_v2.pdf</div>
                    </div>
                </div>
            </FloatingCard>

            {/* 4. Analysis Complete */}
            <FloatingCard
                className="absolute -right-28 bottom-[25%] animate-float"
                delay="3s"
            >
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-white">Analysis Ready</div>
                </div>
            </FloatingCard>

        </div>
    );
};

// Helper component for floating cards
const FloatingCard = ({ children, className, delay }: { children: React.ReactNode, className?: string, delay?: string }) => {
    return (
        <div
            className={cn(
                "p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-white/20 shadow-xl z-20 transition-transform hover:scale-105",
                className
            )}
            style={{ animationDelay: delay }}
        >
            {children}
        </div>
    );
}

export default DashboardPreview;
