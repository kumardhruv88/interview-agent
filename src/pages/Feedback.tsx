import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Groq from "groq-sdk";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft,
  Trophy,
  Target,
  Brain,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
  FileText,
  Download,
  Activity,
  Zap,
  Volume2
} from "lucide-react";
import { jsPDF } from "jspdf";

// Initialize Groq
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

interface Interview {
  id: string;
  jobPosition: string;
  jobDescription: string;
  yearsOfExperience: string;
  createdAt: string;
  questions: string[];
  answers?: string[];
  score?: number;
  resumeContent?: string;
  transcript?: { role: string; content: string }[];
  analysis?: AnalysisResult;
  // Topic interview fields
  isTopicInterview?: boolean;
  topicName?: string;
  topicId?: string;
  description?: string;
  duration?: number;
  completedAt?: string;
}

interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  communicationFeedback: string;
  behavioralFeedback: string;
  overallAnalysis: string;
  confidenceScore?: number;
  clarityScore?: number;
  pace?: string;
  fillerWords?: string[];
  fillerWordCount?: number;
}

const CircularMeter = ({ score, color, label, icon: Icon }: { score: number; color: string; label: string; icon: any }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          />
        </svg>
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Icon className="w-3 h-3 mb-0.5 opacity-80" />
          <span className="text-xs font-bold">{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
};

const GlassCard = ({
  title,
  icon: Icon,
  gradient,
  children,
  className = "",
  delay = 0
}: {
  title: string;
  icon?: any;
  gradient: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <div
    className={`relative group h-full opacity-0 animate-fade-in-up ${className}`}
    style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
  >
    {/* Animated Gradient Border Layer */}
    <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${gradient} opacity-30 blur-[2px] group-hover:opacity-100 transition-opacity duration-500`} />

    {/* Ambient Outer Glow */}
    <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-r ${gradient} opacity-0 blur-xl group-hover:opacity-10 transition-opacity duration-700`} />

    {/* Glass Content Container */}
    <div className="relative h-full flex flex-col bg-[#050505]/95 backdrop-blur-3xl rounded-2xl border border-white/10 p-4 overflow-hidden transition-transform duration-500 group-hover:-translate-y-1">

      {/* Subtle Inner Highlight Reflected from Gradient */}
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r ${gradient} opacity-20`} />

      {/* Header - Extremely Compact */}
      <div className="flex items-center gap-3 mb-2 relative z-10">
        {Icon && (
          <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-sm`} />
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
      </div>

      {/* Content - Dense & Scannable */}
      <div className="relative z-10 flex-1 text-gray-400 leading-snug text-xs flex flex-col">
        {children}
      </div>
    </div>
  </div>
);

