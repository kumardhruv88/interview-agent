import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, CheckCircle, Clock, ExternalLink, Target, ChevronDown, ChevronRight, Sparkles, PlayCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
    type: "Article" | "Video" | "Course" | "Documentation";
    title: string;
    url: string;
}

interface RoadmapItem {
    skill: string;
    why: string; // 1-line summary
    whatToLearn: string;
    effort: string;
    resources: Resource[];
    status: "pending" | "in-progress" | "completed";
}

interface WeeklyPlan {
    weekTitle: string;
    focusArea: string;
    items: RoadmapItem[];
}

const RoadmapCard = ({ item }: { item: RoadmapItem }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <div className={`group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/10 ${isOpen ? 'bg-white/10 border-white/10' : ''}`}>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                    <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-base font-semibold text-white tracking-wide group-hover:text-yellow-400 transition-colors">
                                {item.skill}
                            </h3>
                            <div className="flex items-center gap-3 shrink-0">
                                <Badge variant="secondary" className="bg-white/5 text-xs text-gray-400 border-white/10 font-normal hover:bg-white/10">
                                    <Clock className="w-3 h-3 mr-1" /> {item.effort}
                                </Badge>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                            </div>
                        </div>
                        <p className="text-xs font-medium text-yellow-500/80 uppercase tracking-wider truncate max-w-[90%]">
                            {item.why}
                        </p>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Divider */}
                        <div className="h-px w-full bg-white/5" />

                        {/* Learning Objectives */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Target className="w-3 h-3 text-purple-400" />
                                What to Learn
                            </div>
                            <div className="flex flex-wrap gap-2 pl-5">
                                {item.whatToLearn.split(',').map((point, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
                                        {point.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <BookOpen className="w-3 h-3 text-blue-400" />
                                Resources
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
                                {item.resources.map((res, rIdx) => (
                                    <a
                                        key={rIdx}
                                        href={res.url !== '#' ? res.url : `https://www.google.com/search?q=${encodeURIComponent(item.skill + " " + res.title)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group/link"
                                    >
                                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${res.type === 'Video' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {res.type === 'Video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-300 truncate group-hover/link:text-white transition-colors">
                                                {res.title}
                                            </p>
                                            <p className="text-[10px] text-gray-600 truncate">
                                                {res.type}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-gray-600 group-hover/link:text-white opacity-0 group-hover/link:opacity-100 transition-all" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
};

const LearningRoadmap = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [roadmap, setRoadmap] = useState<WeeklyPlan[]>([]);
    const [interviewData, setInterviewData] = useState<any>(null);

    useEffect(() => {
        fetchInterviewAndGenerateRoadmap();
    }, [id, user]);

    const fetchInterviewAndGenerateRoadmap = async () => {
        if (user) {
            // Logged-in user: Fetch from Supabase
            try {
                const { data, error } = await supabase
                    .from('interviews')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    const interview = {
                        id: data.id,
                        jobPosition: data.job_position,
                        jobDescription: data.job_description,
                        yearsOfExperience: data.years_of_experience,
                        resumeContent: data.resume_content,
                        analysis: data.analysis
                    };
                    setInterviewData(interview);

                    // Check if roadmap exists in Supabase
                    if (data.learning_roadmap) {
                        setRoadmap(data.learning_roadmap);
                        setLoading(false);
                    } else {
                        await generateRoadmap(interview);
                    }
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching interview from Supabase:", err);
                toast({ variant: "destructive", title: "Error", description: "Could not load interview data." });
                setLoading(false);
            }
        } else {
            // Guest user: Load from localStorage
            const saved = localStorage.getItem("interviews");
            if (!saved) {
                setLoading(false);
                return;
            }
            const interviews = JSON.parse(saved);
            const interview = interviews.find((i: any) => i.id === id);

            if (interview) {
                setInterviewData(interview);
                // Check if we already have a saved roadmap for this interview in localStorage to save API calls
                const savedRoadmap = localStorage.getItem(`roadmap_${id}`);
                if (savedRoadmap) {
                    setRoadmap(JSON.parse(savedRoadmap));
                    setLoading(false);
                } else {
                    await generateRoadmap(interview);
                }
            } else {
                setLoading(false);
            }
        }
    };

    const generateRoadmap = async (interview: any) => {
        const prompt = `
        You are an expert Technical Career Coach. Create a 3-Week Personalized Learning Roadmap for a candidate who just finished an interview for a ${interview.jobPosition}.
        
        CONTEXT:
        Job Description:, ${interview.jobDescription.substring(0, 500)}...
        Resume Context: ${interview.resumeContent ? interview.resumeContent.substring(0, 500) + "..." : "Not provided"}
        
        GOAL:
        Identify the likely weak areas based on the JD and Resume gaps (inference) and create a concrete action plan.
        
        CRITICAL UX RULES:
        - KEEP IT SHORT. No long paragraphs.
        - The "Why" field must be a SINGLE line (max 5-7 words), e.g., "Critical gap in JD", "Required for Senior Role".
        - "whatToLearn" should be comma-separated keywords, e.g., "React Hooks, Context API, Redux".
        
        REQUIREMENTS:
        - Split into Week 1, Week 2, Week 3.
        - Each week should have 2-3 key skills/topics to focus on.
        - **RESOURCE RECOMMENDATIONS**:
          - Prioritize high-quality, free resources (CampusX, Krish Naik, FreeCodeCamp).
        
        Output JSON ONLY:
        [
            {
                "weekTitle": "Week 1: Foundations",
                "focusArea": "Core Concepts",
                "items": [
                    {
                        "skill": "Topic Name",
                        "why": "Brief 5-word reason",
                        "whatToLearn": "Keyword 1, Keyword 2, Keyword 3",
                        "effort": "2-3 hours",
                        "status": "pending",
                        "resources": [
                            { "type": "Video", "title": "Channel Name - Topic", "url": "#" }
                        ]
                    }
                ]
            }
        ]
      `;

        try {
            const { generateGroqResponse } = await import('@/utils/groq');
            const text = await generateGroqResponse(prompt);

            // Clean/Parse JSON
            const jsonStr = text.replace(/```json|```/g, "").trim();
            const parsedData = JSON.parse(jsonStr);

            // Handle both object wrapper or direct array
            const weeks = parsedData.weeks || parsedData.roadmap || parsedData || [];
            // Ensure it's an array
            const finalMap = Array.isArray(weeks) ? weeks : [];

            setRoadmap(finalMap);

            // Save to appropriate storage
            if (user) {
                // Logged-in user: Save to Supabase
                try {
                    await supabase
                        .from('interviews')
                        .update({ learning_roadmap: finalMap })
                        .eq('id', id)
                        .eq('user_id', user.id);
                } catch (err) {
                    console.error("Error saving roadmap to Supabase:", err);
                }
            } else {
                // Guest user: Save to localStorage
                localStorage.setItem(`roadmap_${id}`, JSON.stringify(finalMap)); // Cache it
            }
        } catch (e) {
            console.error("Roadmap generation failed", e);
            toast({ variant: "destructive", title: "Could not generate roadmap" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
                <p className="text-gray-400 animate-pulse">Designing your personalized curriculum...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-yellow-500/30">
            <Navbar />

            <div className="max-w-3xl mx-auto pt-20">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 mb-4" asChild>
                        <Link to={`/feedback/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Analysis</Link>
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-orange-400 to-red-500 mb-2">
                        Learning Roadmap
                    </h1>
                    <p className="text-gray-400">
                        Tailored 3-week plan for <span className="text-white font-medium">{interviewData?.jobPosition}</span> roles.
                    </p>
                </div>

                {/* Timeline */}
                <div className="space-y-10 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-white/5 hidden md:block" />

                    {roadmap.map((week, weekIdx) => (
                        <div key={weekIdx} className="relative md:pl-10">
                            {/* Timeline Node */}
                            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center z-10 hidden md:flex">
                                <span className="text-[10px] font-bold text-gray-500">{weekIdx + 1}</span>
                            </div>

                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span className="md:hidden text-yellow-500 mr-2">W{weekIdx + 1}</span>
                                    {week.weekTitle}
                                </h2>
                                <p className="text-yellow-500/60 font-medium text-xs uppercase tracking-widest mt-1">{week.focusArea}</p>
                            </div>

                            <div className="grid gap-3">
                                {week.items.map((item, itemIdx) => (
                                    <RoadmapCard key={itemIdx} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-8 font-bold" asChild>
                        <Link to={`/interview/${id}/voice`}>Retake Interview</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
export default LearningRoadmap;
