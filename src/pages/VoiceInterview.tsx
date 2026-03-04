import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Mic, PhoneOff, ChevronLeft, Video, VideoOff, ArrowRight, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || "6972a6c2-16f4-46ea-982a-3551b3bcc4b9";
// ------------------------------------------------------------------

const vapi = new Vapi(VAPI_PUBLIC_KEY);

interface Interview {
    id: string;
    jobPosition: string;
    jobDescription: string;
    yearsOfExperience: string;
    resumeName?: string;
    resumeContent?: string;
    transcript?: { role: string; content: string }[];
}

const VoiceInterview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();

    const [interview, setInterview] = useState<Interview | null>(null);
    const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "speaking" | "listening" | "completed">("idle");
    const [activeVolume, setActiveVolume] = useState(0);
    const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([]);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [viewMode, setViewMode] = useState<"split" | "zoom">("split"); // New state for view mode

    const transcriptRef = useRef<{ role: string; content: string }[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef<Date | null>(null); // Track interview start time

    useEffect(() => {
        // Check if this is a topic-based interview
        const state = location.state as any;
        if (state?.topicMode) {
            // Create mock interview object from topic data
            const topicInterview: Interview = {
                id: state.topicId || id || '',
                jobPosition: `${state.topicName} Topic Interview`,
                jobDescription: state.description || `Interview focused on ${state.topicName}`,
                yearsOfExperience: state.duration?.toString() || '15',
                resumeName: undefined,
                resumeContent: undefined
            };
            setInterview(topicInterview);
        } else {
            // Regular interview - load from localStorage
            const saved = localStorage.getItem("interviews");
            if (saved) {
                const interviews: Interview[] = JSON.parse(saved);
                const found = interviews.find((i) => i.id === id);
                if (found) setInterview(found);
            }
        }

        vapi.on("call-start", () => setStatus("connected"));
        vapi.on("call-end", () => handleCallEnd());
        vapi.on("speech-start", () => setStatus("listening"));
        vapi.on("speech-end", () => setStatus("connected"));
        vapi.on("volume-level", (level) => setActiveVolume(level));

        vapi.on("message", (message: any) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const role = message.role === "assistant" ? "AI" : "Candidate";
                const content = message.transcript;

                setTranscript(prev => {
                    // Check if last message has same role to merge
                    if (prev.length > 0 && prev[prev.length - 1].role === role) {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                            ...updated[updated.length - 1],
                            content: updated[updated.length - 1].content + " " + content
                        };
                        transcriptRef.current = updated;
                        return updated;
                    }

                    // Else add new entry
                    const updated = [...prev, { role, content }];
                    transcriptRef.current = updated;
                    return updated;
                });
            }
        });

        vapi.on("error", (error) => {
            console.error("Vapi Error:", error);
            setStatus("idle");
            toast({
                variant: "destructive",
                title: "Connection Error",
                description: error.message || "Failed to connect to the voice agent.",
            });
        });

        return () => {
            stopCamera();
        };
    }, [id, toast]);

    // Attach stream to video element when it mounts
    useEffect(() => {
        if (cameraEnabled && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [cameraEnabled]);

    const toggleCamera = async () => {
        if (cameraEnabled) {
            stopCamera();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                setCameraEnabled(true);
            } catch (err) {
                console.error("Camera Error:", err);
                toast({ variant: "destructive", title: "Camera Failed", description: "Could not access webcam." });
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraEnabled(false);
    };

    const handleCallEnd = async () => {
        const state = location.state as any;

        if (state?.topicMode) {
            // Save topic interview separately
            const topicInterview = {
                id: id || state.topicId,
                topicName: state.topicName,
                topicId: state.topicId,
                description: state.description,
                duration: state.duration,
                transcript: transcriptRef.current,
                completedAt: new Date().toISOString(),
                isTopicInterview: true
            };

            // Save to localStorage for reports and feedback
            const savedTopicInterviews = localStorage.getItem("topic_interviews");
            const topicInterviews = savedTopicInterviews ? JSON.parse(savedTopicInterviews) : [];
            topicInterviews.push(topicInterview);
            localStorage.setItem("topic_interviews", JSON.stringify(topicInterviews));
        } else {
            // Regular interview - update transcript and duration
            // Calculate duration in minutes
            const durationMinutes = startTimeRef.current
                ? Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 60000)
                : 0;

            if (user) {
                // Logged-in user: Update Supabase
                try {
                    await supabase
                        .from('interviews')
                        .update({
                            transcript: transcriptRef.current,
                            duration_minutes: durationMinutes,
                            completed_at: new Date().toISOString()
                        })
                        .eq('id', id)
                        .eq('user_id', user.id);
                } catch (err) {
                    console.error("Error updating transcript in Supabase:", err);
                }
            } else {
                // Guest user: Update localStorage
                const saved = localStorage.getItem("interviews");
                if (saved && id) {
                    const interviews: Interview[] = JSON.parse(saved);
                    const updatedInterviews = interviews.map(i => {
                        if (i.id === id) {
                            return {
                                ...i,
                                transcript: transcriptRef.current,
                                durationMinutes: durationMinutes,
                                completedAt: new Date().toISOString()
                            };
                        }
                        return i;
                    });
                    localStorage.setItem("interviews", JSON.stringify(updatedInterviews));
                }
            }
        }
        setStatus("completed");
    };

    const startCall = async () => {
        if (!interview) return;
        setStatus("connecting");

        // Record start time
        startTimeRef.current = new Date();
        setTranscript([]);
        transcriptRef.current = [];

        // Dynamic System Prompt with Context
        const systemPrompt = `You are an expert technical interviewer for a ${interview.jobPosition} role.
        
        CONTEXT:
        - Job Description: ${interview.jobDescription}
        - Candidate Experience: ${interview.yearsOfExperience} years
        - Resume Content: ${interview.resumeContent || "Not provided"}

        INSTRUCTIONS:
        - Conduct a professional, human-like interview.
        - Start by briefly introducing yourself and asking the first relevant question based on the resume/JD.
        - Dig deeper into their experience. If they mention a project, ask technical details about it.
        - Keep responses concise (1-2 sentences) to keep the conversation flowing naturally.
        - Be encouraging but rigorous.`;

        try {
            await vapi.start({
                model: {
                    provider: "openai",
                    model: "gpt-4", // High quality for reasoning
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        }
                    ]
                },
                transcriber: {
                    provider: "deepgram",
                    model: "nova-2",
                    language: "en-US"
                },
                voice: {
                    provider: "11labs",
                    voiceId: "burt", // Professional male voice
                },
                name: `${interview.jobPosition} Interviewer`
            });

        } catch (err) {
            console.error("Failed to start:", err);
            setStatus("idle");
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: "Check console for details.",
            });
        }
    };

    const endCall = () => {
        vapi.stop();
    };

    if (!interview) return <div className="min-h-screen bg-black text-white p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 pt-24 flex flex-col items-center justify-center relative">

                {/* Background Ambient */}
                {!cameraEnabled && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
                )}

                <div className="relative z-10 w-full max-w-6xl space-y-6">

                    {/* Header Controls */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            className="text-white/50 hover:text-white"
                            onClick={() => navigate(location.state?.topicMode ? '/topic-interview' : `/interview/${id}`)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`border-purple-500/30 ${status === 'connecting' ? 'animate-pulse text-yellow-400' : status === 'completed' ? 'text-green-400' : 'text-purple-400'}`}>
                                {status === "idle" ? "Ready" : status === "connecting" ? "Connecting..." : status === "completed" ? "Finished" : "Live"}
                            </Badge>
                        </div>
                    </div>

                    {/* Main Visual Area - Conditional Layout */}
                    {viewMode === "zoom" && cameraEnabled ? (
                        /* ZOOM-STYLE FULL SCREEN VIDEO GRID */
                        <div className="relative w-full h-[calc(100vh-16rem)] bg-black rounded-3xl overflow-hidden border border-white/10">
                            {/* Grid Layout - 2 participants side by side */}
                            <div className="grid grid-cols-2 gap-2 h-full p-4">

                                {/* AI Interviewer Panel */}
                                <div className="relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                                    {/* Participant Label */}
                                    <div className="absolute top-4 left-4 z-20 bg-black/70 px-3 py-1 rounded-lg">
                                        <p className="text-sm font-medium text-white">AI Interviewer</p>
                                    </div>

                                    {/* Audio Indicator */}
                                    {status === "listening" && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-xs text-green-400">Speaking</span>
                                        </div>
                                    )}

                                    {/* AI Visual */}
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <div className={`absolute inset-0 rounded-full border border-white/10 ${status === "connected" || status === "listening" ? "animate-ping-slow opacity-30" : ""}`} />
                                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 blur-sm shadow-2xl flex items-center justify-center transition-all duration-300 ${status === "listening" ? "scale-110" : "scale-100"}`}>
                                            {status === "listening" ? (
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-4 bg-white animate-bounce delay-75" />
                                                    <div className="w-1 h-6 bg-white animate-bounce delay-150" />
                                                    <div className="w-1 h-4 bg-white animate-bounce delay-75" />
                                                </div>
                                            ) : (
                                                <Mic className="w-10 h-10 text-white" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* User Video Panel */}
                                <div className="relative bg-black rounded-2xl overflow-hidden border border-white/10">
                                    {/* Participant Label */}
                                    <div className="absolute top-4 left-4 z-20 bg-black/70 px-3 py-1 rounded-lg">
                                        <p className="text-sm font-medium text-white">You</p>
                                    </div>

                                    {/* Mic Status */}
                                    {status !== "idle" && (
                                        <div className="absolute top-4 right-4 z-20 bg-black/70 p-2 rounded-full">
                                            <Mic className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    {/* User Video */}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover transform scale-x-[-1]"
                                    />
                                </div>
                            </div>

                            {/* Zoom-style Bottom Bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                                <div className="flex items-center justify-between max-w-6xl mx-auto">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="border-white/20 text-white">
                                            {status === "idle" ? "Ready" : status === "connecting" ? "Connecting..." : status === "completed" ? "Finished" : "Live"}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Mic (Placeholder) */}
                                        <Button size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                                            <Mic className="w-5 h-5" />
                                        </Button>

                                        {/* Camera */}
                                        <Button
                                            size="icon"
                                            className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                            onClick={toggleCamera}
                                        >
                                            <Video className="w-5 h-5" />
                                        </Button>

                                        {/* View Mode Toggle */}
                                        <Button
                                            size="icon"
                                            className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                            onClick={() => setViewMode("split")}
                                            title="Switch to Split View"
                                        >
                                            <Minimize2 className="w-5 h-5" />
                                        </Button>

                                        {/* End Call */}
                                        <Button
                                            onClick={endCall}
                                            className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6"
                                        >
                                            <PhoneOff className="w-5 h-5 mr-2" />
                                            End Call
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ORIGINAL SPLIT-SCREEN MODE */
                        <>
                            <div className={`transition-all duration-500 w-full ${cameraEnabled ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex justify-center'}`}>

                                {/* 1. AI Agent Box */}
                                <div className={`relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center transition-all duration-500 ${cameraEnabled ? 'aspect-video w-full' : 'aspect-video w-full max-w-4xl'}`}>

                                    <div className="absolute top-4 left-4 z-20">
                                        <Badge className="bg-black/50 text-white/50 border-0 backdrop-blur-md">AI Interviewer</Badge>
                                    </div>

                                    {status === "completed" ? (
                                        <div className="text-center space-y-4 p-8">
                                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                                <ArrowRight className="w-8 h-8 text-green-400" />
                                            </div>
                                            <h2 className="text-2xl font-bold">Interview Completed</h2>
                                            <p className="text-white/60">Your feedback is ready.</p>
                                            <Button
                                                onClick={() => {
                                                    const state = location.state as any;
                                                    if (state?.topicMode) {
                                                        navigate(`/topic-interview/${id}/feedback`);
                                                    } else {
                                                        navigate(`/feedback/${id}`);
                                                    }
                                                }}
                                                className="bg-white text-black hover:bg-gray-200"
                                            >
                                                View Detailed Analysis
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full flex items-center justify-center p-12">
                                            <div className="relative w-48 h-48 flex items-center justify-center">
                                                <div className={`absolute inset-0 rounded-full border border-white/10 ${status === "connected" || status === "listening" ? "animate-ping-slow opacity-30" : ""} `} />
                                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 blur-[2px] shadow-glow flex items-center justify-center transition-all duration-300 ${status === "listening" ? "scale-110 shadow-purple-500/50" : "scale-100"}`}>
                                                    {status === "listening" ? (
                                                        <div className="flex gap-1">
                                                            <div className="w-1 h-4 bg-white animate-bounce delay-75" />
                                                            <div className="w-1 h-6 bg-white animate-bounce delay-150" />
                                                            <div className="w-1 h-4 bg-white animate-bounce delay-75" />
                                                        </div>
                                                    ) : (
                                                        <Mic className="w-8 h-8 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 2. User Box */}
                                {cameraEnabled && (
                                    <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center group">

                                        <div className="absolute top-4 left-4 z-20">
                                            <Badge className="bg-black/50 text-white/50 border-0 backdrop-blur-md">You</Badge>
                                        </div>

                                        {/* Overlay Toggle for quick access */}
                                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="rounded-full shadow-lg"
                                                onClick={toggleCamera}
                                                title="Turn Off Camera"
                                            >
                                                <VideoOff className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover transform scale-x-[-1]"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Persistent Bottom Controls (Only for Split View) */}
                    {viewMode === "split" && (
                        <div className="flex justify-center h-24 items-center gap-6 mt-4">
                            {status === "idle" ? (
                                <Button onClick={startCall} size="lg" className="px-8 rounded-full bg-white text-black hover:bg-gray-200 font-semibold text-lg hover:scale-105 transition-all shadow-glow">
                                    Start Interview
                                </Button>
                            ) : (
                                <div className="flex items-center gap-6 bg-white/5 px-8 py-3 rounded-full border border-white/10 backdrop-blur-md">

                                    {/* Mute/Unmute (Placeholder for now as Vapi handles this, but good UI) */}
                                    {/* <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 text-white hover:bg-white/10"><Mic className="w-5 h-5"/></Button> */}

                                    {/* Camera Toggle */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`rounded-full h-12 w-12 transition-all ${cameraEnabled ? 'bg-white text-black hover:bg-gray-200' : 'text-white hover:bg-white/10'}`}
                                        onClick={toggleCamera}
                                        title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
                                    >
                                        {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                    </Button>

                                    {/* Zoom View Toggle (only show when camera is enabled) */}
                                    {cameraEnabled && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="rounded-full h-12 w-12 text-white hover:bg-white/10"
                                            onClick={() => setViewMode("zoom")}
                                            title="Switch to Zoom View"
                                        >
                                            <Maximize2 className="w-5 h-5" />
                                        </Button>
                                    )}

                                    {/* End Call */}
                                    <Button onClick={endCall} size="lg" variant="destructive" className="h-12 px-6 rounded-full font-semibold hover:scale-105 transition-all shadow-red-500/20">
                                        <PhoneOff className="w-5 h-5 mr-2" />
                                        End Call
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default VoiceInterview;
