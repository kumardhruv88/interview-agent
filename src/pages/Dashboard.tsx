import { useState, useEffect } from "react";
import { UserDashboardSidebar } from "@/components/user-dashboard/UserDashboardSidebar";
import { UserDashboardHeader } from "@/components/user-dashboard/UserDashboardHeader";
import { StatsGrid } from "@/components/user-dashboard/StatsGrid";
import { InterviewActionCards } from "@/components/user-dashboard/InterviewActionCards";
import { DashboardShowcase } from "@/components/user-dashboard/DashboardShowcase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { InterviewCard } from "@/components/dashboard/InterviewCard";
import { CreateInterviewDialog } from "@/components/dashboard/CreateInterviewDialog";
import { Loader2, Briefcase } from "lucide-react";

interface Interview {
  id: string;
  jobPosition: string;
  jobDescription: string;
  yearsOfExperience: string;
  createdAt: string;
  questions: string[];
  score?: number;
  transcript?: any[];
}

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    useEffect(() => {
        const handleSidebarToggle = (e: CustomEvent) => {
            setSidebarCollapsed(e.detail.collapsed);
        };
        window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
        };
    }, []);

    useEffect(() => {
        if (authLoading) return;
        loadInterviews();
    }, [user, authLoading]);

    const loadInterviews = async () => {
        setLoading(true);
        if (user) {
            const isDevMode = localStorage.getItem('devMode') === 'true';
            if (isDevMode) {
                const saved = localStorage.getItem("interviews");
                if (saved) {
                    setInterviews(JSON.parse(saved));
                }
            } else {
                try {
                    const { data, error } = await supabase
                        .from('interviews')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    const mappedInterviews = (data || []).map((row: any) => ({
                        id: row.id,
                        jobPosition: row.job_position,
                        jobDescription: row.job_description,
                        yearsOfExperience: row.years_of_experience,
                        createdAt: row.created_at,
                        questions: row.questions || [],
                        score: row.score,
                        transcript: row.transcript
                    }));

                    setInterviews(mappedInterviews);

                    const local = localStorage.getItem("interviews");
                    if (local) {
                        const localInterviews: Interview[] = JSON.parse(local);
                        if (localInterviews.length > 0) {
                            migrateInterviews(localInterviews);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching interviews:", err);
                    // Fallback to local storage if Supabase fails
                    const saved = localStorage.getItem("interviews");
                    if (saved) {
                        setInterviews(JSON.parse(saved));
                    }
                }
            }
        } else {
            const saved = localStorage.getItem("interviews");
            if (saved) {
                setInterviews(JSON.parse(saved));
            }
        }
        setLoading(false);
    };

    const migrateInterviews = async (localInterviews: Interview[]) => {
        if (!user) return;
        const isDevMode = localStorage.getItem('devMode') === 'true';
        if (isDevMode) return;

        try {
            const toInsert = localInterviews.map(i => ({
                user_id: user.id,
                job_position: i.jobPosition,
                job_description: i.jobDescription,
                years_of_experience: i.yearsOfExperience,
                created_at: i.createdAt,
                questions: i.questions,
                score: i.score,
                transcript: i.transcript
            }));

            const { error } = await supabase.from('interviews').insert(toInsert);

            if (!error) {
                toast({ title: "Data Synced", description: "Your guest interviews have been saved to your account." });
                localStorage.removeItem("interviews");
                loadInterviews();
            }
        } catch (e) {
            console.error("Migration failed", e);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar (Desktop) */}
            <UserDashboardSidebar />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

                {/* Header */}
                <UserDashboardHeader
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    showWelcome={true}
                    showStartInterview={true}
                />

                {/* Content */}
                <main className="flex-1 pt-20 px-6 pb-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Guest View Notice */}
                        {!user && interviews.length > 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4 flex items-center justify-between">
                                <p className="text-sm text-yellow-500">You are using a Guest account. Your data is only saved on this device. Create an account to save it permanently!</p>
                            </div>
                        )}

                        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {/* Stats Grid */}
                            <section>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    Your Progress
                                    <span className="text-xs font-normal text-muted-foreground ml-2 px-2 py-0.5 bg-white/5 rounded-full">
                                        Last 7 Days
                                    </span>
                                </h2>
                                <StatsGrid />
                            </section>

                            {/* Interview Options */}
                            <section>
                                <h2 className="text-xl font-bold mb-4">Interview Type</h2>
                                <InterviewActionCards />
                            </section>

                            {/* Dashboard Showcase - Modern Floating Cards */}
                            <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <DashboardShowcase />
                            </section>

                            {/* Recent Activity (From old Dashboard) */}
                            <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
                                {interviews.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {interviews.slice(0, 3).map((interview, index) => (
                                            <InterviewCard
                                                key={interview.id}
                                                id={interview.id}
                                                jobPosition={interview.jobPosition}
                                                techStack={interview.jobDescription}
                                                experience={interview.yearsOfExperience}
                                                createdAt={interview.createdAt}
                                                questionsCount={interview.questions.length}
                                                score={interview.score}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl">
                                        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                            <Briefcase className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            Ready to Start?
                                        </h3>
                                        <p className="text-gray-400 max-w-sm mb-6 text-sm">
                                            Create your first mock interview to start practicing and see your activity here.
                                        </p>
                                        <CreateInterviewDialog />
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="w-64 h-full bg-background border-r border-white/10 p-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Menu</h2>
                        <a href="/dashboard" className="block py-2 text-primary">Dashboard</a>
                        <button className="mt-8 text-sm text-red-500" onClick={() => setSidebarOpen(false)}>Close Menu</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
