
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { AnalysisResult } from "@/components/resume/AnalysisResult";
import { LiveDemoResults } from "@/components/resume/LiveDemoResults";
import { analyzeResumeGap, SkillGapAnalysis } from "@/utils/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, Upload, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResumeAnalysis = () => {
    const location = useLocation();
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [transcriptText, setTranscriptText] = useState("");

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<SkillGapAnalysis | null>(null);
    const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);

    const { toast } = useToast();

    // Check if we are in "Feedback Mode" (came from post-interview)
    const isFeedbackMode = !!location.state?.transcriptText;

    const [interviewId, setInterviewId] = useState<string | null>(null);

    useEffect(() => {
        if (location.state) {
            if (location.state.resumeText) setResumeText(location.state.resumeText);
            if (location.state.jobDescription) setJobDescription(location.state.jobDescription);
            if (location.state.transcriptText) setTranscriptText(location.state.transcriptText);
            if (location.state.interviewId) setInterviewId(location.state.interviewId);
        }
    }, [location.state]);

    // Check for existing analysis on load
    useEffect(() => {
        const checkExisting = async () => {
            if (!interviewId) return;

            // 1. Check LocalStorage
            const saved = localStorage.getItem("interviews");
            if (saved) {
                const interviews = JSON.parse(saved);
                const interview = interviews.find((i: any) => i.id === interviewId);
                if (interview && interview.resumeAnalysis) {
                    setResult(interview.resumeAnalysis);
                    setHasAutoAnalyzed(true);
                    return;
                }
            }

            // 2. Check Supabase (if needed)
            // ... (Simple implementation: assume if it's not in local state passed or local storage, we regenerate)
        };
        checkExisting();
    }, [interviewId]);

    // Auto-analyze effect
    useEffect(() => {
        if (isFeedbackMode && resumeText && jobDescription && !hasAutoAnalyzed && !isAnalyzing && !result) {
            handleAnalyze();
            setHasAutoAnalyzed(true);
        }
    }, [isFeedbackMode, resumeText, jobDescription, hasAutoAnalyzed, isAnalyzing, result]);

    const saveResultToStorage = async (analysisResult: SkillGapAnalysis) => {
        if (!interviewId) return;

        // 1. LocalStorage
        const saved = localStorage.getItem("interviews");
        if (saved) {
            const interviews = JSON.parse(saved);
            const index = interviews.findIndex((i: any) => i.id === interviewId);
            if (index !== -1) {
                interviews[index].resumeAnalysis = analysisResult;
                localStorage.setItem("interviews", JSON.stringify(interviews));
            }
        }

        // 2. Supabase
        try {
            await supabase
                .from('interviews')
                .update({ resume_analysis: analysisResult })
                .eq('id', interviewId);
        } catch (e) {
            console.error("Supabase Save Error", e);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText) {
            toast({
                variant: "destructive",
                title: "Missing Resume",
                description: "Please upload your resume PDF first.",
            });
            return;
        }
        if (!jobDescription.trim()) {
            toast({
                variant: "destructive",
                title: "Missing Job Description",
                description: "Please paste the Job Description to compare against.",
            });
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        try {
            const data = await analyzeResumeGap(resumeText, jobDescription, transcriptText);
            setResult(data);

            // Save if part of an interview flow
            if (isFeedbackMode && interviewId) {
                saveResultToStorage(data);
            }

            if (!isFeedbackMode) {
                toast({
                    title: "Analysis Complete",
                    description: "Check your match score and gaps below.",
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: error.message || "Something went wrong during AI analysis.",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Resume Skill Gap Analyzer
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {isFeedbackMode
                            ? "Analyzing your resume against the job description based on your interview performance..."
                            : "Upload your resume and paste a Job Description to get an ATS-style score and actionable feedback."
                        }
                    </p>
                </div>

                {/* Only show inputs if NOT in feedback mode */}
                {!isFeedbackMode && (
                    <>
                        {/* Compact Input Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-5xl mx-auto">
                            {/* Resume Upload Card */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Upload Resume</h3>
                                            <p className="text-xs text-muted-foreground">PDF format</p>
                                        </div>
                                    </div>
                                    <ResumeUploader onResumeConverted={setResumeText} />
                                    {resumeText && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Extracted {resumeText.length} characters
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Job Description Card */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Job Description</h3>
                                            <p className="text-xs text-muted-foreground">Paste JD text</p>
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Paste the complete Job Description here..."
                                        className="min-h-[160px] bg-black/20 border-white/10 resize-none focus:border-blue-500/50"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <div className="flex justify-center mb-16">
                            <Button
                                size="lg"
                                className="px-12 py-6 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !resumeText || !jobDescription}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze Match <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Live Demo Section - Only show when no results */}
                        {!result && !isAnalyzing && (
                            <LiveDemoResults />
                        )}
                    </>
                )}

                {/* Loading State for Feedback Mode */}
                {isFeedbackMode && isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-lg text-muted-foreground animate-pulse">
                            Triangulating Resume, JD, and Interview Transcript...
                        </p>
                    </div>
                )}

                {/* Results Area */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <AnalysisResult result={result} />
                        {isFeedbackMode && (
                            <div className="flex justify-center mt-8">
                                <Button variant="outline" onClick={() => window.history.back()}>
                                    Back to Feedback
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ResumeAnalysis;
