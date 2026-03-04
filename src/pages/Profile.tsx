import { useState, useEffect, useRef } from "react";
import { UserDashboardSidebar } from "@/components/user-dashboard/UserDashboardSidebar";
import { UserDashboardHeader } from "@/components/user-dashboard/UserDashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, GraduationCap, Award, Upload, Save, FileText, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromPDF } from "@/utils/pdf";

interface ExperienceEntry {
    id: string;
    title: string;
    company: string;
    description: string;
}

interface ProjectEntry {
    id: string;
    name: string;
    description: string;
}

interface UserProfile {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    yearsOfExperience: string;
    college: string;
    degree: string;
    jobPreference: "internship" | "job" | "switch" | "";
    desiredRole: string;
    skills: string;
    experiences: ExperienceEntry[];
    projects: ProjectEntry[];
    resumeFileName?: string;
    resumeContent?: string;
}

const Profile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<UserProfile>({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        yearsOfExperience: "",
        college: "",
        degree: "",
        jobPreference: "",
        desiredRole: "",
        skills: "",
        experiences: [],
        projects: [],
    });

    useEffect(() => {
        loadProfile();

        // Listen for sidebar toggle events
        const handleSidebarToggle = (e: CustomEvent) => {
            setSidebarCollapsed(e.detail.collapsed);
        };

        window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);

        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
        };
    }, []);

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Load from Supabase user_profiles table
            const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
                throw error;
            }

            if (profileData) {
                // Profile exists in Supabase
                setProfile({
                    fullName: profileData.full_name || "",
                    email: profileData.email || user.email || "",
                    phone: profileData.phone || "",
                    location: profileData.location || "",
                    yearsOfExperience: profileData.years_of_experience?.toString() || "",
                    college: profileData.college || "",
                    degree: profileData.degree || "",
                    jobPreference: profileData.job_preference || "",
                    desiredRole: profileData.desired_role || "",
                    skills: profileData.skills || "",
                    experiences: profileData.experience || [],
                    projects: profileData.projects || [],
                    resumeFileName: profileData.resume_file_name,
                    resumeContent: profileData.resume_content,
                });
                setProfileExists(true);
            } else {
                // No profile yet - set email only
                setProfile(prev => ({ ...prev, email: user.email || "" }));
                setProfileExists(false);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            setProfile(prev => ({ ...prev, email: user.email || "" }));
            setProfileExists(false);
        }
    };

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File too large",
                description: "Resume must be under 10MB",
            });
            return;
        }

        setLoading(true);
        try {
            // Extract text from PDF
            const resumeText = await extractTextFromPDF(file);
            console.log("Extracted resume text:", resumeText.substring(0, 500));

            // Check if we have cached parsed data for this resume
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase
                    .from('user_profiles')
                    .select('parsed_resume_data, resume_file_name')
                    .eq('user_id', user.id)
                    .single();

                // If same resume file and we have cached data, use it
                if (profileData?.resume_file_name === file.name && profileData?.parsed_resume_data) {
                    console.log("✅ Using cached resume data (no Groq call needed)");
                    const extractedData = profileData.parsed_resume_data;

                    // Map cached data to profile format
                    setProfile(prev => ({
                        ...prev,
                        fullName: extractedData.candidateName || prev.fullName,
                        email: extractedData.email || prev.email,
                        phone: extractedData.phone || prev.phone,
                        yearsOfExperience: extractedData.yearsOfExperience || prev.yearsOfExperience,
                        skills: extractedData.skills?.join(', ') || prev.skills,
                        college: extractedData.education?.[0]?.institution || prev.college,
                        degree: extractedData.education?.[0]?.degree || prev.degree,
                        experiences: extractedData.workExperience?.map((exp: any, idx: number) => ({
                            id: `exp-${Date.now()}-${idx}`,
                            title: exp.title,
                            company: exp.company,
                            description: `${exp.duration}${exp.description ? ' - ' + exp.description : ''}`
                        })) || prev.experiences,
                        projects: extractedData.projects?.map((proj: any, idx: number) => ({
                            id: `proj-${Date.now()}-${idx}`,
                            name: proj.name,
                            description: proj.description
                        })) || prev.projects,
                        resumeFileName: file.name,
                        resumeContent: resumeText,
                    }));

                    toast({
                        title: "Resume loaded!",
                        description: "Profile filled from cached data (no AI processing needed).",
                    });
                    setLoading(false);
                    return;
                }
            }

            // No cached data or different file - use LLM for parsing
            console.log("🤖 Calling Groq LLM to parse resume (first time or new file)");
            const { extractResumeWithLLM } = await import('@/utils/extractResumeWithLLM');
            const extractedData = await extractResumeWithLLM(resumeText);
            console.log("LLM extracted data:", extractedData);

            // Map extracted data to profile format
            setProfile(prev => ({
                ...prev,
                fullName: extractedData.candidateName || prev.fullName,
                email: extractedData.email || prev.email,
                phone: extractedData.phone || prev.phone,
                yearsOfExperience: extractedData.yearsOfExperience || prev.yearsOfExperience,
                skills: extractedData.skills.join(', ') || prev.skills,
                college: extractedData.education[0]?.institution || prev.college,
                degree: extractedData.education[0]?.degree || prev.degree,
                // Map work experience
                experiences: extractedData.workExperience.map((exp, idx) => ({
                    id: `exp-${Date.now()}-${idx}`,
                    title: exp.title,
                    company: exp.company,
                    description: `${exp.duration}${exp.description ? ' - ' + exp.description : ''}`
                })),
                // Map projects
                projects: extractedData.projects.map((proj, idx) => ({
                    id: `proj-${Date.now()}-${idx}`,
                    name: proj.name,
                    description: proj.description
                })),
                resumeFileName: file.name,
                resumeContent: resumeText,
            }));

            // Save parsed data to database for future use
            if (user) {
                await supabase
                    .from('user_profiles')
                    .upsert({
                        user_id: user.id,
                        parsed_resume_data: extractedData,
                        resume_last_parsed_at: new Date().toISOString(),
                        resume_file_name: file.name,
                        resume_content: resumeText,
                    }, {
                        onConflict: 'user_id'
                    });
            }

            toast({
                title: "Resume uploaded!",
                description: "Profile auto-filled from resume using AI. Please review and save.",
            });
        } catch (error) {
            console.error("Resume upload error:", error);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Could not process resume. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveResume = () => {
        setProfile(prev => ({
            ...prev,
            resumeFileName: undefined,
            resumeContent: undefined,
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        toast({
            title: "Resume removed",
            description: "You can upload a new resume anytime.",
        });
    };

    const addExperience = () => {
        setProfile(prev => ({
            ...prev,
            experiences: [
                ...prev.experiences,
                { id: Date.now().toString(), title: "", company: "", description: "" }
            ]
        }));
    };

    const removeExperience = (id: string) => {
        setProfile(prev => ({
            ...prev,
            experiences: prev.experiences.filter(exp => exp.id !== id)
        }));
    };

    const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
        setProfile(prev => ({
            ...prev,
            experiences: prev.experiences.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const addProject = () => {
        setProfile(prev => ({
            ...prev,
            projects: [
                ...prev.projects,
                { id: Date.now().toString(), name: "", description: "" }
            ]
        }));
    };

    const removeProject = (id: string) => {
        setProfile(prev => ({
            ...prev,
            projects: prev.projects.filter(proj => proj.id !== id)
        }));
    };

    const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
        setProfile(prev => ({
            ...prev,
            projects: prev.projects.map(proj =>
                proj.id === id ? { ...proj, [field]: value } : proj
            )
        }));
    };

    const handleSave = async () => {
        if (!profile.fullName || !profile.email) {
            toast({
                variant: "destructive",
                title: "Missing fields",
                description: "Please fill name and email.",
            });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Save to Supabase user_profiles table
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.id,
                    full_name: profile.fullName,
                    email: profile.email,
                    phone: profile.phone,
                    location: profile.location,
                    years_of_experience: profile.yearsOfExperience ? parseInt(profile.yearsOfExperience) : null,
                    college: profile.college,
                    degree: profile.degree,
                    job_preference: profile.jobPreference || null,
                    desired_role: profile.desiredRole,
                    skills: profile.skills,
                    experience: profile.experiences,
                    projects: profile.projects,
                    resume_file_name: profile.resumeFileName,
                    resume_content: profile.resumeContent,
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            const wasUpdate = profileExists;
            setProfileExists(true);
            toast({
                title: wasUpdate ? "Profile updated!" : "Profile saved!",
                description: wasUpdate ? "Your changes have been saved." : "Profile created successfully.",
            });
        } catch (error) {
            console.error("Save error:", error);
            toast({
                variant: "destructive",
                title: profileExists ? "Update failed" : "Save failed",
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-foreground flex">
            <UserDashboardSidebar />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <UserDashboardHeader
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    showWelcome={false}
                    showNotification={false}
                    showStartInterview={false}
                />

                <main className="flex-1 pt-16 px-6 pb-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">

                        <div className="mb-8">
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Complete Your Profile</h1>
                            <p className="text-sm text-muted-foreground mt-2">Build your professional profile for better interview preparation</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            <div className="space-y-8">

                                {/* Quick Setup Card with 3D Glow */}
                                <div className="group relative">
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                    {/* Card */}
                                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                                                <Upload className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Quick Setup</h3>
                                                <p className="text-xs text-muted-foreground">Upload resume to auto-fill your profile</p>
                                            </div>
                                        </div>

                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleResumeUpload}
                                            disabled={loading}
                                            className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-colors"
                                        />

                                        {profile.resumeFileName && (
                                            <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                                <div className="flex items-center gap-2 text-sm text-green-400">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="truncate max-w-[250px] font-medium">{profile.resumeFileName}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveResume}
                                                    className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Personal Information Card */}
                                <div className="group relative">
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                    {/* Card */}
                                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                                                <User className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="fullName" className="text-sm font-medium text-gray-300 mb-2 block">Full Name *</Label>
                                                <Input
                                                    id="fullName"
                                                    value={profile.fullName}
                                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                                    placeholder="John Doe"
                                                    className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="email" className="text-sm font-medium text-gray-300 mb-2 block">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={profile.email}
                                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                                        placeholder="john@example.com"
                                                        className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-300 mb-2 block">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={profile.phone}
                                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                                        placeholder="+1 234 567 8900"
                                                        className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="location" className="text-sm font-medium text-gray-300 mb-2 block">Location</Label>
                                                <Input
                                                    id="location"
                                                    value={profile.location}
                                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                                    placeholder="San Francisco, CA"
                                                    className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Education Card */}
                                <div className="group relative">
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                    {/* Card */}
                                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                                                <GraduationCap className="w-5 h-5 text-green-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">Education</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="college" className="text-sm font-medium text-gray-300 mb-2 block">College/University</Label>
                                                <Input
                                                    id="college"
                                                    value={profile.college}
                                                    onChange={(e) => handleInputChange("college", e.target.value)}
                                                    placeholder="Stanford University"
                                                    className="bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="degree" className="text-sm font-medium text-gray-300 mb-2 block">Degree</Label>
                                                <Input
                                                    id="degree"
                                                    value={profile.degree}
                                                    onChange={(e) => handleInputChange("degree", e.target.value)}
                                                    placeholder="B.Tech Computer Science"
                                                    className="bg-white/5 border-white/10 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-8">

                                {/* Professional Profile Card */}
                                <div className="group relative">
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                    {/* Card */}
                                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                                                <Briefcase className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">Professional Profile</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-300 mb-2 block">Years of Experience</Label>
                                                    <Input
                                                        id="yearsOfExperience"
                                                        value={profile.yearsOfExperience}
                                                        onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                                                        placeholder="3"
                                                        className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="jobPreference" className="text-sm font-medium text-gray-300 mb-2 block">Job Preference</Label>
                                                    <Select value={profile.jobPreference} onValueChange={(val) => handleInputChange("jobPreference", val)}>
                                                        <SelectTrigger className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="internship">Internship</SelectItem>
                                                            <SelectItem value="job">Full-time</SelectItem>
                                                            <SelectItem value="switch">Job Switch</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="desiredRole" className="text-sm font-medium text-gray-300 mb-2 block">Desired Role</Label>
                                                <Input
                                                    id="desiredRole"
                                                    value={profile.desiredRole}
                                                    onChange={(e) => handleInputChange("desiredRole", e.target.value)}
                                                    placeholder="Senior Software Engineer"
                                                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="skills" className="text-sm font-medium text-gray-300 mb-2 block">Skills</Label>
                                                <Textarea
                                                    id="skills"
                                                    value={profile.skills}
                                                    onChange={(e) => handleInputChange("skills", e.target.value)}
                                                    placeholder="React, Node.js, Python, AWS..."
                                                    className="min-h-[100px] bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Experience Card */}
                                <div className="group relative">
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                    {/* Card */}
                                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                                                    <Award className="w-5 h-5 text-yellow-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-white">Experience</h3>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addExperience}
                                                className="h-8 text-xs border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50"
                                            >
                                                + Add
                                            </Button>
                                        </div>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                            {profile.experiences.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-6">
                                                    No experience added. Click "+ Add" to get started.
                                                </p>
                                            ) : (
                                                profile.experiences.map((exp) => (
                                                    <div key={exp.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-yellow-500/20 transition-colors space-y-3">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <Input
                                                                value={exp.title}
                                                                onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                                                                placeholder="Job Title"
                                                                className="h-9 text-sm bg-black/30 border-white/10 focus:border-yellow-500/50"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeExperience(exp.id)}
                                                                className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <Input
                                                            value={exp.company}
                                                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                                            placeholder="Company Name"
                                                            className="h-9 text-sm bg-black/30 border-white/10 focus:border-yellow-500/50"
                                                        />
                                                        <Textarea
                                                            value={exp.description}
                                                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                                            placeholder="Brief description..."
                                                            className="min-h-[70px] text-sm bg-black/30 border-white/10 focus:border-yellow-500/50 resize-none"
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Projects Card */}
                                <div className="group relative">
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                    {/* Card */}
                                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
                                                    <Award className="w-5 h-5 text-orange-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-white">Projects</h3>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addProject}
                                                className="h-8 text-xs border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50"
                                            >
                                                + Add
                                            </Button>
                                        </div>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                            {profile.projects.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-6">
                                                    No projects added. Click "+ Add" to get started.
                                                </p>
                                            ) : (
                                                profile.projects.map((proj) => (
                                                    <div key={proj.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-colors space-y-3">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <Input
                                                                value={proj.name}
                                                                onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                                                                placeholder="Project Name"
                                                                className="h-9 text-sm bg-black/30 border-white/10 focus:border-orange-500/50"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeProject(proj.id)}
                                                                className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <Textarea
                                                            value={proj.description}
                                                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                                                            placeholder="Project description..."
                                                            className="min-h-[70px] text-sm bg-black/30 border-white/10 focus:border-orange-500/50 resize-none"
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        <div className="flex justify-center mt-12 pb-12">
                            <div className="relative group w-full max-w-md">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    size="lg"
                                    className="relative w-full h-14 bg-black border border-white/10 hover:bg-white/5 disabled:hover:bg-black text-white font-bold text-lg tracking-wide shadow-2xl transition-all duration-300 transform group-hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-5 w-5 text-purple-400" />
                                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                                {profileExists ? "Updating..." : "Saving..."}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2 text-purple-400" />
                                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                                {profileExists ? "Update Profile" : "Save Profile"}
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;
