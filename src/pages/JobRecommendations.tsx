import { useEffect, useState } from "react";
import { UserDashboardSidebar } from "@/components/user-dashboard/UserDashboardSidebar";
import { UserDashboardHeader } from "@/components/user-dashboard/UserDashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, MapPin, DollarSign, Building, ArrowUpRight, Sparkles, Target, TrendingUp, Award, Zap, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { jobRecommendationService, type RecommendationRequest } from "@/services/jobRecommendationService";
import type { RankedJob } from "@/services/jobMatcher";
import type { UserProfile } from "@/services/jobMatcher";

const JobRecommendations = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<RankedJob[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [resumeText, setResumeText] = useState<string>("");
    const [profileAnalysis, setProfileAnalysis] = useState<any>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    useEffect(() => {
        const handleSidebarToggle = (e: CustomEvent) => {
            setSidebarCollapsed(e.detail.collapsed);
        };
        window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
        return () => window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    }, []);

    // Load user profile on mount
    useEffect(() => {
        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        if (!user) return;

        try {
            // Fetch user profile from database (including cached analysis)
            const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!error && profileData) {
                // Convert database profile to UserProfile
                // Parse skills: can be string (comma-separated) or array
                let skillsArray: string[] = [];
                if (typeof profileData.skills === 'string') {
                    skillsArray = profileData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
                } else if (Array.isArray(profileData.skills)) {
                    skillsArray = profileData.skills;
                }

                const profile: UserProfile = {
                    name: profileData.full_name || "",
                    skills: skillsArray,
                    experience_years: profileData.years_of_experience || 0,
                    education: profileData.degree || "",
                    location_preference: profileData.location || ""
                };

                setUserProfile(profile);
                setResumeText(profileData.resume_content || "");

                // Load cached profile analysis if available
                if (profileData.profile_analysis) {
                    console.log('✅ Loaded cached profile analysis from database');
                    setProfileAnalysis(profileData.profile_analysis);
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    // Helper to check if profile has minimum data for job recommendations
    const hasMinimumProfileData = () => {
        return userProfile &&
            userProfile.skills &&
            userProfile.skills.length > 0 &&
            userProfile.experience_years !== undefined;
    };

    const fetchAndAnalyze = async () => {
        // Check if API is configured
        if (!jobRecommendationService.isConfigured()) {
            toast({
                variant: "destructive",
                title: "API Not Configured",
                description: "Please configure your Adzuna API credentials in the .env file.",
            });
            return;
        }

        setLoading(true);
        try {
            console.log('🎯 Getting job recommendations for:', userProfile);

            const request: RecommendationRequest = {
                profile: userProfile,
                resumeText: resumeText,
                profileAnalysis: profileAnalysis, // Pass cached analysis if available
                topN: 10
            };

            const response = await jobRecommendationService.getRecommendations(request);

            console.log('✅ Received recommendations:', response);

            setRecommendations(response.recommendations);

            // Cache the profile analysis if it was newly generated
            if (response.profileAnalysis && !profileAnalysis) {
                console.log('💾 Caching profile analysis to database');
                await supabase
                    .from('user_profiles')
                    .update({
                        profile_analysis: response.profileAnalysis,
                        profile_last_analyzed_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id);
                setProfileAnalysis(response.profileAnalysis);
            }

            toast({
                title: "Recommendations Ready!",
                description: `Found ${response.recommendations.length} high-match opportunities for you.`,
            });

        } catch (error) {
            console.error("❌ Error generating recommendations:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : String(error),
                userProfile,
                hasProfileAnalysis: !!profileAnalysis,
                userId: user?.id
            });

            let errorMessage = "Could not generate recommendations. Please try again.";

            if (error instanceof Error) {
                if (error.message.includes('API')) {
                    errorMessage = "API configuration error. Please check your Adzuna API keys in .env file.";
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = "Network error. Please check your internet connection.";
                } else {
                    errorMessage = error.message;
                }
            }

            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const openJobLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <UserDashboardSidebar />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <UserDashboardHeader
                    showWelcome={false}
                    showStartInterview={false}
                />

                <main className="flex-1 pt-24 px-6 pb-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Modern Hero Header */}
                        <div className="mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
                            <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
                                <span className="text-xs font-semibold text-purple-400 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    AI-POWERED CAREER INTELLIGENCE
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                                Your Personalized Job Matches
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                                AI analyzes your profile and finds real job opportunities from top companies that match your skills and experience.
                            </p>
                        </div>

                        {/* Feature Cards - Before Recommendations */}
                        {recommendations.length === 0 && !loading && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {/* Card 1: Smart Matching */}
                                    <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6 hover:border-purple-500/20 transition-all duration-300">
                                            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
                                                <Target className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">Smart Matching</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                Groq LLM analyzes your profile and ranks jobs by fit, ensuring every recommendation is relevant to your career goals.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card 2: Real Opportunities */}
                                    <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s' }}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6 hover:border-cyan-500/20 transition-all duration-300">
                                            <div className="p-3 bg-cyan-500/20 rounded-xl w-fit mb-4">
                                                <TrendingUp className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">Real Opportunities</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                Live jobs from Adzuna API. Click to apply directly - these are real, current opportunities from top companies.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card 3: Personalized Insights */}
                                    <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-300">
                                            <div className="p-3 bg-amber-500/20 rounded-xl w-fit mb-4">
                                                <Award className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">Interview Prep</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                Get AI-generated interview tips for each role, helping you prepare effectively and increase your chances.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Section */}
                                <div className="group relative animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-lg opacity-50" />
                                    <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-8 text-center">
                                        <div className="max-w-2xl mx-auto">
                                            <h2 className="text-2xl font-bold text-white mb-3">Ready to Discover Your Next Role?</h2>
                                            <p className="text-gray-400 mb-6">
                                                Click below to let our AI analyze your profile and find real job opportunities tailored just for you.
                                            </p>
                                            <Button
                                                onClick={fetchAndAnalyze}
                                                disabled={loading || !hasMinimumProfileData()}
                                                size="lg"
                                                className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-5 h-5" />
                                                        Recommend Jobs
                                                    </>
                                                )}
                                            </Button>
                                            {!hasMinimumProfileData() && (
                                                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                    <p className="text-xs text-amber-400 text-center">
                                                        💡 Please complete your <a href="/profile" className="underline font-semibold">profile</a> with skills and experience to get personalized recommendations
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
                                    <Loader2 className="w-16 h-16 text-purple-400 animate-spin relative z-10" />
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="text-xl font-semibold text-white">Analyzing Your Profile</h3>
                                    <p className="text-gray-400">Searching real jobs and ranking by fit...</p>
                                </div>
                            </div>
                        )}

                        {/* Job Recommendations Grid */}
                        {recommendations.length > 0 && !loading && (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Top Matches for You</h2>
                                        <p className="text-sm text-gray-400 mt-1">Based on your profile and real-time job data</p>
                                    </div>
                                    <Button
                                        onClick={fetchAndAnalyze}
                                        disabled={loading}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Refresh
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recommendations.map((job, index) => (
                                        <div
                                            key={job.id}
                                            className="group relative animate-fade-in-up opacity-0"
                                            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                                        >
                                            <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                                            <div className="relative h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300 group-hover:-translate-y-1 flex flex-col">
                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-3 gap-3">
                                                    <div className="flex gap-3 overflow-hidden flex-1">
                                                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors shrink-0">
                                                            <Building className="w-5 h-5 text-gray-300" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors truncate">
                                                                {job.title}
                                                            </h3>
                                                            <p className="text-xs text-gray-400 truncate">{job.company}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xl font-bold bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent shrink-0">
                                                        {job.matchScore}%
                                                    </span>
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                        <MapPin className="w-3 h-3" /> {job.location.split(',')[0]}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                                                        <DollarSign className="w-3 h-3" /> {job.salary}
                                                    </div>
                                                    <div className="text-xs text-gray-500 px-2 py-1">
                                                        {job.postedDate}
                                                    </div>
                                                </div>

                                                {/* Reason */}
                                                <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5">
                                                    <div className="flex items-start gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                                                            {job.matchReason}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <div className="mt-auto pt-3 border-t border-white/5">
                                                    <Button
                                                        onClick={() => openJobLink(job.applyUrl)}
                                                        size="sm"
                                                        className="w-full bg-white text-black hover:bg-gray-200 font-semibold text-xs rounded-lg"
                                                    >
                                                        <span className="flex items-center justify-center gap-1.5">
                                                            Apply Now
                                                            <ExternalLink className="w-3 h-3" />
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default JobRecommendations;
