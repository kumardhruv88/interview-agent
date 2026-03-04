import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { CreateInterviewDialog } from "@/components/dashboard/CreateInterviewDialog";
import { UserAvatar } from "./UserAvatar";
import { useState, useEffect } from "react";

interface UserDashboardHeaderProps {
    onMenuClick?: () => void;
    showWelcome?: boolean;
    showNotification?: boolean;
    showStartInterview?: boolean;
}

export const UserDashboardHeader = ({
    onMenuClick,
    showWelcome = false,
    showStartInterview = false
}: UserDashboardHeaderProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show header when scrolling up or at top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            }
            // Hide header when scrolling down
            else if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`fixed top-0 right-0 left-0 lg:left-64 h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between z-30 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-400" onClick={onMenuClick}>
                    <Menu className="w-5 h-5" />
                </Button>
                {showWelcome && (
                    <div className="hidden md:flex flex-col">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-green-400 font-mono">$</span> Welcome Back, User!
                        </h2>
                        <p className="text-xs text-muted-foreground">Ready to ace your next interview?</p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* User Profile Avatar */}
                <UserAvatar />

                {showStartInterview && (
                    <CreateInterviewDialog
                        trigger={
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-900/20">
                                Start Interview
                            </Button>
                        }
                    />
                )}
            </div>
        </header>
    );
};
