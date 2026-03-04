import { Button } from "@/components/ui/button";
import { Code, Bot, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateInterviewDialog } from "@/components/dashboard/CreateInterviewDialog"; // Reusing the dialog for functionality

export const InterviewActionCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Test Yourself Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-8" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                            <Code className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Test Yourself</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">Real Exam Mode</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-6 min-h-[40px]">
                        Realistic interview simulation. Use generic questions, get scored, receive no hints during the session.
                    </p>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-400 font-medium">Best for: Assessment</span>
                        {/* We wrap the existing dialog trigger button here or style it to match */}
                        <div className="flex gap-2">
                            <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/20 text-blue-300">
                                Config
                            </Button>
                            <CreateInterviewDialog
                                trigger={
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                        Start <ArrowRight className="w-4 h-4" />
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Practice with Help Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Bot className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-8" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Practice with Help</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">AI Tutor Mode</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-6 min-h-[40px]">
                        AI guides you through answers, corrects mistakes in real-time, and suggests improvements.
                    </p>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-purple-400 font-medium">Best for: Learning</span>
                        <div className="flex gap-2">
                            <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/20 text-purple-300">
                                Config
                            </Button>
                            <CreateInterviewDialog
                                trigger={
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                                        Start <ArrowRight className="w-4 h-4" />
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
