import { useEffect, useState } from "react";
import { UserDashboardSidebar } from "@/components/user-dashboard/UserDashboardSidebar";
import { UserDashboardHeader } from "@/components/user-dashboard/UserDashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Calendar, Clock, BarChart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Reports = () => {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });
    const navigate = useNavigate();

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
        const fetchInterviews = async () => {
            setLoading(true);
            if (user) {
                const { data, error } = await supabase
                    .from("interviews")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching reports:", error);
                } else {
                    setInterviews(data || []);
                }
            } else {
                // Guest mode - fetch from localStorage
                const local = JSON.parse(localStorage.getItem("interviews") || "[]");
                setInterviews(local);
            }
            setLoading(false);
        };

        fetchInterviews();
    }, [user]);

    const handleDelete = async (interviewId: string) => {
        if (!confirm("Are you sure you want to delete this interview? This action cannot be undone.")) {
            return;
        }

        try {
            if (user) {
                // Logged-in user: Delete from Supabase
                const { error } = await supabase
                    .from('interviews')
                    .delete()
                    .eq('id', interviewId)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                // Guest: Delete from localStorage
                const saved = localStorage.getItem("interviews");
                if (saved) {
                    const interviews = JSON.parse(saved);
                    const filtered = interviews.filter((i: any) => i.id !== interviewId);
                    localStorage.setItem("interviews", JSON.stringify(filtered));
                }
            }

            // Refresh list
            setInterviews(prev => prev.filter(i => i.id !== interviewId));
        } catch (error) {
            console.error("Error deleting interview:", error);
            alert("Failed to delete interview. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-foreground font-sans selection:bg-primary/20">
            <div className="flex">
                <UserDashboardSidebar />
                <main className={`flex-1 relative min-h-screen w-full transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                    {/* Background Gradients */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10">
                        <UserDashboardHeader
                            showWelcome={false}
                            showStartInterview={false}
                        />

                        <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-8">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl font-bold text-white tracking-tight">Interview Reports</h1>
                                <p className="text-muted-foreground">View your past performance and detailed feedback.</p>
                            </div>

                            {loading ? (
                                <div className="text-center py-20 text-muted-foreground">Loading reports...</div>
                            ) : interviews.length === 0 ? (
                                <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-xl font-medium text-white">No Reports Yet</h3>
                                    <p className="text-muted-foreground mt-2">Complete an interview to see your detailed analysis here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {interviews.map((interview) => (
                                        <Card key={interview.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold text-white">{interview.job_position || "Mock Interview"}</h3>
                                                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10">
                                                            {interview.feedback ? "Completed" : "In Progress"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            {format(new Date(interview.created_at || interview.createdAt), "MMM d, yyyy")}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {interview.duration ? `${interview.duration}m` : "20m"}
                                                        </div>
                                                        {interview.overall_score !== undefined && (
                                                            <div className="flex items-center gap-1.5 text-green-400">
                                                                <BarChart className="w-4 h-4" />
                                                                Score: {interview.overall_score}/100
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                                                        onClick={() => handleDelete(interview.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10 flex-1 md:flex-none"
                                                        onClick={() => navigate(`/feedback/${interview.id}`)}
                                                    >
                                                        Performance
                                                    </Button>
                                                    {!interview.feedback && (
                                                        <Button
                                                            className="bg-primary hover:bg-primary/90 text-white flex-1 md:flex-none"
                                                            onClick={() => navigate(`/interview/${interview.id}`)}
                                                        >
                                                            Continue <ArrowRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports;
