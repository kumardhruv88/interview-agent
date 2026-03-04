import { useState, useEffect, ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Sparkles, Lock, MessageSquare, Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { JobTemplate } from "@/data/jobTemplates";
import { extractResumeWithLLM, formatExtractedDataForInterview, ExtractedResumeData } from "@/utils/extractResumeWithLLM";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromPDF } from "@/utils/pdf";

interface CreateInterviewDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: JobTemplate | null;
}

export const CreateInterviewDialog = ({ trigger, open: controlledOpen, onOpenChange, initialData }: CreateInterviewDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [extractedResumeData, setExtractedResumeData] = useState<ExtractedResumeData | null>(null);
  const { user } = useAuth();

  // Use controlled state if provided, otherwise internal state
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = controlledOpen ?? internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const [formData, setFormData] = useState<{
    jobPosition: string;
    jobDescription: string;
    yearsOfExperience: string;
    resumeName?: string;
    resumeContent?: string;
    duration: string;
    interviewType: 'chat' | 'voice';
  }>({
    jobPosition: initialData?.role || "",
    jobDescription: initialData?.fullDescription || "",
    yearsOfExperience: "",
    resumeName: "",
    resumeContent: "",
    duration: "",
    interviewType: "chat",
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        jobPosition: initialData.role,
        jobDescription: initialData.fullDescription
      }));
    }
  }, [initialData]);

  // Auto-load resume and profile data from Supabase
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        // Load from Supabase user_profiles table
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profileData && profileData.resume_content) {
          // Auto-populate with profile resume
          setFormData(prev => ({
            ...prev,
            resumeName: profileData.resume_file_name || 'Resume from profile',
            resumeContent: profileData.resume_content
          }));

          // Also set extracted resume data if available
          if (profileData.resume_parsed_data) {
            setExtractedResumeData(profileData.resume_parsed_data);
          }

          // Show toast to inform user
          toast({
            title: "Profile loaded",
            description: `Using your saved resume: ${profileData.resume_file_name || 'resume.pdf'}`,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    if (open) {
      loadProfileData();
    }
  }, [open, user]);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobPosition || !formData.jobDescription || !formData.yearsOfExperience) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);

    // Extract resume data with LLM if resume is available
    let resumeContext = "";
    if (formData.resumeContent) {
      try {
        setExtracting(true);
        console.log("📝 Extracting resume with LLM...");

        const extractedData = await extractResumeWithLLM(formData.resumeContent);
        setExtractedResumeData(extractedData);

        // Format extracted data for interview context
        resumeContext = formatExtractedDataForInterview(extractedData);

        console.log("✅ Resume extracted successfully");
        console.log("Resume context:", resumeContext);

        toast({
          title: "Resume analyzed!",
          description: "Creating personalized interview...",
        });
      } catch (error) {
        console.error("Failed to extract resume:", error);
        toast({
          variant: "destructive",
          title: "Resume extraction failed",
          description: "Proceeding with interview creation without resume analysis.",
        });
        // Continue without extracted data
      } finally {
        setExtracting(false);
      }
    }

    // Simulate AI question generation
    setTimeout(async () => {
      const mockInterview = {
        id: `interview-${Date.now()}`,
        ...formData,
        extractedResumeData: extractedResumeData,
        resumeContext: resumeContext,
        createdAt: new Date().toISOString(),
        duration: formData.duration,
        questions: [
          "Tell me about yourself and your experience.",
          "What are your greatest strengths in this role?",
          "Describe a challenging project you've worked on.",
          "How do you handle tight deadlines?",
          "Where do you see yourself in 5 years?",
        ],
      };

      const isDevMode = localStorage.getItem('devMode') === 'true';

      const saveLocally = () => {
        const saved = localStorage.getItem("interviews");
        const interviews = saved ? JSON.parse(saved) : [];
        interviews.push(mockInterview);
        localStorage.setItem("interviews", JSON.stringify(interviews));

        setLoading(false);
        setOpen(false);
        setFormData({ jobPosition: "", jobDescription: "", yearsOfExperience: "", duration: "", interviewType: "chat" });
        setExtractedResumeData(null);

        toast({
          title: "Interview Created!",
          description: "Your mock interview is ready. Good luck!",
        });

        const route = formData.interviewType === 'voice' 
          ? `/interview/${mockInterview.id}/voice` 
          : `/interview/${mockInterview.id}`;
        navigate(route);
      };

      // Save interview based on user status
      if (user && !isDevMode) {
        // Logged-in user: Save to Supabase
        try {
          const { data, error } = await supabase
            .from('interviews')
            .insert([{
              user_id: user.id,
              job_position: mockInterview.jobPosition,
              job_description: mockInterview.jobDescription,
              years_of_experience: mockInterview.yearsOfExperience,
              resume_content: mockInterview.resumeContent,
              questions: mockInterview.questions,
              created_at: mockInterview.createdAt
            }])
            .select()
            .single();

          if (error) throw error;

          setLoading(false);
          setOpen(false);
          setFormData({ jobPosition: "", jobDescription: "", yearsOfExperience: "", duration: "", interviewType: "chat" });
          setExtractedResumeData(null);

          toast({
            title: "Interview Created!",
            description: "Interview created in your account.",
          });

          // Navigate using the Supabase-generated ID
          const route = formData.interviewType === 'voice' 
            ? `/interview/${data.id}/voice` 
            : `/interview/${data.id}`;
          navigate(route);
        } catch (err) {
          console.error("Error saving interview to Supabase, falling back to local storage:", err);
          saveLocally();
        }
      } else {
        // Guest user or Dev mode: Save to localStorage
        saveLocally();
      }
    }, 2000);
  };

  const handleTriggerClick = () => {
    // Check Guest Limit
    if (!user) {
      const existing = JSON.parse(localStorage.getItem("interviews") || "[]");
      if (existing.length >= 1) {
        // Guest has already taken 1 free interview
        setShowLimitDialog(true);
        return;
      }
    }
    // Allow opening the create dialog
    setOpen(true);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setExtracting(true);
      let content = "";

      // Handle different file types
      if (file.type === "application/pdf") {
        // Extract text from PDF
        content = await extractTextFromPDF(file);
      } else if (file.type === "text/plain") {
        // Read text file
        content = await file.text();
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        // For DOC/DOCX, we'll need to handle this differently
        // For now, show a toast that only PDF and TXT are supported
        toast({
          variant: "destructive",
          title: "Unsupported file type",
          description: "Please upload a PDF or TXT file for now. DOC/DOCX support coming soon!",
        });
        setExtracting(false);
        return;
      }

      if (content) {
        setFormData({
          ...formData,
          resumeName: file.name,
          resumeContent: content,
        });

        toast({
          title: "Resume uploaded!",
          description: `${file.name} has been uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to read the resume file. Please try again.",
      });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger ? (
          <div onClick={handleTriggerClick}>
            {trigger}
          </div>
        ) : (
          <Button variant="hero" size="lg" className="gap-2" onClick={handleTriggerClick}>
            <Plus className="h-5 w-5" />
            Create New Interview
          </Button>
        )}
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Mock Interview
            </DialogTitle>
            <DialogDescription>
              Fill in the details below and we'll generate personalized interview questions using AI.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="jobPosition">Job Role / Position *</Label>
              <Input
                id="jobPosition"
                placeholder="e.g., Full Stack Developer"
                value={formData.jobPosition}
                onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description / Tech Stack *</Label>
              <Textarea
                id="jobDescription"
                placeholder="e.g., React, Node.js, PostgreSQL, AWS..."
                rows={3}
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume / CV (Optional)</Label>
              {formData.resumeName ? (
                // Show loaded resume
                <div className="flex items-center gap-2 p-3 border border-green-500/20 bg-green-500/10 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-400">✓ {formData.resumeName}</p>
                    <p className="text-xs text-muted-foreground">Loaded from your profile</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, resumeName: "", resumeContent: "" }));
                      setExtractedResumeData(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                // Show file upload
                <>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="cursor-pointer file:text-primary file:font-semibold hover:file:bg-primary/10"
                  />
                  <p className="text-xs text-muted-foreground">Upload your resume for personalized context.</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 3"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Minutes</SelectItem>
                    <SelectItem value="10">10 Minutes</SelectItem>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="20">20 Minutes</SelectItem>
                    <SelectItem value="25">25 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interview Format Selection */}
            <div className="space-y-3">
              <Label>Interview Format *</Label>
              <div className="flex flex-wrap gap-3">
                <Button 
                  type="button"
                  size="sm"
                  variant={formData.interviewType === 'chat' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, interviewType: 'chat' })}
                  className={`flex items-center gap-2 transition-all ${formData.interviewType === 'chat' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  <MessageSquare className={`w-4 h-4 ${formData.interviewType === 'chat' ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className="font-medium">Chat Interview</span>
                </Button>
                <Button 
                  type="button"
                  size="sm"
                  variant={formData.interviewType === 'voice' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, interviewType: 'voice' })}
                  className={`flex items-center gap-2 transition-all ${formData.interviewType === 'voice' ? 'ring-2 ring-purple-500 ring-offset-2 bg-gradient-to-r from-primary to-purple-600 border-transparent text-white' : ''}`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="font-medium">Voice Interview</span>
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={loading || extracting}>
                {extracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Interview
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Free Limit Reached</DialogTitle>
            <DialogDescription className="text-center pt-2">
              You've completed your <strong>1 free interview</strong>. <br />
              Sign up now to unlock <strong>unlimited</strong> interviews, save your progress, and track your performance!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowLimitDialog(false)}>Cancel</Button>
            <Button variant="hero" className="flex-1" onClick={() => {
              setShowLimitDialog(false);
              navigate("/signup");
            }}>
              Create Free Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
