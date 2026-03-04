import { Button } from "@/components/ui/button";
import { Check, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

export const Pricing = () => {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl -z-10" />
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>Simple Pricing</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Start for Free, Upgrade for More.
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Experience the power of AI interviewing with our free tier. Unlock unlimited potential with a free account.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="relative bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl h-full flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Guest Access</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">Free</span>
                                    <span className="text-muted-foreground">/ forever</span>
                                </div>
                                <p className="text-muted-foreground mt-4">Perfect for testing the waters and seeing how it works.</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    1 AI Interview Session
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    Basic Performance Feedback
                                </li>
                                <li className="flex items-center gap-3 text-sm text-muted-foreground/50">
                                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <X className="h-3.5 w-3.5" />
                                    </div>
                                    Data not saved permanently
                                </li>
                                <li className="flex items-center gap-3 text-sm text-muted-foreground/50">
                                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <X className="h-3.5 w-3.5" />
                                    </div>
                                    No Interview History
                                </li>
                            </ul>

                            <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 h-12 rounded-xl" asChild>
                                <Link to="/dashboard">Try It Now</Link>
                            </Button>
                        </div>
                    </div>

                    {/* User Tier */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
                        <div className="relative bg-black/80 backdrop-blur-xl p-8 rounded-3xl h-full flex flex-col border border-white/10">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                                RECOMMENDED
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Pro Access</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">Free</span>
                                    <span className="text-muted-foreground">/ account</span>
                                </div>
                                <p className="text-muted-foreground mt-4">Create a free account to unlock the full potential.</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm text-white">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Unlimited AI Interviews
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Detailed Performance Analytics
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Save & Export History
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Voice & Text Modes
                                </li>
                            </ul>

                            <Button variant="hero" className="w-full h-12 rounded-xl shadow-lg shadow-primary/25" asChild>
                                <Link to="/signup">Create Free Account</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
