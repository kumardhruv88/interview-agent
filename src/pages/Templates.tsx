import { useState, useEffect } from "react";
import { UserDashboardHeader } from "@/components/user-dashboard/UserDashboardHeader";
import { UserDashboardSidebar } from "@/components/user-dashboard/UserDashboardSidebar";
import { jobTemplates, JobTemplate } from "@/data/jobTemplates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Filter } from "lucide-react";
import { CreateInterviewDialog } from "@/components/dashboard/CreateInterviewDialog";
import { Badge } from "@/components/ui/badge";

const Templates = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    useEffect(() => {
        const handleSidebarToggle = (e: CustomEvent) => {
            setSidebarCollapsed(e.detail.collapsed);
        };

        window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);

        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
        };
    }, []);

    const categories = ["All", "Tech", "Creative", "Management", "Other"];

    const filteredTemplates = jobTemplates.filter(template => {
        const matchesSearch = template.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleStartInterview = (template: JobTemplate) => {
        setSelectedTemplate(template);
        setDialogOpen(true);
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

                <main className="flex-1 pt-20 px-6 pb-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Templates</h1>
                            <p className="text-muted-foreground">Unlock Efficiency with Ready-Made Automation.</p>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search by title..."
                                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`rounded-full ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-transparent border-white/10 text-muted-foreground hover:text-white hover:bg-white/5'}`}
                                        size="sm"
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => (
                                <div key={template.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
                                    <div className={`absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity ${template.color}`}>
                                        <template.icon className="w-6 h-6" />
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{template.role}</h3>
                                        <Badge variant="secondary" className="bg-white/5 text-xs font-normal border-0 mb-3">{template.category}</Badge>
                                        <p className="text-sm text-gray-400 line-clamp-3 h-[60px]">{template.fullDescription}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-green-400">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Ready to use
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-primary/90 hover:bg-primary gap-2"
                                            onClick={() => handleStartInterview(template)}
                                        >
                                            Start <Sparkles className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredTemplates.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No templates found matching your search.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Interview Dialog */}
                <CreateInterviewDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    initialData={selectedTemplate}
                />

                {/* Mobile Menu Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 z-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="w-64 h-full bg-background border-r border-white/10 p-4" onClick={e => e.stopPropagation()}>
                            {/* Ideally reuse Sidebar component here or a mobile version */}
                            <p className="text-sm text-gray-500">Menu</p>
                            <button className="mt-4 text-sm text-red-500" onClick={() => setSidebarOpen(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Templates;
