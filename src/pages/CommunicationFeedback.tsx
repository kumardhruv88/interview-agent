import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Activity, Zap, Volume2, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
// Initialize Groq

interface Metric {
    label: string;
    score: number; // 0-100
    status: "Excellent" | "Good" | "Fair" | "Poor";
    icon: any;
    color: string;
}

interface CommunicationAnalysis {
    confidenceScore: number;
    clarityScore: number;
    paceScore: number; // Inferred
    fillerWordCount: number;
    fillerWords: string[];
    observations: string[];
    improvementTips: string[];
}

const CircularMeter = ({ score, color, label, icon: Icon }: { score: number; color: string; label: string; icon: any }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-white/5"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Icon className="w-6 h-6 mb-1 opacity-80" />
                    <span className="text-2xl font-bold">{score}</span>
                </div>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        </div>
    );
};

const WaveformVisual = () => {
    // Simulated waveform bars
    return (
        <div className="flex items-center justify-center gap-1 h-16 w-full opacity-50">
            {Array.from({ length: 40 }).map((_, i) => (
                <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full animate-pulse"
                    style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.05}s`
                    }}
                />
            ))}
        </div>
    )
}

const CommunicationFeedback = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<CommunicationAnalysis | null>(null);
    const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([]);

    useEffect(() => {
        fetchInterviewAndAnalyze();
    }, [id, user]);

    const fetchInterviewAndAnalyze = async () => {
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
                    const transcript = data.transcript || [];
                    setTranscript(transcript);

                    // Check if communication analysis exists
                    if (data.communication_analysis) {
                        setAnalysis(data.communication_analysis);
                        setLoading(false);
                    } else {
                        // Generate analysis
                        const interviewData = {
                            id: data.id,
                            transcript: transcript,
                            communicationAnalysis: data.communication_analysis
                        };
                        await analyzeCommunication(interviewData);
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
                setTranscript(interview.transcript || []);

                // 1. Check if analysis already exists
                if (interview.communicationAnalysis) {
                    setAnalysis(interview.communicationAnalysis);
                    setLoading(false);
                } else {
                    // 2. If not, generate it
                    await analyzeCommunication(interview);
                }
            } else {
                setLoading(false);
            }
        }
    };

    const saveAnalysisToStorage = async (analysisData: CommunicationAnalysis) => {
        if (!id) return;

        if (user) {
            // Logged-in user: Save to Supabase
            try {
                await supabase
                    .from('interviews')
                    .update({ communication_analysis: analysisData })
                    .eq('id', id)
                    .eq('user_id', user.id);
            } catch (err) {
                console.error("Error saving communication analysis to Supabase:", err);
            }
        } else {
            // Guest user: Save to localStorage
            const saved = localStorage.getItem("interviews");
            if (saved) {
                const interviews = JSON.parse(saved);
                const index = interviews.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    interviews[index].communicationAnalysis = analysisData;
                    localStorage.setItem("interviews", JSON.stringify(interviews));
                }
            }
        }
    };

    const analyzeCommunication = async (interviewData: any) => {
        // Mocking or Using AI to infer metrics from text since we don't have raw audio

        try {
            const transcriptText = interviewData.transcript?.map((t: any) => `${t.role}: ${t.content}`).join('\n') || "";

            if (!transcriptText) {
                // Handle empty transcript case
                const emptyData: CommunicationAnalysis = {
                    confidenceScore: 0,
                    clarityScore: 0,
                    paceScore: 0,
                    fillerWordCount: 0,
                    fillerWords: [],
                    observations: ["No transcript available for analysis."],
                    improvementTips: ["Complete an interview to get feedback."]
                };
                setAnalysis(emptyData);
                saveAnalysisToStorage(emptyData);
                setLoading(false);
                return;
            }

            const prompt = `
            Analyze this interview transcript for Communication Skills & Confidence.
            Transcript: 
            ${transcriptText}

            Infer the following metrics based on the text (syntax, length, hesitation markers like '...', 'um', brief answers):
            1. Confidence Score (0-100)
            2. Clarity Score (0-100)
            3. Pace Score (0-100) - Infer from sentence length/complexity
            4. Detect filler words used (like 'umm', 'like', 'actually')
            
            Output JSON:
            {
                "confidenceScore": number,
                "clarityScore": number,
                "paceScore": number,
                "fillerWordCount": number,
                "fillerWords": ["word1"],
                "observations": ["observation 1", "observation 2"],
                "improvementTips": ["tip 1", "tip 2"]
            }
          `;

            const { generateGroqResponse } = await import('@/utils/groq');
            const text = await generateGroqResponse(prompt);

            // Robust JSON extraction
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim();

            let data;
            try {
                data = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error("JSON Parse failed", parseError);
                console.log("Raw text:", text);
                throw new Error("AI response was not valid JSON. Please try again.");
            }

            setAnalysis(data);
            saveAnalysisToStorage(data);

        } catch (e: any) {
            console.error("Analysis failed", e);
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: e.message || "Could not generate communication feedback."
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !analysis) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="animate-pulse text-gray-400">Analyzing voice patterns...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
            <Navbar />

            <div className="max-w-5xl mx-auto pt-20 space-y-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-gray-400 hover:text-white pl-0" asChild>
                        <Link to={`/feedback/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Summary</Link>
                    </Button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Communication & Confidence
                    </h1>
                </div>

                {/* Top Section: Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-50" />

                        <h2 className="text-lg font-semibold mb-8 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-400" />
                            Voice Signals Analysis
                        </h2>

                        <div className="flex flex-wrap justify-center md:justify-around gap-12">
                            <CircularMeter
                                score={analysis.confidenceScore}
                                label="Confidence"
                                color="#a855f7"
                                icon={Zap}
                            />
                            <CircularMeter
                                score={analysis.clarityScore}
                                label="Clarity"
                                color="#22c55e"
                                icon={Volume2}
                            />
                            <CircularMeter
                                score={analysis.paceScore}
                                label="Pacing"
                                color="#3b82f6"
                                icon={Activity}
                            />
                        </div>
                    </div>
                </div>

                {/* Waveform & Observations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Waveform Card */}
                    <Card className="bg-black/40 border-white/10 text-white backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Tone & Modulation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="h-32 bg-gradient-to-b from-white/5 to-transparent rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden">
                                <WaveformVisual />
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 uppercase">Detect Fillers</span>
                                    <div className="text-2xl font-bold text-red-400 mt-1">{analysis.fillerWordCount}</div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Words like "{analysis.fillerWords.join('", "')}" detected.
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 uppercase">Est. Speed</span>
                                    <div className="text-2xl font-bold text-blue-400 mt-1">Normal</div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Speaking pace is consistent.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Insights Card */}
                    <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                AI Analyst Impressions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-purple-200">Key Observations</h3>
                                <ul className="space-y-2">
                                    {analysis.observations.map((obs, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                            {obs}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-blue-200">Coaching Tips</h3>
                                <ul className="space-y-2">
                                    {analysis.improvementTips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CommunicationFeedback;
