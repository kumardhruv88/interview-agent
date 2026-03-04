import { useState, useEffect, useRef } from "react";
import { UserDashboardSidebar } from "@/components/user-dashboard/UserDashboardSidebar";
import { UserDashboardHeader } from "@/components/user-dashboard/UserDashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, GraduationCap, Award, Upload, Save, FileText, X } from "lucide-react";
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
        if (user?.email) {
            const saved = localStorage.getItem(`profile_${user.email}`);
            if (saved) {
                setProfile(JSON.parse(saved));
                setProfileExists(true);
            } else {
                setProfile(prev => ({ ...prev, email: user.email || "" }));
                setProfileExists(false);
            }
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
            const resumeText = await extractTextFromPDF(file);
            console.log("Extracted resume text:", resumeText.substring(0, 500));

            const extractedData = extractDataFromResume(resumeText);
            console.log("Extracted data:", extractedData);

            setProfile(prev => ({
                ...prev,
                ...extractedData,
                resumeFileName: file.name,
                resumeContent: resumeText,
            }));

            toast({
                title: "Resume uploaded!",
                description: "Profile auto-filled from resume. Please review and save.",
            });
        } catch (error) {
            console.error("Resume upload error:", error);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: "Could not process resume. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const extractDataFromResume = (resumeText: string): Partial<UserProfile> => {
        const extractedData: Partial<UserProfile> = {};

        const lines = resumeText.split('\n').filter(l => l.trim());
        const nameMatch = lines[0]?.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (nameMatch) {
            extractedData.fullName = nameMatch[1].trim();
        }

        const emailMatch = resumeText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) {
            extractedData.email = emailMatch[0];
        }

        const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
            extractedData.phone = phoneMatch[0];
        }

        const expMatch = resumeText.match(/(\d+)\+?\s*(years?|yrs)\s*(of\s*)?experience/i);
        if (expMatch) {
            extractedData.yearsOfExperience = expMatch[1];
        }

        const locationMatch = resumeText.match(/(?:Location|Address):\s*([^\n]+)/i) ||
            resumeText.match(/([A-Z][a-z]+,\s*[A-Z]{2})/);
        if (locationMatch) {
            extractedData.location = locationMatch[1].trim();
        }

        const collegeMatch = resumeText.match(/(University|College|Institute)\s+[^\n]+/i);
        if (collegeMatch) {
            extractedData.college = collegeMatch[0].trim();
        }

        const degreeMatch = resumeText.match(/(Bachelor|Master|B\.?Tech|M\.?Tech|B\.?S\.?|M\.?S\.?)\s*(?:of|in)?\s*([^\n,]+)/i);
        if (degreeMatch) {
            extractedData.degree = degreeMatch[0].trim();
        }

        const skillsMatch = resumeText.match(/(?:Skills|Technical Skills|Core Skills)\s*:?\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
        if (skillsMatch) {
            extractedData.skills = skillsMatch[1].trim().replace(/\s+/g, ' ');
        }

        return extractedData;
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
            if (user?.email) {
                localStorage.setItem(`profile_${user.email}`, JSON.stringify(profile));
                const wasUpdate = profileExists;
                setProfileExists(true);
                toast({
                    title: wasUpdate ? "Profile updated!" : "Profile saved!",
                    description: wasUpdate ? "Your changes have been saved." : "Profile created successfully.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: profileExists ? "Update failed" : "Save failed",
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
                    <div className="max-w-6xl mx-auto">

                        <div className="mb-6">
                            <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
                            <p className="text-sm text-muted-foreground mt-1">Build your professional profile for better interview preparation</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <div className="space-y-6">

                                <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Upload className="w-5 h-5" />
                                            Quick Setup
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">Upload resume to auto-fill your profile</p>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleResumeUpload}
                                            disabled={loading}
                                            className="bg-black/40 border-white/10"
                                        />
                                        {profile.resumeFileName && (
                                            <div className="flex items-center justify-between mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                <div className="flex items-center gap-2 text-sm text-green-400">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="truncate max-w-[250px]">{profile.resumeFileName}</span>
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
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <User className="w-5 h-5 text-blue-400" />
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                                            <Input
                                                id="fullName"
                                                value={profile.fullName}
                                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                                placeholder="John Doe"
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    placeholder="john@example.com"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    value={profile.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                    placeholder="+1 234 567 8900"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                                            <Input
                                                id="location"
                                                value={profile.location}
                                                onChange={(e) => handleInputChange("location", e.target.value)}
                                                placeholder="San Francisco, CA"
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-green-400" />
                                            Education
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="college" className="text-sm font-medium">College/University</Label>
                                            <Input
                                                id="college"
                                                value={profile.college}
                                                onChange={(e) => handleInputChange("college", e.target.value)}
                                                placeholder="Stanford University"
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="degree" className="text-sm font-medium">Degree</Label>
                                            <Input
                                                id="degree"
                                                value={profile.degree}
                                                onChange={(e) => handleInputChange("degree", e.target.value)}
                                                placeholder="B.Tech Computer Science"
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>

                            <div className="space-y-6">

                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-purple-400" />
                                            Professional Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="yearsOfExperience" className="text-sm font-medium">Years of Experience</Label>
                                                <Input
                                                    id="yearsOfExperience"
                                                    value={profile.yearsOfExperience}
                                                    onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                                                    placeholder="3"
                                                    className="bg-black/20 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="jobPreference" className="text-sm font-medium">Job Preference</Label>
                                                <Select value={profile.jobPreference} onValueChange={(val) => handleInputChange("jobPreference", val)}>
                                                    <SelectTrigger className="bg-black/20 border-white/10">
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
                                        <div className="space-y-2">
                                            <Label htmlFor="desiredRole" className="text-sm font-medium">Desired Role</Label>
                                            <Input
                                                id="desiredRole"
                                                value={profile.desiredRole}
                                                onChange={(e) => handleInputChange("desiredRole", e.target.value)}
                                                placeholder="Senior Software Engineer"
                                                className="bg-black/20 border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="skills" className="text-sm font-medium">Skills</Label>
                                            <Textarea
                                                id="skills"
                                                value={profile.skills}
                                                onChange={(e) => handleInputChange("skills", e.target.value)}
                                                placeholder="React, Node.js, Python, AWS..."
                                                className="min-h-[80px] bg-black/20 border-white/10 resize-none"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Award className="w-5 h-5 text-yellow-400" />
                                                Experience
                                            </CardTitle>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addExperience}
                                                className="h-8 text-xs"
                                            >
                                                + Add
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {profile.experiences.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No experience added. Click "+ Add" to get started.
                                            </p>
                                        ) : (
                                            profile.experiences.map((exp) => (
                                                <div key={exp.id} className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <Input
                                                            value={exp.title}
                                                            onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                                                            placeholder="Job Title"
                                                            className="h-8 text-sm bg-black/30 border-white/10"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeExperience(exp.id)}
                                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <Input
                                                        value={exp.company}
                                                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                                        placeholder="Company Name"
                                                        className="h-8 text-sm bg-black/30 border-white/10"
                                                    />
                                                    <Textarea
                                                        value={exp.description}
                                                        onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                                        placeholder="Brief description..."
                                                        className="min-h-[60px] text-sm bg-black/30 border-white/10 resize-none"
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Award className="w-5 h-5 text-orange-400" />
                                                Projects
                                            </CardTitle>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addProject}
                                                className="h-8 text-xs"
                                            >
                                                + Add
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {profile.projects.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No projects added. Click "+ Add" to get started.
                                            </p>
                                        ) : (
                                            profile.projects.map((proj) => (
                                                <div key={proj.id} className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <Input
                                                            value={proj.name}
                                                            onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                                                            placeholder="Project Name"
                                                            className="h-8 text-sm bg-black/30 border-white/10"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeProject(proj.id)}
                                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <Textarea
                                                        value={proj.description}
                                                        onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                                                        placeholder="Project description..."
                                                        className="min-h-[60px] text-sm bg-black/30 border-white/10 resize-none"
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                            </div>

                        </div>

                        <div className="flex justify-center mt-8">
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                size="lg"
                                className="w-full max-w-md h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-base font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        {profileExists ? "Updating Profile..." : "Saving Profile..."}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        {profileExists ? "Update Profile" : "Save Profile"}
                                    </>
                                )}
                            </Button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;