const Feedback = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInterview = async () => {
      // Check if this is a topic interview feedback (route includes topic-interview)
      const isTopicFeedback = window.location.pathname.includes('/topic-interview');

      if (isTopicFeedback) {
        // Load topic interview
        const savedTopicInterviews = localStorage.getItem("topic_interviews");
        if (savedTopicInterviews) {
          const topicInterviews = JSON.parse(savedTopicInterviews);
          const found = topicInterviews.find((i: any) => i.id === id);

          if (found) {
            setInterview(found);

            if (found.analysis) {
              setAnalysis(found.analysis);
              setLoading(false);
            } else if (found.transcript && found.transcript.length > 0) {
              generateFeedback(found);
            } else {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        // Load regular interview
        // Check if user is logged in
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
              // Map DB fields to Frontend Interface
              const mappedInterview: Interview = {
                id: data.id,
                jobPosition: data.job_position,
                jobDescription: data.job_description,
                yearsOfExperience: data.years_of_experience,
                createdAt: data.created_at,
                questions: data.questions || [],
                score: data.score,
                transcript: data.transcript,
                resumeContent: data.resume_content,
                analysis: data.analysis
              };

              setInterview(mappedInterview);

              // Check if analysis already exists
              if (mappedInterview.analysis) {
                setAnalysis(mappedInterview.analysis);
                setLoading(false);
              } else if (mappedInterview.transcript && mappedInterview.transcript.length > 0) {
                generateFeedback(mappedInterview);
              } else {
                setLoading(false);
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
          if (saved) {
            const interviews: Interview[] = JSON.parse(saved);
            const found = interviews.find((i) => i.id === id);

            if (found) {
              setInterview(found);

              // Check if analysis already exists
              if (found.analysis) {
                setAnalysis(found.analysis);
                setLoading(false);
              } else if (found.transcript && found.transcript.length > 0) {
                generateFeedback(found);
              } else if (found.answers && found.answers.length > 0) {
                generateFeedback(found); // Try anyway for text inputs
              } else {
                setLoading(false); // No data to analyze
              }
            } else {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      }
    };

    loadInterview();
  }, [id, user]);

  const generateFeedback = async (interviewData: Interview) => {
    if (!GROQ_API_KEY) {
      toast({ variant: "destructive", title: "Missing API Key", description: "Please add VITE_GROQ_API_KEY to your .env file." });
      setLoading(false);
      return;
    }

    try {
      let transcriptText = "";
      if (interviewData.transcript) {
        transcriptText = interviewData.transcript.map(t => `${t.role}: ${t.content}`).join("\n");
      } else {
        // Fallback construct from questions/answers
        transcriptText = interviewData.questions.map((q, i) => `Interviewer: ${q}\nCandidate: ${interviewData.answers?.[i] || "No answer"}`).join("\n");
      }

      // Different prompts for topic vs regular interviews
      const systemPrompt = interviewData.isTopicInterview
        ? `You are an expert technical interviewer. Analyze the provided interview transcript for a ${interviewData.topicName} topic interview.
          
          Topic: ${interviewData.topicName}
          Duration: ${interviewData.duration || 15} minutes
          Description: ${interviewData.description || "General knowledge interview"}
          
          Provide a detailed JSON analysis with the following fields:
          - score: number (0-100)
          - strengths: string[] (top 3 things they understood well)
          - weaknesses: string[] (top 3 areas of confusion)
          - skillGaps: string[] (specific topic concepts they should study more, max 5)
          - communicationFeedback: string (concise analysis, max 2 sentences)
          - behavioralFeedback: string (confidence, engagement level, max 2 sentences)
          - overallAnalysis: string (topic knowledge summary, max 2 sentences)
          - confidenceScore: number (0-100, based on how confidently they answered)
          - clarityScore: number (0-100, based on answer clarity)
          - pace: string (e.g., "Fast", "Normal", "Slow")
          - fillerWords: string[] (e.g., "um", "ah", "like")
          - fillerWordCount: number
          
          IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, just raw JSON.`
        : `You are an expert technical interviewer. Analyze the provided interview transcript for a ${interviewData.jobPosition} role.
          
          Candidate Experience: ${interviewData.yearsOfExperience} years.
          Job Description: ${interviewData.jobDescription}
          Resume Context: ${interviewData.resumeContent || "Not provided"}
          
          Provide a detailed JSON analysis with the following fields:
          - score: number (0-100)
          - strengths: string[] (top 3)
          - weaknesses: string[] (top 3)
          - skillGaps: string[] (technical skills missing/weak, max 5)
          - communicationFeedback: string (concise analysis, max 2 sentences)
          - behavioralFeedback: string (analysis of behavioral traits, max 2 sentences)
          - overallAnalysis: string (concise summary, max 2 sentences)
          - confidenceScore: number (0-100, infer from tone/language)
          - clarityScore: number (0-100, infer from structure)
          - pace: string (e.g., "Fast", "Normal", "Slow")
          - fillerWords: string[] (e.g., "um", "ah", "like")
          - fillerWordCount: number

          IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, just raw JSON.`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the transcript: \n${transcriptText} ` }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, // Low temp for consistent JSON
        response_format: { type: "json_object" }
      });

      const text = completion.choices[0]?.message?.content || "{}";

      // Clean/Parse JSON (Handle potential markdown wrappers)
      const jsonStr = text.replace(/```json | ```/g, "").trim();

      let analysisData: AnalysisResult;
      try {
        analysisData = JSON.parse(jsonStr);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        // Fallback dummy data if parse fails to avoid crash
        analysisData = {
          score: 0,
          strengths: ["Could not parse analysis"],
          weaknesses: ["Try again"],
          skillGaps: [],
          communicationFeedback: "Error parsing AI response.",
          behavioralFeedback: "Error parsing AI response.",
          overallAnalysis: "The AI generated a response but it was not in valid JSON format."
        };
      }

      setAnalysis(analysisData);

      // Save analysis back to storage
      if (user) {
        // Logged-in user: Save to Supabase
        try {
          await supabase
            .from('interviews')
            .update({ analysis: analysisData })
            .eq('id', interviewData.id)
            .eq('user_id', user.id);
        } catch (err) {
          console.error("Error saving analysis to Supabase:", err);
        }
      } else {
        // Guest user: Save to localStorage
        const saved = localStorage.getItem("interviews");
        if (saved) {
          const interviews: Interview[] = JSON.parse(saved);
          const index = interviews.findIndex(i => i.id === interviewData.id);
          if (index !== -1) {
            interviews[index].analysis = analysisData;
            localStorage.setItem("interviews", JSON.stringify(interviews));
          }
        }
      }

      setLoading(false);

    } catch (error: any) {
      console.error("Groq Error:", error);
      let msg = "Could not generate AI feedback.";
      if (error && error.message) msg = error.message;
      toast({ variant: "destructive", title: "Analysis Failed", description: msg });
      setLoading(false);
    }
  };

  const getProcessedTranscript = () => {
    if (!interview?.transcript) return [];

    // Merge consecutive messages with same role (for legacy data)
    const processed: { role: string; content: string }[] = [];
    interview.transcript.forEach((msg) => {
      if (processed.length > 0 && processed[processed.length - 1].role === msg.role) {
        processed[processed.length - 1].content += " " + msg.content;
      } else {
        processed.push({ ...msg });
      }
    });
    return processed;
  };

  const downloadPDF = () => {
    if (!interview || !analysis) return;

    const doc = new jsPDF();
    const transcriptData = getProcessedTranscript();

    // Title
    doc.setFontSize(20);
    doc.text(`Interview Report: ${interview.jobPosition} `, 20, 20);

    doc.setFontSize(12);
    doc.text(`Experience: ${interview.yearsOfExperience} Years`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()} `, 20, 36);
    doc.text(`Overall Score: ${analysis.score}/100`, 20, 42);

    // Analysis Summary
    doc.setFontSize(14);
    doc.text("Analysis Summary", 20, 55);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(analysis.overallAnalysis, 170);
    doc.text(summaryLines, 20, 62);

    let yPos = 62 + (summaryLines.length * 5) + 10;

    // Transcript
    doc.setFontSize(14);
    doc.text("Full Transcript", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    transcriptData.forEach((msg) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${msg.role}:`, 20, yPos);
      yPos += 5;

      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(msg.content, 170);
      doc.text(lines, 20, yPos);
      yPos += (lines.length * 5) + 5;
    });

    doc.save(`${interview.jobPosition.replace(/\s+/g, '_')}_Transcript.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <p className="text-gray-400 animate-pulse">Analyzing interview conversation...</p>
      </div>
    );
  }

  if (!interview || !analysis) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p className="text-gray-400">No interview data or analysis found.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-10 overflow-x-hidden selection:bg-purple-500/30">
      <Navbar />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <main className="container mx-auto px-4 pt-20 relative z-10 space-y-4">
        {/* Header Section - Minimized */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div>
            <Link to={user ? "/user-dashboard" : "/dashboard"} className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors group mb-1">
              <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Dashboard
            </Link>
            <div className="flex items-baseline gap-3">
              <h1 className="text-xl font-bold text-white">
                Performance Analysis
              </h1>
              <span className="text-xs text-gray-400 border-l border-white/20 pl-3">
                {interview.jobPosition}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[10px] border-white/10 bg-white/5 hover:bg-white/10 text-white" onClick={downloadPDF}>
            <Download className="w-3 h-3 mr-2" /> PDF Report
          </Button>
        </div>

        {/* Dense 3-Column Grid for All 6 Aspects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">

          {/* 1. Overall Score - Compact */}
          <GlassCard
            title="Overall Score"
            icon={Trophy}
            gradient="from-purple-500 via-blue-500 to-cyan-500"
            delay={0.1}
          >
            <div className="flex flex-row items-center justify-between h-full gap-3">
              <div className="flex-1 flex flex-col justify-center gap-2">
                <p className="text-gray-400 text-xs line-clamp-3 leading-4">{analysis.overallAnalysis}</p>
                <Badge className={`${analysis.score >= 70 ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'} w-fit px-2 py-0 text-[10px]`}>
                  {analysis.score >= 70 ? 'Ready' : 'Needs Work'}
                </Badge>
              </div>

              {/* Score Indicator - Micro */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 opacity-20" />
                <div className="absolute inset-[2px] rounded-full bg-black z-10" />
                <div className="relative z-20 text-center">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                    {analysis.score}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 2. Key Strengths */}
          <GlassCard title="Strengths" icon={CheckCircle} gradient="from-green-400 via-emerald-500 to-teal-500" delay={0.2}>
            <ul className="space-y-2 h-full justify-center flex flex-col">
              {(analysis.strengths || []).slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs group/item leading-tight">
                  <div className="mt-0.5 w-1 h-1 rounded-full bg-green-400 shadow-[0_0_5px_theme(colors.green.400)] shrink-0" />
                  <span className="group-hover/item:text-white transition-colors line-clamp-2">{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* 3. Weaknesses */}
          <GlassCard title="Weaknesses" icon={AlertTriangle} gradient="from-red-500 via-rose-500 to-pink-600" delay={0.3}>
            <ul className="space-y-2 h-full justify-center flex flex-col">
              {(analysis.weaknesses || []).slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs group/item leading-tight">
                  <div className="mt-0.5 w-1 h-1 rounded-full bg-red-400 shadow-[0_0_5px_theme(colors.red.400)] shrink-0" />
                  <span className="group-hover/item:text-white transition-colors line-clamp-2">{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* 4. Communication */}
          <GlassCard title="Communication" icon={MessageSquare} gradient="from-blue-400 via-cyan-400 to-teal-400" delay={0.4}>
            <div className="h-full flex flex-col gap-4">
              <div className="flex flex-row justify-around">
                <CircularMeter score={analysis.confidenceScore || 0} label="Confidence" color="#a855f7" icon={Zap} />
                <CircularMeter score={analysis.clarityScore || 0} label="Clarity" color="#22c55e" icon={Volume2} />
              </div>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 min-h-[2.5em]">{analysis.communicationFeedback}</p>
              {analysis.fillerWords && analysis.fillerWords.length > 0 && (
                <div className="text-[10px] text-gray-500">
                  Fillers detected: <span className="text-gray-400">{analysis.fillerWords.join(", ")}</span> ({analysis.fillerWordCount})
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full text-[10px] h-7 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 mt-auto" asChild>
                <Link to={`/communication-feedback/${id}`}>View Full Analysis <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
            </div>
          </GlassCard>

          {/* 5. Behavioral */}
          <GlassCard title="Behavioral" icon={Brain} gradient="from-fuchsia-500 via-purple-500 to-indigo-500" delay={0.5}>
            <div className="h-full flex flex-col justify-center">
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">{analysis.behavioralFeedback}</p>
            </div>
          </GlassCard>

          {/* 6. Skill Gaps */}
          <GlassCard title="Skill Gaps" icon={Target} gradient="from-yellow-400 via-orange-500 to-red-500" delay={0.6}>
            <div className="h-full flex flex-col justify-between">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(analysis.skillGaps || []).slice(0, 6).map((skill, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-yellow-500/5 text-yellow-200 border border-yellow-500/10 hover:bg-yellow-500/20 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
                {(!analysis.skillGaps || analysis.skillGaps.length === 0) && <p className="text-gray-500 text-xs">No critical gaps identified.</p>}
              </div>

              <Button variant="outline" size="sm" className="w-full text-[10px] h-7 bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400" asChild>
                <Link to={`/roadmap/${id}`}>View Learning Roadmap <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Full Transcript - Very Subtle & Compact */}
        <div className="pt-2">
          <div className="bg-[#050505]/50 border border-white/5 rounded-xl p-3">
            <button
              className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2"><FileText className="w-3 h-3" /> View Full Transcript</span>
              <span className="text-[10px] opacity-50">Scroll to view</span>
            </button>
            <div className="mt-3 max-h-[150px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {interview && interview.transcript ? (
                getProcessedTranscript().map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'AI' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[95%] rounded px-2 py-1.5 ${msg.role === 'AI'
                      ? 'bg-white/5 text-gray-400 text-xs border-l-2 border-white/10'
                      : 'bg-primary/10 text-primary-foreground text-xs border-r-2 border-primary/20 text-right'
                      }`}>
                      <span className="font-bold opacity-50 mr-2 text-[10px] uppercase">{msg.role}</span>
                      {msg.content}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-xs">No transcript available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 pb-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white px-6 h-8 text-xs"
            onClick={downloadPDF}
          >
            <Download className="w-3 h-3 mr-2" />
            Download Transcript
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-white text-black hover:bg-gray-200 px-6 font-semibold shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all hover:scale-105 h-8 text-xs"
            asChild
          >
            <Link to={`/interview/${id}/voice`}>Retake Interview</Link>
          </Button>
        </div>

      </main>
    </div>
  );
};

export default Feedback;
