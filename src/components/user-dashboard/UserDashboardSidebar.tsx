import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Briefcase, FileText, BarChart2, Crown, LogOut, Code, User, Settings, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const UserDashboardSidebar = () => {
    const location = useLocation();
    const { signOut } = useAuth();

    // Load collapsed state from localStorage
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    // Persist collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(collapsed));
        // Dispatch event for other components to listen
        window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { collapsed } }));
    }, [collapsed]);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: User, label: "Profile", path: "/profile" },
        { icon: Briefcase, label: "Recommended Jobs", path: "/job-recommendations", badge: "New" },
        { icon: Target, label: "Topic Interview", path: "/topic-interview" },
        { icon: FileText, label: "Templates", path: "/templates" },
        { icon: BarChart2, label: "Reports", path: "/reports" },
    ];

    const bottomItems = [
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    const NavItem = ({ item }: { item: typeof navItems[0] }) => {
        const isActive = location.pathname === item.path;
        const content = (
            <Link
                to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
            >
                <item.icon className={`w-5 h-5 ${collapsed ? '' : ''} ${isActive ? "text-primary" : "text-gray-500 group-hover:text-white"}`} />
                {!collapsed && (
                    <>
                        <span>{item.label}</span>
                        {item.badge && (
                            <span className="ml-auto text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">
                                {item.badge}
                            </span>
                        )}
                    </>
                )}
            </Link>
        );

        if (collapsed) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {content}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return content;
    };

    return (
        <div
            className={`${collapsed ? 'w-20' : 'w-64'
                } border-r border-white/5 bg-black/50 backdrop-blur-xl h-screen fixed left-0 top-0 flex flex-col z-40 hidden lg:flex transition-all duration-300`}
        >
            {/* Logo Area */}
            <div className="p-6 border-b border-white/5 relative">
                <Link to="/" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} hover:opacity-80 transition-opacity cursor-pointer`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Code className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && <span className="font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">AI Interview Agents</span>}
                </Link>

                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all z-50"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavItem key={item.label} item={item} />
                ))}
            </div>

            {/* Bottom Section */}
            <div className={`p-4 border-t border-white/5 space-y-4`}>
                {/* User Profile / Logout */}
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} pt-2`}>
                    {collapsed ? (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer">
                                        <User className="w-4 h-4 text-gray-400" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    Guest User - Free Plan
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                    <User className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-white">Guest User</span>
                                    <span className="text-[10px] text-gray-500">Free Plan</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-400" onClick={() => signOut()}>
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    {collapsed && (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-red-400 absolute bottom-4"
                                        onClick={() => signOut()}
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    Logout
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        </div>
    );
};
