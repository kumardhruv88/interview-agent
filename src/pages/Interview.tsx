import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Mic, Send, StopCircle, ArrowUp, ArrowLeft } from "lucide-react";
import Groq from "groq-sdk";
import { useToast } from "@/components/ui/use-toast";

// Initialize Groq
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

interface Interview {
  id: string;
  jobPosition: string;
  jobDescription: string;
  yearsOfExperience: string;
  questions: string[];
  resumeContent?: string;
  transcript?: { role: string; content: string }[];
}

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Speech Recognition Setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(prev => prev + " " + finalTranscript);
        }
      };
      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    const loadInterview = async () => {
      // 1. Try LocalStorage first (for guest users)
      const saved = localStorage.getItem("interviews");
      if (saved) {
        const interviews: Interview[] = JSON.parse(saved);
        const found = interviews.find((i) => i.id === id);
        if (found) {
          setInterview(found);
          if (messages.length === 0) initialGreeting(found);
          return;
        }
      }

      // 2. Try Supabase (for logged-in users)
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          // Map DB snake_case to frontend camelCase
          const found: Interview = {
            id: data.id,
            jobPosition: data.job_position,
            jobDescription: data.job_description,
            yearsOfExperience: data.years_of_experience,
            questions: data.questions || [],
            resumeContent: data.resume_content, // Make sure this column exists or ignore
            transcript: data.transcript
          };
          setInterview(found);

          // Reconstruct messages from transcript if available
          if (found.transcript && found.transcript.length > 0) {
            const hist = found.transcript.map((t: any, idx: number) => ({
              id: idx.toString(),
              role: t.role === 'AI' ? 'ai' : 'user',
              content: t.content,
              timestamp: new Date()
            }));
            setMessages(hist as Message[]);
          } else if (messages.length === 0) {
            initialGreeting(found);
          }
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load interview data."
        });
      }
    };

    if (id) {
      loadInterview();
    }
  }, [id]);

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
    setIsRecording(!isRecording);
  };

  const initialGreeting = async (interviewData: Interview) => {
    // Simulate AI typing delay for first message
    setIsGenerating(true);
    setTimeout(() => {
      const greeting = `Hello! I'm your AI interviewer for the ${interviewData.jobPosition} role. Let's get started. Tell me about yourself and your experience.`;
      setMessages([{
        id: "0",
        role: "ai",
        content: greeting,
        timestamp: new Date()
      }]);
      setIsGenerating(false);
    }, 1000);
  };

  const updateTranscriptInStorage = async (msgs: Message[]) => {
    // Save to LocalStorage (for guests)
    const saved = localStorage.getItem("interviews");
    if (saved) {
      const interviews: Interview[] = JSON.parse(saved);
      const updatedInterviews = interviews.map(i => {
        if (interview && i.id === interview.id) {
          return {
            ...i,
            transcript: msgs.map(m => ({ role: m.role === 'ai' ? 'AI' : 'Candidate', content: m.content }))
          };
        }
        return i;
      });
      localStorage.setItem("interviews", JSON.stringify(updatedInterviews));
    }

    // Save to Supabase (for logged-in users)
    if (interview) {
      const transcriptData = msgs.map(m => ({ role: m.role === 'ai' ? 'AI' : 'Candidate', content: m.content }));
      try {
        await supabase
          .from('interviews')
          .update({ transcript: transcriptData })
          .eq('id', interview.id);
      } catch (e) {
        console.error("Failed to sync transcript to Supabase", e);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsGenerating(true);

    if (!interview) return;

    try {
      if (!GROQ_API_KEY) {
        throw new Error("Missing Groq API Key");
      }

      // Convert history to Groq format
      const conversationHistory = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      // Add System Prompt
      const systemPrompt = `You are an expert technical interviewer for a ${interview.jobPosition} role.
        
        Create a challenging and relevant interview experience based on the following context:
        
        JOB DESCRIPTION:
        ${interview.jobDescription}
        
        CANDIDATE RESUME:
        ${interview.resumeContent || "No resume provided."}
        
        INSTRUCTIONS:
        1. Ask questions that specifically target the skills required in the JD and the candidate's experience.
        2. If the resume mentions a skill, verify their depth of knowledge.
        3. If the interview seems effectively over (after 5-6 exchanges), thank them and say "INTERVIEW_END".
        4. Keep your response as just the question text, no "Interviewer:" prefix.
        5. Refuse to answer questions not related to the interview.`;

      const apiMessages: any[] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userMsg.content }
      ];

      // Groq Call with Llama 3.3 70B
      const completion = await groq.chat.completions.create({
        messages: apiMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 150,
      });

      const responseText = completion.choices[0]?.message?.content || "Could not generate a response.";

      if (responseText.includes("INTERVIEW_END")) {
        await updateTranscriptInStorage([...messages, userMsg]);
        navigate(`/feedback/${id}`);
        return;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      updateTranscriptInStorage([...messages, userMsg, aiMsg]);

    } catch (error: any) {
      console.error("Groq Error Details:", error);
      let errorMessage = "Failed to generate next question.";
      if (error.message && error.message.includes("401")) errorMessage = "Invalid API Key. Check your .env file.";
      else if (error.message && error.message.includes("429")) errorMessage = "Rate limit exceeded. Try again in a moment.";
      else errorMessage = error.message || "Unknown error occurred.";

      toast({
        variant: "destructive",
        title: "AI Generation Error",
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24 flex flex-col relative max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" className="text-sm text-white/50 hover:text-white mb-1 pl-0 hover:bg-transparent" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Exit Interview
            </Button>
            <h1 className="text-3xl font-bold">{interview?.jobPosition} Interview</h1>
          </div>
          <Button variant="outline" className="border-white/10 hover:bg-white/10" onClick={() => navigate(`/interview/${id}/voice`)}>
            Switch to Voice Mode
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-24 custom-scrollbar pr-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>

              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 mt-1 shadow-lg shrink-0">
                  <span className="text-xs font-bold">AI</span>
                </div>
              )}

              <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg relative group ${msg.role === 'ai'
                ? 'bg-white/10 text-white rounded-tl-none border border-white/5'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-none'
                }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <span className="text-[10px] opacity-40 mt-2 block uppercase tracking-wider font-bold">
                  {msg.role === 'ai' ? 'AI Interviewer' : 'You'}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ml-3 mt-1 border border-white/20 shrink-0">
                  <span className="text-xs">👤</span>
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/10 mr-3 shrink-0" />
              <div className="bg-white/5 rounded-2xl p-4 w-32 h-12 flex items-center gap-2">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}

          <div id="scroll-anchor" />
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 z-20">
          <div className="container max-w-4xl mx-auto flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your answer or use the microphone..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 pr-12 min-h-[60px] max-h-[150px] focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none text-white placeholder:text-white/30 custom-scrollbar"
              />

              <Button
                size="icon"
                variant="ghost"
                className={`absolute right-3 bottom-3 rounded-full hover:bg-white/10 text-white ${isRecording ? 'text-red-500 animate-pulse' : 'opacity-50 hover:opacity-100'}`}
                onClick={toggleRecording}
              >
                {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isGenerating}
              className="h-[60px] w-[60px] rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center mb-[1px]"
            >
              {isGenerating ? (
                <ArrowUp className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6 ml-0.5" />
              )}
            </Button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-white/30">Microphone will transcribe text. Review and edit before sending.</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Interview;
