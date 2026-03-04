import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserDashboardHeader } from "@/components/user-dashboard/UserDashboardHeader";
import { UserDashboardSidebar } from "@/components/user-dashboard/UserDashboardSidebar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Plus } from "lucide-react";
import { CreateTopicDialog } from "@/components/topic-interview/CreateTopicDialog";

const FEATURED_TOPICS = [
    {
        id: "transformers",
        name: "Transformers & Attention",
        tagline: "Master the architecture that revolutionized AI",
        description: "Dive deep into transformer architecture, attention mechanisms, and the foundation of modern language models.",
        image: "transformers.png",
        gradient: "from-purple-500/10 via-blue-500/10 to-cyan-500/10",
        accentColor: "text-purple-400"
    },
    {
        id: "llm",
        name: "Large Language Models",
        tagline: "Explore the minds behind conversational AI",
        description: "Learn about LLM architectures, training techniques, fine-tuning strategies, and prompt engineering.",
        image: "llm.png",
        gradient: "from-blue-500/10 via-cyan-500/10 to-teal-500/10",
        accentColor: "text-cyan-400"
    },
    {
        id: "system-design",
        name: "System Design",
        tagline: "Build scalable architectures that stand the test of scale",
        description: "Master distributed systems, microservices, database design, caching strategies, and cloud infrastructure.",
        image: "system-design.png",
        gradient: "from-green-500/10 via-emerald-500/10 to-teal-500/10",
        accentColor: "text-green-400"
    },
    {
        id: "fastapi",
        name: "FastAPI & Python Backend",
        tagline: "Lightning-fast APIs with modern Python",
        description: "Build high-performance REST APIs with FastAPI. Learn async programming and production-ready backends.",
        image: "fastapi.png",
        gradient: "from-green-500/10 via-emerald-400/10 to-cyan-500/10",
        accentColor: "text-emerald-400"
    },
];

const TopicInterview = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
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

    const handleTopicClick = (topicId: string, topicName: string) => {
        navigate(`/topic-interview/${topicId}/voice`, {
            state: {
                topicMode: true,
                topicName: topicName,
                topicId: topicId,
                duration: 15,
            }
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <UserDashboardSidebar />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <UserDashboardHeader
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    showWelcome={false}
                    showStartInterview={false}
                />

                <main className="flex-1 pt-24 px-6 pb-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                    Topic-Based Interviews
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Master specific technical topics with AI-powered contextual interviews.
                                </p>
                            </div>
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="gap-2 shadow-lg shadow-primary/25"
                                size="sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Create Custom Topic</span>
                            </Button>
                        </div>

                        {/* Featured Topics - Hero Style */}
                        <div className="space-y-6">
                            {FEATURED_TOPICS.map((topic, index) => (
                                <div
                                    key={topic.id}
                                    className="group relative animate-fade-in-up opacity-0"
                                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                                >
                                    {/* Glow Effect */}
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${topic.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />

                                    {/* Card Container */}
                                    <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
                                        <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                                            {/* Text Content */}
                                            <div className={`p-6 md:p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                                                <div className={`inline-block px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${topic.accentColor} text-[10px] font-semibold mb-3 w-fit uppercase tracking-wider`}>
                                                    TOPIC INTERVIEW
                                                </div>

                                                <h2 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                    {topic.name}
                                                </h2>

                                                <p className={`text-sm md:text-base font-medium ${topic.accentColor} mb-3 opacity-90`}>
                                                    {topic.tagline}
                                                </p>

                                                <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-6">
                                                    {topic.description}
                                                </p>

                                                <Button
                                                    onClick={() => handleTopicClick(topic.id, topic.name)}
                                                    className="bg-primary hover:bg-primary/90 text-white gap-2 w-fit group/btn shadow-lg shadow-primary/20"
                                                    size="sm"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    Start Interview
                                                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>

                                            {/* Image */}
                                            <div className={`relative h-48 md:h-64 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                                                <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent z-10" />
                                                <img
                                                    src={`/images/topics/${topic.image}`}
                                                    alt={topic.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Decorative Gradient Overlay */}
                                                <div className={`absolute inset-0 bg-gradient-to-${index % 2 === 0 ? 'r' : 'l'} from-background/60 via-background/10 to-transparent`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Info Section */}
                        <div className="mt-12 relative group animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl blur-lg opacity-50" />
                            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🎯</span>
                                    How Topic Interviews Work
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold mt-0.5">1</div>
                                        <div>
                                            <p className="font-medium text-white text-sm mb-0.5">Choose Your Topic</p>
                                            <p className="text-xs">Select from curated topics or create your own</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold mt-0.5">2</div>
                                        <div>
                                            <p className="font-medium text-white text-sm mb-0.5">Upload Resources</p>
                                            <p className="text-xs">Provide PDFs, papers, or documentation links</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold mt-0.5">3</div>
                                        <div>
                                            <p className="font-medium text-white text-sm mb-0.5">AI Analysis</p>
                                            <p className="text-xs">AI generates contextual questions from your resources</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold mt-0.5">4</div>
                                        <div>
                                            <p className="font-medium text-white text-sm mb-0.5">Get Feedback</p>
                                            <p className="text-xs">Receive intelligent follow-ups and detailed insights</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Mobile Menu Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 z-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>

            {/* Create Topic Dialog */}
            <CreateTopicDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div>
    );
};

export default TopicInterview;
